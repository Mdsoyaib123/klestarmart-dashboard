import { useState } from 'react'
import ChartTable from '@/components/charts/ChartTable'
import { niceTicks, useWidth, type Point } from '@/components/charts/chartUtils'

const HEIGHT = 200
const PAD = { top: 12, right: 8, bottom: 28, left: 40 }

// A rounded top on the data end, square at the baseline.
const columnPath = (x: number, y: number, w: number, h: number) => {
  const r = Math.min(4, w / 2, h)
  return `M${x},${y + h} V${y + r} Q${x},${y} ${x + r},${y} H${x + w - r} Q${x + w},${y} ${x + w},${y + r} V${y + h} Z`
}

// Single-series columns (e.g. units sold per day); each column shows its value on hover or focus.
export default function ColumnChart({ data, valueLabel, formatValue }: { data: Point[]; valueLabel: string; formatValue: (value: number) => string }) {
  const [wrapRef, width] = useWidth<HTMLDivElement>()
  const [active, setActive] = useState<number | null>(null)

  const ticks = niceTicks(Math.max(...data.map((point) => point.value), 0), 3)
  const yMax = ticks[ticks.length - 1]
  const plotW = Math.max(0, width - PAD.left - PAD.right)
  const plotH = HEIGHT - PAD.top - PAD.bottom
  const band = data.length ? plotW / data.length : 0
  // Capped at 24px so columns never fill their slot; the rest is air.
  const barW = Math.max(2, Math.min(24, band - 2))
  const y = (value: number) => PAD.top + plotH - (value / yMax) * plotH
  const labelEvery = Math.max(1, Math.ceil(data.length / 5))
  const point = active !== null ? data[active] : null

  return (
    <div>
      <div ref={wrapRef} className="relative">
        {width > 0 && (
          <svg width={width} height={HEIGHT} role="img" aria-label={`${valueLabel} by day`} className="block">
            {ticks.map((tick) => (
              <g key={tick}>
                <line x1={PAD.left} x2={PAD.left + plotW} y1={y(tick)} y2={y(tick)} stroke="var(--color-line)" strokeWidth={1} />
                <text x={PAD.left - 8} y={y(tick)} dy="0.32em" textAnchor="end" className="fill-muted text-[11px] tabular-nums">
                  {formatValue(tick)}
                </text>
              </g>
            ))}
            {data.map((point, index) => {
              const left = PAD.left + index * band
              const h = PAD.top + plotH - y(point.value)
              return (
                <g key={point.label}>
                  {point.value > 0 && (
                    <path d={columnPath(left + (band - barW) / 2, y(point.value), barW, h)} fill="var(--color-chart)" fillOpacity={active === null || active === index ? 1 : 0.45} />
                  )}
                  {/* The whole band is the hover target, not just the painted column. */}
                  <rect
                    x={left}
                    y={PAD.top}
                    width={band}
                    height={plotH}
                    fill="transparent"
                    tabIndex={0}
                    aria-label={`${point.label}: ${formatValue(point.value)} ${valueLabel.toLowerCase()}`}
                    onPointerEnter={() => setActive(index)}
                    onPointerLeave={() => setActive(null)}
                    onFocus={() => setActive(index)}
                    onBlur={() => setActive(null)}
                    className="outline-none"
                  />
                  {(index % labelEvery === 0 || index === data.length - 1) && (
                    // The first and last labels align to the plot edges so they are never clipped.
                    <text
                      x={index === 0 ? left : index === data.length - 1 ? left + band : left + band / 2}
                      y={HEIGHT - 8}
                      textAnchor={index === 0 ? 'start' : index === data.length - 1 ? 'end' : 'middle'}
                      className="fill-muted text-[11px]"
                    >
                      {point.label}
                    </text>
                  )}
                </g>
              )
            })}
          </svg>
        )}
        {active !== null && point && (
          <div
            className="pointer-events-none absolute top-1 z-10 rounded-lg border border-line bg-white px-3 py-2 text-xs shadow-lg"
            style={{ left: Math.min(Math.max(PAD.left + active * band + band / 2 - 60, 0), Math.max(width - 120, 0)), width: 120 }}
          >
            <p className="text-sm font-semibold tabular-nums">{formatValue(point.value)}</p>
            <p className="mt-0.5 text-muted">
              {valueLabel} · {point.label}
            </p>
          </div>
        )}
      </div>
      <ChartTable data={data} labelHeader="Day" valueHeader={valueLabel} format={formatValue} />
    </div>
  )
}
