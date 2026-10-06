import { Lock } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAppSelector } from '@/app/hooks'
import { errorMessage } from '@/api/baseApi'
import { useGetMeQuery, useLoginMutation } from '@/features/auth/authApi'
import { selectAuthNotice, selectAuthStatus } from '@/features/auth/authSlice'
import { APP_NAME } from '@/config/site'
import Button from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { inputClass } from '@/lib/ui'

export default function Login() {
  useGetMeQuery()
  const status = useAppSelector(selectAuthStatus)
  const notice = useAppSelector(selectAuthNotice)
  const navigate = useNavigate()
  const from = (useLocation().state as { from?: string } | null)?.from ?? '/'
  const [login, { isLoading }] = useLoginMutation()
  const [error, setError] = useState('')

  if (status === 'signedIn') return <Navigate to={from} replace />

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setError('')
    try {
      await login({ email: String(form.get('email') ?? ''), password: String(form.get('password') ?? '') }).unwrap()
      navigate(from, { replace: true })
    } catch (err) {
      setError(errorMessage(err))
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-paper p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-brand text-white">
            <Lock className="h-5 w-5" />
          </span>
          <h1 className="mt-4 text-xl font-semibold">{APP_NAME}</h1>
          <p className="mt-1 text-sm text-muted">Sign in to manage your store</p>
        </div>
        <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-line bg-white p-6 shadow-sm">
          {(error || notice) && (
            <p role="alert" className="rounded-lg bg-accent-soft px-3 py-2.5 text-sm text-accent">
              {error || notice}
            </p>
          )}
          <Field label="Email">
            <input name="email" type="email" autoComplete="username" required autoFocus className={inputClass} />
          </Field>
          <Field label="Password">
            <input name="password" type="password" autoComplete="current-password" required className={inputClass} />
          </Field>
          <Button type="submit" loading={isLoading} className="w-full">
            Sign in
          </Button>
        </form>
        <p className="mt-4 text-center text-xs text-muted">The first admin account is created with the backend's seed script.</p>
      </div>
    </main>
  )
}
