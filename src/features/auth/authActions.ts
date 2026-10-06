import { createAction } from '@reduxjs/toolkit'

// Dispatched by the API layer when the server rejects the session (kept separate to avoid an import cycle).
export const sessionExpired = createAction('auth/sessionExpired')
