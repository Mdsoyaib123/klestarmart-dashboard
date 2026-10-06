import { Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useDebounced } from '@/hooks/useDebounced'
import { inputClass } from '@/lib/ui'

// Reports the search term after the user pauses typing.
export default function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
  const [text, setText] = useState(value)
  const debounced = useDebounced(text)

  useEffect(() => {
    if (debounced !== value) onChange(debounced)
    // Only react to the debounced text; `value` and `onChange` change on every parent render.
  }, [debounced]) // eslint-disable-line react-hooks/exhaustive-deps

  // Follow outside changes, such as "Clear filters".
  useEffect(() => setText(value), [value])

  return (
    <label className="relative block w-full sm:w-72">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
      <input type="search" value={text} onChange={(event) => setText(event.target.value)} placeholder={placeholder} aria-label={placeholder} className={`${inputClass} pl-9`} />
    </label>
  )
}
