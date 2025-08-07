"use client";

import Link from "next/link";
import { ArrowRight, Heart, Shield, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CharityCard } from "@/components/CharityCard";
import { useGetCharitiesQuery } from "@/store/services/charitiesApi";

export default function HomePage() {
  const { data: charitiesData } = useGetCharitiesQuery({ limit: "6" });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Make a Difference Today
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Connect with verified charities and create meaningful impact in
              communities worldwide. Every donation matters, every story counts.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/charities">
                <Button
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-gray-100"
                >
                  Browse Charities
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-blue-600"
                >
                  Start Donating
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We ensure your donations reach the right hands and create real
              impact
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>Verified Charities</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  All charities are thoroughly vetted and verified before
                  joining our platform
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <TrendingUp className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <CardTitle>Impact Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  See exactly how your donations are being used with detailed
                  impact reports
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Heart className="h-12 w-12 text-red-600 mx-auto mb-4" />
                <CardTitle>Secure Donations</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Your donations are processed securely with industry-leading
                  payment systems
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Charities */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Featured Charities
            </h2>
            <p className="text-lg text-gray-600">
              Discover amazing organizations making a difference
            </p>
          </div>

          {charitiesData?.charities && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
              {charitiesData.charities.slice(0, 6).map((charity: any) => (
                <CharityCard key={charity._id} charity={charity} />
              ))}
            </div>
          )}

          <div className="text-center">
            <Link href="/charities">
              <Button size="lg">
                View All Charities
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">$2.5M+</div>
              <div className="text-blue-100">Total Donations</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">150+</div>
              <div className="text-blue-100">Verified Charities</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">10K+</div>
              <div className="text-blue-100">Happy Donors</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Make an Impact?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands of donors who are already making a difference in
            communities worldwide
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg">
                Start Donating Today
                <Heart className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/charity/register">
              <Button size="lg" variant="outline">
                Register Your Charity
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
