import React from "react";
import Image from "next/image";
import { NextPage } from "next";
import { redirect } from "next/navigation";
import Form from "./form";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import Button from "./button";

const login: NextPage = async (props) => {
  const session = await getServerSession(authOptions);
  if (session) {
    redirect("/dashboard");
  }

  return (
    <section className="bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <a
          href="#"
          className="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white"
        >
          <Image
            className="w-8 h-8 mr-2"
            src="/adey_logo.png"
            alt="logo"
            width={75}
            height={75}
          />
          Adey
        </a>
        <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
              Sign in to your account
            </h1>
            <Form />
            <div className="flex flex-row w-full items-center">
              <div className="flex-1 h-[1px] bg-gray-400"></div>
              <p className="mx-3 text-gray-800">or</p>
              <div className="flex-1 h-[1px] bg-gray-400"></div>
            </div>
            <Button />
          </div>
        </div>
      </div>
    </section>
  );
};

export default login;
