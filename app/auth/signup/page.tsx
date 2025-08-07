"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useRegisterMutation,
  useRegisterCharityMutation,
} from "@/store/services/authApi";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/store/slices/authSlice";
import { addToast } from "@/store/slices/uiSlice";

const userSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    phone: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

const charitySchema = z
  .object({
    name: z.string().min(2, "Organization name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    registrationNumber: z.string().min(1, "Registration number is required"),
    phone: z.string().min(1, "Phone number is required"),
    website: z.string().url("Invalid website URL").optional().or(z.literal("")),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters"),
    mission: z.string().min(10, "Mission must be at least 10 characters"),
    vision: z.string().min(10, "Vision must be at least 10 characters"),
    category: z.string().min(1, "Category is required"),
    address: z.string().min(1, "Address is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    country: z.string().min(1, "Country is required"),
    accountName: z.string().min(1, "Account name is required"),
    accountNumber: z.string().min(1, "Account number is required"),
    bankName: z.string().min(1, "Bank name is required"),
    ifscCode: z.string().min(1, "IFSC code is required"),
    branch: z.string().min(1, "Branch is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type UserFormData = z.infer<typeof userSchema>;
type CharityFormData = z.infer<typeof charitySchema>;

const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("user");
  const router = useRouter();
  const dispatch = useDispatch();

  const [registerUser, { isLoading: userLoading }] = useRegisterMutation();
  const [registerCharity, { isLoading: charityLoading }] =
    useRegisterCharityMutation();

  const userForm = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
  });

  const charityForm = useForm<CharityFormData>({
    resolver: zodResolver(charitySchema),
  });

  const onUserSubmit = async (data: UserFormData) => {
    try {
      const result = await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone,
      }).unwrap();

      dispatch(
        setCredentials({
          user: result.user,
          token: result.token,
        })
      );

      dispatch(
        addToast({
          type: "success",
          title: "Account Created!",
          message: "Welcome to CharityPlatform",
        })
      );

      router.push("/dashboard/user");
    } catch (error: any) {
      dispatch(
        addToast({
          type: "error",
          title: "Registration Failed",
          message: error.data?.error || "Something went wrong",
        })
      );
    }
  };

  const onCharitySubmit = async (data: CharityFormData) => {
    try {
      const result = await registerCharity({
        name: data.name,
        email: data.email,
        password: data.password,
        registrationNumber: data.registrationNumber,
        phone: data.phone,
        website: data.website || undefined,
        description: data.description,
        mission: data.mission,
        vision: data.vision,
        category: data.category,
        location: {
          address: data.address,
          city: data.city,
          state: data.state,
          country: data.country,
        },
        bankDetails: {
          accountName: data.accountName,
          accountNumber: data.accountNumber,
          bankName: data.bankName,
          ifscCode: data.ifscCode,
          branch: data.branch,
        },
      }).unwrap();

      dispatch(
        setCredentials({
          user: result.charity,
          token: result.token,
        })
      );

      dispatch(
        addToast({
          type: "success",
          title: "Charity Registered!",
          message: "Your application is under review",
        })
      );

      router.push("/dashboard/charity");
    } catch (error: any) {
      dispatch(
        addToast({
          type: "error",
          title: "Registration Failed",
          message: error.data?.error || "Something went wrong",
        })
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <Link
            href="/"
            className="flex items-center justify-center space-x-2 mb-4"
          >
            <Heart className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">
              CharityPlatform
            </span>
          </Link>
          <h2 className="text-3xl font-bold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-gray-600">
            Join our community and start making a difference
          </p>
        </div>

        <Card>
          <CardHeader>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="user">Individual Donor</TabsTrigger>
                <TabsTrigger value="charity">Charity Organization</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>

          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsContent value="user">
                <form
                  onSubmit={userForm.handleSubmit(onUserSubmit)}
                  className="space-y-4"
                >
                  <div>
                    <Label htmlFor="user-name">Full Name</Label>
                    <Input
                      id="user-name"
                      {...userForm.register("name")}
                      placeholder="Enter your full name"
                    />
                    {userForm.formState.errors.name && (
                      <p className="text-sm text-red-600 mt-1">
                        {userForm.formState.errors.name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="user-email">Email Address</Label>
                    <Input
                      id="user-email"
                      type="email"
                      {...userForm.register("email")}
                      placeholder="Enter your email"
                    />
                    {userForm.formState.errors.email && (
                      <p className="text-sm text-red-600 mt-1">
                        {userForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="user-phone">Phone Number (Optional)</Label>
                    <Input
                      id="user-phone"
                      {...userForm.register("phone")}
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div>
                    <Label htmlFor="user-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="user-password"
                        type={showPassword ? "text" : "password"}
                        {...userForm.register("password")}
                        placeholder="Create a password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {userForm.formState.errors.password && (
                      <p className="text-sm text-red-600 mt-1">
                        {userForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="user-confirm-password">
                      Confirm Password
                    </Label>
                    <Input
                      id="user-confirm-password"
                      type="password"
                      {...userForm.register("confirmPassword")}
                      placeholder="Confirm your password"
                    />
                    {userForm.formState.errors.confirmPassword && (
                      <p className="text-sm text-red-600 mt-1">
                        {userForm.formState.errors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={userLoading}
                  >
                    {userLoading ? "Creating Account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="charity">
                <form
                  onSubmit={charityForm.handleSubmit(onCharitySubmit)}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="charity-name">Organization Name</Label>
                      <Input
                        id="charity-name"
                        {...charityForm.register("name")}
                        placeholder="Enter organization name"
                      />
                      {charityForm.formState.errors.name && (
                        <p className="text-sm text-red-600 mt-1">
                          {charityForm.formState.errors.name.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="charity-email">Email Address</Label>
                      <Input
                        id="charity-email"
                        type="email"
                        {...charityForm.register("email")}
                        placeholder="Enter organization email"
                      />
                      {charityForm.formState.errors.email && (
                        <p className="text-sm text-red-600 mt-1">
                          {charityForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="charity-registration">
                        Registration Number
                      </Label>
                      <Input
                        id="charity-registration"
                        {...charityForm.register("registrationNumber")}
                        placeholder="Enter registration number"
                      />
                      {charityForm.formState.errors.registrationNumber && (
                        <p className="text-sm text-red-600 mt-1">
                          {
                            charityForm.formState.errors.registrationNumber
                              .message
                          }
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="charity-phone">Phone Number</Label>
                      <Input
                        id="charity-phone"
                        {...charityForm.register("phone")}
                        placeholder="Enter phone number"
                      />
                      {charityForm.formState.errors.phone && (
                        <p className="text-sm text-red-600 mt-1">
                          {charityForm.formState.errors.phone.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="charity-website">Website (Optional)</Label>
                    <Input
                      id="charity-website"
                      {...charityForm.register("website")}
                      placeholder="https://your-website.com"
                    />
                    {charityForm.formState.errors.website && (
                      <p className="text-sm text-red-600 mt-1">
                        {charityForm.formState.errors.website.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="charity-category">Category</Label>
                    <select
                      id="charity-category"
                      {...charityForm.register("category")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select a category</option>
                      <option value="Education">Education</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Environment">Environment</option>
                      <option value="Poverty">Poverty</option>
                      <option value="Animal Welfare">Animal Welfare</option>
                      <option value="Disaster Relief">Disaster Relief</option>
                      <option value="Human Rights">Human Rights</option>
                      <option value="Arts & Culture">Arts & Culture</option>
                      <option value="Sports">Sports</option>
                      <option value="Other">Other</option>
                    </select>
                    {charityForm.formState.errors.category && (
                      <p className="text-sm text-red-600 mt-1">
                        {charityForm.formState.errors.category.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="charity-description">Description</Label>
                    <textarea
                      id="charity-description"
                      {...charityForm.register("description")}
                      placeholder="Describe your organization"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {charityForm.formState.errors.description && (
                      <p className="text-sm text-red-600 mt-1">
                        {charityForm.formState.errors.description.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="charity-mission">Mission Statement</Label>
                      <textarea
                        id="charity-mission"
                        {...charityForm.register("mission")}
                        placeholder="Your organization's mission"
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {charityForm.formState.errors.mission && (
                        <p className="text-sm text-red-600 mt-1">
                          {charityForm.formState.errors.mission.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="charity-vision">Vision Statement</Label>
                      <textarea
                        id="charity-vision"
                        {...charityForm.register("vision")}
                        placeholder="Your organization's vision"
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {charityForm.formState.errors.vision && (
                        <p className="text-sm text-red-600 mt-1">
                          {charityForm.formState.errors.vision.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label>Address Information</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      <div className="md:col-span-2">
                        <Input
                          {...charityForm.register("address")}
                          placeholder="Street address"
                        />
                        {charityForm.formState.errors.address && (
                          <p className="text-sm text-red-600 mt-1">
                            {charityForm.formState.errors.address.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Input
                          {...charityForm.register("city")}
                          placeholder="City"
                        />
                        {charityForm.formState.errors.city && (
                          <p className="text-sm text-red-600 mt-1">
                            {charityForm.formState.errors.city.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Input
                          {...charityForm.register("state")}
                          placeholder="State"
                        />
                        {charityForm.formState.errors.state && (
                          <p className="text-sm text-red-600 mt-1">
                            {charityForm.formState.errors.state.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Input
                          {...charityForm.register("country")}
                          placeholder="Country"
                        />
                        {charityForm.formState.errors.country && (
                          <p className="text-sm text-red-600 mt-1">
                            {charityForm.formState.errors.country.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>Bank Details</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      <div>
                        <Input
                          {...charityForm.register("accountName")}
                          placeholder="Account name"
                        />
                        {charityForm.formState.errors.accountName && (
                          <p className="text-sm text-red-600 mt-1">
                            {charityForm.formState.errors.accountName.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Input
                          {...charityForm.register("accountNumber")}
                          placeholder="Account number"
                        />
                        {charityForm.formState.errors.accountNumber && (
                          <p className="text-sm text-red-600 mt-1">
                            {charityForm.formState.errors.accountNumber.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Input
                          {...charityForm.register("bankName")}
                          placeholder="Bank name"
                        />
                        {charityForm.formState.errors.bankName && (
                          <p className="text-sm text-red-600 mt-1">
                            {charityForm.formState.errors.bankName.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Input
                          {...charityForm.register("ifscCode")}
                          placeholder="IFSC code"
                        />
                        {charityForm.formState.errors.ifscCode && (
                          <p className="text-sm text-red-600 mt-1">
                            {charityForm.formState.errors.ifscCode.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Input
                          {...charityForm.register("branch")}
                          placeholder="Branch"
                        />
                        {charityForm.formState.errors.branch && (
                          <p className="text-sm text-red-600 mt-1">
                            {charityForm.formState.errors.branch.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="charity-password">Password</Label>
                      <div className="relative">
                        <Input
                          id="charity-password"
                          type={showPassword ? "text" : "password"}
                          {...charityForm.register("password")}
                          placeholder="Create a password"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                      {charityForm.formState.errors.password && (
                        <p className="text-sm text-red-600 mt-1">
                          {charityForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="charity-confirm-password">
                        Confirm Password
                      </Label>
                      <Input
                        id="charity-confirm-password"
                        type="password"
                        {...charityForm.register("confirmPassword")}
                        placeholder="Confirm your password"
                      />
                      {charityForm.formState.errors.confirmPassword && (
                        <p className="text-sm text-red-600 mt-1">
                          {charityForm.formState.errors.confirmPassword.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={charityLoading}
                  >
                    {charityLoading
                      ? "Registering Organization..."
                      : "Register Organization"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link
                  href="/auth/login"
                  className="text-blue-600 hover:text-blue-500"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
export default SignUpPage;
