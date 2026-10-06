import { CheckCircle2, X, XCircle } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { dismissToast, selectToasts } from '@/features/toast/toastSlice'

export default function Toaster() {
  const toasts = useAppSelector(selectToasts)
  const dispatch = useAppDispatch()

  return (
    <div aria-live="polite" className="no-print pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role={toast.tone === 'error' ? 'alert' : 'status'}
          className="pointer-events-auto flex items-start gap-3 rounded-xl border border-line bg-white px-4 py-3 text-sm shadow-lg"
        >
          {toast.tone === 'success' ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" /> : <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-accent" />}
          <p className="flex-1">{toast.message}</p>
          <button type="button" aria-label="Dismiss" onClick={() => dispatch(dismissToast(toast.id))} className="text-muted hover:text-ink">
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
