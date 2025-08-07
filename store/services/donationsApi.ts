import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { RootState } from '../store'

const baseQuery = fetchBaseQuery({
  baseUrl: '/api/donations',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token
    if (token) {
      headers.set('authorization', `Bearer ${token}`)
    }
    return headers
  },
})

export const donationsApi = createApi({
  reducerPath: 'donationsApi',
  baseQuery,
  tagTypes: ['Donation'],
  endpoints: (builder) => ({
    createDonation: builder.mutation({
      query: (donationData) => ({
        url: '',
        method: 'POST',
        body: donationData,
      }),
      invalidatesTags: ['Donation'],
    }),
    confirmDonation: builder.mutation({
      query: (paymentIntentId) => ({
        url: '/confirm',
        method: 'POST',
        body: { paymentIntentId },
      }),
      invalidatesTags: ['Donation'],
    }),
    getDonations: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams(params).toString()
        return `?${searchParams}`
      },
      providesTags: ['Donation'],
    }),
    getReceipt: builder.query({
      query: (id) => `/${id}/receipt`,
    }),
  }),
})

export const {
  useCreateDonationMutation,
  useConfirmDonationMutation,
  useGetDonationsQuery,
  useGetReceiptQuery,
} = donationsApi
