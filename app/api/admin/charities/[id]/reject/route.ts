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

    const { reason } = await request.json()
    if (!reason) {
      return NextResponse.json(
        { error: 'Rejection reason is required' },
        { status: 400 }
      )
    }

    const charity = await Charity.findById(params.id)
    if (!charity) {
      return NextResponse.json(
        { error: 'Charity not found' },
        { status: 404 }
      )
    }

    // Send rejection email
    try {
      await sendEmail({
        to: charity.email,
        subject: 'Charity Registration Update',
        html: emailTemplates.charityRejection(charity.name, reason)
      })
    } catch (emailError) {
      console.error('Failed to send rejection email:', emailError)
    }

    // Delete charity record (or mark as rejected)
    await Charity.findByIdAndDelete(params.id)

    return NextResponse.json({
      message: 'Charity rejected successfully'
    })

  } catch (error: any) {
    console.error('Reject charity error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
