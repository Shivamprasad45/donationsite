import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import Charity from '@/models/Charity'
import { generateToken } from '@/lib/auth'
import { charityRegistrationSchema } from '@/lib/validation'
import { sendEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    await dbConnect()

    const body = await request.json()
    const validatedData = charityRegistrationSchema.parse(body)

    // Check if charity already exists
    const existingCharity = await Charity.findOne({ 
      $or: [
        { email: validatedData.email },
        { registrationNumber: validatedData.registrationNumber }
      ]
    })
    
    if (existingCharity) {
      return NextResponse.json(
        { error: 'Charity already exists with this email or registration number' },
        { status: 400 }
      )
    }

    // Create new charity
    const charity = new Charity(validatedData)
    await charity.save()

    // Generate JWT token
    const token = generateToken({
      userId: charity._id.toString(),
      email: charity.email,
      role: 'charity',
      charityId: charity._id.toString()
    })

    // Send registration confirmation email
    try {
      await sendEmail({
        to: charity.email,
        subject: 'Charity Registration Received',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Registration Received</h2>
            <p>Dear ${charity.name} Team,</p>
            <p>Thank you for registering with our platform. Your application is under review.</p>
            <p>We will notify you once your charity has been approved.</p>
            <p>Best regards,<br>The Charity Platform Team</p>
          </div>
        `
      })
    } catch (emailError) {
      console.error('Failed to send registration email:', emailError)
    }

    return NextResponse.json({
      message: 'Charity registered successfully. Awaiting approval.',
      charity: {
        id: charity._id,
        name: charity.name,
        email: charity.email,
        isApproved: charity.isApproved
      },
      token
    }, { status: 201 })

  } catch (error: any) {
    console.error('Charity registration error:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
