# KlestarMart Admin Dashboard

Admin panel for managing the KlestarMart catalogue. Built with React 19, TypeScript, Redux Toolkit (RTK Query), React Router, Tailwind CSS v4 and Vite.

## Getting started

```bash
cp .env.example .env    # points at the backend, default http://localhost:5000/api
npm install
npm run dev             # http://localhost:5174
```

The backend must be running, and its `.env` needs an `ADMIN_API_KEY` of **at least 32 characters**
(generate one with `openssl rand -hex 32`). Sign in to the dashboard with that key.

The key is kept in `sessionStorage` for the current tab only. It is never put in the build, since any
`VITE_` variable is readable by everyone who loads the page. Reading products is public; creating,
editing and deleting send the key in the `x-admin-api-key` header. A rejected key signs you out.

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
  api/baseApi.ts          RTK Query base: API URL, admin-key header, sign-out on 401
  app/                    Redux store and typed hooks
  features/auth/          Admin key session (authSlice)
  features/products/      Product endpoints (productsApi, via injectEndpoints)
  components/layout/      Sidebar layout
  components/ui/          Shared UI pieces
  pages/                  Login, Overview, Products, ProductEditor, NotFound
  routes/                 Routes and the RequireAdmin guard
  types/                  Types matching the backend models
```

To add a feature, create `src/features/<name>/<name>Api.ts` with `baseApi.injectEndpoints`, add its
tag to `tagTypes` in `baseApi.ts`, then add a page and a route.
