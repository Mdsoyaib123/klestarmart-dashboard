import { useAppDispatch } from '@/app/hooks'
import { errorMessage } from '@/api/baseApi'
import { notify } from '@/features/toast/toastSlice'

// Runs an API call and reports the outcome as a toast. Resolves to true on success.
export const useRunWithToast = () => {
  const dispatch = useAppDispatch()
  return async (action: () => Promise<unknown>, success?: string) => {
    try {
      await action()
      if (success) dispatch(notify('success', success))
      return true
    } catch (error) {
      dispatch(notify('error', errorMessage(error)))
      return false
    }
  }
}
