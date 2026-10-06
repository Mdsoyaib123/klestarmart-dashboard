import { baseApi, cleanParams } from '@/api/baseApi'
import type { ApiResponse, Category, CategoryInput, PageMeta, Paginated, Product, ProductInput, ProductStats, ProductStatus } from '@/types'

export interface ProductQuery {
  page?: number
  limit?: number
  q?: string
  category?: string
  status?: ProductStatus | ''
  stock?: 'low' | 'out' | ''
  sort?: 'newest' | 'name' | 'price' | 'stock' | 'sold'
}

export const productsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<Paginated<Product>, ProductQuery>({
      query: (params) => ({ url: '/products', params: cleanParams(params) }),
      transformResponse: (response: { data: Product[]; meta: PageMeta }) => ({ items: response.data, meta: response.meta }),
      providesTags: (result) => [{ type: 'Product', id: 'LIST' }, ...(result?.items ?? []).map(({ id }) => ({ type: 'Product' as const, id }))],
    }),
    getProduct: builder.query<Product, string>({
      query: (id) => `/products/${id}`,
      transformResponse: (response: ApiResponse<Product>) => response.data,
      providesTags: (_result, _error, id) => [{ type: 'Product', id }],
    }),
    getProductStats: builder.query<ProductStats, { id: string; days: number }>({
      query: ({ id, days }) => ({ url: `/stats/products/${id}`, params: { days } }),
      transformResponse: (response: ApiResponse<ProductStats>) => response.data,
      providesTags: ['Stats'],
    }),
    createProduct: builder.mutation<Product, ProductInput>({
      query: (body) => ({ url: '/products', method: 'POST', body }),
      transformResponse: (response: ApiResponse<Product>) => response.data,
      invalidatesTags: [{ type: 'Product', id: 'LIST' }, 'Category', 'Stats'],
    }),
    updateProduct: builder.mutation<Product, { id: string; body: ProductInput }>({
      query: ({ id, body }) => ({ url: `/products/${id}`, method: 'PUT', body }),
      transformResponse: (response: ApiResponse<Product>) => response.data,
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Product', id }, { type: 'Product', id: 'LIST' }, 'Category', 'Stats'],
    }),
    adjustStock: builder.mutation<Product, { id: string; change: number }>({
      query: ({ id, change }) => ({ url: `/products/${id}/stock`, method: 'POST', body: { change } }),
      transformResponse: (response: ApiResponse<Product>) => response.data,
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Product', id }, { type: 'Product', id: 'LIST' }, 'Stats'],
    }),
    deleteProduct: builder.mutation<void, string>({
      query: (id) => ({ url: `/products/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Product', id: 'LIST' }, 'Category', 'Stats'],
    }),

    getCategories: builder.query<Category[], void>({
      query: () => '/categories',
      transformResponse: (response: ApiResponse<Category[]>) => response.data,
      providesTags: ['Category'],
    }),
    saveCategory: builder.mutation<Category, { id?: string; body: CategoryInput }>({
      query: ({ id, body }) => ({ url: id ? `/categories/${id}` : '/categories', method: id ? 'PUT' : 'POST', body }),
      transformResponse: (response: ApiResponse<Category>) => response.data,
      // A renamed slug moves its products, so product lists refresh too.
      invalidatesTags: ['Category', { type: 'Product', id: 'LIST' }],
    }),
    deleteCategory: builder.mutation<void, string>({
      query: (id) => ({ url: `/categories/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Category'],
    }),
  }),
})

export const {
  useGetProductsQuery,
  useGetProductQuery,
  useGetProductStatsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useAdjustStockMutation,
  useDeleteProductMutation,
  useGetCategoriesQuery,
  useSaveCategoryMutation,
  useDeleteCategoryMutation,
} = productsApi
