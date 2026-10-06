// Shapes returned by the backend admin API (backend/src/modules).

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface PageMeta {
  page: number
  limit: number
  total: number
  pages: number
}

export interface Paginated<T> {
  items: T[]
  meta: PageMeta
}

export interface StaffUser {
  id: string
  name: string
  email: string
  role: 'admin' | 'staff'
  status: 'active' | 'blocked'
  lastLoginAt?: string
  createdAt: string
}

export const PRODUCT_STATUSES = ['active', 'draft', 'archived'] as const
export type ProductStatus = (typeof PRODUCT_STATUSES)[number]
export const BADGES = ['New', 'Sale', 'Bestseller'] as const
export type Badge = (typeof BADGES)[number]

export interface Product {
  id: string
  sku: string
  slug: string
  name: string
  brand: string
  description: string
  specs: [label: string, value: string][]
  price: number
  compareAtPrice?: number | null
  category: string
  rating: number
  reviewCount: number
  stock: number
  soldCount: number
  imageUrl?: string | null
  images?: string[]
  badge?: Badge | null
  status: ProductStatus
  createdAt: string
  updatedAt: string
}

export interface ProductInput {
  sku: string
  slug?: string
  name: string
  brand: string
  description: string
  specs: [string, string][]
  price: number
  compareAtPrice: number | null
  category: string
  stock: number
  images: string[]
  badge: Badge | null
  status: ProductStatus
}

export interface Category {
  id: string
  slug: string
  name: string
  description: string
  imageUrl?: string | null
  highlights: string[]
  sortOrder: number
  isActive: boolean
  productCount?: number
}

export type CategoryInput = Omit<Category, 'id' | 'productCount'>

export const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'] as const
export type OrderStatus = (typeof ORDER_STATUSES)[number]
export const PAYMENT_METHODS = ['cod', 'bkash', 'nagad', 'card', 'bank'] as const
export type PaymentMethod = (typeof PAYMENT_METHODS)[number]
export const PAYMENT_STATUSES = ['unpaid', 'partially_paid', 'paid', 'partially_refunded', 'refunded'] as const
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number]

export interface OrderItem {
  product: string
  name: string
  sku: string
  slug?: string
  imageUrl?: string
  price: number
  quantity: number
}

export interface Order {
  id: string
  orderNumber: string
  user?: string
  customer: { name: string; phone: string; email?: string }
  shippingAddress: { district: string; upazila: string; address: string; note?: string }
  deliveryRegion: 'dhaka' | 'outside'
  items: OrderItem[]
  subtotal: number
  shippingFee: number
  discount: number
  total: number
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  amountPaid: number
  amountRefunded: number
  status: OrderStatus
  statusHistory: { status: OrderStatus; note?: string; by?: string; at: string }[]
  createdAt: string
}

export interface Payment {
  id: string
  order: string
  orderNumber: string
  customerName: string
  type: 'payment' | 'refund'
  method: PaymentMethod
  amount: number
  status: 'pending' | 'completed' | 'failed'
  transactionId?: string
  note?: string
  recordedBy?: string
  completedAt?: string
  createdAt: string
}

export interface PaymentSummary {
  collected: number
  pending: number
  refunded: number
  net: number
}

export interface Customer {
  id: string
  name: string
  phone?: string
  email?: string
  status: 'active' | 'blocked'
  registered: boolean
  orderCount: number
  totalSpent: number
  lastOrderAt?: string
  lastLoginAt?: string
  createdAt: string
}

export interface Banner {
  id: string
  eyebrow: string
  title: string
  text: string
  imageUrl?: string | null
  ctaLabel: string
  ctaLink: string
  secondaryLabel: string
  secondaryLink: string
  theme: 'light' | 'dark' | 'accent'
  sortOrder: number
  isActive: boolean
  startsAt?: string | null
  endsAt?: string | null
}

export type BannerInput = Omit<Banner, 'id'>

export interface DeliveryRate {
  fee: number
  minDays: number
  maxDays: number
}

export interface SiteSettings {
  siteName: string
  tagline: string
  logoUrl: string
  announcement: { enabled: boolean; text: string }
  contact: { email: string; phone: string; address: string }
  social: { facebook: string; instagram: string; youtube: string }
  shipping: { dhaka: DeliveryRate; outside: DeliveryRate; freeShippingThreshold: number; insideDhakaDistricts: string[] }
  returnDays: number
  seo: { metaDescription: string }
}

export interface Totals {
  revenue: number
  orders: number
  units: number
  averageOrder: number
  newCustomers: number
}

export interface DailyPoint {
  date: string
  revenue: number
  orders: number
  units: number
}

export interface Overview {
  days: number
  current: Totals
  previous: Totals
  series: DailyPoint[]
  pendingOrders: number
  ordersByStatus: Partial<Record<OrderStatus, number>>
  topProducts: { productId: string; name: string; imageUrl?: string; units: number; revenue: number }[]
  paymentMethods: { method: PaymentMethod; count: number; amount: number }[]
  lowStock: Pick<Product, 'id' | 'name' | 'sku' | 'stock' | 'imageUrl'>[]
  recentOrders: Pick<Order, 'id' | 'orderNumber' | 'customer' | 'total' | 'status' | 'paymentStatus' | 'createdAt'>[]
}

export interface ProductStats {
  days: number
  lifetime: { units: number; revenue: number; orders: number }
  series: DailyPoint[]
}
