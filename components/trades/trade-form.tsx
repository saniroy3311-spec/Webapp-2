'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { createTrade } from '@/app/actions/trades'
import { Database } from '@/types/database'
import { Upload, Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

type Market = Database['public']['Tables']['markets']['Row']
type Setup = Database['public']['Tables']['setups']['Row']
type Mistake = Database['public']['Tables']['mistakes']['Row']

export function TradeForm({
  markets,
  setups,
  mistakes
}: {
  markets: Market[]
  setups: Setup[]
  mistakes: Mistake[]
}) {
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  // Local state for calculations preview
  const [formData, setFormData] = useState({
    market_id: '',
    lots: 0,
    entry: 0,
    exit: 0,
    sl: 0,
    target: 0,
    direction: 'LONG',
    brokerage: 0,
    taxes: 0
  })

  // Derived calculations
  const selectedMarket = markets.find(m => m.id === formData.market_id)
  const lotSize = selectedMarket ? selectedMarket.lot_size : 0
  const quantity = formData.lots * lotSize

  const multiplier = formData.direction === 'LONG' ? 1 : -1
  const grossPnL = (formData.exit - formData.entry) * multiplier * quantity
  const netPnL = grossPnL - formData.brokerage - formData.taxes

  const risk = formData.sl ? Math.abs(formData.entry - formData.sl) * quantity : 0
  const reward = formData.target ? Math.abs(formData.target - formData.entry) : 0
  const rr = (risk > 0 && reward > 0) ? (reward / (Math.abs(formData.entry - formData.sl))).toFixed(2) : '0'

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    setUploading(true)
    const file = e.target.files[0]
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        toast.error('User not found')
        setUploading(false)
        return
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('trade_images')
      .upload(fileName, file)

    if (uploadError) {
      toast.error('Upload failed: ' + uploadError.message)
      setUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('trade_images')
      .getPublicUrl(fileName)

    setImageUrl(publicUrl)
    setUploading(false)
    toast.success('Image uploaded')
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const data = new FormData(e.currentTarget)
    if (imageUrl) data.append('trade_image_url', imageUrl)

    try {
      await createTrade(data)
      toast.success('Trade saved successfully')
    } catch (err: any) {
      toast.error(err.message)
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'market_id' || name === 'direction' ? value : Number(value)
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Left Column: Inputs */}
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-400">Date</label>
                    <input type="datetime-local" name="trade_date" required className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-white focus:border-white focus:outline-none" />
                </div>
                <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-400">Time Slot</label>
                    <select name="time_slot" className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-white focus:border-white focus:outline-none">
                        <option value="">Auto (calculated)</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-400">Market</label>
                    <select name="market_id" onChange={handleChange} required className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-white focus:border-white focus:outline-none">
                        <option value="">Select Market</option>
                        {markets.map(m => <option key={m.id} value={m.id}>{m.name} (Lot: {m.lot_size})</option>)}
                    </select>
                </div>
                 <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-400">Trade Type</label>
                    <select name="trade_type" required className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-white focus:border-white focus:outline-none">
                        <option value="INTRADAY">Intraday</option>
                        <option value="SWING">Swing</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-400">Direction</label>
                    <select name="direction" onChange={handleChange} required className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-white focus:border-white focus:outline-none">
                        <option value="LONG">Long (Buy)</option>
                        <option value="SHORT">Short (Sell)</option>
                    </select>
                </div>
                <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-400">Lots</label>
                    <input type="number" name="lots" onChange={handleChange} required min="0.01" step="0.01" className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-white focus:border-white focus:outline-none" />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-400">Entry Price</label>
                    <input type="number" name="entry_price" onChange={(e) => setFormData({...formData, entry: Number(e.target.value)})} required step="0.05" className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-white focus:border-white focus:outline-none" />
                </div>
                <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-400">Exit Price</label>
                    <input type="number" name="exit_price" onChange={(e) => setFormData({...formData, exit: Number(e.target.value)})} required step="0.05" className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-white focus:border-white focus:outline-none" />
                </div>
            </div>

             <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-400">Stop Loss</label>
                    <input type="number" name="sl_price" onChange={(e) => setFormData({...formData, sl: Number(e.target.value)})} step="0.05" className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-white focus:border-white focus:outline-none" />
                </div>
                <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-400">Target</label>
                    <input type="number" name="target_price" onChange={(e) => setFormData({...formData, target: Number(e.target.value)})} step="0.05" className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-white focus:border-white focus:outline-none" />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-400">Strategy</label>
                    <select name="setup_id" className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-white focus:border-white focus:outline-none">
                        <option value="">None</option>
                        {setups.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>
                 <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-400">Mistake</label>
                    <select name="mistake_id" className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-white focus:border-white focus:outline-none">
                        <option value="">None</option>
                        {mistakes.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                </div>
            </div>

             <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-400">Brokerage</label>
                    <input type="number" name="brokerage" onChange={(e) => setFormData({...formData, brokerage: Number(e.target.value)})} step="0.01" className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-white focus:border-white focus:outline-none" />
                </div>
                <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-400">Taxes</label>
                    <input type="number" name="taxes" onChange={(e) => setFormData({...formData, taxes: Number(e.target.value)})} step="0.01" className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-white focus:border-white focus:outline-none" />
                </div>
            </div>

             <div>
                <label className="mb-2 block text-sm font-medium text-zinc-400">Notes</label>
                <textarea name="notes" rows={4} className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-white focus:border-white focus:outline-none" />
            </div>

             <div>
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-400">
                    <input type="checkbox" name="followed_rules" className="h-4 w-4 rounded border-zinc-800 bg-zinc-900" defaultChecked />
                    Followed Rules
                </label>
            </div>
        </div>

        {/* Right Column: Live Stats & Image */}
        <div className="space-y-6">
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6 space-y-4">
                <h3 className="font-semibold text-lg text-white">Live Calculation</h3>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-zinc-400">Quantity</span>
                        <span className="font-mono text-white">{quantity}</span>
                    </div>
                     <div className="flex justify-between">
                        <span className="text-zinc-400">Gross P&L</span>
                        <span className={cn("font-mono font-bold", grossPnL >= 0 ? "text-green-500" : "text-red-500")}>
                            {grossPnL.toFixed(2)}
                        </span>
                    </div>
                     <div className="flex justify-between border-t border-zinc-800 pt-2">
                        <span className="text-zinc-400">Net P&L</span>
                        <span className={cn("font-mono font-bold text-lg", netPnL >= 0 ? "text-green-500" : "text-red-500")}>
                            {netPnL.toFixed(2)}
                        </span>
                    </div>
                     <div className="flex justify-between pt-4">
                        <span className="text-zinc-400">Risk Amount</span>
                        <span className="font-mono text-white">{risk.toFixed(2)}</span>
                    </div>
                     <div className="flex justify-between">
                        <span className="text-zinc-400">Risk:Reward</span>
                        <span className="font-mono text-white">1 : {rr}</span>
                    </div>
                </div>
            </div>

            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6 space-y-4">
                <h3 className="font-semibold text-lg text-white">Screenshot</h3>
                <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-zinc-700 border-dashed rounded-lg cursor-pointer bg-zinc-900 hover:bg-zinc-800">
                        {imageUrl ? (
                            <img src={imageUrl} alt="Trade Screenshot" className="h-full w-full object-contain rounded-lg" />
                        ) : (
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                {uploading ? <Loader2 className="h-8 w-8 text-zinc-400 animate-spin" /> : <Upload className="w-8 h-8 mb-4 text-zinc-400" />}
                                <p className="mb-2 text-sm text-zinc-400"><span className="font-semibold">Click to upload</span></p>
                                <p className="text-xs text-zinc-500">PNG, JPG (MAX. 5MB)</p>
                            </div>
                        )}
                        <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
                    </label>
                </div>
            </div>

            <button
                type="submit"
                disabled={loading || uploading}
                className="w-full flex items-center justify-center gap-2 rounded-md bg-white px-4 py-3 text-black font-bold hover:bg-zinc-200 disabled:opacity-50"
            >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                Save Trade
            </button>
        </div>
      </div>
    </form>
  )
}
