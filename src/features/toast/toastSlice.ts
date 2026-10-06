import { createSlice, nanoid, type PayloadAction } from '@reduxjs/toolkit'
import type { AppDispatch, RootState } from '@/app/store'

export interface Toast {
  id: string
  tone: 'success' | 'error'
  message: string
}

const toastSlice = createSlice({
  name: 'toast',
  initialState: [] as Toast[],
  reducers: {
    addToast: {
      reducer: (state, action: PayloadAction<Toast>) => [...state.slice(-3), action.payload],
      prepare: (tone: Toast['tone'], message: string) => ({ payload: { id: nanoid(), tone, message } }),
    },
    dismissToast: (state, action: PayloadAction<string>) => state.filter((toast) => toast.id !== action.payload),
  },
})

export const { addToast, dismissToast } = toastSlice.actions
export default toastSlice.reducer
export const selectToasts = (state: RootState) => state.toast

// Shows a toast that disappears after a few seconds.
export const notify = (tone: Toast['tone'], message: string) => (dispatch: AppDispatch) => {
  const action = dispatch(addToast(tone, message))
  window.setTimeout(() => dispatch(dismissToast(action.payload.id)), tone === 'error' ? 6000 : 3500)
}
