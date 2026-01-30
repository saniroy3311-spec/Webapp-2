'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const marketSchema = z.object({
  name: z.string().min(1),
  lot_size: z.coerce.number().min(1),
})

const setupSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
})

const mistakeSchema = z.object({
  name: z.string().min(1),
})

// MARKETS
export async function getMarkets() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('markets').select('*').order('name')
  if (error) throw new Error(error.message)
  return data
}

export async function createMarket(formData: FormData) {
  const supabase = await createClient()
  const rawData = {
    name: formData.get('name'),
    lot_size: formData.get('lot_size'),
  }

  const { name, lot_size } = marketSchema.parse(rawData)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase.from('markets').insert({
    user_id: user.id,
    name,
    lot_size,
  })

  if (error) throw new Error(error.message)
  revalidatePath('/settings')
}

export async function updateMarket(id: string, formData: FormData) {
  const supabase = await createClient()
  const rawData = {
    name: formData.get('name'),
    lot_size: formData.get('lot_size'),
  }

  const { name, lot_size } = marketSchema.parse(rawData)
  const { error } = await supabase.from('markets').update({ name, lot_size }).eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/settings')
}

export async function deleteMarket(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('markets').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/settings')
}

// SETUPS
export async function getSetups() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('setups').select('*').order('name')
  if (error) throw new Error(error.message)
  return data
}

export async function createSetup(formData: FormData) {
  const supabase = await createClient()
  const rawData = {
    name: formData.get('name'),
    description: formData.get('description'),
  }

  const { name, description } = setupSchema.parse(rawData)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase.from('setups').insert({
    user_id: user.id,
    name,
    description: description || null,
  })

  if (error) throw new Error(error.message)
  revalidatePath('/settings')
}

export async function updateSetup(id: string, formData: FormData) {
  const supabase = await createClient()
  const rawData = {
    name: formData.get('name'),
    description: formData.get('description'),
  }

  const { name, description } = setupSchema.parse(rawData)
  const { error } = await supabase.from('setups').update({ name, description: description || null }).eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/settings')
}

export async function deleteSetup(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('setups').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/settings')
}

// MISTAKES
export async function getMistakes() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('mistakes').select('*').order('name')
  if (error) throw new Error(error.message)
  return data
}

export async function createMistake(formData: FormData) {
  const supabase = await createClient()
  const rawData = {
    name: formData.get('name'),
  }

  const { name } = mistakeSchema.parse(rawData)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase.from('mistakes').insert({
    user_id: user.id,
    name,
  })

  if (error) throw new Error(error.message)
  revalidatePath('/settings')
}

export async function updateMistake(id: string, formData: FormData) {
  const supabase = await createClient()
  const rawData = {
    name: formData.get('name'),
  }

  const { name } = mistakeSchema.parse(rawData)
  const { error } = await supabase.from('mistakes').update({ name }).eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/settings')
}

export async function deleteMistake(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('mistakes').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/settings')
}
