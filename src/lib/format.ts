import { CURRENCY_SYMBOL } from '@/config/site'

const whole = new Intl.NumberFormat('en-BD', { maximumFractionDigits: 0 })
const compact = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 })

export const formatPrice = (value: number) => `${CURRENCY_SYMBOL}${whole.format(value)}`

// 1,284 / 12.9K / 4.2M, for stat tiles and chart axes.
export const formatCompact = (value: number) => (Math.abs(value) < 10_000 ? whole.format(value) : compact.format(value))
export const formatCompactPrice = (value: number) => `${CURRENCY_SYMBOL}${formatCompact(value)}`

export const formatNumber = (value: number) => whole.format(value)

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

export const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

// "2026-10-06" -> "6 Oct"
export const formatShortDate = (isoDate: string) =>
  new Date(`${isoDate}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })

// Percentage change versus the previous period, or null when there is nothing to compare with.
export const percentChange = (current: number, previous: number) =>
  previous === 0 ? null : Math.round(((current - previous) / previous) * 100)
