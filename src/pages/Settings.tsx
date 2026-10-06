import { ExternalLink } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useGetSettingsQuery, useUpdateSettingsMutation } from '@/features/content/contentApi'
import { useRunWithToast } from '@/hooks/useAppActions'
import { STOREFRONT_URL } from '@/config/site'
import { inputClass, textareaClass } from '@/lib/ui'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { Field, Toggle } from '@/components/ui/Field'
import { ImageUpload } from '@/components/ui/ImageUpload'
import PageHeader from '@/components/ui/PageHeader'
import { ErrorNotice, Loading } from '@/components/ui/States'
import type { DeliveryRate, SiteSettings } from '@/types'

const TABS = [
  { id: 'store', label: 'Store & branding' },
  { id: 'contact', label: 'Contact & social' },
  { id: 'shipping', label: 'Delivery & returns' },
] as const

type TabId = (typeof TABS)[number]['id']

function RateFields({ title, rate, onChange }: { title: string; rate: DeliveryRate; onChange: (rate: DeliveryRate) => void }) {
  return (
    <fieldset className="rounded-lg border border-line p-4">
      <legend className="px-1 text-sm font-medium">{title}</legend>
      <div className="grid grid-cols-3 gap-3">
        <Field label="Fee (৳)">
          <input type="number" min={0} value={rate.fee} onChange={(event) => onChange({ ...rate, fee: Number(event.target.value) })} required className={inputClass} />
        </Field>
        <Field label="Min days">
          <input type="number" min={0} value={rate.minDays} onChange={(event) => onChange({ ...rate, minDays: Number(event.target.value) })} required className={inputClass} />
        </Field>
        <Field label="Max days">
          <input type="number" min={rate.minDays} value={rate.maxDays} onChange={(event) => onChange({ ...rate, maxDays: Number(event.target.value) })} required className={inputClass} />
        </Field>
      </div>
    </fieldset>
  )
}

