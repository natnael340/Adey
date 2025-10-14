"use client";

import React, { FormEvent, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSearchParams } from "next/navigation";
import {
  get_redirect_url,
  handleLoginWithPassword,
} from "@/app/auth/components/utils";
import { AlertCircleIcon, Eye, EyeOff, RefreshCw, X } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AuthErrorMessage } from "@/app/types/types";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [showAlert, setShowAlert] = useState<AuthErrorMessage>({
    messages: [],
    code: "",
  });

  const oauthSignIn = (provider: string) => {
    signIn(provider, {
      redirect: true,
      callbackUrl: get_redirect_url(searchParams),
    });
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>Login with your Google account</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e: FormEvent) =>
              handleLoginWithPassword(
                e,
                (success, error) => {
                  if (!success) {
                    setShowAlert(error);
                  } else {
                    router.push(get_redirect_url(searchParams));
                  }
                },
                setLoading
              )
            }
          >
            <div className="grid gap-6">
              <div className="flex flex-col gap-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => oauthSignIn("google")}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  Login with Google
                </Button>
              </div>
              <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                <span className="relative z-10 bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
              <div className="grid gap-6">
                <div className="grid gap-2">
                  {showAlert.messages.length > 0 ? (
                    <Alert variant="destructive" className="relative">
                      <div className="absolute top-2 right-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6 rounded-full p-0"
                          onClick={() =>
                            setShowAlert({ messages: [], code: "" })
                          }
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                      <AlertCircleIcon className="w-5 h-5" />
                      <AlertTitle>Login failed!</AlertTitle>
                      <AlertDescription>
                        <ul className="list-inside list-disc text-sm">
                          {showAlert.messages.map((msg, index) => (
                            <li key={index}>{msg}</li>
                          ))}
                        </ul>

                        {showAlert.code == "unverified_account" ? (
                          <>
                            &nbsp;
                            <a
                              href="/auth/email/verify"
                              className="text-blue-700 underline"
                            >
                              Verify email
                            </a>
                          </>
                        ) : (
                          <></>
                        )}
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <></>
                  )}
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="m@example.com"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    <a
                      href="/auth/password/forgot"
                      className="ml-auto text-sm underline-offset-4 hover:underline"
                    >
                      Forgot your password?
                    </a>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      name="password"
                    />
                    <div className="absolute right-0.5 top-1/2 -translate-y-1/2">
                      <Button
                        variant="ghost"
                        onClick={() => setShowPassword((prev) => !prev)}
                      >
                        {showPassword ? (
                          <EyeOff color="#7a7a7a" size={16} />
                        ) : (
                          <Eye color="#7a7a7a" size={16} />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    "Login"
                  )}
                </Button>
              </div>
              <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <a href="/auth/signup" className="underline underline-offset-4">
                  Sign up
                </a>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary  ">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}
