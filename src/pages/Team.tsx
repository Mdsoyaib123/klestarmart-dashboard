import { Pencil, Plus, ShieldCheck } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useAppSelector } from '@/app/hooks'
import { selectUser } from '@/features/auth/authSlice'
import { useGetStaffQuery, useSaveStaffMutation } from '@/features/customers/customersApi'
import { useRunWithToast } from '@/hooks/useAppActions'
import { formatDateTime } from '@/lib/format'
import { inputClass, tableClass, tableWrapClass, tdClass, thClass } from '@/lib/ui'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import Modal from '@/components/ui/Modal'
import PageHeader from '@/components/ui/PageHeader'
import { ErrorNotice, Loading } from '@/components/ui/States'
import type { StaffUser } from '@/types'

const ROLE_HELP = {
  admin: 'Everything, including settings and the team.',
  staff: 'Orders, payments, customers, products, categories and banners.',
}

function MemberForm({ member, onDone }: { member?: StaffUser; onDone: () => void }) {
  const [saveStaff, { isLoading }] = useSaveStaffMutation()
  const run = useRunWithToast()
  const [role, setRole] = useState<StaffUser['role']>(member?.role ?? 'staff')

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const text = (name: string) => String(form.get(name) ?? '').trim()
    const body = member
      ? { name: text('name'), role, status: text('status') as StaffUser['status'], password: text('password') || undefined }
      : { name: text('name'), email: text('email'), role, password: text('password') }
    const ok = await run(() => saveStaff({ id: member?.id, body }).unwrap(), member ? 'Team member updated' : 'Team member added')
    if (ok) onDone()
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Name">
        <input name="name" required maxLength={80} defaultValue={member?.name} className={inputClass} />
      </Field>
      <Field label="Email" hint={member ? 'Email cannot be changed.' : 'They sign in with this.'}>
        <input name="email" type="email" required={!member} disabled={Boolean(member)} defaultValue={member?.email} className={inputClass} />
      </Field>
      <Field label="Role" hint={ROLE_HELP[role]}>
        <select value={role} onChange={(event) => setRole(event.target.value as StaffUser['role'])} className={inputClass}>
          <option value="staff">Staff</option>
          <option value="admin">Admin</option>
        </select>
      </Field>
      {member && (
        <Field label="Access">
          <select name="status" defaultValue={member.status} className={inputClass}>
            <option value="active">Active</option>
            <option value="blocked">Deactivated (cannot sign in)</option>
          </select>
        </Field>
      )}
      <Field label={member ? 'New password (optional)' : 'Password'} hint="At least 8 characters. Share it with them privately.">
        <input name="password" type="password" autoComplete="new-password" minLength={8} required={!member} className={inputClass} />
      </Field>
      <div className="flex justify-end gap-2 border-t border-line pt-4">
        <Button variant="secondary" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" loading={isLoading}>
          {member ? 'Save' : 'Add member'}
        </Button>
      </div>
    </form>
  )
}

export default function Team() {
  const me = useAppSelector(selectUser)
  const { data: staff = [], error, refetch, isLoading } = useGetStaffQuery()
  const [editing, setEditing] = useState<StaffUser | 'new' | null>(null)

  return (
    <>
      <PageHeader
        title="Team"
        description="People who can sign in to this dashboard."
        actions={
          <Button icon={<Plus className="h-4 w-4" />} onClick={() => setEditing('new')}>
            Add member
          </Button>
        }
      />
      {error && <ErrorNotice error={error} onRetry={refetch} />}
      {isLoading ? (
        <Loading />
      ) : (
        <div className={tableWrapClass}>
          <table className={`${tableClass} min-w-[640px]`}>
            <thead>
              <tr>
                <th className={thClass}>Member</th>
                <th className={thClass}>Role</th>
                <th className={thClass}>Access</th>
                <th className={thClass}>Last sign-in</th>
                <th className={thClass}>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {staff.map((member) => (
                <tr key={member.id}>
                  <td className={tdClass}>
                    <p className="font-medium">
                      {member.name} {member.id === me?.id && <span className="text-xs font-normal text-muted">(you)</span>}
                    </p>
                    <p className="text-xs text-muted">{member.email}</p>
                  </td>
                  <td className={tdClass}>
                    <span className="inline-flex items-center gap-1.5 capitalize">
                      {member.role === 'admin' && <ShieldCheck className="h-4 w-4 text-brand" />}
                      {member.role}
                    </span>
                  </td>
                  <td className={tdClass}>
                    <Badge tone={member.status === 'active' ? 'success' : 'neutral'}>{member.status === 'active' ? 'Active' : 'Deactivated'}</Badge>
                  </td>
                  <td className={`${tdClass} text-muted`}>{member.lastLoginAt ? formatDateTime(member.lastLoginAt) : 'Never'}</td>
                  <td className={`${tdClass} text-right`}>
                    <Button variant="ghost" size="sm" aria-label={`Edit ${member.name}`} onClick={() => setEditing(member)} icon={<Pencil className="h-3.5 w-3.5" />} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing === 'new' ? 'Add team member' : 'Edit team member'}>
        {editing !== null && <MemberForm key={editing === 'new' ? 'new' : editing.id} member={editing === 'new' ? undefined : editing} onDone={() => setEditing(null)} />}
      </Modal>
    </>
  )
}
