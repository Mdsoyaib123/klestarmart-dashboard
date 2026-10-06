import { ImagePlus, Loader2, Star, Trash2 } from 'lucide-react'
import { useRef, type ChangeEvent } from 'react'
import { useAppDispatch } from '@/app/hooks'
import { errorMessage } from '@/api/baseApi'
import { useUploadImageMutation } from '@/features/content/contentApi'
import { notify } from '@/features/toast/toastSlice'

const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif,image/avif'
const MAX_BYTES = 5 * 1024 * 1024

const useUploader = () => {
  const [upload, { isLoading }] = useUploadImageMutation()
  const dispatch = useAppDispatch()

  const uploadFiles = async (files: File[]) => {
    const urls: string[] = []
    for (const file of files) {
      if (file.size > MAX_BYTES) {
        dispatch(notify('error', `${file.name} is larger than 5 MB.`))
        continue
      }
      try {
        urls.push((await upload(file).unwrap()).url)
      } catch (error) {
        dispatch(notify('error', errorMessage(error)))
      }
    }
    return urls
  }
  return { uploadFiles, uploading: isLoading }
}

function Picker({ multiple, uploading, onFiles, label, className = '' }: { multiple?: boolean; uploading: boolean; onFiles: (files: File[]) => void; label: string; className?: string }) {
  const input = useRef<HTMLInputElement>(null)
  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    onFiles([...(event.target.files ?? [])])
    event.target.value = ''
  }
  return (
    <button
      type="button"
      onClick={() => input.current?.click()}
      disabled={uploading}
      className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-line bg-paper text-xs font-medium text-muted transition hover:border-brand/50 hover:text-brand disabled:cursor-wait ${className}`}
    >
      {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
      {uploading ? 'Uploading…' : label}
      <input ref={input} type="file" accept={ACCEPT} multiple={multiple} onChange={onChange} className="sr-only" tabIndex={-1} />
    </button>
  )
}

// One image, e.g. a logo or banner.
export function ImageUpload({ value, onChange, aspect = 'aspect-video', label = 'Upload image' }: { value?: string | null; onChange: (url: string) => void; aspect?: string; label?: string }) {
  const { uploadFiles, uploading } = useUploader()
  const choose = async (files: File[]) => {
    const [url] = await uploadFiles(files.slice(0, 1))
    if (url) onChange(url)
  }

  if (!value) return <Picker uploading={uploading} onFiles={choose} label={label} className={`w-full ${aspect}`} />

  return (
    <div className={`group relative w-full overflow-hidden rounded-xl border border-line bg-paper ${aspect}`}>
      <img src={value} alt="" className="h-full w-full object-contain" />
      <div className="absolute inset-x-2 bottom-2 flex justify-end gap-2 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
        <label className="cursor-pointer rounded-lg bg-white/95 px-3 py-1.5 text-xs font-medium shadow-sm hover:bg-white">
          {uploading ? 'Uploading…' : 'Replace'}
          <input type="file" accept={ACCEPT} className="sr-only" onChange={(event) => { choose([...(event.target.files ?? [])]); event.target.value = '' }} />
        </label>
        <button type="button" onClick={() => onChange('')} className="rounded-lg bg-white/95 px-3 py-1.5 text-xs font-medium text-accent shadow-sm hover:bg-white">
          Remove
        </button>
      </div>
    </div>
  )
}

// Several images; the first is the main one shown on product cards.
export function ImageGallery({ value, onChange, max = 10 }: { value: string[]; onChange: (urls: string[]) => void; max?: number }) {
  const { uploadFiles, uploading } = useUploader()
  const add = async (files: File[]) => {
    const urls = await uploadFiles(files.slice(0, max - value.length))
    if (urls.length) onChange([...value, ...urls])
  }
  const makeMain = (index: number) => onChange([value[index], ...value.filter((_, i) => i !== index)])

  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
      {value.map((url, index) => (
        <div key={url} className="group relative aspect-square overflow-hidden rounded-xl border border-line bg-paper">
          <img src={url} alt={`Product image ${index + 1}`} className="h-full w-full object-cover" />
          {index === 0 && <span className="absolute left-1.5 top-1.5 rounded-md bg-ink/80 px-1.5 py-0.5 text-[10px] font-semibold text-white">Main</span>}
          <div className="absolute inset-x-1.5 bottom-1.5 flex justify-end gap-1 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
            {index > 0 && (
              <button type="button" aria-label="Make main image" title="Make main image" onClick={() => makeMain(index)} className="grid h-7 w-7 place-items-center rounded-lg bg-white/95 shadow-sm hover:text-brand">
                <Star className="h-3.5 w-3.5" />
              </button>
            )}
            <button type="button" aria-label="Remove image" title="Remove image" onClick={() => onChange(value.filter((_, i) => i !== index))} className="grid h-7 w-7 place-items-center rounded-lg bg-white/95 text-accent shadow-sm">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ))}
      {value.length < max && <Picker multiple uploading={uploading} onFiles={add} label="Add images" className="aspect-square" />}
    </div>
  )
}
