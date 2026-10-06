import { baseApi } from '@/api/baseApi'
import type { ApiResponse, Overview } from '@/types'

export const statsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOverview: builder.query<Overview, number>({
      query: (days) => ({ url: '/stats/overview', params: { days } }),
      transformResponse: (response: ApiResponse<Overview>) => response.data,
      providesTags: ['Stats'],
    }),
  }),
})

export const { useGetOverviewQuery } = statsApi
