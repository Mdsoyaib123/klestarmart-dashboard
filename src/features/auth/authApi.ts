import { baseApi } from '@/api/baseApi'
import type { ApiResponse, StaffUser } from '@/types'

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMe: builder.query<StaffUser | null, void>({
      // Signed out is a normal state, not an error.
      queryFn: async (_arg, _api, _extra, baseQuery) => {
        const result = await baseQuery('/auth/me')
        if (result.error) return result.error.status === 401 ? { data: null } : { error: result.error }
        return { data: (result.data as ApiResponse<StaffUser>).data }
      },
      providesTags: ['Me'],
    }),
    login: builder.mutation<StaffUser, { email: string; password: string }>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
      transformResponse: (response: ApiResponse<StaffUser>) => response.data,
    }),
    logout: builder.mutation<void, void>({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
    }),
    changePassword: builder.mutation<void, { currentPassword: string; newPassword: string }>({
      query: (body) => ({ url: '/auth/password', method: 'PUT', body }),
    }),
  }),
})

export const { useGetMeQuery, useLoginMutation, useLogoutMutation, useChangePasswordMutation } = authApi
