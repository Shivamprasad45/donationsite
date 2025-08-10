import { NextRequest, NextResponse } from "next/server";
import Donation from "@/models/Donation";
import dbConnect from "@/lib/db";
import { Types } from "mongoose";

interface IDonation {
  _id: string;
  donor: { name: string; email: string } | Types.ObjectId;
  charity:
    | { name: string; logo?: string; registrationNumber?: string }
    | Types.ObjectId;
  amount: number;
  currency: string;
  paymentStatus: string;
  paymentMethod: string;
  transactionId?: string;
  receiptNumber?: string;
  message?: string;
  dedicatedTo?: string;
  taxDeductible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const userId = req.nextUrl.searchParams.get("user");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const donation = await Donation.findOne({ donor: userId })
      .select(
        "_id amount currency charity donor paymentStatus paymentMethod transactionId receiptNumber message dedicatedTo taxDeductible createdAt"
      )
      .populate("charity", "name logo registrationNumber")
      .populate("donor", "name email")
      .lean<IDonation>();

    if (!donation) {
      return NextResponse.json({ error: "Charity not found" }, { status: 404 });
    }

    const formatted = {
      id: donation._id,
      amount: donation.amount,
      currency: donation.currency,
      paymentStatus: donation.paymentStatus,
      paymentMethod: donation.paymentMethod,
      transactionId: donation.transactionId,
      receiptNumber: donation.receiptNumber,
      message: donation.message,
      dedicatedTo: donation.dedicatedTo,
      taxDeductible: donation.taxDeductible,
      createdAt: donation.createdAt,
      donor: {
        name: (donation.donor as any)?.name,
        email: (donation.donor as any)?.email,
      },
      charity: {
        name: (donation.charity as any)?.name,
        logo: (donation.charity as any)?.logo,
        registrationNumber: (donation.charity as any)?.registrationNumber,
      },
    };

    return NextResponse.json(formatted);
  } catch (err) {
    console.error("Error fetching donation:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
