import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import type { ReactNode } from 'react'

// A headline number with its change versus the previous period of the same length.
export default function StatCard({ label, value, change, icon, hint }: { label: string; value: string; change?: number | null; icon?: ReactNode; hint?: string }) {
  const up = (change ?? 0) >= 0
  return (
    <div className="rounded-xl border border-line bg-white p-5">
      <div className="flex items-center justify-between text-sm text-muted">
        {label}
        <span className="text-muted/80">{icon}</span>
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 flex items-center gap-1 text-xs text-muted">
        {change !== undefined && change !== null ? (
          <>
            <span className={`inline-flex items-center gap-0.5 font-medium ${up ? 'text-success' : 'text-accent'}`}>
              {up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
              {up ? '+' : ''}
              {change}%
            </span>
            vs previous period
          </>
        ) : (
          (hint ?? 'No earlier data to compare')
        )}
      </p>
    </div>
  )
}
