import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Charity from "@/models/Charity";
import Donation from "@/models/Donation";
import ImpactReport from "@/models/ImpactReport";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const charity = await Charity.findById({ _id: params.id })

      .select("-password -bankDetails")
      .populate("impactReports");

    if (!charity) {
      return NextResponse.json({ error: "Charity not found" }, { status: 404 });
    }

    if (!charity.isApproved) {
      return NextResponse.json(
        { error: "Charity not approved" },
        { status: 403 }
      );
    }

    // Get recent donations count and total
    const donationStats = await Donation.aggregate([
      { $match: { charity: charity._id, paymentStatus: "completed" } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
          donationCount: { $sum: 1 },
          uniqueDonors: { $addToSet: "$donor" },
        },
      },
    ]);

    const stats = donationStats[0] || {
      totalAmount: 0,
      donationCount: 0,
      uniqueDonors: [],
    };

    // Get recent impact reports
    const recentReports = await ImpactReport.find({
      charity: charity._id,
      isPublished: true,
    })
      .sort({ publishedAt: -1 })
      .limit(3)
      .lean();

    return NextResponse.json({
      charity: {
        ...charity,
        totalReceived: stats.totalAmount,
        donorCount: stats.uniqueDonors.length,
        donationCount: stats.donationCount,
      },
      recentReports,
    });
  } catch (error: any) {
    console.error("Get charity error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
