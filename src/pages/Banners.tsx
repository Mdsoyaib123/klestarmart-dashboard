import { ArrowDown, ArrowUp, Image, Pencil, Plus, Trash2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useDeleteBannerMutation, useGetBannersQuery, useSaveBannerMutation } from '@/features/content/contentApi'
import { useRunWithToast } from '@/hooks/useAppActions'
import { formatDate } from '@/lib/format'
import { inputClass, textareaClass } from '@/lib/ui'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { Field, Toggle } from '@/components/ui/Field'
import { ImageUpload } from '@/components/ui/ImageUpload'
import Modal from '@/components/ui/Modal'
import PageHeader from '@/components/ui/PageHeader'
import { EmptyState, ErrorNotice, Loading } from '@/components/ui/States'
import type { Banner, BannerInput } from '@/types'

// Matches the storefront hero's colour themes.
const THEMES: Record<Banner['theme'], { label: string; preview: string; dark: boolean }> = {
  light: { label: 'Light blue', preview: 'bg-gradient-to-br from-cream to-[#d9e4fb] text-ink', dark: false },
  dark: { label: 'Deep blue', preview: 'bg-gradient-to-br from-[#0a2a8c] to-[#1a47c4] text-white', dark: true },
  accent: { label: 'Warm orange', preview: 'bg-gradient-to-br from-accent-soft to-[#ffddc7] text-ink', dark: false },
}

const toDateInput = (value?: string | null) => (value ? value.slice(0, 10) : '')

// When the banner shows, given its switch and optional schedule.
const visibility = (banner: Banner) => {
  const now = Date.now()
  if (!banner.isActive) return { label: 'Hidden', tone: 'neutral' as const }
  if (banner.startsAt && new Date(banner.startsAt).getTime() > now) return { label: `Starts ${formatDate(banner.startsAt)}`, tone: 'warning' as const }
  if (banner.endsAt && new Date(banner.endsAt).getTime() <= now) return { label: 'Ended', tone: 'neutral' as const }
  return { label: 'Live', tone: 'success' as const }
}

function Preview({ banner }: { banner: Pick<Banner, 'eyebrow' | 'title' | 'text' | 'ctaLabel' | 'theme' | 'imageUrl'> }) {
  const theme = THEMES[banner.theme]
  return (
    <div className={`grid items-center gap-4 overflow-hidden rounded-xl p-5 sm:grid-cols-2 ${theme.preview}`}>
      <div className="min-w-0">
        {banner.eyebrow && <p className="mb-2 inline-block rounded-full border border-current/20 px-2.5 py-0.5 text-[10px] font-medium">{banner.eyebrow}</p>}
        <p className="text-lg font-semibold leading-tight">{banner.title || 'Your headline'}</p>
        {banner.text && <p className={`mt-1.5 line-clamp-2 text-xs ${theme.dark ? 'text-white/80' : 'text-muted'}`}>{banner.text}</p>}
        <span className={`mt-3 inline-block rounded-full px-3 py-1.5 text-xs font-medium ${theme.dark ? 'bg-white text-brand' : 'bg-brand text-white'}`}>{banner.ctaLabel || 'Shop now'}</span>
      </div>
      {banner.imageUrl && <img src={banner.imageUrl} alt="" className="aspect-[4/3] w-full rounded-lg object-cover" />}
    </div>
  )
}

