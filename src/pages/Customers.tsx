import { Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useGetCustomersQuery } from '@/features/customers/customersApi'
import { useListParams } from '@/hooks/useListParams'
import { formatDate, formatPrice } from '@/lib/format'
import { tableClass, tableWrapClass, tdClass, thClass } from '@/lib/ui'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import PageHeader from '@/components/ui/PageHeader'
import Pagination from '@/components/ui/Pagination'
import SearchInput from '@/components/ui/SearchInput'
import Select from '@/components/ui/Select'
import { EmptyState, ErrorNotice, Loading } from '@/components/ui/States'

const KEYS = ['q', 'status', 'type'] as const

export default function Customers() {
  const { values, page, set, clear, active } = useListParams(KEYS)
  const { data, error, refetch, isLoading, isFetching } = useGetCustomersQuery({
    page,
    limit: 25,
    q: values.q,
    status: values.status as 'active' | 'blocked',
    type: values.type as 'registered' | 'guest',
  })

  return (
    <>
      <PageHeader
        title="Customers"
        description="Everyone who has an account or has ordered as a guest. Guests become registered when they sign up with the same phone number."
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <SearchInput value={values.q} onChange={(value) => set('q', value)} placeholder="Name, phone or email" />
        <Select value={values.type} onChange={(event) => set('type', event.target.value)} aria-label="Account type">
          <option value="">All customers</option>
          <option value="registered">Registered</option>
          <option value="guest">Guests</option>
        </Select>
        <Select value={values.status} onChange={(event) => set('status', event.target.value)} aria-label="Status">
          <option value="">Any status</option>
          <option value="active">Active</option>
          <option value="blocked">Blocked</option>
        </Select>
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
          <EmptyState icon={<Users className="h-5 w-5" />} title={active ? 'No customers match these filters' : 'No customers yet'} />
        </div>
      ) : (
        data && (
          <>
            <div className={`${tableWrapClass} transition-opacity ${isFetching ? 'opacity-60' : ''}`}>
              <table className={`${tableClass} min-w-[820px]`}>
                <thead>
                  <tr>
                    <th className={thClass}>Customer</th>
                    <th className={thClass}>Phone</th>
                    <th className={thClass}>Account</th>
                    <th className={`${thClass} text-right`}>Orders</th>
                    <th className={`${thClass} text-right`}>Total spent</th>
                    <th className={thClass}>Last order</th>
                    <th className={thClass}>Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {data.items.map((customer) => (
                    <tr key={customer.id} className="hover:bg-cream/40">
                      <td className={tdClass}>
                        <Link to={`/customers/${customer.id}`} className="font-medium text-brand hover:underline">
                          {customer.name}
                        </Link>
                        {customer.email && <p className="text-xs text-muted">{customer.email}</p>}
                      </td>
                      <td className={`${tdClass} tabular-nums`}>{customer.phone ?? '—'}</td>
                      <td className={tdClass}>
                        <span className="flex flex-wrap gap-1.5">
                          <Badge tone={customer.registered ? 'info' : 'neutral'}>{customer.registered ? 'Registered' : 'Guest'}</Badge>
                          {customer.status === 'blocked' && <Badge tone="danger">Blocked</Badge>}
                        </span>
                      </td>
                      <td className={`${tdClass} text-right tabular-nums`}>{customer.orderCount}</td>
                      <td className={`${tdClass} text-right font-medium tabular-nums`}>{formatPrice(customer.totalSpent)}</td>
                      <td className={`${tdClass} text-muted`}>{customer.lastOrderAt ? formatDate(customer.lastOrderAt) : '—'}</td>
                      <td className={`${tdClass} text-muted`}>{formatDate(customer.createdAt)}</td>
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
