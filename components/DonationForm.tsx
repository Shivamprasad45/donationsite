"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useCreateDonationMutation,
  useConfirmDonationMutation,
} from "@/store/services/donationsApi";
import { useDispatch } from "react-redux";
import { addToast } from "@/store/slices/uiSlice";

// Declare Razorpay type
declare global {
  interface Window {
    Razorpay: any;
  }
}

interface DonationFormProps {
  charity: any;
  onSuccess?: (donation: any) => void;
}

interface DonationFormData {
  amount: number;
  message?: string;
  dedicatedTo?: string;
  isAnonymous: boolean;
  name: string;
  email: string;
}

export function DonationForm({ charity, onSuccess }: DonationFormProps) {
  const [processing, setProcessing] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const dispatch = useDispatch();

  const [createDonation] = useCreateDonationMutation();
  const [confirmDonation] = useConfirmDonationMutation();
  const { _doc } = charity;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<DonationFormData>({
    defaultValues: {
      isAnonymous: false,
      amount: 10,
      name: "",
      email: "",
    },
  });

  const isAnonymous = watch("isAnonymous");
  const amount = watch("amount");

  const loadRazorpay = (): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      // Check if Razorpay is already loaded
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;

      script.onload = () => {
        if (window.Razorpay) {
          resolve(true);
        } else {
          reject(new Error("Razorpay SDK failed to load"));
        }
      };

      script.onerror = () => {
        reject(new Error("Failed to load Razorpay SDK"));
      };

      document.body.appendChild(script);
    });
  };

  const validateForm = (data: DonationFormData): boolean => {
    const errors: Record<string, string> = {};

    if (!data.amount || data.amount < 1) {
      errors.amount = "Amount must be at least $1";
    }

    if (!data.name.trim() && !isAnonymous) {
      errors.name = "Name is required";
    }

    if (!data.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
      errors.email = "Invalid email address";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const onSubmit = async (data: DonationFormData) => {
    if (!validateForm(data)) return;

    setProcessing(true);

    try {
      console.log("Creating donation...", {
        charityId: _doc.id || _doc._id,
        amount: data.amount,
      });

      // Create donation order
      const donationResult = await createDonation({
        charityId: _doc.id || _doc._id || "68947b07640d0404198017e0",
        amount: data.amount,
        currency: "INR", // Changed to INR as your backend uses INR
        paymentMethod: "razorpay",
        isAnonymous: data.isAnonymous,
        message: data.message,
        dedicatedTo: data.dedicatedTo,
        donorName: data.name,
        donorEmail: data.email,
      }).unwrap();

      console.log("Donation created:", donationResult);

      // Load Razorpay SDK
      try {
        await loadRazorpay();
        console.log("Razorpay SDK loaded successfully");
      } catch (loadError) {
        console.error("Failed to load Razorpay SDK:", loadError);
        throw new Error("Failed to load payment gateway");
      }

      // Check if we have the required environment variable
      const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID; // Note: NEXT_PUBLIC_ prefix for client-side

      if (!razorpayKeyId) {
        console.error("Razorpay Key ID not found in environment variables");
        throw new Error("Payment gateway configuration error");
      }

      console.log("Razorpay Key ID:", razorpayKeyId);

      const options = {
        key: razorpayKeyId,
        amount: donationResult.order?.amount || data.amount * 100, // Use order amount from response
        currency: donationResult.order?.currency || "INR",
        name: _doc.name || "Charity",
        description: `Donation to ${_doc.name}`,
        order_id: donationResult.order?.id, // Use order ID from response
        handler: async (response: any) => {
          try {
            console.log("Payment successful:", response);

            // Confirm payment on successful transaction
            await confirmDonation({
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            }).unwrap();

            dispatch(
              addToast({
                type: "success",
                title: "Donation Successful!",
                message: `Thank you for your donation of ₹${data.amount} to ${_doc.name}`,
              })
            );

            onSuccess?.(donationResult.donation);
          } catch (confirmError) {
            console.error("Payment confirmation failed:", confirmError);
            dispatch(
              addToast({
                type: "error",
                title: "Payment Confirmation Failed",
                message:
                  "Payment was successful but confirmation failed. Please contact support.",
              })
            );
          } finally {
            setProcessing(false);
          }
        },
        prefill: {
          name: data.isAnonymous ? "Anonymous" : data.name,
          email: data.email,
        },
        theme: {
          color: "#4f46e5",
        },
        modal: {
          ondismiss: () => {
            console.log("Payment modal dismissed");
            setProcessing(false);
          },
        },
      };

      console.log("Razorpay options:", options);

      if (!window.Razorpay) {
        throw new Error("Razorpay SDK not available");
      }

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", (response: any) => {
        console.error("Payment failed:", response);
        dispatch(
          addToast({
            type: "error",
            title: "Payment Failed",
            message:
              response.error?.description ||
              "Payment failed. Please try again.",
          })
        );
        setProcessing(false);
      });

      console.log("Opening Razorpay modal...");
      rzp.open();
    } catch (error: any) {
      console.error("Donation error:", error);

      dispatch(
        addToast({
          type: "error",
          title: "Donation Failed",
          message: error.message || "Something went wrong. Please try again.",
        })
      );
      setProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Make a Donation to {_doc?.name || "Charity"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label htmlFor="amount">Donation Amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              min="1"
              step="0.01"
              {...register("amount", { valueAsNumber: true })}
              placeholder="Enter amount"
            />
            {formErrors.amount && (
              <p className="text-sm text-red-600 mt-1">{formErrors.amount}</p>
            )}
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[10, 25, 50, 100].map((amt) => (
              <Button
                key={amt}
                type="button"
                variant="outline"
                onClick={() => setValue("amount", amt)}
                className="text-sm"
              >
                ₹{amt}
              </Button>
            ))}
          </div>

          <div>
            <Label htmlFor="name">Your Name *</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Enter your name"
              disabled={isAnonymous}
            />
            {formErrors.name && !isAnonymous && (
              <p className="text-sm text-red-600 mt-1">{formErrors.name}</p>
            )}
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="Enter your email"
            />
            {formErrors.email && (
              <p className="text-sm text-red-600 mt-1">{formErrors.email}</p>
            )}
          </div>

          <div>
            <Label htmlFor="message">Message (Optional)</Label>
            <Textarea
              id="message"
              {...register("message")}
              placeholder="Leave a message for the charity"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="dedicatedTo">
              Dedicate this donation (Optional)
            </Label>
            <Input
              id="dedicatedTo"
              {...register("dedicatedTo")}
              placeholder="In memory of / In honor of"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isAnonymous"
              checked={isAnonymous}
              onCheckedChange={(checked) => setValue("isAnonymous", !!checked)}
            />
            <Label htmlFor="isAnonymous">Make this donation anonymous</Label>
          </div>

          <Button type="submit" className="w-full" disabled={processing}>
            {processing ? "Processing..." : `Donate ₹${amount || 0}`}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
