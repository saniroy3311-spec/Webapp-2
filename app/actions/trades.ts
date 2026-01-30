'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const tradeSchema = z.object({
  trade_date: z.string(),
  market_id: z.string().uuid(),
  setup_id: z.string().uuid().optional().or(z.literal('')),
  mistake_id: z.string().uuid().optional().or(z.literal('')),
  direction: z.enum(['LONG', 'SHORT']),
  trade_type: z.enum(['INTRADAY', 'SWING']),
  entry_price: z.coerce.number(),
  exit_price: z.coerce.number(),
  lots: z.coerce.number(),
  sl_price: z.coerce.number().optional(),
  target_price: z.coerce.number().optional(),
  brokerage: z.coerce.number().default(0),
  taxes: z.coerce.number().default(0),
  notes: z.string().optional(),
  trade_image_url: z.string().optional(),
  emotion: z.string().optional(),
  followed_rules: z.coerce.boolean().optional(),
})

export async function createTrade(formData: FormData) {
  const supabase = await createClient()

  // Extract data
  const rawData = Object.fromEntries(formData)

  // Clean up empty strings to null/undefined for optional fields
  if (rawData.setup_id === '') delete rawData.setup_id
  if (rawData.mistake_id === '') delete rawData.mistake_id
  if (rawData.sl_price === '') delete rawData.sl_price
  if (rawData.target_price === '') delete rawData.target_price

  const validated = tradeSchema.parse(rawData)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Fetch Market to get current Lot Size
  const { data: market } = await supabase
    .from('markets')
    .select('lot_size')
    .eq('id', validated.market_id)
    .single()

  if (!market) throw new Error('Market not found')

  const lot_size_snapshot = market.lot_size
  const quantity = validated.lots * lot_size_snapshot

  // Calculations
  const isLong = validated.direction === 'LONG'
  const multiplier = isLong ? 1 : -1
  const gross_pnl = (validated.exit_price - validated.entry_price) * multiplier * quantity
  const pnl_after_expense = gross_pnl - validated.brokerage - validated.taxes

  let risk_amount = null
  if (validated.sl_price) {
    risk_amount = Math.abs(validated.entry_price - validated.sl_price) * quantity
  }

  let rr = null
  if (validated.sl_price && validated.target_price) {
    const risk = Math.abs(validated.entry_price - validated.sl_price)
    const reward = Math.abs(validated.target_price - validated.entry_price)
    if (risk !== 0) {
      rr = reward / risk
    }
  }

  // Calculate Time Slot
  let time_slot = null
  const timePart = validated.trade_date.split('T')[1]
  if (timePart) {
      const [h, m] = timePart.split(':').map(Number)
      const minutes = h * 60 + m

      if (minutes >= 555 && minutes < 630) time_slot = '09:15-10:30'
      else if (minutes >= 630 && minutes < 750) time_slot = '10:30-12:30'
      else if (minutes >= 750 && minutes < 870) time_slot = '12:30-02:30'
      else if (minutes >= 870 && minutes < 930) time_slot = '02:30-03:30'
      else time_slot = 'Other'
  }

  // Convert IST input to UTC
  // We assume the user is entering time in IST (since it's an Indian journal)
  const tradeDateIST = new Date(`${validated.trade_date}:00+05:30`)

  // Insert
  const { error } = await supabase.from('trades').insert({
    user_id: user.id,
    trade_date: tradeDateIST.toISOString(),
    time_slot,
    market_id: validated.market_id,
    setup_id: validated.setup_id || null,
    mistake_id: validated.mistake_id || null,
    direction: validated.direction,
    trade_type: validated.trade_type,
    entry_price: validated.entry_price,
    exit_price: validated.exit_price,
    quantity,
    lots: validated.lots,
    lot_size_snapshot,
    sl_price: validated.sl_price || null,
    target_price: validated.target_price || null,
    risk_amount,
    rr,
    gross_pnl,
    brokerage: validated.brokerage,
    taxes: validated.taxes,
    pnl_after_expense,
    emotion: validated.emotion || null,
    followed_rules: rawData.followed_rules === 'on', // checkbox handling
    notes: validated.notes || null,
    trade_image_url: validated.trade_image_url || null,
  })

  if (error) {
    console.error('Insert Error:', error)
    throw new Error(error.message)
  }

  revalidatePath('/trades')
  revalidatePath('/dashboard')
  redirect('/trades')
}

export async function getTrades(searchParams?: {
  market?: string,
  setup?: string,
  result?: string,
  month?: string
}) {
  const supabase = await createClient()

  let query = supabase
    .from('trades')
    .select(`
      *,
      markets (name),
      setups (name),
      mistakes (name)
    `)
    .order('trade_date', { ascending: false })

  if (searchParams?.market) query = query.eq('market_id', searchParams.market)
  if (searchParams?.setup) query = query.eq('setup_id', searchParams.setup)

  if (searchParams?.result) {
    if (searchParams.result === 'WIN') query = query.gt('pnl_after_expense', 0)
    else if (searchParams.result === 'LOSS') query = query.lt('pnl_after_expense', 0)
    else if (searchParams.result === 'BE') query = query.eq('pnl_after_expense', 0)
  }

  if (searchParams?.month) {
    // searchParams.month is 'YYYY-MM'
    const start = new Date(`${searchParams.month}-01`).toISOString()

    const [y, m] = searchParams.month.split('-').map(Number)
    const nextMonth = m === 12 ? 1 : m + 1
    const nextYear = m === 12 ? y + 1 : y
    const endStr = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`
    const end = new Date(endStr).toISOString()

    query = query.gte('trade_date', start).lt('trade_date', end)
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data as any[]
}

export async function getTrade(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('trades')
    .select(`
      *,
      markets (name),
      setups (name),
      mistakes (name)
    `)
    .eq('id', id)
    .single()

  if (error) throw new Error(error.message)
  return data as any
}

export async function deleteTrade(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('trades').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/trades')
  revalidatePath('/dashboard')
}
