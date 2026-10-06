import { ChevronLeft, ExternalLink, Minus, Plus, Trash2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  useAdjustStockMutation,
  useCreateProductMutation,
  useDeleteProductMutation,
  useGetCategoriesQuery,
  useGetProductQuery,
  useGetProductStatsQuery,
  useUpdateProductMutation,
} from '@/features/products/productsApi'
import { useRunWithToast } from '@/hooks/useAppActions'
import { STOREFRONT_URL } from '@/config/site'
import { formatNumber, formatPrice, formatShortDate } from '@/lib/format'
import { PRODUCT_STATUS } from '@/lib/labels'
import { inputClass, textareaClass } from '@/lib/ui'
import ColumnChart from '@/components/charts/ColumnChart'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { Field } from '@/components/ui/Field'
import { ImageGallery } from '@/components/ui/ImageUpload'
import PageHeader from '@/components/ui/PageHeader'
import { ErrorNotice, Loading } from '@/components/ui/States'
import { BADGES, PRODUCT_STATUSES, type Badge, type Product, type ProductInput, type ProductStatus } from '@/types'

// Specs are edited as one "Label: value" pair per line.
const specsToText = (specs: Product['specs']) => specs.map(([label, value]) => `${label}: ${value}`).join('\n')
const textToSpecs = (text: string): [string, string][] =>
  text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const at = line.indexOf(':')
      return at === -1 ? [line, ''] : [line.slice(0, at).trim(), line.slice(at + 1).trim()]
    })

function SalesPanel({ product }: { product: Product }) {
  const { data } = useGetProductStatsQuery({ id: product.id, days: 30 })
  const [adjustStock, { isLoading }] = useAdjustStockMutation()
  const [change, setChange] = useState(1)
  const run = useRunWithToast()

  const adjust = (direction: 1 | -1) =>
    run(() => adjustStock({ id: product.id, change: change * direction }).unwrap(), direction > 0 ? `Added ${change} to stock` : `Removed ${change} from stock`)

  return (
    <>
      <Card title="Inventory">
        <p className="text-3xl font-semibold">{formatNumber(product.stock)}</p>
        <p className="text-sm text-muted">units in stock · {formatNumber(product.soldCount)} sold</p>
        <div className="mt-4 flex items-center gap-2">
          <input type="number" min={1} value={change} onChange={(event) => setChange(Math.max(1, Number(event.target.value) || 1))} aria-label="Units to add or remove" className={`${inputClass} w-24`} />
          <Button variant="secondary" size="md" icon={<Plus className="h-4 w-4" />} loading={isLoading} onClick={() => adjust(1)}>
            Add
          </Button>
          <Button variant="secondary" size="md" icon={<Minus className="h-4 w-4" />} disabled={isLoading || product.stock < change} onClick={() => adjust(-1)}>
            Remove
          </Button>
        </div>
        <p className="mt-2 text-xs text-muted">For deliveries from suppliers and stock counts. Orders adjust stock automatically.</p>
      </Card>
      <Card title="Sales" description="Excluding cancelled and returned orders">
        {data ? (
          <>
            <dl className="mb-4 grid grid-cols-3 gap-3 text-center">
              {[
                { label: 'Units sold', value: formatNumber(data.lifetime.units) },
                { label: 'Revenue', value: formatPrice(data.lifetime.revenue) },
                { label: 'Orders', value: formatNumber(data.lifetime.orders) },
              ].map((item) => (
                <div key={item.label} className="rounded-lg bg-cream/60 px-2 py-3">
                  <dt className="text-xs text-muted">{item.label}</dt>
                  <dd className="mt-1 font-semibold">{item.value}</dd>
                </div>
              ))}
            </dl>
            <p className="mb-2 text-xs font-medium text-muted">Units sold per day, last 30 days</p>
            <ColumnChart data={data.series.map((point) => ({ label: formatShortDate(point.date), value: point.units }))} valueLabel="Units sold" formatValue={formatNumber} />
          </>
        ) : (
          <Loading />
        )}
      </Card>
    </>
  )
}

