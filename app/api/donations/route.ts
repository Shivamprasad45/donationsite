import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Donation from "@/models/Donation";
import User from "@/models/User";
import Charity from "@/models/Charity";
import { authenticateRequest } from "@/lib/auth";
import { donationSchema } from "@/lib/validation";
import { RazorpayService } from "@/lib/payment";
import { sendEmail, emailTemplates } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // Authenticate user
    const payload = await authenticateRequest(request);
    if (!payload || payload.role !== "user") {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = donationSchema.parse(body);

    // Verify charity
    const charity = await Charity.findById(validatedData.charityId);
    if (!charity || !charity.isApproved) {
      return NextResponse.json(
        { error: "Charity not found or not approved" },
        { status: 404 }
      );
    }

    // Get user details
    const user = await User.findById(payload.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create Razorpay order
    const razorpay = new RazorpayService();

    // Check if Razorpay initialized properly
    // if (!razorpay.razorpay) {
    //   return NextResponse.json(
    //     { error: "Payment gateway configuration error" },
    //     { status: 500 }
    //   )
    // }

    const order = await razorpay.createOrder(
      validatedData.amount,
      validatedData.currency,
      {
        charityId: validatedData.charityId,
        donorId: payload.userId,
        isAnonymous: validatedData.isAnonymous.toString(),
        message: validatedData.message || "",
        dedicatedTo: validatedData.dedicatedTo || "",
      }
    );

    // Create donation record
    const donation = new Donation({
      donor: payload.userId,
      charity: validatedData.charityId,
      amount: validatedData.amount,
      currency: validatedData.currency,
      paymentMethod: validatedData.paymentMethod,
      paymentId: order.id, // Razorpay order ID
      isAnonymous: validatedData.isAnonymous,
      message: validatedData.message,
      dedicatedTo: validatedData.dedicatedTo,
      status: "pending", // Initial status
    });

    await donation.save();

    return NextResponse.json(
      {
        message: "Razorpay order created successfully",
        donation: {
          id: donation._id,
          amount: donation.amount,
          currency: donation.currency,
        },
        order: {
          id: order.id,
          amount: order.amount,
          currency: order.currency,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create donation error:", error);

    // Handle validation errors
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    // Handle Razorpay errors
    if (error.message.includes("Razorpay")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Generic error response
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Authenticate user
    const payload = await authenticateRequest(request);
    if (!payload) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Build filter based on user role
    let filter: any = {};
    if (payload.role === "user") {
      filter.donor = payload.userId;
    } else if (payload.role === "charity") {
      filter.charity = payload.charityId;
    }

    // Get donations
    const [donations, total] = await Promise.all([
      Donation.find(filter)
        .populate("donor", "name email")
        .populate("charity", "name logo")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Donation.countDocuments(filter),
    ]);

    return NextResponse.json({
      donations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Get donations error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
