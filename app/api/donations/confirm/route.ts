import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Donation from "@/models/Donation";
import User from "@/models/User";
import Charity from "@/models/Charity";
import { RazorpayService } from "@/lib/payment"; // Import your Razorpay service
import { sendEmail, emailTemplates } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { paymentIntentId } = await request.json();
    const { orderId, paymentId, signature } = paymentIntentId;
    // console.log(orderId, paymentId, signature, "sdsd");
    // console.log(orderId, paymentId, signature, "fsdsfsf");
    // Validate required fields
    if (!orderId || !paymentId || !signature) {
      return NextResponse.json(
        { error: "Order ID, Payment ID, and Signature are required" },
        { status: 400 }
      );
    }

    // Find donation by Razorpay order ID
    const donation = await Donation.findOne({ paymentId: orderId })
      .populate("donor", "name email")
      .populate("charity", "name email");

    if (!donation) {
      return NextResponse.json(
        { error: "Donation not found" },
        { status: 404 }
      );
    }

    // Check if donation is already processed
    if (donation.status === "completed") {
      return NextResponse.json(
        { message: "Donation already confirmed" },
        { status: 200 }
      );
    }

    // Verify payment signature with Razorpay
    const razorpay = new RazorpayService();
    const isValidSignature = razorpay.verifyPayment(
      orderId,
      paymentId,
      signature
    );

    if (!isValidSignature) {
      // Update donation status to failed
      donation.status = "failed";
      await donation.save();

      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    // Payment is valid, update donation
    donation.status = "completed";
    donation.transactionId = paymentId; // Store the actual payment ID
    donation.confirmedAt = new Date();
    await donation.save();

    // Check if this is a new donor for this charity (for donorCount)
    const existingDonation = await Donation.findOne({
      donor: donation.donor._id,
      charity: donation.charity._id,
      status: "completed",
      _id: { $ne: donation._id }, // Exclude current donation
    });

    const isNewDonor = !existingDonation;

    // Update user's donation history and total
    await User.findByIdAndUpdate(donation.donor._id, {
      $push: { donationHistory: donation._id },
      $inc: { totalDonated: donation.amount },
    });

    // Update charity's totals
    const charityUpdate = {
      $inc: {
        totalReceived: donation.amount,
        ...(isNewDonor && { donorCount: 1 }),
      },
    };

    await Charity.findByIdAndUpdate(donation.charity._id, charityUpdate);

    // Send confirmation emails
    try {
      // Email to donor
      await sendEmail({
        to: donation.donor.email,
        subject: "Donation Confirmation - Thank You!",
        html: emailTemplates.donationConfirmation
          ? emailTemplates.donationConfirmation(
              donation.donor.name,
              donation.charity.name,
              donation.amount,
              donation._id.toString() // Use donation ID as receipt number
            )
          : `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #16a34a;">Thank You for Your Donation!</h2>
              <p>Dear ${donation.donor.name},</p>
              <p>Your donation of $${donation.amount} to ${donation.charity.name} has been successfully processed.</p>
              <p><strong>Transaction ID:</strong> ${paymentId}</p>
              <p><strong>Receipt Number:</strong> ${donation._id}</p>
              ${donation.message ? `<p><strong>Your Message:</strong> ${donation.message}</p>` : ""}
              ${donation.dedicatedTo ? `<p><strong>Dedicated To:</strong> ${donation.dedicatedTo}</p>` : ""}
              <p>Thank you for making a difference!</p>
              <p>Best regards,<br>The Charity Platform Team</p>
            </div>
          `,
      });

      // Email to charity
      await sendEmail({
        to: donation.charity.email,
        subject: "New Donation Received",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #16a34a;">New Donation Received!</h2>
            <p>Dear ${donation.charity.name} Team,</p>
            <p>You have received a new donation of $${donation.amount}${donation.isAnonymous ? " from an anonymous donor" : ` from ${donation.donor.name}`}.</p>
            ${donation.message ? `<p><strong>Donor Message:</strong> ${donation.message}</p>` : ""}
            ${donation.dedicatedTo ? `<p><strong>Dedicated To:</strong> ${donation.dedicatedTo}</p>` : ""}
            <p><strong>Transaction ID:</strong> ${paymentId}</p>
            <p><strong>Receipt Number:</strong> ${donation._id}</p>
            <p>The funds will be transferred to your account as per the processing schedule.</p>
            <p>Best regards,<br>The Charity Platform Team</p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Failed to send confirmation emails:", emailError);
      // Don't fail the entire request if email fails
    }

    return NextResponse.json({
      success: true,
      message: "Donation confirmed successfully",
      donation: {
        id: donation._id,
        amount: donation.amount,
        currency: donation.currency,
        transactionId: paymentId,
        receiptNumber: donation._id.toString(),
        status: donation.status,
        confirmedAt: donation.confirmedAt,
      },
    });
  } catch (error: any) {
    console.error("Confirm donation error:", error);

    // Handle specific errors
    if (error.name === "ValidationError") {
      return NextResponse.json(
        { error: "Validation failed", details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
