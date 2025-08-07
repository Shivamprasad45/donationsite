"use client";

import { useState } from "react";
import {
  Users,
  Building,
  DollarSign,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useGetCharitiesForApprovalQuery,
  useApproveCharityMutation,
  useRejectCharityMutation,
} from "@/store/services/adminApi";
import { useDispatch } from "react-redux";
import { addToast } from "@/store/slices/uiSlice";
import { Charity } from "@/types";

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("pending");

  const { data: pendingCharities, isLoading: pendingLoading } =
    useGetCharitiesForApprovalQuery({
      status: "pending",
      limit: "20",
    });

  const { data: approvedCharities, isLoading: approvedLoading } =
    useGetCharitiesForApprovalQuery({
      status: "approved",
      limit: "20",
    });

  const [approveCharity] = useApproveCharityMutation();
  const [rejectCharity] = useRejectCharityMutation();

  const handleApprove = async (charityId: string) => {
    try {
      await approveCharity(charityId).unwrap();
      dispatch(
        addToast({
          type: "success",
          title: "Charity Approved",
          message: "The charity has been approved and notified",
        })
      );
    } catch (error: any) {
      dispatch(
        addToast({
          type: "error",
          title: "Approval Failed",
          message: error.data?.error || "Failed to approve charity",
        })
      );
    }
  };

  const handleReject = async (charityId: string, reason: string) => {
    try {
      await rejectCharity({ id: charityId, reason }).unwrap();
      dispatch(
        addToast({
          type: "success",
          title: "Charity Rejected",
          message: "The charity has been rejected and notified",
        })
      );
    } catch (error: any) {
      dispatch(
        addToast({
          type: "error",
          title: "Rejection Failed",
          message: error.data?.error || "Failed to reject charity",
        })
      );
    }
  };

  const stats = {
    totalCharities:
      (pendingCharities?.pagination?.total || 0) +
      (approvedCharities?.pagination?.total || 0),
    pendingApproval: pendingCharities?.pagination?.total || 0,
    approved: approvedCharities?.pagination?.total || 0,
    totalDonations: 0, // This would come from a separate API call
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Manage charities, users, and platform operations
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Charities
              </CardTitle>
              <Building className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCharities}</div>
              <p className="text-xs text-gray-600">Registered organizations</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Approval
              </CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {stats.pendingApproval}
              </div>
              <p className="text-xs text-gray-600">Awaiting review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.approved}
              </div>
              <p className="text-xs text-gray-600">Active charities</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Platform Donations
              </CardTitle>
              <DollarSign className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">$2.5M+</div>
              <p className="text-xs text-gray-600">Total processed</p>
            </CardContent>
          </Card>
        </div>

        {/* Charity Management */}
        <Card>
          <CardHeader>
            <CardTitle>Charity Management</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="pending">
                  Pending Approval ({stats.pendingApproval})
                </TabsTrigger>
                <TabsTrigger value="approved">
                  Approved ({stats.approved})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pending" className="mt-6">
                {pendingLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-24 bg-gray-200 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : pendingCharities?.charities?.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-gray-600">
                      No charities pending approval
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingCharities?.charities?.map((charity: Charity) => (
                      <Card
                        key={charity._id}
                        className="border-l-4 border-l-yellow-400"
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-4 mb-4">
                                <img
                                  src={
                                    charity.logo ||
                                    "/placeholder.svg?height=60&width=60&query=charity logo"
                                  }
                                  alt={charity.name}
                                  className="w-15 h-15 rounded-lg object-cover"
                                />
                                <div>
                                  <h3 className="text-lg font-semibold">
                                    {charity.name}
                                  </h3>
                                  <p className="text-gray-600">
                                    {charity.email}
                                  </p>
                                  <Badge variant="secondary">
                                    {charity.category}
                                  </Badge>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                  <p className="text-sm font-medium text-gray-700">
                                    Registration Number
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {charity.registrationNumber}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-700">
                                    Location
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {charity.location?.city},{" "}
                                    {charity.location?.state}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-700">
                                    Phone
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {charity.phone}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-700">
                                    Applied
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {new Date().toLocaleDateString()}
                                  </p>
                                </div>
                              </div>

                              <div className="mb-4">
                                <p className="text-sm font-medium text-gray-700 mb-2">
                                  Mission
                                </p>
                                <p className="text-sm text-gray-600 line-clamp-2">
                                  {charity.mission}
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-col space-y-2 ml-6">
                              <Button
                                size="sm"
                                onClick={() => handleApprove(charity._id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  const reason = prompt(
                                    "Please provide a reason for rejection:"
                                  );
                                  if (reason) {
                                    handleReject(charity._id, reason);
                                  }
                                }}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                              </Button>
                              <Button size="sm" variant="outline">
                                View Details
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="approved" className="mt-6">
                {approvedLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-20 bg-gray-200 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : approvedCharities?.charities?.length === 0 ? (
                  <div className="text-center py-8">
                    <Building className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">No approved charities yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {approvedCharities?.charities?.map((charity: any) => (
                      <Card
                        key={charity._id}
                        className="border-l-4 border-l-green-400"
                      >
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <img
                                src={
                                  charity.logo ||
                                  "/placeholder.svg?height=50&width=50&query=charity logo"
                                }
                                alt={charity.name}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                              <div>
                                <h3 className="font-semibold">
                                  {charity.name}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  {charity.email}
                                </p>
                                <div className="flex items-center space-x-2 mt-1">
                                  <Badge variant="secondary">
                                    {charity.category}
                                  </Badge>
                                  <Badge variant="default">Approved</Badge>
                                </div>
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="text-lg font-semibold text-green-600">
                                ${charity.totalReceived?.toLocaleString() || 0}
                              </div>
                              <p className="text-sm text-gray-600">
                                {charity.donorCount || 0} donors
                              </p>
                              <p className="text-xs text-gray-500">
                                Approved{" "}
                                {charity.approvedAt
                                  ? new Date(
                                      charity.approvedAt
                                    ).toLocaleDateString()
                                  : "N/A"}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
