// import Stripe from 'stripe'

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: '2024-06-20'
// })

export interface PaymentIntentData {
  amount: number;
  currency: string;
  charityId: string;
  donorId: string;
  metadata?: Record<string, string>;
}

//  export async function createPaymentIntent(data: PaymentIntentData) {
// // // try {
// // //   const paymentIntent = await stripe.paymentIntents.create({
// // //     amount: Math.round(data.amount * 100), // Convert to cents
// // //     currency: data.currency.toLowerCase(),
// // //     metadata: {
// // //       charityId: data.charityId,
// // //       donorId: data.donorId,
// // //       ...data.metadata,
// // //     },
// // //   });

// // //   return {
// // //     clientSecret: paymentIntent.client_secret,
// // //     paymentIntentId: paymentIntent.id,
// // //   };
// // // } catch (error) {
// // //   console.error("Stripe payment intent creation error:", error);
// // //   throw new Error("Failed to create payment intent");
// // // }
//  }

// export async function confirmPayment(paymentIntentId: string) {
//   try {
//     const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
//     return paymentIntent
//   } catch (error) {
//     console.error('Stripe payment confirmation error:', error)
//     throw new Error('Failed to confirm payment')
//   }
// }

// export async function refundPayment(paymentIntentId: string, amount?: number) {
//   try {
//     const refund = await stripe.refunds.create({
//       payment_intent: paymentIntentId,
//       amount: amount ? Math.round(amount * 100) : undefined,
//     });
//     return refund;
//   } catch (error) {
//     console.error("Stripe refund error:", error);
//     throw new Error("Failed to process refund");
//   }
// }

// Razorpay integration (alternative)
export class RazorpayService {
  private razorpay: any;

  constructor() {
    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
      const Razorpay = require("razorpay");
      this.razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });
    }
  }

  async createOrder(
    amount: number,
    currency: string = "INR",
    metadata: any = {}
  ) {
    try {
      const order = await this.razorpay.orders.create({
        amount: Math.round(amount * 100), // Convert to paise
        currency,
        notes: metadata,
      });
      return order;
    } catch (error) {
      console.error("Razorpay order creation error:", error);
      throw new Error("Failed to create Razorpay order");
    }
  }

  async verifyPayment(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string
  ) {
    try {
      const crypto = require("crypto");
      const body = razorpayOrderId + "|" + razorpayPaymentId;
      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest("hex");

      return expectedSignature === razorpaySignature;
    } catch (error) {
      console.error("Razorpay verification error:", error);
      return false;
    }
  }
}
