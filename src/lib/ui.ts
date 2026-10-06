// Shared class names so buttons, inputs and tables look the same everywhere.
// Base look of every form control, without a width.
export const controlClass =
  'h-10 rounded-lg border border-line bg-white px-3 text-sm outline-none transition placeholder:text-muted/70 focus:border-brand focus:ring-2 focus:ring-brand/15 disabled:bg-cream disabled:text-muted'
// Full-width controls in forms.
export const inputClass = `${controlClass} w-full`
// Content-width controls in filter bars.
export const filterClass = `${controlClass} w-auto`
export const textareaClass = `${inputClass} h-auto py-2.5`
export const tableWrapClass = 'overflow-x-auto rounded-xl border border-line bg-white'
export const tableClass = 'w-full text-left text-sm'
export const thClass = 'whitespace-nowrap border-b border-line bg-cream/50 px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-muted'
export const tdClass = 'px-4 py-3 align-middle'

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'
export type ButtonSize = 'sm' | 'md'

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-brand text-white hover:bg-brand-dark',
  secondary: 'border border-line bg-white text-ink hover:border-brand/40 hover:bg-cream/40',
  danger: 'bg-accent text-white hover:bg-[#b83c0b]',
  ghost: 'text-muted hover:bg-cream hover:text-ink',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'h-8 gap-1.5 px-3 text-xs',
  md: 'h-10 gap-2 px-4 text-sm',
}

export const buttonClass = (variant: ButtonVariant = 'primary', size: ButtonSize = 'md') =>
  `inline-flex shrink-0 items-center justify-center rounded-lg font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${sizes[size]}`
