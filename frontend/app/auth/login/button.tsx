"use client";

import { signIn } from "next-auth/react";
import React from "react";
import { useSearchParams } from "next/navigation";
import { get_redirect_url } from "../components/utils";
import GithubIcon from "../../components/ui/icons/github-icon";
import GoogleIcon from "../../components/ui/icons/google-icon";
import { Button } from "@/components/ui/button";

const button = () => {
  const searchParams = useSearchParams();
  const oauthSignIn = (provider: string) => {
    signIn(provider, {
      redirect: true,
      callbackUrl: get_redirect_url(searchParams),
    });
  };
  return (
    <div className="w-full space-y-2">
      <Button
        onClick={() => oauthSignIn("google")}
        variant="outline"
        className="gap-x-3 w-full border-gray-300"
      >
        <GoogleIcon size={16} />
        Sign in with Google
      </Button>
    </div>
  );
};

export default button;
