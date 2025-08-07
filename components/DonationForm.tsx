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

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
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
  console.log(_doc._id, "sdsdsd");
  const onSubmit = async (data: DonationFormData) => {
    if (!validateForm(data)) return;

    setProcessing(true);

    try {
      // Create donation order
      const donationResult = await createDonation({
        charityId: _doc.id || "68947b07640d0404198017e0",
        amount: data.amount,
        currency: "USD",
        paymentMethod: "razorpay",
        isAnonymous: data.isAnonymous,
        message: data.message,
        dedicatedTo: data.dedicatedTo,
        donorName: data.name,
        donorEmail: data.email,
      }).unwrap();

      // Load Razorpay SDK
      await loadRazorpay();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: donationResult.amount * 100,
        currency: donationResult.currency,
        name: _doc.name,
        description: `Donation to ${_doc.name}`,
        order_id: donationResult.orderId,
        handler: async (response: any) => {
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
              message: `Thank you for your donation of $${data.amount} to ${_doc.name}`,
            })
          );

          onSuccess?.(donationResult.donation);
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
            setProcessing(false);
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", (response: any) => {
        dispatch(
          addToast({
            type: "error",
            title: "Payment Failed",
            message:
              response.error.description || "Payment failed. Please try again.",
          })
        );
      });

      rzp.open();
    } catch (error: any) {
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
        <CardTitle>Make a Donation to {_doc.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label htmlFor="amount">Donation Amount ($)</Label>
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

          <div className="grid grid-cols-3 gap-2">
            {[10, 25, 50, 100].map((amt) => (
              <Button
                key={amt}
                type="button"
                variant="outline"
                onClick={() => setValue("amount", amt)}
                className="text-sm"
              >
                ${amt}
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
            {processing ? "Processing..." : `Donate $${amount || 0}`}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
