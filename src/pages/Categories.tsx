import { Pencil, Plus, Tags, Trash2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useDeleteCategoryMutation, useGetCategoriesQuery, useSaveCategoryMutation } from '@/features/products/productsApi'
import { useRunWithToast } from '@/hooks/useAppActions'
import { inputClass, tableClass, tableWrapClass, tdClass, textareaClass, thClass } from '@/lib/ui'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { Field, Toggle } from '@/components/ui/Field'
import { ImageUpload } from '@/components/ui/ImageUpload'
import Modal from '@/components/ui/Modal'
import PageHeader from '@/components/ui/PageHeader'
import { EmptyState, ErrorNotice, Loading } from '@/components/ui/States'
import type { Category } from '@/types'

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

function CategoryForm({ category, onDone }: { category?: Category; onDone: () => void }) {
  const [saveCategory, { isLoading }] = useSaveCategoryMutation()
  const run = useRunWithToast()
  const [name, setName] = useState(category?.name ?? '')
  const [slug, setSlug] = useState(category?.slug ?? '')
  const [slugTouched, setSlugTouched] = useState(Boolean(category))
  const [imageUrl, setImageUrl] = useState(category?.imageUrl ?? '')
  const [isActive, setIsActive] = useState(category?.isActive ?? true)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const ok = await run(
      () =>
        saveCategory({
          id: category?.id,
          body: {
            name: name.trim(),
            slug: slug.trim(),
            description: String(form.get('description') ?? '').trim(),
            highlights: String(form.get('highlights') ?? '')
              .split('\n')
              .map((line) => line.trim())
              .filter(Boolean),
            sortOrder: Number(form.get('sortOrder') ?? 0),
            imageUrl: imageUrl || null,
            isActive,
          },
        }).unwrap(),
      category ? 'Category saved' : 'Category created',
    )
    if (ok) onDone()
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name">
          <input
            value={name}
            onChange={(event) => {
              setName(event.target.value)
              if (!slugTouched) setSlug(slugify(event.target.value))
            }}
            required
            maxLength={60}
            className={inputClass}
          />
        </Field>
        <Field label="URL slug" hint={category && category.slug !== slug ? 'Products in this category move to the new slug.' : 'Used in the store address, e.g. /category/clothing.'}>
          <input
            value={slug}
            onChange={(event) => {
              setSlugTouched(true)
              setSlug(event.target.value)
            }}
            required
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            title="Lowercase letters, numbers and hyphens"
            className={`${inputClass} font-mono`}
          />
        </Field>
      </div>
      <Field label="Description">
        <textarea name="description" rows={2} maxLength={300} defaultValue={category?.description} className={textareaClass} />
      </Field>
      <Field label="Highlights" hint="One per line, up to 6. Shown on product pages under “Why you will like it”.">
        <textarea name="highlights" rows={3} defaultValue={category?.highlights.join('\n')} className={textareaClass} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
        <div>
          <span className="mb-1.5 block text-sm font-medium">Image</span>
          <ImageUpload value={imageUrl} onChange={setImageUrl} aspect="aspect-[16/9]" />
        </div>
        <Field label="Sort order" hint="Lower numbers come first.">
          <input name="sortOrder" type="number" defaultValue={category?.sortOrder ?? 0} className={inputClass} />
        </Field>
      </div>
      <Toggle checked={isActive} onChange={setIsActive} label="Visible in the store" description="Hidden categories keep their products, but do not appear in menus." />
      <div className="flex justify-end gap-2 border-t border-line pt-4">
        <Button variant="secondary" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" loading={isLoading}>
          {category ? 'Save category' : 'Create category'}
        </Button>
      </div>
    </form>
  )
}

export default function Categories() {
  const { data: categories = [], error, refetch, isLoading } = useGetCategoriesQuery()
  const [deleteCategory, { isLoading: deleting }] = useDeleteCategoryMutation()
  const [editing, setEditing] = useState<Category | 'new' | null>(null)
  const [removing, setRemoving] = useState<Category | null>(null)
  const run = useRunWithToast()

  const remove = async () => {
    if (!removing) return
    await run(() => deleteCategory(removing.id).unwrap(), 'Category deleted')
    setRemoving(null)
  }

  return (
    <>
      <PageHeader
        title="Categories"
        description="Group products into the sections shown in the store's menus."
        actions={
          <Button icon={<Plus className="h-4 w-4" />} onClick={() => setEditing('new')}>
            Add category
          </Button>
        }
      />
      {error && <ErrorNotice error={error} onRetry={refetch} />}
      {isLoading ? (
        <Loading />
      ) : categories.length === 0 ? (
        <div className={tableWrapClass}>
          <EmptyState icon={<Tags className="h-5 w-5" />} title="No categories yet" action={<Button onClick={() => setEditing('new')}>Add category</Button>} />
        </div>
      ) : (
        <div className={tableWrapClass}>
          <table className={`${tableClass} min-w-[640px]`}>
            <thead>
              <tr>
                <th className={thClass}>Category</th>
                <th className={thClass}>Slug</th>
                <th className={`${thClass} text-right`}>Products</th>
                <th className={thClass}>Status</th>
                <th className={thClass}>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {categories.map((category) => (
                <tr key={category.id} className="hover:bg-cream/40">
                  <td className={tdClass}>
                    <div className="flex items-center gap-3">
                      {category.imageUrl ? <img src={category.imageUrl} alt="" className="h-10 w-14 rounded-lg object-cover" /> : <span className="h-10 w-14 rounded-lg bg-cream" />}
                      <div>
                        <p className="font-medium">{category.name}</p>
                        <p className="line-clamp-1 text-xs text-muted">{category.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className={`${tdClass} font-mono text-xs text-muted`}>{category.slug}</td>
                  <td className={`${tdClass} text-right tabular-nums`}>
                    <Link to={`/products?category=${category.slug}`} className="text-brand hover:underline">
                      {category.productCount ?? 0}
                    </Link>
                  </td>
                  <td className={tdClass}>
                    <Badge tone={category.isActive ? 'success' : 'neutral'}>{category.isActive ? 'Visible' : 'Hidden'}</Badge>
                  </td>
                  <td className={tdClass}>
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" aria-label={`Edit ${category.name}`} onClick={() => setEditing(category)} icon={<Pencil className="h-3.5 w-3.5" />} />
                      <Button variant="ghost" size="sm" aria-label={`Delete ${category.name}`} onClick={() => setRemoving(category)} icon={<Trash2 className="h-3.5 w-3.5" />} className="hover:text-accent" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing === 'new' ? 'Add category' : 'Edit category'} size="lg">
        {editing !== null && <CategoryForm key={editing === 'new' ? 'new' : editing.id} category={editing === 'new' ? undefined : editing} onDone={() => setEditing(null)} />}
      </Modal>
      <ConfirmDialog
        open={removing !== null}
        title="Delete this category?"
        message={
          removing?.productCount
            ? `"${removing.name}" still has ${removing.productCount} product(s). Move them to another category first.`
            : `"${removing?.name}" will be removed permanently.`
        }
        confirmLabel="Delete"
        danger
        loading={deleting}
        onConfirm={remove}
        onClose={() => setRemoving(null)}
      />
    </>
  )
}
