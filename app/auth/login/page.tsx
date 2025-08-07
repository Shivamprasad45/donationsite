"use client";

import { useEffect, useState } from "react";
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
  useLoginMutation,
  useLoginCharityMutation,
} from "@/store/services/authApi";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/store/slices/authSlice";
import { addToast } from "@/store/slices/uiSlice";
import { cookies } from "next/headers";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("user");
  const router = useRouter();
  const dispatch = useDispatch();

  const [loginUser, { data: logindata, isLoading: userLoading }] =
    useLoginMutation();
  // useEffect(() => {
  //   if (localStorage.getItem("token")) {
  //     sessionStorage.setItem("token", localStorage.getItem("token") || "");
  //   }
  // }, []);

  const [loginCharity, { isLoading: charityLoading }] =
    useLoginCharityMutation();

  const userForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const charityForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onUserSubmit = async (data: LoginFormData) => {
    try {
      const result = await loginUser(data).unwrap();

      dispatch(
        setCredentials({
          user: result.user,
          token: result.token,
        })
      );

      dispatch(
        addToast({
          type: "success",
          title: "Welcome back!",
          message: "You have successfully logged in",
        })
      );

      router.push(
        result.user.role === "admin" ? "/dashboard/admin" : "/dashboard/user"
      );
    } catch (error: any) {
      dispatch(
        addToast({
          type: "error",
          title: "Login Failed",
          message: error.data?.error || "Invalid credentials",
        })
      );
    }
  };

  const onCharitySubmit = async (data: LoginFormData) => {
    try {
      const result = await loginCharity(data).unwrap();

      dispatch(
        setCredentials({
          user: result.charity,
          token: result.token,
        })
      );

      dispatch(
        addToast({
          type: "success",
          title: "Welcome back!",
          message: "You have successfully logged in",
        })
      );

      router.push("/dashboard/charity");
    } catch (error: any) {
      dispatch(
        addToast({
          type: "error",
          title: "Login Failed",
          message: error.data?.error || "Invalid credentials",
        })
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
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
            Sign in to your account
          </h2>
          <p className="mt-2 text-gray-600">
            Welcome back! Please sign in to continue
          </p>
        </div>

        <Card>
          <CardHeader>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="user">Individual</TabsTrigger>
                <TabsTrigger value="charity">Organization</TabsTrigger>
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
                    <Label htmlFor="user-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="user-password"
                        type={showPassword ? "text" : "password"}
                        {...userForm.register("password")}
                        placeholder="Enter your password"
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

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={userLoading}
                  >
                    {userLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="charity">
                <form
                  onSubmit={charityForm.handleSubmit(onCharitySubmit)}
                  className="space-y-4"
                >
                  <div>
                    <Label htmlFor="charity-email">Organization Email</Label>
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

                  <div>
                    <Label htmlFor="charity-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="charity-password"
                        type={showPassword ? "text" : "password"}
                        {...charityForm.register("password")}
                        placeholder="Enter your password"
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

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={charityLoading}
                  >
                    {charityLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link
                  href="/auth/signup"
                  className="text-blue-600 hover:text-blue-500"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
