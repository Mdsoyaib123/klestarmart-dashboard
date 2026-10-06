import { useState, type KeyboardEvent, type PointerEvent } from 'react'
import ChartTable from '@/components/charts/ChartTable'
import { niceTicks, useWidth, type Point } from '@/components/charts/chartUtils'

const HEIGHT = 240
const PAD = { top: 12, right: 12, bottom: 28, left: 56 }

interface Props {
  data: Point[]
  // Name of the measure, e.g. "Revenue".
  valueLabel: string
  formatValue: (value: number) => string
  formatAxis: (value: number) => string
}

// A single-series line with a light area wash and a crosshair tooltip (mouse, touch and arrow keys).
export default function AreaChart({ data, valueLabel, formatValue, formatAxis }: Props) {
  const [wrapRef, width] = useWidth<HTMLDivElement>()
  const [active, setActive] = useState<number | null>(null)

  const ticks = niceTicks(Math.max(...data.map((point) => point.value), 0))
  const yMax = ticks[ticks.length - 1]
  const plotW = Math.max(0, width - PAD.left - PAD.right)
  const plotH = HEIGHT - PAD.top - PAD.bottom
  const x = (index: number) => PAD.left + (data.length <= 1 ? plotW / 2 : (index / (data.length - 1)) * plotW)
  const y = (value: number) => PAD.top + plotH - (value / yMax) * plotH

  const line = data.map((point, index) => `${index === 0 ? 'M' : 'L'}${x(index)},${y(point.value)}`).join(' ')
  const area = data.length ? `${line} L${x(data.length - 1)},${PAD.top + plotH} L${x(0)},${PAD.top + plotH} Z` : ''
  // About five evenly spaced date labels, always including the last day.
  const labelEvery = Math.max(1, Math.ceil(data.length / 5))

  const pick = (event: PointerEvent<SVGSVGElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    const ratio = (event.clientX - bounds.left - PAD.left) / (plotW || 1)
    setActive(Math.min(data.length - 1, Math.max(0, Math.round(ratio * (data.length - 1)))))
  }

  const onKey = (event: KeyboardEvent<SVGSVGElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    event.preventDefault()
    const current = active ?? data.length - 1
    setActive(Math.min(data.length - 1, Math.max(0, current + (event.key === 'ArrowRight' ? 1 : -1))))
  }

  const point = active !== null ? data[active] : null

  return (
    <div>
      <div ref={wrapRef} className="relative">
        {width > 0 && (
          <svg
            width={width}
            height={HEIGHT}
            role="img"
            aria-label={`${valueLabel} by day. Use the left and right arrow keys to read each day.`}
            tabIndex={0}
            onPointerMove={pick}
            onPointerDown={pick}
            onPointerLeave={() => setActive(null)}
            onKeyDown={onKey}
            onBlur={() => setActive(null)}
            className="block touch-none outline-none focus-visible:rounded-lg focus-visible:ring-2 focus-visible:ring-brand"
          >
            {ticks.map((tick) => (
              <g key={tick}>
                <line x1={PAD.left} x2={PAD.left + plotW} y1={y(tick)} y2={y(tick)} stroke="var(--color-line)" strokeWidth={1} />
                <text x={PAD.left - 8} y={y(tick)} dy="0.32em" textAnchor="end" className="fill-muted text-[11px] tabular-nums">
                  {formatAxis(tick)}
                </text>
              </g>
            ))}
            {data.map((point, index) =>
              index % labelEvery === 0 || index === data.length - 1 ? (
                <text key={point.label} x={x(index)} y={HEIGHT - 8} textAnchor={index === 0 ? 'start' : index === data.length - 1 ? 'end' : 'middle'} className="fill-muted text-[11px]">
                  {point.label}
                </text>
              ) : null,
            )}
            <path d={area} fill="var(--color-chart)" fillOpacity={0.1} />
            <path d={line} fill="none" stroke="var(--color-chart)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
            {active !== null && point && (
              <g>
                <line x1={x(active)} x2={x(active)} y1={PAD.top} y2={PAD.top + plotH} stroke="var(--color-muted)" strokeOpacity={0.5} strokeWidth={1} />
                <circle cx={x(active)} cy={y(point.value)} r={5} fill="var(--color-chart)" stroke="white" strokeWidth={2} />
              </g>
            )}
          </svg>
        )}
        {active !== null && point && (
          <div
            className="pointer-events-none absolute top-1 z-10 rounded-lg border border-line bg-white px-3 py-2 text-xs shadow-lg"
            style={{ left: Math.min(Math.max(x(active) - 70, 0), Math.max(width - 140, 0)), width: 140 }}
          >
            <p className="text-sm font-semibold tabular-nums">{formatValue(point.value)}</p>
            <p className="mt-0.5 flex items-center gap-1.5 text-muted">
              <span className="h-0.5 w-3 rounded-full bg-chart" aria-hidden="true" />
              {valueLabel} · {point.label}
            </p>
          </div>
        )}
      </div>
      <ChartTable data={data} labelHeader="Day" valueHeader={valueLabel} format={formatValue} />
    </div>
  )
}
