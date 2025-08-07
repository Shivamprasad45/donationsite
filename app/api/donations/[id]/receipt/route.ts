import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import Donation from '@/models/Donation'
import { authenticateRequest } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect()

    // Authenticate user
    const payload = await authenticateRequest(request)
    if (!payload) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const donation = await Donation.findById(params.id)
      .populate('donor', 'name email address')
      .populate('charity', 'name registrationNumber location')

    if (!donation) {
      return NextResponse.json(
        { error: 'Donation not found' },
        { status: 404 }
      )
    }

    // Check authorization
    if (payload.role === 'user' && donation.donor._id.toString() !== payload.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    if (payload.role === 'charity' && donation.charity._id.toString() !== payload.charityId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Generate receipt HTML
    const receiptHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Donation Receipt</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .header { text-align: center; margin-bottom: 40px; }
          .receipt-details { margin: 20px 0; }
          .amount { font-size: 24px; font-weight: bold; color: #2563eb; }
          .footer { margin-top: 40px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Donation Receipt</h1>
          <p>Receipt Number: ${donation.receiptNumber}</p>
        </div>
        
        <div class="receipt-details">
          <h3>Donor Information:</h3>
          <p><strong>Name:</strong> ${donation.donor.name}</p>
          <p><strong>Email:</strong> ${donation.donor.email}</p>
          
          <h3>Charity Information:</h3>
          <p><strong>Name:</strong> ${donation.charity.name}</p>
          <p><strong>Registration Number:</strong> ${donation.charity.registrationNumber}</p>
          
          <h3>Donation Details:</h3>
          <p><strong>Amount:</strong> <span class="amount">${donation.currency} ${donation.amount}</span></p>
          <p><strong>Date:</strong> ${donation.createdAt.toLocaleDateString()}</p>
          <p><strong>Payment Method:</strong> ${donation.paymentMethod}</p>
          <p><strong>Transaction ID:</strong> ${donation.transactionId}</p>
          ${donation.message ? `<p><strong>Message:</strong> ${donation.message}</p>` : ''}
          ${donation.dedicatedTo ? `<p><strong>Dedicated To:</strong> ${donation.dedicatedTo}</p>` : ''}
        </div>
        
        <div class="footer">
          <p>This receipt is for tax deduction purposes. Please keep it for your records.</p>
          <p>Thank you for your generous donation!</p>
        </div>
      </body>
      </html>
    `

    return new NextResponse(receiptHtml, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="receipt-${donation.receiptNumber}.html"`
      }
    })

  } catch (error: any) {
    console.error('Generate receipt error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
