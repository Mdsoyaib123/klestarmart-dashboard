import Badge from '@/components/ui/Badge'
import { ORDER_STATUS, PAYMENT_STATUS } from '@/lib/labels'
import type { OrderStatus, PaymentStatus } from '@/types'

export const OrderStatusBadge = ({ status }: { status: OrderStatus }) => <Badge tone={ORDER_STATUS[status].tone}>{ORDER_STATUS[status].label}</Badge>

export const PaymentStatusBadge = ({ status }: { status: PaymentStatus }) => <Badge tone={PAYMENT_STATUS[status].tone}>{PAYMENT_STATUS[status].label}</Badge>
