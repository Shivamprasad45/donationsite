import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { RootState } from '../store'

const baseQuery = fetchBaseQuery({
  baseUrl: '/api/charities',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token
    if (token) {
      headers.set('authorization', `Bearer ${token}`)
    }
    return headers
  },
})

export const charitiesApi = createApi({
  reducerPath: 'charitiesApi',
  baseQuery,
  tagTypes: ['Charity', 'ImpactReport'],
  endpoints: (builder) => ({
    getCharities: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams(params).toString()
        return `?${searchParams}`
      },
      providesTags: ['Charity'],
    }),
    getCharityById: builder.query({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'Charity', id }],
    }),
    updateCharity: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Charity', id }],
    }),
    getImpactReports: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams(params).toString()
        return `/impact-reports?${searchParams}`
      },
      providesTags: ['ImpactReport'],
    }),
    createImpactReport: builder.mutation({
      query: (data) => ({
        url: '/impact-reports',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['ImpactReport'],
    }),
    publishImpactReport: builder.mutation({
      query: (id) => ({
        url: `/impact-reports/${id}/publish`,
        method: 'POST',
      }),
      invalidatesTags: ['ImpactReport'],
    }),
  }),
})

export const {
  useGetCharitiesQuery,
  useGetCharityByIdQuery,
  useUpdateCharityMutation,
  useGetImpactReportsQuery,
  useCreateImpactReportMutation,
  usePublishImpactReportMutation,
} = charitiesApi
