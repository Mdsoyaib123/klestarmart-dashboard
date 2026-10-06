import { CreditCard } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useGetPaymentsQuery } from '@/features/orders/ordersApi'
import { useListParams } from '@/hooks/useListParams'
import { formatDateTime, formatPrice } from '@/lib/format'
import { PAYMENT_METHOD, PAYMENT_RECORD_STATUS } from '@/lib/labels'
import { filterClass, tableClass, tableWrapClass, tdClass, thClass } from '@/lib/ui'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import PageHeader from '@/components/ui/PageHeader'
import Pagination from '@/components/ui/Pagination'
import SearchInput from '@/components/ui/SearchInput'
import Select from '@/components/ui/Select'
import { EmptyState, ErrorNotice, Loading } from '@/components/ui/States'
import { PAYMENT_METHODS, type Payment, type PaymentMethod } from '@/types'

const KEYS = ['q', 'type', 'method', 'status', 'from', 'to'] as const

export default function Payments() {
  const { values, page, set, clear, active } = useListParams(KEYS)
  const { data, error, refetch, isLoading, isFetching } = useGetPaymentsQuery({
    page,
    limit: 25,
    q: values.q,
    type: values.type as Payment['type'],
    method: values.method as PaymentMethod,
    status: values.status as Payment['status'],
    from: values.from,
    to: values.to ? `${values.to}T23:59:59` : '',
  })

  const summary = [
    { label: 'Collected', value: data?.summary.collected ?? 0, hint: 'Completed payments' },
    { label: 'Awaiting collection', value: data?.summary.pending ?? 0, hint: 'Cash on delivery not yet collected' },
    { label: 'Refunded', value: data?.summary.refunded ?? 0, hint: 'Money returned to customers' },
    { label: 'Net received', value: data?.summary.net ?? 0, hint: 'Collected minus refunds' },
  ]

  return (
    <>
      <PageHeader title="Payments" description="Every payment and refund recorded against an order. Totals follow the filters below." />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <SearchInput value={values.q} onChange={(value) => set('q', value)} placeholder="Order, customer or transaction ID" />
        <Select value={values.type} onChange={(event) => set('type', event.target.value)} aria-label="Type">
          <option value="">Payments and refunds</option>
          <option value="payment">Payments</option>
          <option value="refund">Refunds</option>
        </Select>
        <Select value={values.method} onChange={(event) => set('method', event.target.value)} aria-label="Method">
          <option value="">All methods</option>
          {PAYMENT_METHODS.map((method) => (
            <option key={method} value={method}>
              {PAYMENT_METHOD[method]}
            </option>
          ))}
        </Select>
        <Select value={values.status} onChange={(event) => set('status', event.target.value)} aria-label="Status">
          <option value="">All statuses</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Void</option>
        </Select>
        <input type="date" value={values.from} onChange={(event) => set('from', event.target.value)} aria-label="From date" className={filterClass} />
        <input type="date" value={values.to} onChange={(event) => set('to', event.target.value)} aria-label="To date" className={filterClass} />
        {active && (
          <Button variant="ghost" onClick={clear}>
            Clear filters
          </Button>
        )}
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summary.map((item) => (
          <div key={item.label} className="rounded-xl border border-line bg-white p-5">
            <p className="text-sm text-muted">{item.label}</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight">{formatPrice(item.value)}</p>
            <p className="mt-1 text-xs text-muted">{item.hint}</p>
          </div>
        ))}
      </div>

      {error && <ErrorNotice error={error} onRetry={refetch} />}
      {isLoading ? (
        <Loading />
      ) : data && data.items.length === 0 ? (
        <div className={tableWrapClass}>
          <EmptyState icon={<CreditCard className="h-5 w-5" />} title={active ? 'No payments match these filters' : 'No payments yet'} description="Payments appear here when customers place orders." />
        </div>
      ) : (
        data && (
          <>
            <div className={`${tableWrapClass} transition-opacity ${isFetching ? 'opacity-60' : ''}`}>
              <table className={`${tableClass} min-w-[900px]`}>
                <thead>
                  <tr>
                    <th className={thClass}>Date</th>
                    <th className={thClass}>Order</th>
                    <th className={thClass}>Customer</th>
                    <th className={thClass}>Method</th>
                    <th className={thClass}>Transaction</th>
                    <th className={thClass}>Status</th>
                    <th className={`${thClass} text-right`}>Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {data.items.map((payment) => (
                    <tr key={payment.id} className="hover:bg-cream/40">
                      <td className={`${tdClass} whitespace-nowrap text-muted`}>{formatDateTime(payment.completedAt ?? payment.createdAt)}</td>
                      <td className={tdClass}>
                        <Link to={`/orders/${payment.order}`} className="font-medium text-brand hover:underline">
                          {payment.orderNumber}
                        </Link>
                      </td>
                      <td className={tdClass}>{payment.customerName}</td>
                      <td className={tdClass}>
                        {PAYMENT_METHOD[payment.method]}
                        {payment.type === 'refund' && <span className="ml-1.5 text-xs font-medium text-accent">Refund</span>}
                      </td>
                      <td className={`${tdClass} font-mono text-xs text-muted`}>{payment.transactionId ?? '—'}</td>
                      <td className={tdClass}>
                        <Badge tone={PAYMENT_RECORD_STATUS[payment.status].tone}>{PAYMENT_RECORD_STATUS[payment.status].label}</Badge>
                      </td>
                      <td className={`${tdClass} text-right font-medium tabular-nums ${payment.type === 'refund' ? 'text-accent' : ''}`}>
                        {payment.type === 'refund' ? '−' : ''}
                        {formatPrice(payment.amount)}
                      </td>
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
