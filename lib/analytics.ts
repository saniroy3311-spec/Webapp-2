import { Database } from '@/types/database'

// Define a type that matches what getTrades returns (joined data)
type Trade = {
  id: string
  trade_date: string
  pnl_after_expense: number | null
  setups: { name: string } | null
  mistakes: { name: string } | null
  [key: string]: any
}

export function calculateStats(trades: Trade[]) {
  const totalTrades = trades.length
  if (totalTrades === 0) return { netPnL: 0, winRate: 0, totalTrades: 0, wins: 0, losses: 0 }

  const netPnL = trades.reduce((sum, t) => sum + (t.pnl_after_expense || 0), 0)
  const wins = trades.filter(t => (t.pnl_after_expense || 0) > 0).length
  const losses = trades.filter(t => (t.pnl_after_expense || 0) < 0).length
  const winRate = (wins / totalTrades) * 100

  return {
    netPnL,
    winRate,
    totalTrades,
    wins,
    losses
  }
}

export function calculateEquityCurve(trades: Trade[]) {
  // Sort by date ascending
  const sorted = [...trades].sort((a, b) => new Date(a.trade_date).getTime() - new Date(b.trade_date).getTime())

  let currentEquity = 0
  return sorted.map(t => {
    currentEquity += (t.pnl_after_expense || 0)
    return {
      date: t.trade_date,
      equity: currentEquity,
      pnl: t.pnl_after_expense
    }
  })
}

export function calculateSetupPerformance(trades: Trade[]) {
  const groups: Record<string, { pnl: number, wins: number, total: number }> = {}

  trades.forEach(t => {
    const setupName = t.setups?.name || 'No Setup'
    if (!groups[setupName]) groups[setupName] = { pnl: 0, wins: 0, total: 0 }

    groups[setupName].pnl += (t.pnl_after_expense || 0)
    groups[setupName].total += 1
    if ((t.pnl_after_expense || 0) > 0) groups[setupName].wins += 1
  })

  return Object.entries(groups).map(([name, stats]) => ({
    name,
    pnl: stats.pnl,
    winRate: (stats.wins / stats.total) * 100,
    count: stats.total
  })).sort((a, b) => b.pnl - a.pnl)
}

export function calculateMistakeImpact(trades: Trade[]) {
  const groups: Record<string, { loss: number, count: number }> = {}

  trades.forEach(t => {
    if (!t.mistakes?.name) return
    const name = t.mistakes.name
    if (!groups[name]) groups[name] = { loss: 0, count: 0 }

    if ((t.pnl_after_expense || 0) < 0) {
        groups[name].loss += Math.abs(t.pnl_after_expense || 0)
    }
    groups[name].count += 1
  })

  return Object.entries(groups).map(([name, stats]) => ({
    name,
    loss: stats.loss,
    count: stats.count
  })).sort((a, b) => b.loss - a.loss)
}
