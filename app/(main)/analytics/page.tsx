import { getTrades } from '@/app/actions/trades'
import { calculateSetupPerformance, calculateMistakeImpact } from '@/lib/analytics'
import { SimpleBarChart } from '@/components/analytics/simple-bar-chart'

export const dynamic = 'force-dynamic'

export default async function AnalyticsPage() {
  const trades = await getTrades()

  const setups = calculateSetupPerformance(trades)
  const mistakes = calculateMistakeImpact(trades)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-zinc-400">Deep dive into your trading behavior.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6 space-y-4">
            <h3 className="font-semibold text-white">Strategy Performance (Net P&L)</h3>
            <div className="h-[300px]">
                <SimpleBarChart data={setups} dataKey="name" valueKey="pnl" />
            </div>
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6 space-y-4">
            <h3 className="font-semibold text-white">Cost of Mistakes (Total Loss)</h3>
            <div className="h-[300px]">
                <SimpleBarChart data={mistakes} dataKey="name" valueKey="loss" color="#ef4444" />
            </div>
        </div>
      </div>
    </div>
  )
}
