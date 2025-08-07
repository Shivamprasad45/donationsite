import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import Charity from '@/models/Charity'
import { querySchema } from '@/lib/validation'

export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const query = querySchema.parse(Object.fromEntries(searchParams))

    // Build filter object
    const filter: any = { isApproved: true }

    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { description: { $regex: query.search, $options: 'i' } },
        { mission: { $regex: query.search, $options: 'i' } }
      ]
    }

    if (query.category) {
      filter.category = query.category
    }

    if (query.location) {
      filter.$or = [
        { 'location.city': { $regex: query.location, $options: 'i' } },
        { 'location.state': { $regex: query.location, $options: 'i' } },
        { 'location.country': { $regex: query.location, $options: 'i' } }
      ]
    }

    // Build sort object
    const sort: any = {}
    sort[query.sortBy] = query.sortOrder === 'asc' ? 1 : -1

    // Calculate pagination
    const skip = (query.page - 1) * query.limit

    // Execute query
    const [charities, total] = await Promise.all([
      Charity.find(filter)
        .select('-password -bankDetails -documents')
        .sort(sort)
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
    console.error('Get charities error:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