function ProductForm({ product }: { product?: Product }) {
  const navigate = useNavigate()
  const { data: categories = [] } = useGetCategoriesQuery()
  const [createProduct, { isLoading: creating }] = useCreateProductMutation()
  const [updateProduct, { isLoading: updating }] = useUpdateProductMutation()
  const [deleteProduct, { isLoading: deleting }] = useDeleteProductMutation()
  const [images, setImages] = useState<string[]>(product?.images?.length ? product.images : product?.imageUrl ? [product.imageUrl] : [])
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [error, setError] = useState('')
  const run = useRunWithToast()

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const text = (name: string) => String(form.get(name) ?? '').trim()
    const compareAt = text('compareAtPrice')
    const body: ProductInput = {
      name: text('name'),
      sku: text('sku'),
      slug: text('slug') || undefined,
      brand: text('brand'),
      category: text('category'),
      description: text('description'),
      price: Number(text('price')),
      compareAtPrice: compareAt ? Number(compareAt) : null,
      // When editing, stock changes go through the inventory panel so a stale form value never overwrites them.
      stock: product ? product.stock : Number(text('stock')),
      badge: (text('badge') || null) as Badge | null,
      status: text('status') as ProductStatus,
      specs: textToSpecs(text('specs')),
      images,
    }
    if (body.compareAtPrice !== null && body.compareAtPrice <= body.price) {
      setError('The compare-at price must be higher than the price, or left empty.')
      return
    }
    setError('')
    const ok = await run(async () => {
      if (product) await updateProduct({ id: product.id, body }).unwrap()
      else {
        const created = await createProduct(body).unwrap()
        navigate(`/products/${created.id}`, { replace: true })
      }
    }, product ? 'Product saved' : 'Product created')
    if (!ok) window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const remove = async () => {
    if (!product) return
    const ok = await run(() => deleteProduct(product.id).unwrap(), 'Product deleted')
    setConfirmDelete(false)
    if (ok) navigate('/products', { replace: true })
  }

  const saving = creating || updating

  return (
    <form onSubmit={onSubmit} className="grid gap-6 xl:grid-cols-[2fr_1fr]">
      <div className="space-y-6">
        {error && <ErrorNotice error={{ status: 400, data: { message: error } }} />}
        <Card title="Details">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" className="sm:col-span-2">
              <input name="name" required maxLength={160} defaultValue={product?.name} className={inputClass} />
            </Field>
            <Field label="Brand">
              <input name="brand" required maxLength={60} defaultValue={product?.brand} className={inputClass} />
            </Field>
            <Field label="Category" hint={categories.length === 0 ? 'Create a category first.' : undefined}>
              <select name="category" required defaultValue={product?.category ?? ''} className={inputClass}>
                <option value="" disabled>
                  Choose a category
                </option>
                {categories.map((category) => (
                  <option key={category.id} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Description" className="sm:col-span-2">
              <textarea name="description" required rows={5} maxLength={5000} defaultValue={product?.description} className={textareaClass} />
            </Field>
            <Field label="Specifications" className="sm:col-span-2" hint='One per line, as "Label: value", e.g. "Material: 100% linen".'>
              <textarea name="specs" rows={5} defaultValue={product ? specsToText(product.specs) : ''} className={`${textareaClass} font-mono text-xs`} />
            </Field>
          </div>
        </Card>

        <Card title="Images" description="JPG, PNG or WebP up to 5 MB. The first image is shown on product cards; use the star to change it.">
          <ImageGallery value={images} onChange={setImages} />
        </Card>

        <Card title="Pricing & inventory">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Price (৳)">
              <input name="price" type="number" required min={0} step={1} defaultValue={product?.price} className={inputClass} />
            </Field>
            <Field label="Compare-at price (৳)" hint="The original price, shown struck through.">
              <input name="compareAtPrice" type="number" min={0} step={1} defaultValue={product?.compareAtPrice ?? ''} className={inputClass} />
            </Field>
            {product ? (
              <Field label="Stock" hint="Change it in the Inventory panel.">
                <input value={product.stock} readOnly disabled className={inputClass} />
              </Field>
            ) : (
              <Field label="Opening stock">
                <input name="stock" type="number" required min={0} step={1} defaultValue={0} className={inputClass} />
              </Field>
            )}
            <Field label="SKU" hint="Your unique product code.">
              <input name="sku" required maxLength={40} defaultValue={product?.sku} className={`${inputClass} font-mono`} />
            </Field>
            <Field label="URL slug" hint="Left empty, it is made from the name." className="sm:col-span-2">
              <input name="slug" maxLength={80} pattern="[a-z0-9]+(-[a-z0-9]+)*" title="Lowercase letters, numbers and hyphens" defaultValue={product?.slug} className={`${inputClass} font-mono`} />
            </Field>
          </div>
        </Card>
      </div>

      <div className="space-y-6">
        <Card title="Publishing">
          <div className="space-y-4">
            <Field label="Status" hint="Only active products appear in the store.">
              <select name="status" defaultValue={product?.status ?? 'active'} className={inputClass}>
                {PRODUCT_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {PRODUCT_STATUS[status].label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Badge">
              <select name="badge" defaultValue={product?.badge ?? ''} className={inputClass}>
                <option value="">None</option>
                {BADGES.map((badge) => (
                  <option key={badge} value={badge}>
                    {badge}
                  </option>
                ))}
              </select>
            </Field>
            <Button type="submit" loading={saving} className="w-full">
              {product ? 'Save changes' : 'Create product'}
            </Button>
            {product?.status === 'active' && (
              <a href={`${STOREFRONT_URL}/product/${product.slug}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-1.5 text-sm text-brand hover:underline">
                View in store <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </Card>

        {product && <SalesPanel product={product} />}

        {product && (
          <Card title="Delete product">
            <p className="mb-3 text-sm text-muted">Products that have orders cannot be deleted, so your sales history stays complete. Archive them instead.</p>
            <Button variant="secondary" icon={<Trash2 className="h-4 w-4" />} onClick={() => setConfirmDelete(true)} className="text-accent">
              Delete product
            </Button>
          </Card>
        )}
      </div>

      {product && (
        <ConfirmDialog
          open={confirmDelete}
          title="Delete this product?"
          message={`"${product.name}" will be removed permanently.`}
          confirmLabel="Delete"
          danger
          loading={deleting}
          onConfirm={remove}
          onClose={() => setConfirmDelete(false)}
        />
      )}
    </form>
  )
}

export default function ProductEditor() {
  const { id } = useParams()
  const { currentData: product, error, refetch, isFetching } = useGetProductQuery(id ?? '', { skip: !id })

  const back = (
    <Link to="/products" className="mb-3 inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
      <ChevronLeft className="h-4 w-4" /> Products
    </Link>
  )

  if (!id) {
    return (
      <>
        <PageHeader back={back} title="Add product" />
        <ProductForm />
      </>
    )
  }
  if (error) return (<>{back}<ErrorNotice error={error} onRetry={refetch} /></>)
  if (!product) return isFetching ? <Loading /> : null

  return (
    <>
      <PageHeader back={back} title={product.name} description={`SKU ${product.sku}`} />
      {/* Keyed so the form resets when moving between products. */}
      <ProductForm key={product.id} product={product} />
    </>
  )
}
