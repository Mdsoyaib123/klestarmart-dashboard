import { ShoppingCart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useGetOrdersQuery } from '@/features/orders/ordersApi'
import { useListParams } from '@/hooks/useListParams'
import { formatDateTime, formatPrice } from '@/lib/format'
import { ORDER_STATUS, PAYMENT_STATUS } from '@/lib/labels'
import { inputClass, tableClass, tableWrapClass, tdClass, thClass } from '@/lib/ui'
import Button from '@/components/ui/Button'
import PageHeader from '@/components/ui/PageHeader'
import Pagination from '@/components/ui/Pagination'
import SearchInput from '@/components/ui/SearchInput'
import Select from '@/components/ui/Select'
import { EmptyState, ErrorNotice, Loading } from '@/components/ui/States'
import { OrderStatusBadge, PaymentStatusBadge } from '@/components/ui/OrderBadges'
import { ORDER_STATUSES, PAYMENT_STATUSES, type OrderStatus, type PaymentStatus } from '@/types'

const KEYS = ['q', 'status', 'paymentStatus', 'from', 'to'] as const

export default function Orders() {
  const { values, page, set, clear, active } = useListParams(KEYS)
  const { data, error, refetch, isLoading, isFetching } = useGetOrdersQuery({
    page,
    limit: 20,
    q: values.q,
    status: values.status as OrderStatus,
    paymentStatus: values.paymentStatus as PaymentStatus,
    from: values.from,
    // Include the whole "to" day.
    to: values.to ? `${values.to}T23:59:59` : '',
  })

  return (
    <>
      <PageHeader title="Orders" description={data ? `${data.meta.total.toLocaleString()} order${data.meta.total === 1 ? '' : 's'}` : undefined} />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <SearchInput value={values.q} onChange={(value) => set('q', value)} placeholder="Order number, name or phone" />
        <Select value={values.status} onChange={(event) => set('status', event.target.value)} aria-label="Order status">
          <option value="">All statuses</option>
          {ORDER_STATUSES.map((status) => (
            <option key={status} value={status}>
              {ORDER_STATUS[status].label}
            </option>
          ))}
        </Select>
        <Select value={values.paymentStatus} onChange={(event) => set('paymentStatus', event.target.value)} aria-label="Payment status">
          <option value="">All payments</option>
          {PAYMENT_STATUSES.map((status) => (
            <option key={status} value={status}>
              {PAYMENT_STATUS[status].label}
            </option>
          ))}
        </Select>
        <input type="date" value={values.from} onChange={(event) => set('from', event.target.value)} aria-label="From date" className={`${inputClass} w-auto`} />
        <input type="date" value={values.to} onChange={(event) => set('to', event.target.value)} aria-label="To date" className={`${inputClass} w-auto`} />
        {active && (
          <Button variant="ghost" onClick={clear}>
            Clear filters
          </Button>
        )}
      </div>

      {error && <ErrorNotice error={error} onRetry={refetch} />}
      {isLoading ? (
        <Loading />
      ) : data && data.items.length === 0 ? (
        <div className={tableWrapClass}>
          <EmptyState
            icon={<ShoppingCart className="h-5 w-5" />}
            title={active ? 'No orders match these filters' : 'No orders yet'}
            description={active ? 'Try a different search or clear the filters.' : 'Orders placed in the storefront will appear here.'}
          />
        </div>
      ) : (
        data && (
          <>
            <div className={`${tableWrapClass} transition-opacity ${isFetching ? 'opacity-60' : ''}`}>
              <table className={`${tableClass} min-w-[860px]`}>
                <thead>
                  <tr>
                    <th className={thClass}>Order</th>
                    <th className={thClass}>Date</th>
                    <th className={thClass}>Customer</th>
                    <th className={thClass}>Items</th>
                    <th className={thClass}>Status</th>
                    <th className={thClass}>Payment</th>
                    <th className={`${thClass} text-right`}>Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {data.items.map((order) => (
                    <tr key={order.id} className="hover:bg-cream/40">
                      <td className={tdClass}>
                        <Link to={`/orders/${order.id}`} className="font-medium text-brand hover:underline">
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className={`${tdClass} whitespace-nowrap text-muted`}>{formatDateTime(order.createdAt)}</td>
                      <td className={tdClass}>
                        <p className="font-medium">{order.customer.name}</p>
                        <p className="text-xs text-muted">
                          {order.customer.phone} · {order.shippingAddress.district}
                        </p>
                      </td>
                      <td className={`${tdClass} tabular-nums text-muted`}>{order.items.reduce((sum, item) => sum + item.quantity, 0)}</td>
                      <td className={tdClass}>
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className={tdClass}>
                        <PaymentStatusBadge status={order.paymentStatus} />
                      </td>
                      <td className={`${tdClass} text-right font-medium tabular-nums`}>{formatPrice(order.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination meta={data.meta} onPage={(next) => set('page', next)} />
          </>
        )
      )}
    </>
  )
}
