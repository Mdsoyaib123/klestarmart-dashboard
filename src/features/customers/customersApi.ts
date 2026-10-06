import { baseApi, cleanParams } from '@/api/baseApi'
import type { ApiResponse, Customer, PageMeta, Paginated, StaffUser } from '@/types'

export interface CustomerQuery {
  page?: number
  limit?: number
  q?: string
  status?: 'active' | 'blocked' | ''
  type?: 'registered' | 'guest' | ''
}

export interface StaffInput {
  name: string
  email?: string
  role: StaffUser['role']
  status?: StaffUser['status']
  password?: string
}

export const customersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCustomers: builder.query<Paginated<Customer>, CustomerQuery>({
      query: (params) => ({ url: '/customers', params: cleanParams(params) }),
      transformResponse: (response: { data: Customer[]; meta: PageMeta }) => ({ items: response.data, meta: response.meta }),
      providesTags: ['Customer'],
    }),
    getCustomer: builder.query<Customer, string>({
      query: (id) => `/customers/${id}`,
      transformResponse: (response: ApiResponse<Customer>) => response.data,
      providesTags: ['Customer'],
    }),
    setCustomerStatus: builder.mutation<Customer, { id: string; status: Customer['status'] }>({
      query: ({ id, status }) => ({ url: `/customers/${id}/status`, method: 'PATCH', body: { status } }),
      invalidatesTags: ['Customer'],
    }),
    getStaff: builder.query<StaffUser[], void>({
      query: () => '/staff',
      transformResponse: (response: ApiResponse<StaffUser[]>) => response.data,
      providesTags: ['Staff'],
    }),
    saveStaff: builder.mutation<StaffUser, { id?: string; body: StaffInput }>({
      query: ({ id, body }) => ({ url: id ? `/staff/${id}` : '/staff', method: id ? 'PUT' : 'POST', body }),
      invalidatesTags: ['Staff', 'Me'],
    }),
  }),
})

export const { useGetCustomersQuery, useGetCustomerQuery, useSetCustomerStatusMutation, useGetStaffQuery, useSaveStaffMutation } = customersApi
