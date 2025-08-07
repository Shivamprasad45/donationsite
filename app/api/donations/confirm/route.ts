import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import Donation from '@/models/Donation'
import User from '@/models/User'
import Charity from '@/models/Charity'
import { confirmPayment } from '@/lib/payment'
import { sendEmail, emailTemplates } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    await dbConnect()

    const { paymentIntentId } = await request.json()

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'Payment intent ID is required' },
        { status: 400 }
      )
    }

    // Find donation by payment ID
    const donation = await Donation.findOne({ paymentId: paymentIntentId })
      .populate('donor', 'name email')
      .populate('charity', 'name email')

    if (!donation) {
      return NextResponse.json(
        { error: 'Donation not found' },
        { status: 404 }
      )
    }

    // Confirm payment with Stripe
    const paymentIntent = await confirmPayment(paymentIntentId)

    if (paymentIntent.status === 'succeeded') {
      // Update donation status
      donation.paymentStatus = 'completed'
      donation.transactionId = paymentIntent.id
      await donation.save()

      // Update user's donation history and total
      await User.findByIdAndUpdate(donation.donor._id, {
        $push: { donationHistory: donation._id },
        $inc: { totalDonated: donation.amount }
      })

      // Update charity's totals
      await Charity.findByIdAndUpdate(donation.charity._id, {
        $inc: { 
          totalReceived: donation.amount,
          donorCount: 1
        }
      })

      // Send confirmation emails
      try {
        // Email to donor
        await sendEmail({
          to: donation.donor.email,
          subject: 'Donation Confirmation',
          html: emailTemplates.donationConfirmation(
            donation.donor.name,
            donation.charity.name,
            donation.amount,
            donation.receiptNumber
          )
        })

        // Email to charity
        await sendEmail({
          to: donation.charity.email,
          subject: 'New Donation Received',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #16a34a;">New Donation Received!</h2>
              <p>Dear ${donation.charity.name} Team,</p>
              <p>You have received a new donation of $${donation.amount}${donation.isAnonymous ? ' from an anonymous donor' : ` from ${donation.donor.name}`}.</p>
              ${donation.message ? `<p><strong>Message:</strong> ${donation.message}</p>` : ''}
              <p>Receipt Number: ${donation.receiptNumber}</p>
              <p>Best regards,<br>The Charity Platform Team</p>
            </div>
          `
        })
      } catch (emailError) {
        console.error('Failed to send confirmation emails:', emailError)
      }

      return NextResponse.json({
        message: 'Donation confirmed successfully',
        donation: {
          id: donation._id,
          amount: donation.amount,
          currency: donation.currency,
          receiptNumber: donation.receiptNumber,
          status: donation.paymentStatus
        }
      })
    } else {
      // Update donation status to failed
      donation.paymentStatus = 'failed'
      await donation.save()

      return NextResponse.json(
        { error: 'Payment failed' },
        { status: 400 }
      )
    }

  } catch (error: any) {
    console.error('Confirm donation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
