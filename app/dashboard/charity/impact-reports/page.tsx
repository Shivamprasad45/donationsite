'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Eye, Edit, Calendar, Users, DollarSign } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useSelector } from 'react-redux'
import { RootState } from '@/store/store'
import { useGetImpactReportsQuery, usePublishImpactReportMutation } from '@/store/services/charitiesApi'
import { useDispatch } from 'react-redux'
import { addToast } from '@/store/slices/uiSlice'

export default function ImpactReportsPage() {
  const dispatch = useDispatch()
  const { user } = useSelector((state: RootState) => state.auth)
  const charityId = user?.charityId

  const { data, isLoading, error } = useGetImpactReportsQuery({
    charityId,
    limit: '20'
  })

  const [publishReport] = usePublishImpactReportMutation()

  const handlePublish = async (reportId: string) => {
    try {
      await publishReport(reportId).unwrap()
      dispatch(addToast({
        type: 'success',
        title: 'Report Published',
        message: 'Your impact report has been published and donors have been notified',
      }))
    } catch (error: any) {
      dispatch(addToast({
        type: 'error',
        title: 'Publish Failed',
        message: error.data?.error || 'Failed to publish report',
      }))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard/charity">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Impact Reports
              </h1>
              <p className="text-gray-600">
                Create and manage your impact reports to show donors how their contributions are making a difference
              </p>
            </div>
            <Link href="/dashboard/charity/impact-reports/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Report
              </Button>
            </Link>
          </div>
        </div>

        {/* Reports List */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-3 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-600">Failed to load impact reports. Please try again.</p>
              </CardContent>
            </Card>
          ) : data?.reports?.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No Impact Reports Yet</h3>
                <p className="text-gray-600 mb-6">
                  Create your first impact report to show donors how their contributions are making a difference.
                </p>
                <Link href="/dashboard/charity/impact-reports/create">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Report
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.reports.map((report) => (
                <Card key={report.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg line-clamp-2 mb-2">
                          {report.title}
                        </CardTitle>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>
                              {new Date(report.reportPeriod.startDate).toLocaleDateString()} - {' '}
                              {new Date(report.reportPeriod.endDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Badge variant={report.isPublished ? 'default' : 'secondary'}>
                        {report.isPublished ? 'Published' : 'Draft'}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-gray-700 text-sm line-clamp-3 mb-4">
                      {report.description}
                    </p>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <DollarSign className="h-4 w-4 text-blue-600 mx-auto mb-1" />
                        <p className="text-xs font-medium text-blue-900">Funds Received</p>
                        <p className="text-sm font-bold text-blue-600">
                          ${report.totalFundsReceived.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <Users className="h-4 w-4 text-green-600 mx-auto mb-1" />
                        <p className="text-xs font-medium text-green-900">Beneficiaries</p>
                        <p className="text-sm font-bold text-green-600">
                          {report.beneficiariesReached.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Link href={`/dashboard/charity/impact-reports/${report.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </Link>
                      
                      {!report.isPublished && (
                        <>
                          <Link href={`/dashboard/charity/impact-reports/${report.id}/edit`}>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                          </Link>
                          <Button 
                            size="sm"
                            onClick={() => handlePublish(report.id)}
                          >
                            Publish
                          </Button>
                        </>
                      )}
                    </div>

                    {report.isPublished && report.publishedAt && (
                      <p className="text-xs text-gray-500 mt-2">
                        Published on {new Date(report.publishedAt).toLocaleDateString()}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
