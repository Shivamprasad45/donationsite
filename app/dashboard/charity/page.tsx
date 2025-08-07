'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Building, Users, DollarSign, FileText, Plus, Eye, Edit } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useSelector } from 'react-redux'
import { RootState } from '@/store/store'
import { useGetCharityByIdQuery } from '@/store/services/charitiesApi'
import { useGetDonationsQuery } from '@/store/services/donationsApi'
import { useGetImpactReportsQuery } from '@/store/services/charitiesApi'

export default function CharityDashboard() {
  const { user } = useSelector((state: RootState) => state.auth)
  const charityId = user?.charityId

  const { data: charityData, isLoading: charityLoading } = useGetCharityByIdQuery(charityId!, {
    skip: !charityId
  })
  
  const { data: donationsData, isLoading: donationsLoading } = useGetDonationsQuery({
    limit: '5'
  })
  
  const { data: reportsData, isLoading: reportsLoading } = useGetImpactReportsQuery({
    charityId,
    limit: '3'
  })

  if (charityLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const charity = charityData?.charity

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {charity?.name} Dashboard
              </h1>
              <div className="flex items-center space-x-4">
                <Badge variant={charity?.isApproved ? 'default' : 'secondary'}>
                  {charity?.isApproved ? 'Approved' : 'Pending Approval'}
                </Badge>
                <Badge variant={charity?.isVerified ? 'default' : 'secondary'}>
                  {charity?.isVerified ? 'Verified' : 'Unverified'}
                </Badge>
              </div>
            </div>
            <div className="flex space-x-2">
              <Link href={`/charities/${charityId}`}>
                <Button variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  View Public Page
                </Button>
              </Link>
              <Link href="/dashboard/charity/profile">
                <Button variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Approval Status Alert */}
        {!charity?.isApproved && (
          <Card className="mb-8 border-yellow-200 bg-yellow-50">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Building className="h-5 w-5 text-yellow-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Pending Approval
                  </h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    Your charity registration is under review. You'll be notified once approved.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Raised</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ${charity?.totalReceived?.toLocaleString() || 0}
              </div>
              <p className="text-xs text-gray-600">
                Lifetime donations
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Donors</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {charity?.donorCount || 0}
              </div>
              <p className="text-xs text-gray-600">
                Total supporters
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
              <Building className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {charity?.goals?.filter(g => g.isActive).length || 0}
              </div>
              <p className="text-xs text-gray-600">
                Current campaigns
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Impact Reports</CardTitle>
              <FileText className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {reportsData?.reports?.length || 0}
              </div>
              <p className="text-xs text-gray-600">
                Published reports
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Donations */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Donations</CardTitle>
                  <Link href="/dashboard/charity/donations">
                    <Button variant="outline" size="sm">
                      View All
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {donationsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    ))}
                  </div>
                ) : donationsData?.donations?.length > 0 ? (
                  <div className="space-y-4">
                    {donationsData.donations.slice(0, 5).map((donation) => (
                      <div key={donation.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-medium">
                            {donation.isAnonymous ? 'Anonymous Donor' : donation.donor.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {new Date(donation.createdAt).toLocaleDateString()}
                          </p>
                          {donation.message && (
                            <p className="text-sm text-gray-700 mt-1 italic">
                              "{donation.message}"
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-green-600">
                            ${donation.amount.toLocaleString()}
                          </div>
                          <Badge 
                            variant={donation.paymentStatus === 'completed' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {donation.paymentStatus}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <DollarSign className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">No donations received yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & Goals */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link href="/dashboard/charity/projects">
                  <Button className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Project/Goal
                  </Button>
                </Link>
                <Link href="/dashboard/charity/impact-reports">
                  <Button variant="outline" className="w-full">
                    <FileText className="h-4 w-4 mr-2" />
                    Create Impact Report
                  </Button>
                </Link>
                <Link href="/dashboard/charity/profile">
                  <Button variant="outline" className="w-full">
                    Edit Organization Profile
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Active Goals */}
            <Card>
              <CardHeader>
                <CardTitle>Active Goals</CardTitle>
              </CardHeader>
              <CardContent>
                {charity?.goals?.filter(g => g.isActive).length > 0 ? (
                  <div className="space-y-4">
                    {charity.goals.filter(g => g.isActive).slice(0, 2).map((goal, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <h4 className="font-medium text-sm mb-2">{goal.title}</h4>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Progress</span>
                            <span>
                              ${goal.currentAmount.toLocaleString()} / ${goal.targetAmount.toLocaleString()}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-600">No active goals</p>
                    <Link href="/dashboard/charity/projects">
                      <Button size="sm" className="mt-2">
                        Create Goal
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
