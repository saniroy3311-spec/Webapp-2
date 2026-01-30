'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Database } from '@/types/database'

type Market = Database['public']['Tables']['markets']['Row']
type Setup = Database['public']['Tables']['setups']['Row']

export function TradeFilters({ markets, setups }: { markets: Market[], setups: Setup[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    router.push(`/trades?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap gap-4 rounded-lg border border-zinc-800 bg-zinc-900 p-4">
      <div className="flex flex-col gap-1">
        <label className="text-xs text-zinc-500">Month</label>
        <input
            type="month"
            className="rounded border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-white focus:outline-none focus:border-white"
            onChange={(e) => handleFilterChange('month', e.target.value)}
            defaultValue={searchParams.get('month') || ''}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-zinc-500">Market</label>
        <select
            className="rounded border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-white focus:outline-none focus:border-white"
            onChange={(e) => handleFilterChange('market', e.target.value)}
            defaultValue={searchParams.get('market') || ''}
        >
            <option value="">All Markets</option>
            {markets.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-zinc-500">Strategy</label>
        <select
            className="rounded border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-white focus:outline-none focus:border-white"
            onChange={(e) => handleFilterChange('setup', e.target.value)}
            defaultValue={searchParams.get('setup') || ''}
        >
            <option value="">All Setups</option>
            {setups.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-zinc-500">Result</label>
        <select
            className="rounded border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-white focus:outline-none focus:border-white"
            onChange={(e) => handleFilterChange('result', e.target.value)}
            defaultValue={searchParams.get('result') || ''}
        >
            <option value="">All Results</option>
            <option value="WIN">Win</option>
            <option value="LOSS">Loss</option>
            <option value="BE">Break Even</option>
        </select>
      </div>
    </div>
  )
}
