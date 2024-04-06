"use client";

import { signIn } from "next-auth/react";
import React from "react";
import { useSearchParams } from "next/navigation";
import { get_redirect_url } from "../components/utils";
import GithubIcon from "../../components/ui/icons/github-icon";
import GoogleIcon from "../../components/ui/icons/google-icon";

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
      <button
        onClick={() => oauthSignIn("google")}
        className="w-full flex flex-row items-center justify-center gap-x-3 h-10 border-gray-300 border rounded-md"
      >
        <GoogleIcon size={16} />
        Sign in with Google
      </button>
      <button
        onClick={() => oauthSignIn("github")}
        className="w-full flex flex-row items-center justify-center gap-x-3 h-10 border-gray-300 border rounded-md"
      >
        <GithubIcon size={16} />
        Sign in with Github
      </button>
    </div>
  );
};

export default button;
