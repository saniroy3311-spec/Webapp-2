import { getTrade, deleteTrade } from '@/app/actions/trades'
import { format } from 'date-fns'
import { ArrowLeft, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function TradeDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  const trade = await getTrade(id)

  if (!trade) {
    return <div>Trade not found</div>
  }

  // Handle Delete Action
  async function handleDelete() {
    'use server'
    await deleteTrade(id)
    redirect('/trades')
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <Link href="/trades" className="flex items-center gap-2 text-zinc-400 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Back to Journal
        </Link>
        <form action={handleDelete}>
            <button type="submit" className="flex items-center gap-2 text-red-500 hover:text-red-400">
                <Trash2 className="h-4 w-4" /> Delete Trade
            </button>
        </form>
      </div>

      {/* Header */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
        <div className="flex items-start justify-between">
            <div>
                <h1 className="text-2xl font-bold text-white">{trade.markets?.name} {trade.direction}</h1>
                <p className="text-zinc-400">{format(new Date(trade.trade_date), 'dd MMMM yyyy, HH:mm')}</p>
            </div>
            <div className="text-right">
                <div className={`text-3xl font-bold ${(trade.pnl_after_expense || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {trade.pnl_after_expense?.toFixed(2)}
                </div>
                <div className="text-sm text-zinc-500">Net P&L</div>
            </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6 space-y-4">
            <h3 className="font-semibold text-white">Execution</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <div className="text-zinc-500">Entry Price</div>
                    <div className="text-white">{trade.entry_price}</div>
                </div>
                <div>
                    <div className="text-zinc-500">Exit Price</div>
                    <div className="text-white">{trade.exit_price}</div>
                </div>
                <div>
                    <div className="text-zinc-500">Quantity</div>
                    <div className="text-white">{trade.quantity} ({trade.lots} Lots)</div>
                </div>
                <div>
                    <div className="text-zinc-500">Type</div>
                    <div className="text-white">{trade.trade_type}</div>
                </div>
            </div>
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6 space-y-4">
            <h3 className="font-semibold text-white">Analysis</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
                 <div>
                    <div className="text-zinc-500">Strategy</div>
                    <div className="text-white">{trade.setups?.name || '-'}</div>
                </div>
                <div>
                    <div className="text-zinc-500">Mistake</div>
                    <div className="text-red-400">{trade.mistakes?.name || '-'}</div>
                </div>
                <div>
                    <div className="text-zinc-500">Risk : Reward</div>
                    <div className="text-white">1 : {trade.rr?.toFixed(2) || '-'}</div>
                </div>
                 <div>
                    <div className="text-zinc-500">Followed Rules</div>
                    <div className={trade.followed_rules ? "text-green-500" : "text-red-500"}>
                        {trade.followed_rules ? 'Yes' : 'No'}
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Image */}
      {trade.trade_image_url && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6 space-y-4">
            <h3 className="font-semibold text-white">Screenshot</h3>
            <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black/50">
                <img src={trade.trade_image_url} alt="Trade Screenshot" className="object-contain w-full h-full" />
            </div>
        </div>
      )}

      {/* Notes */}
      {trade.notes && (
         <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6 space-y-4">
            <h3 className="font-semibold text-white">Notes</h3>
            <p className="text-zinc-300 whitespace-pre-wrap">{trade.notes}</p>
        </div>
      )}
    </div>
  )
}
