import { Banknote, Clock, Package, ShoppingCart, Users } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppSelector } from '@/app/hooks'
import { selectUser } from '@/features/auth/authSlice'
import { useGetOverviewQuery } from '@/features/stats/statsApi'
import { formatCompactPrice, formatDateTime, formatNumber, formatPrice, formatShortDate, percentChange } from '@/lib/format'
import { ORDER_STATUS, PAYMENT_METHOD } from '@/lib/labels'
import { tableClass, tdClass, thClass } from '@/lib/ui'
import AreaChart from '@/components/charts/AreaChart'
import BarList from '@/components/charts/BarList'
import Card from '@/components/ui/Card'
import PageHeader from '@/components/ui/PageHeader'
import Select from '@/components/ui/Select'
import StatCard from '@/components/ui/StatCard'
import { EmptyState, ErrorNotice, Loading } from '@/components/ui/States'
import { OrderStatusBadge, PaymentStatusBadge } from '@/components/ui/OrderBadges'
import { ORDER_STATUSES } from '@/types'

const RANGES = [
  { days: 7, label: 'Last 7 days' },
  { days: 30, label: 'Last 30 days' },
  { days: 90, label: 'Last 90 days' },
  { days: 365, label: 'Last 12 months' },
]

export default function Overview() {
  const user = useAppSelector(selectUser)
  const [days, setDays] = useState(30)
  const { data, error, refetch, isFetching } = useGetOverviewQuery(days)

  const [greeting] = useState(() => {
    const hour = new Date().getHours()
    return hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  })

  return (
    <>
      <PageHeader
        title={`${greeting}, ${user?.name.split(' ')[0] ?? ''}`}
        description="Here is how your store is doing."
        actions={
          <Select value={days} onChange={(event) => setDays(Number(event.target.value))} aria-label="Date range">
            {RANGES.map((range) => (
              <option key={range.days} value={range.days}>
                {range.label}
              </option>
            ))}
          </Select>
        }
      />

      {error && <ErrorNotice error={error} onRetry={refetch} />}
      {!data && !error && <Loading />}

      {data && (
        // Holds the previous numbers, slightly faded, while a new range loads.
        <div className={`space-y-6 transition-opacity ${isFetching ? 'opacity-60' : ''}`}>
          {data.pendingOrders > 0 && (
            <Link to="/orders?status=pending" className="flex items-center gap-3 rounded-xl border border-warning/30 bg-warning-soft px-4 py-3 text-sm text-warning hover:border-warning/60">
              <Clock className="h-4 w-4" />
              <span>
                <strong>{data.pendingOrders}</strong> order{data.pendingOrders === 1 ? '' : 's'} waiting for confirmation
              </span>
              <span className="ml-auto font-medium">Review →</span>
            </Link>
          )}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Revenue" value={formatPrice(data.current.revenue)} change={percentChange(data.current.revenue, data.previous.revenue)} icon={<Banknote className="h-4 w-4" />} />
            <StatCard label="Orders" value={formatNumber(data.current.orders)} change={percentChange(data.current.orders, data.previous.orders)} icon={<ShoppingCart className="h-4 w-4" />} />
            <StatCard label="Units sold" value={formatNumber(data.current.units)} change={percentChange(data.current.units, data.previous.units)} icon={<Package className="h-4 w-4" />} />
            <StatCard
              label="New customers"
              value={formatNumber(data.current.newCustomers)}
              change={percentChange(data.current.newCustomers, data.previous.newCustomers)}
              icon={<Users className="h-4 w-4" />}
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
            <Card title="Revenue" description={`Daily sales, excluding cancelled and returned orders · average order ${formatPrice(data.current.averageOrder)}`}>
              <AreaChart
                data={data.series.map((point) => ({ label: formatShortDate(point.date), value: point.revenue }))}
                valueLabel="Revenue"
                formatValue={formatPrice}
                formatAxis={formatCompactPrice}
              />
            </Card>
            <Card title="Best sellers" description="By units sold" actions={<Link to="/products?sort=sold" className="text-xs font-medium text-brand hover:underline">All products</Link>}>
              <BarList
                items={data.topProducts.map((product) => ({
                  key: product.productId,
                  label: <Link to={`/products/${product.productId}`} className="hover:underline">{product.name}</Link>,
                  value: product.units,
                  display: `${product.units} sold`,
                }))}
                emptyText="No sales in this period yet"
              />
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card title="Orders by status" description="Orders placed in this period">
              <BarList
                items={ORDER_STATUSES.filter((status) => data.ordersByStatus[status]).map((status) => ({
                  key: status,
                  label: <Link to={`/orders?status=${status}`} className="hover:underline">{ORDER_STATUS[status].label}</Link>,
                  value: data.ordersByStatus[status] ?? 0,
                }))}
                emptyText="No orders in this period"
              />
            </Card>
            <Card title="Payment methods" description="Share of sales">
              <BarList
                items={data.paymentMethods.map((row) => ({ key: row.method, label: PAYMENT_METHOD[row.method], value: row.amount, display: formatPrice(row.amount) }))}
                emptyText="No sales in this period"
              />
            </Card>
            <Card title="Low stock" description="Active products with 5 or fewer left" padded={false}>
              {data.lowStock.length === 0 ? (
                <p className="px-5 py-8 text-center text-sm text-muted">Every product has healthy stock.</p>
              ) : (
                <ul className="divide-y divide-line">
                  {data.lowStock.map((product) => (
                    <li key={product.id}>
                      <Link to={`/products/${product.id}`} className="flex items-center justify-between gap-3 px-5 py-2.5 text-sm hover:bg-cream/50">
                        <span className="min-w-0 truncate">{product.name}</span>
                        <span className={`shrink-0 font-medium tabular-nums ${product.stock === 0 ? 'text-accent' : 'text-warning'}`}>
                          {product.stock === 0 ? 'Out of stock' : `${product.stock} left`}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>

          <Card title="Recent orders" padded={false} actions={<Link to="/orders" className="text-xs font-medium text-brand hover:underline">View all</Link>}>
            {data.recentOrders.length === 0 ? (
              <EmptyState title="No orders yet" description="Orders placed in the storefront will appear here." />
            ) : (
              <div className="overflow-x-auto">
                <table className={tableClass}>
                  <thead>
                    <tr>
                      <th className={thClass}>Order</th>
                      <th className={thClass}>Customer</th>
                      <th className={thClass}>Date</th>
                      <th className={thClass}>Status</th>
                      <th className={thClass}>Payment</th>
                      <th className={`${thClass} text-right`}>Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {data.recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-cream/40">
                        <td className={tdClass}>
                          <Link to={`/orders/${order.id}`} className="font-medium text-brand hover:underline">
                            {order.orderNumber}
                          </Link>
                        </td>
                        <td className={tdClass}>{order.customer.name}</td>
                        <td className={`${tdClass} whitespace-nowrap text-muted`}>{formatDateTime(order.createdAt)}</td>
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
            )}
          </Card>
        </div>
      )}
    </>
  )
}
