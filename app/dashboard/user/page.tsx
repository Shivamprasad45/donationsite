"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, TrendingUp, Calendar, Download, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGetProfileQuery } from "@/store/services/usersApi";
import { useGetDonationsQuery } from "@/store/services/donationsApi";

export default function UserDashboard() {
  const [donationPage, setDonationPage] = useState(1);

  const { data: profile, isLoading: profileLoading } = useGetProfileQuery("");
  const { data: donationsData, isLoading: donationsLoading } =
    useGetDonationsQuery({
      page: donationPage.toString(),
      limit: "10",
    });

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const user = profile?.user;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600">
            Track your donations and see the impact you're making
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Donated
              </CardTitle>
              <Heart className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ${user?.totalDonated?.toLocaleString() || 0}
              </div>
              <p className="text-xs text-gray-600">Lifetime contributions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Donations Made
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {user?.donationHistory?.length || 0}
              </div>
              <p className="text-xs text-gray-600">Total donations</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <Calendar className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                $
                {donationsData?.donations
                  ?.filter((d) => {
                    const donationDate = new Date(d.createdAt);
                    const now = new Date();
                    return (
                      donationDate.getMonth() === now.getMonth() &&
                      donationDate.getFullYear() === now.getFullYear()
                    );
                  })
                  .reduce((sum, d) => sum + d.amount, 0)
                  ?.toLocaleString() || 0}
              </div>
              <p className="text-xs text-gray-600">Current month donations</p>
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
                  <Link href="/dashboard/user/donations">
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
                      <div
                        key={donation.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <img
                            src={
                              donation.charity.logo ||
                              "/placeholder.svg?height=40&width=40&query=charity logo"
                            }
                            alt={donation.charity.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div>
                            <h3 className="font-medium">
                              {donation.charity.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {new Date(
                                donation.createdAt
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-green-600">
                            ${donation.amount.toLocaleString()}
                          </div>
                          <Badge
                            variant={
                              donation.paymentStatus === "completed"
                                ? "default"
                                : "secondary"
                            }
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
                    <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No donations yet</p>
                    <Link href="/charities">
                      <Button>Start Donating</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link href="/charities">
                  <Button className="w-full">
                    <Heart className="h-4 w-4 mr-2" />
                    Browse Charities
                  </Button>
                </Link>
                <Link href="/dashboard/user/profile">
                  <Button variant="outline" className="w-full">
                    Edit Profile
                  </Button>
                </Link>
                <Link href="/impact-reports">
                  <Button variant="outline" className="w-full">
                    <Eye className="h-4 w-4 mr-2" />
                    View Impact Reports
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Profile Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{user?.email}</p>
                  </div>
                  {user?.phone && (
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium">{user.phone}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600">Member since</p>
                    <p className="font-medium">
                      {user?.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
