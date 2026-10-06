import { ButtonLink } from '@/components/ui/Button'

export default function NotFound() {
  return (
    <div className="py-24 text-center">
      <p className="text-sm font-semibold text-brand">404</p>
      <h1 className="mt-2 text-2xl font-semibold">Page not found</h1>
      <p className="mt-2 text-sm text-muted">The page you are looking for does not exist or was moved.</p>
      <ButtonLink to="/" className="mt-6">
        Back to overview
      </ButtonLink>
    </div>
  )
}
