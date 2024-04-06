import React from "react";
import { authApi } from "@/app/components/protected_api";
import Api from "@/app/components/Api";
import { AxiosError } from "axios";
import { redirect } from "next/navigation";
import { PlanType } from "@/app/types/types";
import PaypalPayment from "./PaypalPayment";
import { PaypalOptions } from "@/app/constants/consts";
import Features from "./Features";
import { Gem } from "lucide-react";

type ParamList = {
  params: {
    identifier: string;
  };
};

const page = async ({ params: { identifier } }: ParamList) => {
  const api: Api = await authApi(`/subscription/${identifier}`);
  let data: PlanType;

  try {
    data = await api.get_plan(identifier);
  } catch (error) {
    console.error(error);
    if (error instanceof AxiosError) {
      if (error.code == "404") {
        redirect("/not-found");
      } else {
        redirect(`/auth/login?redirect_url=/subscription/${identifier}`);
      }
    }
    return;
  }

  return (
    <div className="relative w-screen h-screen bg-white flex items-center justify-center">
      <div className="absolute flex flex-col items-center space-y-3  h-[500px] w-96">
        <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-slate-300">
          <div className="absolute w-20 h-20 rounded-full -top-[0.2px] -left-8 bg-gradient-to-b from-[rgba(218,226,255,0.56)] to-[rgba(255,255,255,0.2)] z-10" />
          <div className="absolute w-20 h-20 rounded-full -top-[20.51px] -left-[2.78px] bg-gradient-to-b from-[rgba(180,196,255,0.50)] to-[rgba(76,92,153,0.08)]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
            <Gem size={16} />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-[#130F26]">Premium</h1>
        <div className="space-x-1">
          <span className="text-5xl font-extrabold">$49.99</span>
          <span className="text-gray-600 font-bold">/month</span>
        </div>
        <Features data={data} />

        <PaypalPayment
          data={data}
          token={api.get_token()}
          options={PaypalOptions}
        />
      </div>
    </div>
  );
};

export default page;
