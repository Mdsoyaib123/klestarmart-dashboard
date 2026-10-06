import { Ban, ChevronLeft, Mail, Phone, UserCheck } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useGetCustomerQuery, useSetCustomerStatusMutation } from '@/features/customers/customersApi'
import { useGetOrdersQuery } from '@/features/orders/ordersApi'
import { useRunWithToast } from '@/hooks/useAppActions'
import { formatDate, formatDateTime, formatPrice } from '@/lib/format'
import { tableClass, tdClass, thClass } from '@/lib/ui'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import PageHeader from '@/components/ui/PageHeader'
import Pagination from '@/components/ui/Pagination'
import { EmptyState, ErrorNotice, Loading } from '@/components/ui/States'
import { OrderStatusBadge, PaymentStatusBadge } from '@/components/ui/OrderBadges'

export default function CustomerDetail() {
  const { id = '' } = useParams()
  const [page, setPage] = useState(1)
  const { currentData: customer, error, refetch, isFetching } = useGetCustomerQuery(id)
  const { data: orders } = useGetOrdersQuery({ user: id, page, limit: 10 })
  const [setStatus, { isLoading: saving }] = useSetCustomerStatusMutation()
  const [confirming, setConfirming] = useState(false)
  const run = useRunWithToast()

  const back = (
    <Link to="/customers" className="mb-3 inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
      <ChevronLeft className="h-4 w-4" /> Customers
    </Link>
  )

  if (error) return (<>{back}<ErrorNotice error={error} onRetry={refetch} /></>)
  if (!customer) return isFetching ? <Loading /> : null

  const blocked = customer.status === 'blocked'
  const toggle = async () => {
    const ok = await run(() => setStatus({ id, status: blocked ? 'active' : 'blocked' }).unwrap(), blocked ? `${customer.name} is unblocked` : `${customer.name} is blocked`)
    if (ok) setConfirming(false)
  }

  const stats = [
    { label: 'Orders', value: customer.orderCount.toLocaleString() },
    { label: 'Total spent', value: formatPrice(customer.totalSpent) },
    { label: 'Average order', value: formatPrice(customer.orderCount ? Math.round(customer.totalSpent / customer.orderCount) : 0) },
    { label: 'Last order', value: customer.lastOrderAt ? formatDate(customer.lastOrderAt) : '—' },
  ]

  return (
    <>
      <PageHeader
        back={back}
        title={
          <span className="flex flex-wrap items-center gap-3">
            {customer.name}
            <Badge tone={customer.registered ? 'info' : 'neutral'}>{customer.registered ? 'Registered' : 'Guest'}</Badge>
            {blocked && <Badge tone="danger">Blocked</Badge>}
          </span>
        }
        description={`Customer since ${formatDate(customer.createdAt)}${customer.lastLoginAt ? ` · last signed in ${formatDateTime(customer.lastLoginAt)}` : ''}`}
        actions={
          <Button variant={blocked ? 'secondary' : 'danger'} icon={blocked ? <UserCheck className="h-4 w-4" /> : <Ban className="h-4 w-4" />} onClick={() => setConfirming(true)}>
            {blocked ? 'Unblock customer' : 'Block customer'}
          </Button>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-line bg-white p-5">
            <p className="text-sm text-muted">{stat.label}</p>
            <p className="mt-2 text-xl font-semibold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        <Card title="Contact">
          <div className="space-y-2 text-sm">
            {customer.phone && (
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted" />
                <a href={`tel:${customer.phone}`} className="hover:underline">
                  {customer.phone}
                </a>
              </p>
            )}
            {customer.email && (
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted" />
                <a href={`mailto:${customer.email}`} className="hover:underline">
                  {customer.email}
                </a>
              </p>
            )}
          </div>
        </Card>
        <Card title="Order history" padded={false}>
          {orders && orders.items.length === 0 ? (
            <EmptyState title="No orders yet" />
          ) : (
            <div className="overflow-x-auto">
              <table className={tableClass}>
                <thead>
                  <tr>
                    <th className={thClass}>Order</th>
                    <th className={thClass}>Date</th>
                    <th className={thClass}>Status</th>
                    <th className={thClass}>Payment</th>
                    <th className={`${thClass} text-right`}>Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {orders?.items.map((order) => (
                    <tr key={order.id} className="hover:bg-cream/40">
                      <td className={tdClass}>
                        <Link to={`/orders/${order.id}`} className="font-medium text-brand hover:underline">
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className={`${tdClass} text-muted`}>{formatDate(order.createdAt)}</td>
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
              <div className="px-5 pb-4">
                <Pagination meta={orders?.meta} onPage={setPage} />
              </div>
            </div>
          )}
        </Card>
      </div>

      <ConfirmDialog
        open={confirming}
        title={blocked ? 'Unblock this customer?' : 'Block this customer?'}
        message={
          blocked
            ? `${customer.name} will be able to sign in and place orders again.`
            : `${customer.name} will be signed out and will not be able to sign in or place orders with this phone number. Existing orders are not affected.`
        }
        confirmLabel={blocked ? 'Unblock' : 'Block customer'}
        danger={!blocked}
        loading={saving}
        onConfirm={toggle}
        onClose={() => setConfirming(false)}
      />
    </>
  )
}
