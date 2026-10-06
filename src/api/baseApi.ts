import { createApi, fetchBaseQuery, type BaseQueryFn, type FetchArgs, type FetchBaseQueryError } from '@reduxjs/toolkit/query/react'
import { API_BASE_URL } from '@/config/site'
import { sessionExpired } from '@/features/auth/authActions'

const rawBaseQuery = fetchBaseQuery({
  baseUrl: `${API_BASE_URL}/admin`,
  // The staff session lives in an httpOnly cookie set by the API.
  credentials: 'include',
})

// A 401 on any request except the session check itself means the session ended.
const baseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions)
  const url = typeof args === 'string' ? args : args.url
  if (result.error?.status === 401 && !url.startsWith('/auth/')) api.dispatch(sessionExpired())
  return result
}

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['Me', 'Stats', 'Product', 'Category', 'Order', 'Payment', 'Customer', 'Staff', 'Banner', 'Settings'],
  endpoints: () => ({}),
})

// Drops empty filters so they are not sent as `?q=`.
export const cleanParams = (params: object) =>
  Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ''))

// The backend's `{ message }` from a failed request, for display.
export const errorMessage = (error: unknown) => {
  if (error && typeof error === 'object' && 'status' in error) {
    const { status, data } = error as FetchBaseQueryError
    if (data && typeof data === 'object' && 'message' in data && typeof data.message === 'string') return data.message
    if (status === 'FETCH_ERROR') return 'Could not reach the server. Check that the backend is running.'
    return `Request failed (${String(status)})`
  }
  return 'Something went wrong'
}
