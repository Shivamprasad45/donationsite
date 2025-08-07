'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Download, Eye, Filter } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useGetDonationsQuery } from '@/store/services/donationsApi'

export default function DonationHistoryPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')

  const queryParams = {
    page: page.toString(),
    limit: '10',
    ...(search && { search }),
    ...(status !== 'all' && { status })
  }

  const { data, isLoading, error } = useGetDonationsQuery(queryParams)

  const handleDownloadReceipt = (donationId: string) => {
    window.open(`/api/donations/${donationId}/receipt`, '_blank')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard/user">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Donation History
          </h1>
          <p className="text-gray-600">
            View and manage all your donations
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search by charity name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="w-full md:w-48">
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Donations List */}
        <Card>
          <CardHeader>
            <CardTitle>
              Your Donations ({data?.pagination?.total || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-20 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Failed to load donations. Please try again.</p>
              </div>
            ) : data?.donations?.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">No donations found.</p>
                <Link href="/charities">
                  <Button>Start Donating</Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {data?.donations?.map((donation) => (
                    <div key={donation.id} className="border rounded-lg p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <img
                            src={donation.charity.logo || '/placeholder.svg?height=60&width=60&query=charity logo'}
                            alt={donation.charity.name}
                            className="w-15 h-15 rounded-lg object-cover"
                          />
                          <div>
                            <h3 className="font-semibold text-lg mb-1">
                              {donation.charity.name}
                            </h3>
                            <p className="text-gray-600 mb-2">
                              Receipt: {donation.receiptNumber}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(donation.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                            {donation.message && (
                              <p className="text-sm text-gray-700 mt-2 italic">
                                "{donation.message}"
                              </p>
                            )}
                            {donation.dedicatedTo && (
                              <p className="text-sm text-gray-700 mt-1">
                                <strong>Dedicated to:</strong> {donation.dedicatedTo}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600 mb-2">
                            ${donation.amount.toLocaleString()}
                          </div>
                          <Badge 
                            variant={
                              donation.paymentStatus === 'completed' ? 'default' :
                              donation.paymentStatus === 'pending' ? 'secondary' :
                              'destructive'
                            }
                            className="mb-3"
                          >
                            {donation.paymentStatus}
                          </Badge>
                          
                          <div className="flex flex-col space-y-2">
                            {donation.paymentStatus === 'completed' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDownloadReceipt(donation.id)}
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Receipt
                              </Button>
                            )}
                            <Link href={`/charities/${donation.charity.id}`}>
                              <Button size="sm" variant="ghost" className="w-full">
                                <Eye className="h-4 w-4 mr-2" />
                                View Charity
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {data?.pagination && data.pagination.pages > 1 && (
                  <div className="flex justify-center space-x-2 mt-6">
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
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
