import type { SelectHTMLAttributes } from 'react'
import { filterClass } from '@/lib/ui'

// A compact select for filter bars.
export default function Select({ className = '', ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={`${filterClass} pr-8 ${className}`} {...rest} />
}
