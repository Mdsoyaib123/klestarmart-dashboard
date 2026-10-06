import { useEffect, useRef, useState } from 'react'

// Rounds the axis maximum up to a clean number and returns evenly spaced ticks (0, 2,500, 5,000, ...).
export const niceTicks = (max: number, count = 4) => {
  if (max <= 0) return [0, 1]
  const rough = max / count
  const magnitude = 10 ** Math.floor(Math.log10(rough))
  const step = [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((candidate) => candidate >= rough) ?? rough
  return Array.from({ length: Math.ceil(max / step) + 1 }, (_, index) => index * step)
}

// Tracks an element's width so the SVG can be drawn at real pixel size (text never scales).
export const useWidth = <T extends HTMLElement>() => {
  const ref = useRef<T>(null)
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const element = ref.current
    if (!element) return
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  return [ref, width] as const
}

export interface Point {
  label: string
  value: number
}
