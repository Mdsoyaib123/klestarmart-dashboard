import { useRef, useState, type FormEvent } from 'react'
import { useAppSelector } from '@/app/hooks'
import { useChangePasswordMutation } from '@/features/auth/authApi'
import { selectUser } from '@/features/auth/authSlice'
import { useRunWithToast } from '@/hooks/useAppActions'
import { inputClass } from '@/lib/ui'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { Field } from '@/components/ui/Field'
import PageHeader from '@/components/ui/PageHeader'

export default function Account() {
  const user = useAppSelector(selectUser)
  const [changePassword, { isLoading }] = useChangePasswordMutation()
  const run = useRunWithToast()
  const [error, setError] = useState('')
  const formRef = useRef<HTMLFormElement>(null)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const newPassword = String(form.get('newPassword'))
    if (newPassword !== form.get('confirmPassword')) {
      setError('The new passwords do not match.')
      return
    }
    setError('')
    const ok = await run(() => changePassword({ currentPassword: String(form.get('currentPassword')), newPassword }).unwrap(), 'Password changed')
    if (ok) formRef.current?.reset()
  }

  return (
    <>
      <PageHeader title="Account" description={user ? `${user.name} · ${user.email} · ${user.role}` : undefined} />
      <div className="max-w-lg">
        <Card title="Change password">
          <form ref={formRef} onSubmit={submit} className="space-y-4">
            <Field label="Current password">
              <input name="currentPassword" type="password" autoComplete="current-password" required className={inputClass} />
            </Field>
            <Field label="New password" hint="At least 8 characters.">
              <input name="newPassword" type="password" autoComplete="new-password" minLength={8} required className={inputClass} />
            </Field>
            <Field label="Confirm new password" error={error || undefined}>
              <input name="confirmPassword" type="password" autoComplete="new-password" minLength={8} required className={inputClass} />
            </Field>
            <Button type="submit" loading={isLoading}>
              Change password
            </Button>
          </form>
        </Card>
      </div>
    </>
  )
}
