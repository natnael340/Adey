import React from "react";
import Image from "next/image";
import { NextPage } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { LoginForm } from "@/app/auth/login/login-form";

const login: NextPage = async (props) => {
  const session = await getServerSession(authOptions);
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <Image
            className="w-8 h-8"
            src="/adey_logo.png"
            alt="logo"
            width={32}
            height={32}
          />
          <span className="text-lg font-bold">Adey</span>
        </a>
        <LoginForm />
      </div>
    </div>
  );
};

export default login;
