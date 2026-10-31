import React from "react";
import Link from "next/link";
import { NextPage } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { LoginForm } from "@/app/auth/login/login-form";
import AuthShell from "@/app/auth/components/AuthShell";
import { focusRing } from "@/app/components/brand/Button";
import { cn } from "@/lib/utils";

const footerLink = cn(
  "rounded-control underline underline-offset-4 hover:text-adey-highland",
  focusRing()
);

const login: NextPage = async () => {
  const session = await getServerSession(authOptions);
  if (session) {
    redirect("/dashboard");
  }

  return (
    <AuthShell>
      <LoginForm />
      <p className="text-balance text-center text-xs text-adey-seed/70">
        By signing in, you agree to our{" "}
        <Link href="/tos" className={footerLink}>
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className={footerLink}>
          Privacy Policy
        </Link>
        .
      </p>
    </AuthShell>
  );
};

export default login;
