import { ChevronLeft, CreditCard, MapPin, Phone, Printer, RotateCcw, User } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useGetOrderQuery, useRecordPaymentMutation, useUpdateOrderStatusMutation, type PaymentInput } from '@/features/orders/ordersApi'
import { useRunWithToast } from '@/hooks/useAppActions'
import { formatDateTime, formatPrice } from '@/lib/format'
import { NEXT_STATUSES, ORDER_STATUS, PAYMENT_METHOD, PAYMENT_RECORD_STATUS } from '@/lib/labels'
import { inputClass, tableClass, tdClass, textareaClass, thClass } from '@/lib/ui'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { Field } from '@/components/ui/Field'
import Modal from '@/components/ui/Modal'
import PageHeader from '@/components/ui/PageHeader'
import { ErrorNotice, Loading } from '@/components/ui/States'
import { OrderStatusBadge, PaymentStatusBadge } from '@/components/ui/OrderBadges'
import { PAYMENT_METHODS, type Order, type OrderStatus, type PaymentMethod } from '@/types'

const ACTION_LABELS: Partial<Record<OrderStatus, string>> = {
  confirmed: 'Confirm order',
  processing: 'Start processing',
  shipped: 'Mark as shipped',
  delivered: 'Mark as delivered',
  cancelled: 'Cancel order',
  returned: 'Mark as returned',
}

const CONSEQUENCES: Partial<Record<OrderStatus, string>> = {
  cancelled: 'The items go back into stock and any cash still expected on delivery is voided.',
  returned: 'The items go back into stock. If the customer already paid, record a refund afterwards.',
  delivered: 'Cash on delivery still pending is marked as collected.',
}

function StatusModal({ order, target, onClose }: { order: Order; target: OrderStatus | null; onClose: () => void }) {
  const [updateStatus, { isLoading }] = useUpdateOrderStatusMutation()
  const run = useRunWithToast()
  const [note, setNote] = useState('')

  const submit = async () => {
    if (!target) return
    const ok = await run(() => updateStatus({ id: order.id, status: target, note: note.trim() || undefined }).unwrap(), `Order ${order.orderNumber} is now ${ORDER_STATUS[target].label.toLowerCase()}`)
    if (ok) {
      setNote('')
      onClose()
    }
  }

  const danger = target === 'cancelled' || target === 'returned'
  return (
    <Modal
      open={target !== null}
      onClose={onClose}
      title={target ? (ACTION_LABELS[target] ?? 'Update status') : ''}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Back
          </Button>
          <Button variant={danger ? 'danger' : 'primary'} loading={isLoading} onClick={submit}>
            {target ? ACTION_LABELS[target] : 'Save'}
          </Button>
        </>
      }
    >
      {target && CONSEQUENCES[target] && <p className="mb-4 text-sm text-muted">{CONSEQUENCES[target]}</p>}
      <Field label="Note (optional)" hint="Saved in the order timeline, e.g. courier name or tracking number.">
        <textarea value={note} onChange={(event) => setNote(event.target.value)} rows={3} maxLength={300} className={textareaClass} />
      </Field>
    </Modal>
  )
}

