import { baseApi } from '@/api/baseApi'
import type { ApiResponse, Banner, BannerInput, SiteSettings } from '@/types'

export const contentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBanners: builder.query<Banner[], void>({
      query: () => '/banners',
      transformResponse: (response: ApiResponse<Banner[]>) => response.data,
      providesTags: ['Banner'],
    }),
    saveBanner: builder.mutation<Banner, { id?: string; body: BannerInput }>({
      query: ({ id, body }) => ({ url: id ? `/banners/${id}` : '/banners', method: id ? 'PUT' : 'POST', body }),
      invalidatesTags: ['Banner'],
    }),
    deleteBanner: builder.mutation<void, string>({
      query: (id) => ({ url: `/banners/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Banner'],
    }),
    getSettings: builder.query<SiteSettings, void>({
      query: () => '/settings',
      transformResponse: (response: ApiResponse<SiteSettings>) => response.data,
      providesTags: ['Settings'],
    }),
    updateSettings: builder.mutation<SiteSettings, SiteSettings>({
      query: (body) => ({ url: '/settings', method: 'PUT', body }),
      transformResponse: (response: ApiResponse<SiteSettings>) => response.data,
      invalidatesTags: ['Settings'],
    }),
    uploadImage: builder.mutation<{ url: string }, File>({
      query: (file) => {
        const body = new FormData()
        body.append('file', file)
        return { url: '/uploads', method: 'POST', body }
      },
      transformResponse: (response: ApiResponse<{ url: string }>) => response.data,
    }),
  }),
})

export const {
  useGetBannersQuery,
  useSaveBannerMutation,
  useDeleteBannerMutation,
  useGetSettingsQuery,
  useUpdateSettingsMutation,
  useUploadImageMutation,
} = contentApi
