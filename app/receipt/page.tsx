'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle, Download, Share, ArrowLeft, Heart } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function ReceiptPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [donation, setDonation] = useState<any>(null)

  // In a real app, you'd get this from the URL params or local storage
  useEffect(() => {
    // Mock donation data - in real app, fetch from API using donation ID
    const mockDonation = {
      id: '1',
      amount: 100,
      currency: 'USD',
      receiptNumber: 'RCP-1234567890-ABC123',
      createdAt: new Date().toISOString(),
      charity: {
        name: 'Education for All Foundation',
        logo: '/placeholder.svg?height=80&width=80',
        registrationNumber: 'REG123456'
      },
      donor: {
        name: 'John Doe',
        email: 'john@example.com'
      },
      message: 'Keep up the great work!',
      dedicatedTo: 'In memory of Jane Smith',
      paymentMethod: 'stripe',
      transactionId: 'pi_1234567890'
    }
    setDonation(mockDonation)
  }, [])

  const handleDownloadReceipt = () => {
    if (donation) {
      window.open(`/api/donations/${donation.id}/receipt`, '_blank')
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'I just made a donation!',
          text: `I donated $${donation.amount} to ${donation.charity.name} through CharityPlatform`,
          url: window.location.href,
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  if (!donation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading receipt...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard/user')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        {/* Success Message */}
        <Card className="mb-8 border-green-200 bg-green-50">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-green-800 mb-2">
              Donation Successful!
            </h1>
            <p className="text-green-700 mb-4">
              Thank you for your generous donation of ${donation.amount} to {donation.charity.name}
            </p>
            <div className="flex justify-center space-x-4">
              <Button onClick={handleDownloadReceipt}>
                <Download className="h-4 w-4 mr-2" />
                Download Receipt
              </Button>
              <Button variant="outline" onClick={handleShare}>
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Receipt Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Receipt */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="text-center border-b">
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <Heart className="h-6 w-6 text-blue-600" />
                  <span className="text-xl font-bold text-gray-900">CharityPlatform</span>
                </div>
                <CardTitle className="text-2xl">Donation Receipt</CardTitle>
                <p className="text-gray-600">Receipt Number: {donation.receiptNumber}</p>
              </CardHeader>
              
              <CardContent className="p-8">
                <div className="space-y-6">
                  {/* Donor Information */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3 text-gray-900">Donor Information</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Name</p>
                          <p className="text-gray-900">{donation.donor.name}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Email</p>
                          <p className="text-gray-900">{donation.donor.email}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Charity Information */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3 text-gray-900">Charity Information</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center space-x-4 mb-4">
                        <img
                          src={donation.charity.logo || "/placeholder.svg"}
                          alt={donation.charity.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div>
                          <h4 className="font-semibold text-gray-900">{donation.charity.name}</h4>
                          <p className="text-sm text-gray-600">
                            Registration: {donation.charity.registrationNumber}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Donation Details */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3 text-gray-900">Donation Details</h3>
                    <div className="bg-blue-50 p-6 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-blue-700">Amount</p>
                          <p className="text-2xl font-bold text-blue-900">
                            ${donation.amount.toLocaleString()} {donation.currency}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-blue-700">Date</p>
                          <p className="text-blue-900">
                            {new Date(donation.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-blue-700">Payment Method</p>
                          <p className="text-blue-900 capitalize">{donation.paymentMethod}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-blue-700">Transaction ID</p>
                          <p className="text-blue-900 font-mono text-sm">{donation.transactionId}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Information */}
                  {(donation.message || donation.dedicatedTo) && (
                    <div>
                      <h3 className="font-semibold text-lg mb-3 text-gray-900">Additional Information</h3>
                      <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                        {donation.message && (
                          <div>
                            <p className="text-sm font-medium text-gray-700">Message</p>
                            <p className="text-gray-900 italic">"{donation.message}"</p>
                          </div>
                        )}
                        {donation.dedicatedTo && (
                          <div>
                            <p className="text-sm font-medium text-gray-700">Dedicated To</p>
                            <p className="text-gray-900">{donation.dedicatedTo}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Tax Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tax Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Tax Deductible</span>
                    <Badge variant="default">Yes</Badge>
                  </div>
                  <p className="text-xs text-gray-500">
                    This receipt is for tax deduction purposes. Please keep it for your records.
                  </p>
                  <p className="text-xs text-gray-500">
                    Consult your tax advisor for specific deduction eligibility.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What's Next?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium">Track Impact</p>
                      <p className="text-xs text-gray-600">
                        You'll receive updates on how your donation is being used
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium">Impact Reports</p>
                      <p className="text-xs text-gray-600">
                        Get notified when the charity publishes impact reports
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium">Continue Giving</p>
                      <p className="text-xs text-gray-600">
                        Explore other charities and causes you care about
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => router.push(`/charities/${donation.charity.id}`)}
                >
                  <Heart className="h-4 w-4 mr-2" />
                  Donate Again
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => router.push('/charities')}
                >
                  Browse Charities
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => router.push('/impact-reports')}
                >
                  View Impact Reports
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
