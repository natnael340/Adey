"use client";

import React, { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  get_redirect_url,
  loginWithPassword,
} from "@/app/auth/components/utils";
import {
  AuthCard,
  FormMessage,
  SubmitButton,
  control,
  input,
  textLink,
} from "@/app/auth/components/ui";
import { AuthErrorMessage } from "@/app/types/types";
import Button, { focusRing } from "@/app/components/brand/Button";
import GoogleIcon from "@/app/components/ui/icons/google-icon";

export function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AuthErrorMessage | null>(null);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const failure = await loginWithPassword(e.currentTarget);
    setLoading(false);
    if (failure) setError(failure);
    else router.push(get_redirect_url(searchParams));
  };

  return (
    <AuthCard title="Welcome back" subtitle="Sign in to manage your assistant.">
      <button
        type="button"
        onClick={() =>
          signIn("google", {
            redirect: true,
            callbackUrl: get_redirect_url(searchParams),
          })
        }
        className={cn(
          control,
          "inline-flex items-center justify-center gap-2 border border-adey-mist bg-adey-paper font-medium transition-colors hover:bg-adey-meadow",
          focusRing()
        )}
      >
        <GoogleIcon size={16} />
        Continue with Google
      </button>

      <div className="relative text-center text-sm after:absolute after:inset-x-0 after:top-1/2 after:border-t after:border-adey-mist">
        <span className="relative z-10 bg-adey-paper px-2 text-adey-seed/60">
          Or continue with
        </span>
      </div>

      <form className="grid gap-6" onSubmit={onSubmit}>
        <FormMessage messages={error?.messages ?? []}>
          {error?.code === "unverified_account" && (
            <p>
              <Button variant="link" href="/auth/email/verify">
                Resend verification email
              </Button>
            </p>
          )}
        </FormMessage>

        <div className="grid gap-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            name="email"
            placeholder="m@example.com"
            autoComplete="email"
            required
            className={input}
          />
        </div>

        <div className="grid gap-2">
          <div className="flex items-center">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <Link
              href="/auth/password/forgot"
              className={cn(textLink, "ml-auto text-sm")}
            >
              Forgot your password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              name="password"
              autoComplete="current-password"
              required
              className={cn(input, "pr-10")}
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((prev) => !prev)}
              className={cn(
                "absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-control text-adey-seed/50 hover:text-adey-seed",
                focusRing()
              )}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <SubmitButton loading={loading} loadingText="Signing in…">
          Sign in
        </SubmitButton>
      </form>

      <p className="text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link
          href="/auth/signup"
          className={cn(textLink, "underline hover:decoration-2")}
        >
          Sign up
        </Link>
      </p>
    </AuthCard>
  );
}
