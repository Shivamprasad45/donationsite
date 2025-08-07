'use client'

import { useState } from 'react'
import { Search, Filter, Calendar } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { ImpactReportCard } from '@/components/ImpactReportCard'
import { useGetImpactReportsQuery } from '@/store/services/charitiesApi'

export default function ImpactReportsPage() {
  const [search, setSearch] = useState('')
  const [charityFilter, setCharityFilter] = useState('all')
  const [sortBy, setSortBy] = useState('publishedAt')
  const [page, setPage] = useState(1)

  const queryParams = {
    page: page.toString(),
    limit: '12',
    ...(search && { search }),
    ...(charityFilter !== 'all' && { charityId: charityFilter }),
    sortBy,
    sortOrder: 'desc'
  }

  const { data, isLoading, error } = useGetImpactReportsQuery(queryParams)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Impact Reports
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              See how your donations are making a real difference in communities around the world
            </p>
          </div>

          {/* Search and Filters */}
          <Card>
            <CardContent className="p-6">
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search impact reports by title or charity..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Button type="submit">Search</Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="publishedAt">Most Recent</SelectItem>
                        <SelectItem value="totalFundsReceived">Highest Funding</SelectItem>
                        <SelectItem value="beneficiariesReached">Most Beneficiaries</SelectItem>
                        <SelectItem value="title">Title A-Z</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Select value={charityFilter} onValueChange={setCharityFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by charity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Charities</SelectItem>
                        {/* In a real app, you'd populate this with actual charity options */}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="h-96 animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Failed to load impact reports. Please try again.</p>
          </div>
        ) : data?.reports?.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Impact Reports Found</h3>
            <p className="text-gray-600 mb-4">
              No impact reports match your search criteria.
            </p>
            <Button
              onClick={() => {
                setSearch('')
                setCharityFilter('all')
                setPage(1)
              }}
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600">
                Showing {data?.reports?.length || 0} of {data?.pagination?.total || 0} impact reports
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {data?.reports?.map((report) => (
                <ImpactReportCard key={report.id} report={report} />
              ))}
            </div>

            {/* Pagination */}
            {data?.pagination && data.pagination.pages > 1 && (
              <div className="flex justify-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                
                {[...Array(Math.min(5, data.pagination.pages))].map((_, i) => {
                  const pageNum = i + 1
                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? 'default' : 'outline'}
                      onClick={() => setPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  )
                })}
                
                <Button
                  variant="outline"
                  onClick={() => setPage(page + 1)}
                  disabled={page === data.pagination.pages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
