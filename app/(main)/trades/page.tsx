import { getMarkets, getSetups } from '@/app/actions/settings'
import { getTrades } from '@/app/actions/trades'
import { TradeTable } from '@/components/trades/trade-table'
import { TradeFilters } from '@/components/trades/trade-filters'

export const dynamic = 'force-dynamic'

export default async function TradesPage(props: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const searchParams = await props.searchParams
  const [markets, setups, trades] = await Promise.all([
    getMarkets(),
    getSetups(),
    getTrades(searchParams),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Trade Journal</h1>
        <p className="text-zinc-400">Review your trading performance.</p>
      </div>

      <TradeFilters markets={markets || []} setups={setups || []} />

      <TradeTable trades={trades || []} />
    </div>
  )
}
