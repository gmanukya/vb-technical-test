import type { StatItem } from '../lib/filterPokemons'

interface StatListProps {
  stats: StatItem[]
}

export function StatList({ stats }: StatListProps) {
  const items = stats.map((stat) => (
    <div key={stat.label} className="flex items-baseline justify-between gap-2">
      <span className="text-[11px] tracking-[0.14em] uppercase text-muted">{stat.label}</span>
      <span className="tabular-nums text-sm">{stat.value}</span>
    </div>
  ))

  return <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1">{items}</div>
}
