import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import Charity from '@/models/Charity'
import { generateToken } from '@/lib/auth'
import { charityLoginSchema } from '@/lib/validation'

export async function POST(request: NextRequest) {
  try {
    await dbConnect()

    const body = await request.json()
    const validatedData = charityLoginSchema.parse(body)

    // Find charity and include password for comparison
    const charity = await Charity.findOne({ email: validatedData.email }).select('+password')
    if (!charity) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Check password
    const isPasswordValid = await charity.comparePassword(validatedData.password)
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Generate JWT token
    const token = generateToken({
      userId: charity._id.toString(),
      email: charity.email,
      role: 'charity',
      charityId: charity._id.toString()
    })

    return NextResponse.json({
      message: 'Login successful',
      charity: {
        id: charity._id,
        name: charity.name,
        email: charity.email,
        isApproved: charity.isApproved,
        isVerified: charity.isVerified
      },
      token
    })

  } catch (error: any) {
    console.error('Charity login error:', error)
    
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
