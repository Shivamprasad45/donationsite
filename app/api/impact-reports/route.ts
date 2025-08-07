import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import ImpactReport from '@/models/ImpactReport'
import Charity from '@/models/Charity'
import { authenticateRequest } from '@/lib/auth'
import { impactReportSchema, querySchema } from '@/lib/validation'

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const validatedData = impactReportSchema.parse(body)

    // Verify charity exists and is approved
    const charity = await Charity.findById(payload.charityId)
    if (!charity || !charity.isApproved) {
      return NextResponse.json(
        { error: 'Charity not found or not approved' },
        { status: 404 }
      )
    }

    // Create impact report
    const report = new ImpactReport({
      charity: payload.charityId,
      ...validatedData
    })

    await report.save()

    // Add report to charity's impact reports
    await Charity.findByIdAndUpdate(payload.charityId, {
      $push: { impactReports: report._id }
    })

    return NextResponse.json({
      message: 'Impact report created successfully',
      report: {
        id: report._id,
        title: report.title,
        isPublished: report.isPublished
      }
    }, { status: 201 })

  } catch (error: any) {
    console.error('Create impact report error:', error)
    
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

export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const query = querySchema.parse(Object.fromEntries(searchParams))
    const charityId = searchParams.get('charityId')

    // Build filter
    const filter: any = { isPublished: true }
    if (charityId) {
      filter.charity = charityId
    }

    // Calculate pagination
    const skip = (query.page - 1) * query.limit

    // Execute query
    const [reports, total] = await Promise.all([
      ImpactReport.find(filter)
        .populate('charity', 'name logo')
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(query.limit)
        .lean(),
      ImpactReport.countDocuments(filter)
    ])

    return NextResponse.json({
      reports,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        pages: Math.ceil(total / query.limit)
      }
    })

  } catch (error: any) {
    console.error('Get impact reports error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
