import React from "react";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { api } from "@/app/components/Api";
import { GenericResponseType } from "@/app/types/types";
import { BadgeInfo } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type PropType = {
  params: {
    token: string;
  };
};

const Page = async ({ params: { token } }: PropType) => {
  const session = await getServerSession(authOptions);
  let data = { error: true, message: "" };
  if (session) {
    redirect("/dashboard");
  }
  try {
    const { data: _data } = await api.get<GenericResponseType>(
      `auth/email/verify/${token}`
    );
    data = _data;
  } catch (e) {
    // @ts-ignore
    data = e.response?.data;
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
              Email Verification
            </h1>
            <Alert variant={data.error ? "destructive" : "default"}>
              <BadgeInfo size={16} />
              <AlertTitle>
                Email verification {data.error ? "failed." : "successful."}
              </AlertTitle>
              <AlertDescription>
                {data.message}
                <span>test</span>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Page;
