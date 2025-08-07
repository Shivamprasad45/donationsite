import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import Charity from '@/models/Charity'
import { authenticateRequest } from '@/lib/auth'
import { querySchema } from '@/lib/validation'

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const query = querySchema.parse(Object.fromEntries(searchParams))
    const status = searchParams.get('status') // pending, approved, rejected

    // Build filter
    const filter: any = {}
    if (status === 'pending') {
      filter.isApproved = false
    } else if (status === 'approved') {
      filter.isApproved = true
    }

    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { email: { $regex: query.search, $options: 'i' } },
        { registrationNumber: { $regex: query.search, $options: 'i' } }
      ]
    }

    // Calculate pagination
    const skip = (query.page - 1) * query.limit

    // Execute query
    const [charities, total] = await Promise.all([
      Charity.find(filter)
        .select('-password')
        .populate('approvedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(query.limit)
        .lean(),
      Charity.countDocuments(filter)
    ])

    return NextResponse.json({
      charities,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        pages: Math.ceil(total / query.limit)
      }
    })

  } catch (error: any) {
    console.error('Get admin charities error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