function BannerForm({ banner, nextOrder, onDone }: { banner?: Banner; nextOrder: number; onDone: () => void }) {
  const [saveBanner, { isLoading }] = useSaveBannerMutation()
  const run = useRunWithToast()
  const [draft, setDraft] = useState<BannerInput>({
    eyebrow: banner?.eyebrow ?? '',
    title: banner?.title ?? '',
    text: banner?.text ?? '',
    imageUrl: banner?.imageUrl ?? '',
    ctaLabel: banner?.ctaLabel ?? 'Shop now',
    ctaLink: banner?.ctaLink ?? '/shop',
    secondaryLabel: banner?.secondaryLabel ?? '',
    secondaryLink: banner?.secondaryLink ?? '',
    theme: banner?.theme ?? 'light',
    sortOrder: banner?.sortOrder ?? nextOrder,
    isActive: banner?.isActive ?? true,
    startsAt: toDateInput(banner?.startsAt),
    endsAt: toDateInput(banner?.endsAt),
  })
  const change = <K extends keyof BannerInput>(key: K, value: BannerInput[K]) => setDraft((current) => ({ ...current, [key]: value }))

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    const ok = await run(() => saveBanner({ id: banner?.id, body: { ...draft, imageUrl: draft.imageUrl || null } }).unwrap(), banner ? 'Banner saved' : 'Banner created')
    if (ok) onDone()
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Preview banner={draft} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Headline" className="sm:col-span-2">
          <input value={draft.title} onChange={(event) => change('title', event.target.value)} required maxLength={120} className={inputClass} />
        </Field>
        <Field label="Small label above" hint="e.g. Eid collection">
          <input value={draft.eyebrow} onChange={(event) => change('eyebrow', event.target.value)} maxLength={60} className={inputClass} />
        </Field>
        <Field label="Colour theme">
          <select value={draft.theme} onChange={(event) => change('theme', event.target.value as Banner['theme'])} className={inputClass}>
            {Object.entries(THEMES).map(([value, theme]) => (
              <option key={value} value={value}>
                {theme.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Text" className="sm:col-span-2">
          <textarea value={draft.text} onChange={(event) => change('text', event.target.value)} rows={2} maxLength={300} className={textareaClass} />
        </Field>
        <Field label="Button text">
          <input value={draft.ctaLabel} onChange={(event) => change('ctaLabel', event.target.value)} required maxLength={40} className={inputClass} />
        </Field>
        <Field label="Button link" hint="A store path like /shop?deals=1 or a full URL.">
          <input value={draft.ctaLink} onChange={(event) => change('ctaLink', event.target.value)} required className={inputClass} />
        </Field>
        <Field label="Second button text (optional)">
          <input value={draft.secondaryLabel} onChange={(event) => change('secondaryLabel', event.target.value)} maxLength={40} className={inputClass} />
        </Field>
        <Field label="Second button link">
          <input value={draft.secondaryLink} onChange={(event) => change('secondaryLink', event.target.value)} className={inputClass} />
        </Field>
      </div>
      <div>
        <span className="mb-1.5 block text-sm font-medium">Image (optional)</span>
        <ImageUpload value={draft.imageUrl} onChange={(url) => change('imageUrl', url)} aspect="aspect-[4/3] max-w-xs" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Show from (optional)">
          <input type="date" value={draft.startsAt ?? ''} onChange={(event) => change('startsAt', event.target.value)} className={inputClass} />
        </Field>
        <Field label="Show until (optional)" hint="The banner hides itself after this date.">
          <input type="date" value={draft.endsAt ?? ''} onChange={(event) => change('endsAt', event.target.value)} className={inputClass} />
        </Field>
      </div>
      <Toggle checked={draft.isActive} onChange={(value) => change('isActive', value)} label="Show in the store" />
      <div className="flex justify-end gap-2 border-t border-line pt-4">
        <Button variant="secondary" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" loading={isLoading}>
          {banner ? 'Save banner' : 'Create banner'}
        </Button>
      </div>
    </form>
  )
}

export default function Banners() {
  const { data: banners = [], error, refetch, isLoading } = useGetBannersQuery()
  const [saveBanner] = useSaveBannerMutation()
  const [deleteBanner, { isLoading: deleting }] = useDeleteBannerMutation()
  const [editing, setEditing] = useState<Banner | 'new' | null>(null)
  const [removing, setRemoving] = useState<Banner | null>(null)
  const run = useRunWithToast()

  // Swaps two neighbours by renumbering the whole list, so order stays stable.
  const move = async (index: number, direction: -1 | 1) => {
    const order = [...banners]
    const [item] = order.splice(index, 1)
    order.splice(index + direction, 0, item)
    await run(() => Promise.all(order.map(({ id, ...rest }, position) => (rest.sortOrder === position ? null : saveBanner({ id, body: { ...rest, sortOrder: position } }).unwrap()))))
  }

  const remove = async () => {
    if (!removing) return
    await run(() => deleteBanner(removing.id).unwrap(), 'Banner deleted')
    setRemoving(null)
  }

  return (
    <>
      <PageHeader
        title="Banners"
        description="Slides in the home page carousel, shown in this order. With no live banners, the store shows its built-in slides."
        actions={
          <Button icon={<Plus className="h-4 w-4" />} onClick={() => setEditing('new')}>
            Add banner
          </Button>
        }
      />
      {error && <ErrorNotice error={error} onRetry={refetch} />}
      {isLoading ? (
        <Loading />
      ) : banners.length === 0 ? (
        <div className="rounded-xl border border-line bg-white">
          <EmptyState icon={<Image className="h-5 w-5" />} title="No banners yet" description="Add a banner to promote a sale, a new collection or free delivery." action={<Button onClick={() => setEditing('new')}>Add banner</Button>} />
        </div>
      ) : (
        <ul className="space-y-3">
          {banners.map((banner, index) => {
            const state = visibility(banner)
            return (
              <li key={banner.id} className="grid gap-4 rounded-xl border border-line bg-white p-4 md:grid-cols-[minmax(0,320px)_1fr_auto] md:items-center">
                <Preview banner={banner} />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{banner.title}</p>
                    <Badge tone={state.tone}>{state.label}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted">
                    Button: {banner.ctaLabel} → <span className="font-mono text-xs">{banner.ctaLink}</span>
                  </p>
                  {(banner.startsAt || banner.endsAt) && (
                    <p className="mt-1 text-xs text-muted">
                      {banner.startsAt ? `From ${formatDate(banner.startsAt)}` : 'From now'} {banner.endsAt ? `until ${formatDate(banner.endsAt)}` : 'with no end date'}
                    </p>
                  )}
                </div>
                <div className="flex gap-1 md:flex-col">
                  <Button variant="ghost" size="sm" aria-label="Move up" disabled={index === 0} onClick={() => move(index, -1)} icon={<ArrowUp className="h-3.5 w-3.5" />} />
                  <Button variant="ghost" size="sm" aria-label="Move down" disabled={index === banners.length - 1} onClick={() => move(index, 1)} icon={<ArrowDown className="h-3.5 w-3.5" />} />
                  <Button variant="ghost" size="sm" aria-label={`Edit ${banner.title}`} onClick={() => setEditing(banner)} icon={<Pencil className="h-3.5 w-3.5" />} />
                  <Button variant="ghost" size="sm" aria-label={`Delete ${banner.title}`} onClick={() => setRemoving(banner)} icon={<Trash2 className="h-3.5 w-3.5" />} className="hover:text-accent" />
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing === 'new' ? 'Add banner' : 'Edit banner'} size="lg">
        {editing !== null && (
          <BannerForm key={editing === 'new' ? 'new' : editing.id} banner={editing === 'new' ? undefined : editing} nextOrder={banners.length} onDone={() => setEditing(null)} />
        )}
      </Modal>
      <ConfirmDialog
        open={removing !== null}
        title="Delete this banner?"
        message={`"${removing?.title}" will be removed from the store.`}
        confirmLabel="Delete"
        danger
        loading={deleting}
        onConfirm={remove}
        onClose={() => setRemoving(null)}
      />
    </>
  )
}
