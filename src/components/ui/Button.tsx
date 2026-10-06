import { Loader2 } from 'lucide-react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router-dom'
import { buttonClass, type ButtonSize as Size, type ButtonVariant as Variant } from '@/lib/ui'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  icon?: ReactNode
}

export default function Button({ variant = 'primary', size = 'md', loading = false, icon, className = '', children, disabled, type = 'button', ...rest }: Props) {
  return (
    <button type={type} disabled={disabled || loading} className={`${buttonClass(variant, size)} ${className}`} {...rest}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
      {children}
    </button>
  )
}

export function ButtonLink({ variant = 'primary', size = 'md', icon, className = '', children, ...rest }: LinkProps & { variant?: Variant; size?: Size; icon?: ReactNode }) {
  return (
    <Link className={`${buttonClass(variant, size)} ${className}`} {...rest}>
      {icon}
      {children}
    </Link>
  )
}
