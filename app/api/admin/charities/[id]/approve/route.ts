import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import Charity from '@/models/Charity'
import { authenticateRequest } from '@/lib/auth'
import { sendEmail, emailTemplates } from '@/lib/email'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect()

    // Authenticate admin
    const payload = await authenticateRequest(request)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const charity = await Charity.findById(params.id)
    if (!charity) {
      return NextResponse.json(
        { error: 'Charity not found' },
        { status: 404 }
      )
    }

    if (charity.isApproved) {
      return NextResponse.json(
        { error: 'Charity is already approved' },
        { status: 400 }
      )
    }

    // Approve charity
    charity.isApproved = true
    charity.approvedBy = payload.userId
    charity.approvedAt = new Date()
    await charity.save()

    // Send approval email
    try {
      await sendEmail({
        to: charity.email,
        subject: 'Charity Registration Approved',
        html: emailTemplates.charityApproval(charity.name)
      })
    } catch (emailError) {
      console.error('Failed to send approval email:', emailError)
    }

    return NextResponse.json({
      message: 'Charity approved successfully',
      charity: {
        id: charity._id,
        name: charity.name,
        isApproved: charity.isApproved,
        approvedAt: charity.approvedAt
      }
    })

  } catch (error: any) {
    console.error('Approve charity error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
