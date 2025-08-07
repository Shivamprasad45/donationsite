import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import { authApi } from './services/authApi'
import { charitiesApi } from './services/charitiesApi'
import { donationsApi } from './services/donationsApi'
import { adminApi } from './services/adminApi'
import { usersApi } from './services/usersApi'
import authSlice from './slices/authSlice'
import uiSlice from './slices/uiSlice'

export const store = configureStore({
  reducer: {
    auth: authSlice,
    ui: uiSlice,
    [authApi.reducerPath]: authApi.reducer,
    [charitiesApi.reducerPath]: charitiesApi.reducer,
    [donationsApi.reducerPath]: donationsApi.reducer,
    [adminApi.reducerPath]: adminApi.reducer,
    [usersApi.reducerPath]: usersApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      charitiesApi.middleware,
      donationsApi.middleware,
      adminApi.middleware,
      usersApi.middleware
    ),
})

setupListeners(store.dispatch)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
