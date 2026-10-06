import type { ReactNode } from 'react'
import type { Tone } from '@/lib/labels'

const tones: Record<Tone, string> = {
  neutral: 'bg-cream text-muted',
  info: 'bg-brand-soft text-brand',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-accent-soft text-accent',
}

const dots: Record<Tone, string> = {
  neutral: 'bg-muted',
  info: 'bg-brand',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-accent',
}

// Status is shown with a dot and a word, never colour alone.
export default function Badge({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dots[tone]}`} aria-hidden="true" />
      {children}
    </span>
  )
}
