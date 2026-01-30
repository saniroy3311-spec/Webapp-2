'use client'

import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'

type Trade = {
  id: string
  trade_date: string
  market_id: string | null
  setup_id: string | null
  mistake_id: string | null
  direction: 'LONG' | 'SHORT' | null
  trade_type: 'INTRADAY' | 'SWING' | null
  entry_price: number
  exit_price: number
  quantity: number
  pnl_after_expense: number | null
  markets: { name: string } | null
  setups: { name: string } | null
  mistakes: { name: string } | null
}

export function TradeTable({ trades }: { trades: Trade[] }) {
  const router = useRouter()

  if (trades.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-500">
        No trades found for these filters.
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-zinc-400">
          <thead className="bg-zinc-950 text-xs uppercase text-zinc-500">
            <tr>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Market</th>
              <th className="px-6 py-3">Type</th>
              <th className="px-6 py-3">Setup</th>
              <th className="px-6 py-3 text-right">PnL</th>
              <th className="px-6 py-3">Mistake</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((trade) => (
              <tr
                key={trade.id}
                onClick={() => router.push(`/trades/${trade.id}`)}
                className="border-b border-zinc-800 hover:bg-zinc-800/50 cursor-pointer transition-colors"
              >
                <td className="px-6 py-4 font-medium text-white whitespace-nowrap">
                   {format(new Date(trade.trade_date), 'dd MMM yyyy, HH:mm')}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {trade.markets?.name}
                    {trade.direction === 'LONG' ? (
                       <ArrowUpRight className="h-4 w-4 text-green-500" />
                    ) : (
                       <ArrowDownRight className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="rounded bg-zinc-800 px-2 py-1 text-xs">{trade.trade_type}</span>
                </td>
                <td className="px-6 py-4">{trade.setups?.name || '-'}</td>
                <td className={cn("px-6 py-4 text-right font-bold", (trade.pnl_after_expense || 0) >= 0 ? "text-green-500" : "text-red-500")}>
                  {trade.pnl_after_expense?.toFixed(2)}
                </td>
                <td className="px-6 py-4">
                    {trade.mistakes?.name && (
                        <span className="rounded bg-red-500/10 px-2 py-1 text-xs text-red-500 border border-red-500/20">
                            {trade.mistakes.name}
                        </span>
                    )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
