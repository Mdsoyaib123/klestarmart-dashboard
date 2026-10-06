import { baseApi, cleanParams } from '@/api/baseApi'
import type { ApiResponse, Order, OrderStatus, PageMeta, Paginated, Payment, PaymentMethod, PaymentStatus, PaymentSummary } from '@/types'

export interface OrderQuery {
  page?: number
  limit?: number
  q?: string
  status?: OrderStatus | ''
  paymentStatus?: PaymentStatus | ''
  user?: string
  from?: string
  to?: string
}

export interface PaymentQuery {
  page?: number
  limit?: number
  q?: string
  type?: 'payment' | 'refund' | ''
  method?: PaymentMethod | ''
  status?: Payment['status'] | ''
  from?: string
  to?: string
}

export interface OrderDetail {
  order: Order
  payments: Payment[]
}

export interface PaymentInput {
  type: 'payment' | 'refund'
  method: PaymentMethod
  amount: number
  transactionId?: string
  note?: string
}

const detailTags = (id: string) => [{ type: 'Order' as const, id }, { type: 'Order' as const, id: 'LIST' }, 'Payment' as const, 'Stats' as const, 'Customer' as const]

export const ordersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOrders: builder.query<Paginated<Order>, OrderQuery>({
      query: (params) => ({ url: '/orders', params: cleanParams(params) }),
      transformResponse: (response: { data: Order[]; meta: PageMeta }) => ({ items: response.data, meta: response.meta }),
      providesTags: (result) => [{ type: 'Order', id: 'LIST' }, ...(result?.items ?? []).map(({ id }) => ({ type: 'Order' as const, id }))],
    }),
    getOrder: builder.query<OrderDetail, string>({
      query: (id) => `/orders/${id}`,
      transformResponse: (response: ApiResponse<OrderDetail>) => response.data,
      providesTags: (_result, _error, id) => [{ type: 'Order', id }],
    }),
    updateOrderStatus: builder.mutation<OrderDetail, { id: string; status: OrderStatus; note?: string }>({
      query: ({ id, ...body }) => ({ url: `/orders/${id}/status`, method: 'PATCH', body }),
      transformResponse: (response: ApiResponse<OrderDetail>) => response.data,
      // Status changes move stock, so products refresh as well.
      invalidatesTags: (_result, _error, { id }) => [...detailTags(id), { type: 'Product', id: 'LIST' }],
    }),
    recordPayment: builder.mutation<OrderDetail, { id: string; body: PaymentInput }>({
      query: ({ id, body }) => ({ url: `/orders/${id}/payments`, method: 'POST', body }),
      transformResponse: (response: ApiResponse<OrderDetail>) => response.data,
      invalidatesTags: (_result, _error, { id }) => detailTags(id),
    }),
    getPayments: builder.query<Paginated<Payment> & { summary: PaymentSummary }, PaymentQuery>({
      query: (params) => ({ url: '/payments', params: cleanParams(params) }),
      transformResponse: (response: { data: Payment[]; meta: PageMeta; summary: PaymentSummary }) => ({
        items: response.data,
        meta: response.meta,
        summary: response.summary,
      }),
      providesTags: ['Payment'],
    }),
  }),
})

export const { useGetOrdersQuery, useGetOrderQuery, useUpdateOrderStatusMutation, useRecordPaymentMutation, useGetPaymentsQuery } = ordersApi
