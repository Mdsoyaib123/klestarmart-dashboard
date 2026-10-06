import type { SelectHTMLAttributes } from 'react'
import { inputClass } from '@/lib/ui'

// A compact select for filter bars.
export default function Select({ className = '', ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={`${inputClass} w-auto pr-8 ${className}`} {...rest} />
}
