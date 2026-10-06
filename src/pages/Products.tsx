import { Package, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useGetCategoriesQuery, useGetProductsQuery, type ProductQuery } from '@/features/products/productsApi'
import { useListParams } from '@/hooks/useListParams'
import { LOW_STOCK_THRESHOLD } from '@/config/site'
import { formatPrice } from '@/lib/format'
import { PRODUCT_STATUS } from '@/lib/labels'
import { tableClass, tableWrapClass, tdClass, thClass } from '@/lib/ui'
import Badge from '@/components/ui/Badge'
import Button, { ButtonLink } from '@/components/ui/Button'
import PageHeader from '@/components/ui/PageHeader'
import Pagination from '@/components/ui/Pagination'
import SearchInput from '@/components/ui/SearchInput'
import Select from '@/components/ui/Select'
import { EmptyState, ErrorNotice, Loading } from '@/components/ui/States'
import { PRODUCT_STATUSES, type ProductStatus } from '@/types'

const KEYS = ['q', 'category', 'status', 'stock', 'sort'] as const

export default function Products() {
  const { values, page, set, clear, active } = useListParams(KEYS)
  const { data: categories = [] } = useGetCategoriesQuery()
  const { data, error, refetch, isLoading, isFetching } = useGetProductsQuery({
    page,
    limit: 20,
    q: values.q,
    category: values.category,
    status: values.status as ProductStatus,
    stock: values.stock as ProductQuery['stock'],
    sort: (values.sort || 'newest') as ProductQuery['sort'],
  })
  const categoryName = (slug: string) => categories.find((category) => category.slug === slug)?.name ?? slug

  return (
    <>
      <PageHeader
        title="Products"
        description={data ? `${data.meta.total.toLocaleString()} product${data.meta.total === 1 ? '' : 's'}` : undefined}
        actions={
          <ButtonLink to="/products/new" icon={<Plus className="h-4 w-4" />}>
            Add product
          </ButtonLink>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <SearchInput value={values.q} onChange={(value) => set('q', value)} placeholder="Name, brand or SKU" />
        <Select value={values.category} onChange={(event) => set('category', event.target.value)} aria-label="Category">
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.slug}>
              {category.name}
            </option>
          ))}
        </Select>
        <Select value={values.status} onChange={(event) => set('status', event.target.value)} aria-label="Status">
          <option value="">Any status</option>
          {PRODUCT_STATUSES.map((status) => (
            <option key={status} value={status}>
              {PRODUCT_STATUS[status].label}
            </option>
          ))}
        </Select>
        <Select value={values.stock} onChange={(event) => set('stock', event.target.value)} aria-label="Stock">
          <option value="">Any stock</option>
          <option value="low">Low stock</option>
          <option value="out">Out of stock</option>
        </Select>
        <Select value={values.sort} onChange={(event) => set('sort', event.target.value === 'newest' ? '' : event.target.value)} aria-label="Sort">
          <option value="newest">Newest first</option>
          <option value="sold">Best selling</option>
          <option value="stock">Lowest stock</option>
          <option value="price">Highest price</option>
          <option value="name">Name A–Z</option>
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
          <EmptyState
            icon={<Package className="h-5 w-5" />}
            title={active ? 'No products match these filters' : 'No products yet'}
            description={active ? undefined : 'Add your first product to start selling.'}
            action={!active && <ButtonLink to="/products/new">Add product</ButtonLink>}
          />
        </div>
      ) : (
        data && (
          <>
            <div className={`${tableWrapClass} transition-opacity ${isFetching ? 'opacity-60' : ''}`}>
              <table className={`${tableClass} min-w-[880px]`}>
                <thead>
                  <tr>
                    <th className={thClass}>Product</th>
                    <th className={thClass}>Category</th>
                    <th className={thClass}>Status</th>
                    <th className={`${thClass} text-right`}>Price</th>
                    <th className={`${thClass} text-right`}>Stock</th>
                    <th className={`${thClass} text-right`}>Sold</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {data.items.map((product) => (
                    <tr key={product.id} className="hover:bg-cream/40">
                      <td className={tdClass}>
                        <Link to={`/products/${product.id}`} className="flex items-center gap-3">
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt="" className="h-11 w-11 shrink-0 rounded-lg border border-line object-cover" />
                          ) : (
                            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-cream text-muted">
                              <Package className="h-4 w-4" />
                            </span>
                          )}
                          <span className="min-w-0">
                            <span className="block truncate font-medium text-ink hover:text-brand">{product.name}</span>
                            <span className="block text-xs text-muted">
                              {product.brand} · <span className="font-mono">{product.sku}</span>
                            </span>
                          </span>
                        </Link>
                      </td>
                      <td className={tdClass}>{categoryName(product.category)}</td>
                      <td className={tdClass}>
                        <Badge tone={PRODUCT_STATUS[product.status].tone}>{PRODUCT_STATUS[product.status].label}</Badge>
                      </td>
                      <td className={`${tdClass} text-right tabular-nums`}>
                        {formatPrice(product.price)}
                        {product.compareAtPrice ? <span className="block text-xs text-muted line-through">{formatPrice(product.compareAtPrice)}</span> : null}
                      </td>
                      <td className={`${tdClass} text-right font-medium tabular-nums ${product.stock === 0 ? 'text-accent' : product.stock <= LOW_STOCK_THRESHOLD ? 'text-warning' : ''}`}>
                        {product.stock === 0 ? 'Out' : product.stock}
                      </td>
                      <td className={`${tdClass} text-right tabular-nums`}>{product.soldCount}</td>
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
