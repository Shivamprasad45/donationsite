import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import ImpactReport from '@/models/ImpactReport'
import Donation from '@/models/Donation'
import User from '@/models/User'
import { authenticateRequest } from '@/lib/auth'
import { sendEmail, emailTemplates } from '@/lib/email'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect()

    // Authenticate charity
    const payload = await authenticateRequest(request)
    if (!payload || payload.role !== 'charity') {
      return NextResponse.json(
        { error: 'Charity access required' },
        { status: 403 }
      )
    }

    const report = await ImpactReport.findById(params.id)
      .populate('charity', 'name')

    if (!report) {
      return NextResponse.json(
        { error: 'Impact report not found' },
        { status: 404 }
      )
    }

    if (report.charity._id.toString() !== payload.charityId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    if (report.isPublished) {
      return NextResponse.json(
        { error: 'Report is already published' },
        { status: 400 }
      )
    }

    // Publish report
    report.isPublished = true
    report.publishedAt = new Date()
    await report.save()

    // Notify donors
    try {
      const donors = await Donation.find({ 
        charity: payload.charityId,
        paymentStatus: 'completed'
      })
        .populate('donor', 'name email')
        .distinct('donor')

      const uniqueDonors = await User.find({ _id: { $in: donors } })

      for (const donor of uniqueDonors) {
        await sendEmail({
          to: donor.email,
          subject: `New Impact Report from ${report.charity.name}`,
          html: emailTemplates.impactReportNotification(
            donor.name,
            report.charity.name,
            report.title
          )
        })
      }
    } catch (emailError) {
      console.error('Failed to send impact report notifications:', emailError)
    }

    return NextResponse.json({
      message: 'Impact report published successfully',
      report: {
        id: report._id,
        title: report.title,
        isPublished: report.isPublished,
        publishedAt: report.publishedAt
      }
    })

  } catch (error: any) {
    console.error('Publish impact report error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
