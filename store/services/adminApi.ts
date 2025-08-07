import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { RootState } from '../store'

const baseQuery = fetchBaseQuery({
  baseUrl: '/api/admin',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token
    if (token) {
      headers.set('authorization', `Bearer ${token}`)
    }
    return headers
  },
})

export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery,
  tagTypes: ['AdminCharity', 'AdminUser'],
  endpoints: (builder) => ({
    getCharitiesForApproval: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams(params).toString()
        return `/charities?${searchParams}`
      },
      providesTags: ['AdminCharity'],
    }),
    approveCharity: builder.mutation({
      query: (id) => ({
        url: `/charities/${id}/approve`,
        method: 'POST',
      }),
      invalidatesTags: ['AdminCharity'],
    }),
    rejectCharity: builder.mutation({
      query: ({ id, reason }) => ({
        url: `/charities/${id}/reject`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: ['AdminCharity'],
    }),
  }),
})

export const {
  useGetCharitiesForApprovalQuery,
  useApproveCharityMutation,
  useRejectCharityMutation,
} = adminApi
