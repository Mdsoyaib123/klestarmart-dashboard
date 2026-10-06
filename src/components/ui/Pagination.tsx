import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { PageMeta } from '@/types'

export default function Pagination({ meta, onPage }: { meta?: PageMeta; onPage: (page: number) => void }) {
  if (!meta || meta.total === 0) return null
  const first = (meta.page - 1) * meta.limit + 1
  const last = Math.min(meta.page * meta.limit, meta.total)
  const button = 'grid h-8 w-8 place-items-center rounded-lg border border-line bg-white text-muted transition hover:text-ink disabled:cursor-not-allowed disabled:opacity-40'

  return (
    <nav aria-label="Pagination" className="mt-4 flex items-center justify-between gap-4 text-sm text-muted">
      <p>
        Showing <span className="font-medium text-ink">{first}</span>–<span className="font-medium text-ink">{last}</span> of{' '}
        <span className="font-medium text-ink">{meta.total.toLocaleString()}</span>
      </p>
      <div className="flex items-center gap-2">
        <button type="button" aria-label="Previous page" className={button} disabled={meta.page <= 1} onClick={() => onPage(meta.page - 1)}>
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="tabular-nums">
          {meta.page} / {meta.pages}
        </span>
        <button type="button" aria-label="Next page" className={button} disabled={meta.page >= meta.pages} onClick={() => onPage(meta.page + 1)}>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </nav>
  )
}
