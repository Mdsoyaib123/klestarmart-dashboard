# KlestarMart Admin Dashboard

Manage the whole store: orders, payments, customers, products, categories, home page banners, site
settings and the team. Built with React 19, TypeScript, Redux Toolkit (RTK Query), React Router,
Tailwind CSS v4 and Vite.

## Getting started

```bash
cp .env.example .env    # API and storefront URLs
npm install
npm run dev             # http://localhost:5174
```

The backend must be running. Sign in with the admin created by `npm run seed` in `backend/`
(see the root README). Add more people from **Team**.

## Pages

| Page        | What you can do                                                                 |
| ----------- | ------------------------------------------------------------------------------- |
| Overview    | Revenue, orders, units sold and new customers vs the previous period; revenue chart; best sellers; orders by status; payment methods; low stock; recent orders |
| Orders      | Filter by status, payment, date or search; move orders through their statuses; record payments and refunds; print an invoice |
| Payments    | Every payment and refund, with collected / pending / refunded / net totals for any filter |
| Customers   | Registered and guest customers with order count and lifetime spend; block or unblock |
| Products    | Add and edit products with images, status (active / draft / archived), stock adjustments and per-product sales |
| Categories  | Store sections, with image, highlights, order and visibility                    |
| Banners     | Home page carousel slides with live preview, scheduling and ordering            |
| Settings    | Store name, logo, announcement bar, contact and social links, delivery charges, return window, SEO (admins only) |
| Team        | Add staff or admins, change roles, deactivate access (admins only)              |

## Scripts

| Command           | What it does                         |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Start the dev server on port 5174    |
| `npm run build`   | Type-check and build to `dist/`      |
| `npm run lint`    | Lint with oxlint                     |
| `npm run preview` | Serve the production build locally   |

## Structure

```
src/
  api/baseApi.ts        RTK Query base: /api/admin, session cookie, sign-out on 401
  app/                  Redux store and typed hooks
  features/             API endpoints per area (auth, products, orders, customers, content, stats) and toasts
  components/charts/    Area, column and bar-list charts (each with a data table)
  components/ui/        Buttons, cards, fields, modals, pagination, image upload, …
  components/layout/    Sidebar layout
  hooks/                URL-backed list filters, debouncing, toast helper
  pages/                One file per page
  routes/               Routes and the sign-in / admin guards
  types/                Types matching the backend
```

List filters live in the URL, so a filtered view can be bookmarked or shared.