function PaymentModal({ order, type, onClose }: { order: Order; type: PaymentInput['type'] | null; onClose: () => void }) {
  const [recordPayment, { isLoading }] = useRecordPaymentMutation()
  const run = useRunWithToast()
  const due = order.total - order.amountPaid
  const refundable = order.amountPaid - order.amountRefunded

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!type) return
    const form = new FormData(event.currentTarget)
    const text = (name: string) => String(form.get(name) ?? '').trim()
    const ok = await run(
      () =>
        recordPayment({
          id: order.id,
          body: { type, method: text('method') as PaymentMethod, amount: Number(text('amount')), transactionId: text('transactionId') || undefined, note: text('note') || undefined },
        }).unwrap(),
      type === 'refund' ? 'Refund recorded' : 'Payment recorded',
    )
    if (ok) onClose()
  }

  return (
    <Modal open={type !== null} onClose={onClose} title={type === 'refund' ? 'Record a refund' : 'Record a payment'} size="sm">
      {type && (
        <form onSubmit={submit} className="space-y-4">
          <p className="text-sm text-muted">
            {type === 'refund' ? `Up to ${formatPrice(refundable)} can be refunded.` : `${formatPrice(due)} is still due on this order.`}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Amount (৳)">
              <input name="amount" type="number" min={1} max={type === 'refund' ? refundable : due} step={1} required defaultValue={type === 'refund' ? refundable : due} className={inputClass} />
            </Field>
            <Field label="Method">
              <select name="method" defaultValue="bkash" className={inputClass}>
                {PAYMENT_METHODS.map((method) => (
                  <option key={method} value={method}>
                    {PAYMENT_METHOD[method]}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Transaction ID" hint="From bKash, Nagad, the card terminal or the bank.">
            <input name="transactionId" maxLength={80} className={inputClass} />
          </Field>
          <Field label="Note (optional)">
            <input name="note" maxLength={300} className={inputClass} />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant={type === 'refund' ? 'danger' : 'primary'} loading={isLoading}>
              {type === 'refund' ? 'Record refund' : 'Record payment'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  )
}

export default function OrderDetail() {
  const { id = '' } = useParams()
  const { currentData, error, refetch, isFetching } = useGetOrderQuery(id)
  const [target, setTarget] = useState<OrderStatus | null>(null)
  const [paymentType, setPaymentType] = useState<PaymentInput['type'] | null>(null)

  const back = (
    <Link to="/orders" className="no-print mb-3 inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
      <ChevronLeft className="h-4 w-4" /> Orders
    </Link>
  )

  if (error) return (<>{back}<ErrorNotice error={error} onRetry={refetch} /></>)
  if (!currentData) return isFetching ? <Loading /> : null

  const { order, payments } = currentData
  const next = NEXT_STATUSES[order.status]
  const due = order.total - order.amountPaid
  const refundable = order.amountPaid - order.amountRefunded

  return (
    <>
      <PageHeader
        back={back}
        title={
          <span className="flex flex-wrap items-center gap-3">
            Order {order.orderNumber} <OrderStatusBadge status={order.status} /> <PaymentStatusBadge status={order.paymentStatus} />
          </span>
        }
        description={`Placed ${formatDateTime(order.createdAt)}`}
        actions={
          <div className="no-print flex flex-wrap gap-2">
            <Button variant="secondary" icon={<Printer className="h-4 w-4" />} onClick={() => window.print()}>
              Print invoice
            </Button>
            {next.map((status) => (
              <Button key={status} variant={status === 'cancelled' || status === 'returned' ? 'secondary' : 'primary'} onClick={() => setTarget(status)}>
                {ACTION_LABELS[status]}
              </Button>
            ))}
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <Card title={`Items (${order.items.reduce((sum, item) => sum + item.quantity, 0)})`} padded={false}>
            <div className="overflow-x-auto">
              <table className={tableClass}>
                <thead>
                  <tr>
                    <th className={thClass}>Product</th>
                    <th className={`${thClass} text-right`}>Price</th>
                    <th className={`${thClass} text-right`}>Qty</th>
                    <th className={`${thClass} text-right`}>Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {order.items.map((item) => (
                    <tr key={item.product}>
                      <td className={tdClass}>
                        <div className="flex items-center gap-3">
                          {item.imageUrl ? <img src={item.imageUrl} alt="" className="h-10 w-10 rounded-lg object-cover" /> : <span className="h-10 w-10 rounded-lg bg-cream" />}
                          <div>
                            <Link to={`/products/${item.product}`} className="font-medium hover:underline">
                              {item.name}
                            </Link>
                            <p className="font-mono text-xs text-muted">{item.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td className={`${tdClass} text-right tabular-nums`}>{formatPrice(item.price)}</td>
                      <td className={`${tdClass} text-right tabular-nums`}>{item.quantity}</td>
                      <td className={`${tdClass} text-right font-medium tabular-nums`}>{formatPrice(item.price * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <dl className="space-y-2 border-t border-line px-5 py-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Subtotal</dt>
                <dd className="tabular-nums">{formatPrice(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Delivery ({order.deliveryRegion === 'dhaka' ? 'inside Dhaka' : 'outside Dhaka'})</dt>
                <dd className="tabular-nums">{order.shippingFee === 0 ? 'Free' : formatPrice(order.shippingFee)}</dd>
              </div>
              <div className="flex justify-between border-t border-line pt-2 text-base font-semibold">
                <dt>Total</dt>
                <dd className="tabular-nums">{formatPrice(order.total)}</dd>
              </div>
            </dl>
          </Card>

          <Card
            title="Payments"
            description={`${formatPrice(order.amountPaid)} received${order.amountRefunded ? ` · ${formatPrice(order.amountRefunded)} refunded` : ''}${due > 0 ? ` · ${formatPrice(due)} due` : ''}`}
            padded={false}
            actions={
              <div className="no-print flex gap-2">
                {refundable > 0 && (
                  <Button size="sm" variant="secondary" icon={<RotateCcw className="h-3.5 w-3.5" />} onClick={() => setPaymentType('refund')}>
                    Refund
                  </Button>
                )}
                {due > 0 && order.status !== 'cancelled' && (
                  <Button size="sm" icon={<CreditCard className="h-3.5 w-3.5" />} onClick={() => setPaymentType('payment')}>
                    Record payment
                  </Button>
                )}
              </div>
            }
          >
            <ul className="divide-y divide-line">
              {payments.map((payment) => (
                <li key={payment.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 text-sm">
                  <div>
                    <p className="font-medium">
                      {payment.type === 'refund' ? 'Refund' : 'Payment'} · {PAYMENT_METHOD[payment.method]}
                      {payment.transactionId && <span className="ml-2 font-mono text-xs text-muted">{payment.transactionId}</span>}
                    </p>
                    <p className="text-xs text-muted">
                      {formatDateTime(payment.completedAt ?? payment.createdAt)}
                      {payment.recordedBy && ` · by ${payment.recordedBy}`}
                      {payment.note && ` · ${payment.note}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge tone={PAYMENT_RECORD_STATUS[payment.status].tone}>{PAYMENT_RECORD_STATUS[payment.status].label}</Badge>
                    <span className={`font-semibold tabular-nums ${payment.type === 'refund' ? 'text-accent' : ''}`}>
                      {payment.type === 'refund' ? '−' : ''}
                      {formatPrice(payment.amount)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Customer">
            <div className="space-y-2 text-sm">
              <p className="flex items-center gap-2 font-medium">
                <User className="h-4 w-4 text-muted" />
                {order.user ? (
                  <Link to={`/customers/${order.user}`} className="text-brand hover:underline">
                    {order.customer.name}
                  </Link>
                ) : (
                  order.customer.name
                )}
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted" />
                <a href={`tel:${order.customer.phone}`} className="hover:underline">
                  {order.customer.phone}
                </a>
              </p>
              {order.customer.email && <p className="pl-6 text-muted">{order.customer.email}</p>}
            </div>
          </Card>
          <Card title="Delivery address">
            <p className="flex gap-2 text-sm">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
              <span>
                {order.shippingAddress.address}
                <br />
                {order.shippingAddress.upazila}, {order.shippingAddress.district}
              </span>
            </p>
            {order.shippingAddress.note && <p className="mt-3 rounded-lg bg-cream px-3 py-2 text-sm text-muted">Note: {order.shippingAddress.note}</p>}
          </Card>
          <Card title="Timeline">
            <ol className="relative space-y-4 border-l border-line pl-5">
              {[...order.statusHistory].reverse().map((entry, index) => (
                <li key={`${entry.at}-${index}`} className="relative">
                  <span className={`absolute -left-[25px] top-1 h-2.5 w-2.5 rounded-full ring-4 ring-white ${index === 0 ? 'bg-brand' : 'bg-sand'}`} />
                  <p className="text-sm font-medium">{ORDER_STATUS[entry.status].label}</p>
                  <p className="text-xs text-muted">
                    {formatDateTime(entry.at)}
                    {entry.by && ` · ${entry.by}`}
                  </p>
                  {entry.note && <p className="mt-1 text-sm text-muted">{entry.note}</p>}
                </li>
              ))}
            </ol>
          </Card>
        </div>
      </div>

      <StatusModal order={order} target={target} onClose={() => setTarget(null)} />
      <PaymentModal key={paymentType ?? 'closed'} order={order} type={paymentType} onClose={() => setPaymentType(null)} />
    </>
  )
}
