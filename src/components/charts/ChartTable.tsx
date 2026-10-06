import type { Point } from '@/components/charts/chartUtils'

// The same numbers as the chart, for screen readers and anyone who prefers a table.
export default function ChartTable({ data, labelHeader, valueHeader, format }: { data: Point[]; labelHeader: string; valueHeader: string; format: (value: number) => string }) {
  return (
    <details className="mt-3 text-sm">
      <summary className="cursor-pointer text-xs font-medium text-muted hover:text-ink">Show data table</summary>
      <div className="mt-2 max-h-56 overflow-y-auto rounded-lg border border-line">
        <table className="w-full text-left text-xs">
          <thead className="sticky top-0 bg-cream">
            <tr>
              <th className="px-3 py-2 font-medium">{labelHeader}</th>
              <th className="px-3 py-2 text-right font-medium">{valueHeader}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {data.map((point) => (
              <tr key={point.label}>
                <td className="px-3 py-1.5">{point.label}</td>
                <td className="px-3 py-1.5 text-right tabular-nums">{format(point.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  )
}
