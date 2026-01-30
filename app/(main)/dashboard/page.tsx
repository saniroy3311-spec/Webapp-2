import { getTrades } from '@/app/actions/trades'
import { calculateStats, calculateEquityCurve } from '@/lib/analytics'
import { EquityChart } from '@/components/analytics/equity-chart'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { format } from 'date-fns'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const trades = await getTrades() // Fetch all trades by default
  const stats = calculateStats(trades)
  const equityData = calculateEquityCurve(trades)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-zinc-400">Your trading performance at a glance.</p>
        </div>
        <Link href="/trades/new" className="flex items-center gap-2 rounded bg-white px-4 py-2 text-sm font-medium text-black hover:bg-zinc-200">
            <Plus className="h-4 w-4" /> Add Trade
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
            <div className="text-zinc-400 text-sm">Net P&L</div>
            <div className={`text-2xl font-bold ${stats.netPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                ₹{stats.netPnL.toFixed(2)}
            </div>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
            <div className="text-zinc-400 text-sm">Win Rate</div>
            <div className="text-2xl font-bold text-white">
                {stats.winRate.toFixed(1)}%
            </div>
            <div className="text-xs text-zinc-500 mt-1">{stats.wins}W - {stats.losses}L</div>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
            <div className="text-zinc-400 text-sm">Total Trades</div>
            <div className="text-2xl font-bold text-white">
                {stats.totalTrades}
            </div>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
            <div className="text-zinc-400 text-sm">Avg Trade</div>
             <div className="text-2xl font-bold text-white">
                ₹{stats.totalTrades > 0 ? (stats.netPnL / stats.totalTrades).toFixed(2) : '0.00'}
             </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 rounded-lg border border-zinc-800 bg-zinc-900 p-6">
            <h3 className="mb-4 font-semibold text-white">Equity Curve</h3>
            <EquityChart data={equityData} />
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white">Recent Activity</h3>
                <Link href="/trades" className="text-xs text-zinc-400 hover:text-white">View All</Link>
            </div>
            <div className="space-y-4">
                {trades.slice(0, 5).map((t: any) => (
                    <div key={t.id} className="flex justify-between items-center text-sm border-b border-zinc-800 pb-2 last:border-0">
                        <div>
                            <div className="text-white font-medium">{t.markets?.name}</div>
                            <div className="text-xs text-zinc-500">{format(new Date(t.trade_date), 'dd MMM')}</div>
                        </div>
                        <div className={`font-mono font-bold ${t.pnl_after_expense >= 0 ? "text-green-500" : "text-red-500"}`}>
                            {t.pnl_after_expense?.toFixed(2)}
                        </div>
                    </div>
                ))}
                {trades.length === 0 && <div className="text-zinc-500 text-sm text-center py-4">No trades yet.</div>}
            </div>
        </div>
      </div>
    </div>
  )
}
