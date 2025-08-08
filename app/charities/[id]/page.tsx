"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  MapPin,
  Globe,
  Phone,
  Mail,
  Star,
  Users,
  Target,
  Calendar,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DonationForm } from "@/components/DonationForm";
import { ImpactReportCard } from "@/components/ImpactReportCard";
import { useGetCharityByIdQuery } from "@/store/services/charitiesApi";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

export default function CharityDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [showDonationForm, setShowDonationForm] = useState(false);

  const { data, isLoading, error } = useGetCharityByIdQuery(
    params.id as string
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading charity details...</p>
        </div>
      </div>
    );
  }

  if (error || !data?.charity) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            Charity not found or failed to load.
          </p>
          <Button onClick={() => router.push("/charities")}>
            Back to Charities
          </Button>
        </div>
      </div>
    );
  }

  const { charity, recentReports } = data;
  const { _doc } = charity;
  const activeGoal = charity.goals?.find((goal: any) => goal.isActive);
  console.log(_doc);
  const handleDonationSuccess = () => {
    setShowDonationForm(false);
    router.push("/receipt");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
              <img
                src={
                  _doc.logo ||
                  `https://picsum.photos/seed/${Math.floor(Math.random() * 200)}/600/400`
                }
                alt={_doc.name}
                className="w-32 h-32 rounded-lg object-cover"
              />
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {_doc.name}
                  </h1>
                  <div className="flex items-center space-x-4 text-gray-600 mb-2">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>
                        {_doc.location.city}, {_doc.location.state}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 mr-1 text-yellow-500 fill-current" />
                      <span>
                        {_doc.rating.toFixed(1)} ({_doc.reviews?.length || 0}{" "}
                        reviews)
                      </span>
                    </div>
                  </div>
                  <Badge variant="secondary" className="mb-4">
                    {_doc.category}
                  </Badge>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    ${_doc.totalReceived?.toLocaleString() || 0}
                  </div>
                  <div className="text-sm text-gray-600">raised</div>
                  <div className="text-sm text-gray-600">
                    {_doc.donorCount || 0} donors
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                {isAuthenticated ? (
                  <Button
                    size="lg"
                    onClick={() => setShowDonationForm(true)}
                    className="flex-1 sm:flex-none"
                  >
                    Donate Now
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    onClick={() => router.push("/auth/login")}
                    className="flex-1 sm:flex-none"
                  >
                    Login to Donate
                  </Button>
                )}

                <div className="flex gap-2">
                  {_doc.website && (
                    <Button variant="outline" size="lg" asChild>
                      <a
                        href={_doc.website}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Globe className="h-4 w-4 mr-2" />
                        Website
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="about" className="space-y-6">
              <TabsList>
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="goals">Goals & Projects</TabsTrigger>
                <TabsTrigger value="impact">Impact Reports</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="about">
                <Card>
                  <CardHeader>
                    <CardTitle>About {_doc.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-2">Description</h3>
                      <p className="text-gray-700">{_doc.description}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-semibold mb-2">Mission</h3>
                        <p className="text-gray-700">{_doc.mission}</p>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">Vision</h3>
                        <p className="text-gray-700">{_doc.vision}</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">
                        Contact Information
                      </h3>
                      <div className="space-y-2">
                        <div className="flex items-center text-gray-600">
                          <Mail className="h-4 w-4 mr-2" />
                          <span>{_doc.email}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Phone className="h-4 w-4 mr-2" />
                          <span>{_doc.phone}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span>
                            {_doc.location.address}, {_doc.location.city},{" "}
                            {_doc.location.state}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="goals">
                <div className="space-y-6">
                  {_doc.goals?.length > 0 ? (
                    _doc.goals.map((goal, index) => (
                      <Card key={index}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <CardTitle className="text-lg">
                              {goal.title}
                            </CardTitle>
                            <Badge
                              variant={goal.isActive ? "default" : "secondary"}
                            >
                              {goal.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-700 mb-4">
                            {goal.description}
                          </p>

                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Progress</span>
                              <span>
                                ${goal.currentAmount.toLocaleString()} / $
                                {goal.targetAmount.toLocaleString()}
                              </span>
                            </div>
                            <Progress
                              value={
                                (goal.currentAmount / goal.targetAmount) * 100
                              }
                              className="h-2"
                            />
                            <div className="text-sm text-gray-600">
                              {(
                                (goal.currentAmount / goal.targetAmount) *
                                100
                              ).toFixed(1)}
                              % completed
                            </div>
                          </div>

                          {goal.deadline && (
                            <div className="flex items-center text-sm text-gray-600 mt-4">
                              <Calendar className="h-4 w-4 mr-1" />
                              <span>
                                Deadline:{" "}
                                {new Date(goal.deadline).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card>
                      <CardContent className="text-center py-8">
                        <p className="text-gray-600">
                          No active goals or projects at the moment.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="impact">
                <div className="space-y-6">
                  {recentReports?.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6">
                      {recentReports.map((report) => (
                        <ImpactReportCard key={report.id} report={report} />
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="text-center py-8">
                        <p className="text-gray-600">
                          No impact reports available yet.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="reviews">
                <div className="space-y-6">
                  {_doc.reviews?.length > 0 ? (
                    _doc.reviews.map((review, index) => (
                      <Card key={index}>
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating
                                      ? "text-yellow-500 fill-current"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-600">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-gray-700">{review.comment}</p>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card>
                      <CardContent className="text-center py-8">
                        <p className="text-gray-600">No reviews yet.</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Target className="h-4 w-4 mr-2 text-blue-600" />
                    <span className="text-sm">Total Raised</span>
                  </div>
                  <span className="font-semibold">
                    ${charity.totalReceived?.toLocaleString() || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2 text-green-600" />
                    <span className="text-sm">Donors</span>
                  </div>
                  <span className="font-semibold">
                    {charity.donorCount || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 mr-2 text-yellow-600" />
                    <span className="text-sm">Rating</span>
                  </div>
                  <span className="font-semibold">
                    {_doc.rating.toFixed(1)}/5
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Active Goal */}
            {activeGoal && (
              <Card>
                <CardHeader>
                  <CardTitle>Current Goal</CardTitle>
                </CardHeader>
                <CardContent>
                  <h3 className="font-semibold mb-2">{activeGoal.title}</h3>
                  <p className="text-sm text-gray-700 mb-4">
                    {activeGoal.description}
                  </p>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>
                        ${activeGoal.currentAmount.toLocaleString()} / $
                        {activeGoal.targetAmount.toLocaleString()}
                      </span>
                    </div>
                    <Progress
                      value={
                        (activeGoal.currentAmount / activeGoal.targetAmount) *
                        100
                      }
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Donation Form Modal */}
      {showDonationForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">Make a Donation</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDonationForm(false)}
              >
                ×
              </Button>
            </div>
            <div className="p-4">
              <DonationForm
                charity={charity}
                onSuccess={handleDonationSuccess}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