function SettingsForm({ initial }: { initial: SiteSettings }) {
  const [settings, setSettings] = useState(initial)
  const [tab, setTab] = useState<TabId>('store')
  const [districts, setDistricts] = useState(initial.shipping.insideDhakaDistricts.join(', '))
  const [updateSettings, { isLoading }] = useUpdateSettingsMutation()
  const run = useRunWithToast()

  // Updates one nested section, e.g. update('contact', { phone: '…' }).
  const update = <K extends keyof SiteSettings>(key: K, value: Partial<SiteSettings[K]> | SiteSettings[K]) =>
    setSettings((current) => ({ ...current, [key]: typeof value === 'object' && !Array.isArray(value) ? { ...(current[key] as object), ...value } : value }))

  const save = async (event: FormEvent) => {
    event.preventDefault()
    const insideDhakaDistricts = districts
      .split(',')
      .map((name) => name.trim())
      .filter(Boolean)
    await run(() => updateSettings({ ...settings, shipping: { ...settings.shipping, insideDhakaDistricts } }).unwrap(), 'Settings saved. The store shows the changes on its next page load.')
  }

  return (
    <form onSubmit={save}>
      <div role="tablist" aria-label="Settings sections" className="mb-6 flex gap-1 overflow-x-auto border-b border-line">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            onClick={() => setTab(item.id)}
            className={`-mb-px shrink-0 border-b-2 px-4 py-2.5 text-sm font-medium transition ${tab === item.id ? 'border-brand text-brand' : 'border-transparent text-muted hover:text-ink'}`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="space-y-6" role="tabpanel">
        {tab === 'store' && (
          <>
            <Card title="Store identity">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Store name">
                  <input value={settings.siteName} onChange={(event) => update('siteName', event.target.value)} required maxLength={60} className={inputClass} />
                </Field>
                <Field label="Tagline">
                  <input value={settings.tagline} onChange={(event) => update('tagline', event.target.value)} maxLength={120} className={inputClass} />
                </Field>
                <div className="sm:col-span-2">
                  <span className="mb-1.5 block text-sm font-medium">Logo</span>
                  <div className="max-w-sm">
                    <ImageUpload value={settings.logoUrl} onChange={(url) => update('logoUrl', url)} aspect="aspect-[3/1]" label="Upload logo" />
                  </div>
                  <p className="mt-1.5 text-xs text-muted">A wide PNG or WebP with a transparent background works best. Without one, the store uses its built-in logo.</p>
                </div>
              </div>
            </Card>
            <Card title="Announcement bar" description="The thin strip at the very top of every store page.">
              <div className="space-y-4">
                <Toggle checked={settings.announcement.enabled} onChange={(enabled) => update('announcement', { enabled })} label="Show the announcement bar" />
                <Field label="Message">
                  <input value={settings.announcement.text} onChange={(event) => update('announcement', { text: event.target.value })} maxLength={200} disabled={!settings.announcement.enabled} className={inputClass} />
                </Field>
              </div>
            </Card>
            <Card title="Search engines">
              <Field label="Meta description" hint={`${settings.seo.metaDescription.length}/300 · Shown under your store's name in Google results.`}>
                <textarea value={settings.seo.metaDescription} onChange={(event) => update('seo', { metaDescription: event.target.value })} rows={3} maxLength={300} className={textareaClass} />
              </Field>
            </Card>
          </>
        )}

        {tab === 'contact' && (
          <>
            <Card title="Contact details" description="Shown in the store footer and on order confirmations.">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Support email">
                  <input type="email" value={settings.contact.email} onChange={(event) => update('contact', { email: event.target.value })} className={inputClass} />
                </Field>
                <Field label="Phone">
                  <input type="tel" value={settings.contact.phone} onChange={(event) => update('contact', { phone: event.target.value })} maxLength={30} className={inputClass} />
                </Field>
                <Field label="Address" className="sm:col-span-2">
                  <textarea value={settings.contact.address} onChange={(event) => update('contact', { address: event.target.value })} rows={2} maxLength={300} className={textareaClass} />
                </Field>
              </div>
            </Card>
            <Card title="Social media" description="Full links to your pages. Empty ones are hidden.">
              <div className="grid gap-4 sm:grid-cols-3">
                {(['facebook', 'instagram', 'youtube'] as const).map((network) => (
                  <Field key={network} label={network === 'youtube' ? 'YouTube' : network.charAt(0).toUpperCase() + network.slice(1)}>
                    <input type="url" placeholder="https://" value={settings.social[network]} onChange={(event) => update('social', { [network]: event.target.value })} className={inputClass} />
                  </Field>
                ))}
              </div>
            </Card>
          </>
        )}

        {tab === 'shipping' && (
          <>
            <Card title="Delivery charges" description="Applied at checkout. The server always calculates the final charge.">
              <div className="space-y-4">
                <div className="grid gap-4 lg:grid-cols-2">
                  <RateFields title="Inside Dhaka" rate={settings.shipping.dhaka} onChange={(dhaka) => update('shipping', { dhaka })} />
                  <RateFields title="Outside Dhaka" rate={settings.shipping.outside} onChange={(outside) => update('shipping', { outside })} />
                </div>
                <Field label="Free delivery from (৳)" hint="Orders at or above this subtotal ship free. Set a very high number to turn it off.">
                  <input
                    type="number"
                    min={0}
                    value={settings.shipping.freeShippingThreshold}
                    onChange={(event) => update('shipping', { freeShippingThreshold: Number(event.target.value) })}
                    className={`${inputClass} max-w-xs`}
                  />
                </Field>
                <Field label="Districts charged the inside-Dhaka rate" hint="Comma separated, spelled as in the checkout list, e.g. Dhaka, Gazipur, Narayanganj.">
                  <input value={districts} onChange={(event) => setDistricts(event.target.value)} required className={inputClass} />
                </Field>
              </div>
            </Card>
            <Card title="Returns">
              <Field label="Return window (days)" hint="Shown on product pages, checkout and the footer. Set 0 to hide return messages.">
                <input type="number" min={0} max={365} value={settings.returnDays} onChange={(event) => update('returnDays', Number(event.target.value))} className={`${inputClass} max-w-xs`} />
              </Field>
            </Card>
          </>
        )}
      </div>

      <div className="sticky bottom-0 -mx-4 mt-6 flex items-center justify-end gap-3 border-t border-line bg-paper/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <a href={STOREFRONT_URL} target="_blank" rel="noreferrer" className="mr-auto inline-flex items-center gap-1.5 text-sm text-brand hover:underline">
          Open store <ExternalLink className="h-3.5 w-3.5" />
        </a>
        <Button variant="secondary" onClick={() => { setSettings(initial); setDistricts(initial.shipping.insideDhakaDistricts.join(', ')) }}>
          Discard changes
        </Button>
        <Button type="submit" loading={isLoading}>
          Save settings
        </Button>
      </div>
    </form>
  )
}

export default function Settings() {
  const { data, error, refetch } = useGetSettingsQuery()
  return (
    <>
      <PageHeader title="Settings" description="What customers see across the store. Only admins can change these." />
      {error && <ErrorNotice error={error} onRetry={refetch} />}
      {data ? <SettingsForm initial={data} /> : !error && <Loading />}
    </>
  )
}
