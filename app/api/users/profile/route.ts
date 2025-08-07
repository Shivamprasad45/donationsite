import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import User from '@/models/User'
import { authenticateRequest } from '@/lib/auth'
import { userUpdateSchema } from '@/lib/validation'

export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    // Authenticate user
    const payload = await authenticateRequest(request)
    if (!payload || payload.role !== 'user') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const user = await User.findById(payload.userId)
      .populate('donationHistory', 'amount charity createdAt receiptNumber')
      .populate({
        path: 'donationHistory',
        populate: {
          path: 'charity',
          select: 'name logo'
        }
      })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        profileImage: user.profileImage,
        isVerified: user.isVerified,
        totalDonated: user.totalDonated,
        donationHistory: user.donationHistory
      }
    })

  } catch (error: any) {
    console.error('Get user profile error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect()

    // Authenticate user
    const payload = await authenticateRequest(request)
    if (!payload || payload.role !== 'user') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = userUpdateSchema.parse(body)

    const user = await User.findByIdAndUpdate(
      payload.userId,
      validatedData,
      { new: true, runValidators: true }
    )

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address
      }
    })

  } catch (error: any) {
    console.error('Update user profile error:', error)
    
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
