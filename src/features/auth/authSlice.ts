import { createSlice } from '@reduxjs/toolkit'
import type { RootState } from '@/app/store'
import { authApi } from '@/features/auth/authApi'
import { sessionExpired } from '@/features/auth/authActions'
import type { StaffUser } from '@/types'

interface AuthState {
  user: StaffUser | null
  status: 'checking' | 'signedIn' | 'signedOut'
  // Why the user was signed out, shown on the login page.
  notice: string | null
}

const initialState: AuthState = { user: null, status: 'checking', notice: null }

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(sessionExpired, (state) => {
        if (state.status === 'signedIn') state.notice = 'Your session ended. Please sign in again.'
        state.user = null
        state.status = 'signedOut'
      })
      .addMatcher(authApi.endpoints.getMe.matchFulfilled, (state, { payload }) => {
        state.user = payload
        state.status = payload ? 'signedIn' : 'signedOut'
      })
      .addMatcher(authApi.endpoints.getMe.matchRejected, (state, action) => {
        // A network failure while checking the session; treat as signed out so the login page can explain.
        if (!action.meta.condition) state.status = 'signedOut'
      })
      .addMatcher(authApi.endpoints.login.matchFulfilled, (state, { payload }) => {
        state.user = payload
        state.status = 'signedIn'
        state.notice = null
      })
      .addMatcher(authApi.endpoints.logout.matchFulfilled, (state) => {
        state.user = null
        state.status = 'signedOut'
        state.notice = null
      })
  },
})

export default authSlice.reducer

export const selectUser = (state: RootState) => state.auth.user
export const selectAuthStatus = (state: RootState) => state.auth.status
export const selectAuthNotice = (state: RootState) => state.auth.notice
export const selectIsAdmin = (state: RootState) => state.auth.user?.role === 'admin'
