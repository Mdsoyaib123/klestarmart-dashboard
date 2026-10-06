import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import { baseApi } from '@/api/baseApi'
import authReducer from '@/features/auth/authSlice'
import toastReducer from '@/features/toast/toastSlice'

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    auth: authReducer,
    toast: toastReducer,
  },
  middleware: (getDefault) => getDefault().concat(baseApi.middleware),
})

// Refetch when the tab regains focus or the network reconnects.
setupListeners(store.dispatch)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
