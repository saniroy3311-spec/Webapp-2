import { getMarkets, getSetups, getMistakes } from '@/app/actions/settings'
import { MarketsTable } from '@/components/settings/markets-table'
import { SetupsList } from '@/components/settings/setups-list'
import { MistakesList } from '@/components/settings/mistakes-list'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const [markets, setups, mistakes] = await Promise.all([
    getMarkets(),
    getSetups(),
    getMistakes(),
  ])

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-zinc-400">Manage your trading environment.</p>
      </div>

      <div className="space-y-12">
        <MarketsTable markets={markets || []} />
        <SetupsList setups={setups || []} />
        <MistakesList mistakes={mistakes || []} />
      </div>
    </div>
  )
}
