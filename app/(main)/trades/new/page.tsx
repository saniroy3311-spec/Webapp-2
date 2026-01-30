import { getMarkets, getSetups, getMistakes } from '@/app/actions/settings'
import { TradeForm } from '@/components/trades/trade-form'

export const dynamic = 'force-dynamic'

export default async function NewTradePage() {
  const [markets, setups, mistakes] = await Promise.all([
    getMarkets(),
    getSetups(),
    getMistakes(),
  ])

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Add New Trade</h1>
        <p className="text-zinc-400">Record your trading performance.</p>
      </div>

      <TradeForm markets={markets || []} setups={setups || []} mistakes={mistakes || []} />
    </div>
  )
}
