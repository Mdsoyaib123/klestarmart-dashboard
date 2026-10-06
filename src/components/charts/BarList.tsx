import type { ReactNode } from 'react'

export interface BarListItem {
  key: string
  label: ReactNode
  value: number
  // Shown at the end of the bar; defaults to the value.
  display?: string
}

// Horizontal bars with the label above and the value at the tip, for ranked lists.
export default function BarList({ items, emptyText = 'No data for this period' }: { items: BarListItem[]; emptyText?: string }) {
  const max = Math.max(...items.map((item) => item.value), 0)
  if (items.length === 0 || max === 0) return <p className="py-6 text-center text-sm text-muted">{emptyText}</p>

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.key}>
          <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
            <span className="min-w-0 truncate">{item.label}</span>
            <span className="shrink-0 font-medium tabular-nums">{item.display ?? item.value.toLocaleString()}</span>
          </div>
          <div className="h-2 rounded-full bg-cream">
            <div className="h-full rounded-full bg-chart" style={{ width: `${Math.max(2, (item.value / max) * 100)}%` }} />
          </div>
        </li>
      ))}
    </ul>
  )
}
