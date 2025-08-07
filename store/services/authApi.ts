import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { RootState } from '../store'

const baseQuery = fetchBaseQuery({
  baseUrl: '/api/auth',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token
    if (token) {
      headers.set('authorization', `Bearer ${token}`)
    }
    return headers
  },
})

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery,
  tagTypes: ['Auth'],
  endpoints: (builder) => ({
    register: builder.mutation({
      query: (userData) => ({
        url: '/register',
        method: 'POST',
        body: userData,
      }),
    }),
    login: builder.mutation({
      query: (credentials) => ({
        url: '/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    registerCharity: builder.mutation({
      query: (charityData) => ({
        url: '/charity/register',
        method: 'POST',
        body: charityData,
      }),
    }),
    loginCharity: builder.mutation({
      query: (credentials) => ({
        url: '/charity/login',
        method: 'POST',
        body: credentials,
      }),
    }),
  }),
})

export const {
  useRegisterMutation,
  useLoginMutation,
  useRegisterCharityMutation,
  useLoginCharityMutation,
} = authApi
