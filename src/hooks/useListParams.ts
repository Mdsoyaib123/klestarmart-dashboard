import { useSearchParams } from 'react-router-dom'

// List filters live in the URL, so a filtered view can be bookmarked, shared, and survives a refresh.
export const useListParams = <K extends string>(keys: readonly K[]) => {
  const [params, setParams] = useSearchParams()
  const values = Object.fromEntries(keys.map((key) => [key, params.get(key) ?? ''])) as Record<K, string>
  const page = Math.max(1, Number(params.get('page')) || 1)

  // Changing a filter returns to page 1.
  const set = (key: K | 'page', value: string | number) => {
    const next = new URLSearchParams(params)
    if (value === '' || (key === 'page' && value === 1)) next.delete(key)
    else next.set(key, String(value))
    if (key !== 'page') next.delete('page')
    setParams(next, { replace: true })
  }

  const clear = () => setParams({}, { replace: true })
  const active = keys.some((key) => values[key])

  return { values, page, set, clear, active }
}
