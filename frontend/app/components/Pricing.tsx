"use client";

import React, { useEffect, useState } from "react";
import { FaBullseye, FaCheck } from "react-icons/fa";
import { PiTarget } from "react-icons/pi";
import { PlanType } from "../types/types";
import { TEST_PLAN } from "../constants/consts";

type PropsType = {
  data: PlanType[];
};

const Pricing = ({ data: base }: PropsType) => {
  const [period, setPeriod] = useState<string>("monthly");
  const [data, setData] = useState<PlanType[]>(TEST_PLAN);

  useEffect(() => {
    const d = base.filter((p) => p.period == period);
    setData(d);
    console.log(d, "here");
  }, [period]);
  return (
    <div className="w-full space-y-10">
      <div className="flex items-start justify-center">
        <div className="flex flex-row items-center justify-center w-64 h-[60px] rounded-xl bg-[#EDD447] bg-opacity-20 shadow-inner">
          <button
            onClick={() => setPeriod("monthly")}
            className={`flex items-center justify-center w-[120px] h-[44px] ${
              period == "monthly"
                ? "bg-white rounded-xl border border-[#E7EBFF]"
                : "bg-transparent text-[#797878]"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setPeriod("yearly")}
            className={`flex items-center justify-center w-[120px] h-[44px] ${
              period == "yearly"
                ? "bg-white rounded-xl border border-[#E7EBFF]"
                : "bg-transparent text-[#797878]"
            }`}
          >
            Yearly
          </button>
        </div>
      </div>
      <div className="w-full grid grid-cols-1 md:gap-x-10 md:grid-cols-3">
        <div className="w-[344px] h-fit p-10 bg-white rounded-2xl space-y-4 shadow-lg mt-20 border border-white">
          <div className="w-14 h-14 flex justify-center items-center rounded-xl bg-[#EDD447]">
            <PiTarget size={32} />
          </div>
          <h2 className="text-3xl font-bold">{data[0].name}</h2>
          <p className="text-[#797878]">
            Unleash the Power of Your Business with Premium Plan.
          </p>
          <div className="flex flex-row justify-between items-center py-3">
            <h1 className="text-4xl">Free</h1>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-x-4">
              <FaCheck />
              <p>{data[0].max_chatbot} Chat Bots</p>
            </div>
            <div className="flex items-center gap-x-4">
              <FaCheck />
              <p>{data[0].max_webapp_per_bot} Web App per Chat Bot</p>
            </div>
            <div className="flex items-center gap-x-4">
              <FaCheck />
              <p>{data[0].max_user_session} Users</p>
            </div>
            <div className="flex items-center gap-x-4">
              <FaCheck />
              <p>
                {data[0].max_request_per_month} Request per{" "}
                {data[0].period == "monthly" ? "month" : "year"}
              </p>
            </div>
            <div className="flex items-center gap-x-4">
              <FaCheck />
              <p>Third party Integration</p>
            </div>
          </div>
          <div>
            <a
              role="button"
              className="w-full h-14 mt-7 bg-[#EDD447] rounded-xl shadow-lg flex items-center justify-center"
              href={"/auth/login"}
            >
              <span className="text-lg">Get Started</span>
            </a>
          </div>
        </div>
        <div className="w-[344px] h-[600px]  rounded-2xl bg-white shadow-lg border border-white relative overflow-hidden">
          <div className="absolute w-[968px] -top-20 -left-52 h-[968px] rounded-full bg-gradient-to-b from-15% from-[#EBDA7A] to-transparent z-10" />
          <div className="absolute w-[968px] -top-48 -left-[600px] h-[968px] rounded-full bg-gradient-to-b from-[rgba(237,212,71,0.7)] to-transparent border border-[#B5C2FB]" />
          <div className="absolute top-0 left-0 bottom-0 right-0 p-10 z-20 h-full space-y-4">
            <div className="w-14 h-14 flex justify-center items-center rounded-xl bg-white">
              <PiTarget size={32} />
            </div>
            <h2 className="text-3xl font-bold">{data[2].name}</h2>
            <p className="text-[#797878]">
              Unleash the Power of Your Business with Premium Plan.
            </p>
            <div className="flex flex-row justify-between items-center py-3">
              <h1 className="text-4xl">ETB {data[2].price}</h1>
              <span className="text-sm text-[#797878]">
                per {data[2].period == "monthly" ? "month" : "year"}
              </span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-x-4">
                <FaCheck />
                <p>Unlimited Chat Bots</p>
              </div>
              <div className="flex items-center gap-x-4">
                <FaCheck />
                <p>Unlimited Web App per Bot</p>
              </div>
              <div className="flex items-center gap-x-4">
                <FaCheck />
                <p>Unlimited Users</p>
              </div>
              <div className="flex items-center gap-x-4">
                <FaCheck />
                <p>
                  {data[2].max_request_per_month} Request per{" "}
                  {data[2].period == "monthly" ? "month" : "year"}
                </p>
              </div>
              <div className="flex items-center gap-x-4">
                <FaCheck />
                <p>Third party Integration</p>
              </div>
            </div>
            <div>
              <a
                role="button"
                className="w-full h-14 mt-7 bg-[#EDD447] rounded-xl shadow-lg flex items-center justify-center"
                href={`/subscription/${data[2].identifier}`}
              >
                <span className="text-lg">Get Started</span>
              </a>
            </div>
          </div>
        </div>
        <div className="w-[344px] h-fit p-10 bg-white rounded-2xl space-y-4 shadow-lg mt-20 border border-white">
          <div className="w-14 h-14 flex justify-center items-center rounded-xl bg-[#EDD447]">
            <PiTarget size={32} />
          </div>
          <h2 className="text-3xl font-bold">{data[1].name}</h2>
          <p className="text-[#797878]">
            Unleash the Power of Your Business with Premium Plan.
          </p>
          <div className="flex flex-row justify-between items-center py-3">
            <h1 className="text-4xl">ETB {data[1].price}</h1>
            <span className="text-sm text-[#797878]">
              per {data[1].period == "monthly" ? "month" : "year"}
            </span>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-x-4">
              <FaCheck />
              <p>{data[1].max_chatbot} Chat Bots</p>
            </div>
            <div className="flex items-center gap-x-4">
              <FaCheck />
              <p>{data[1].max_webapp_per_bot} Web App per Chat Bot</p>
            </div>
            <div className="flex items-center gap-x-4">
              <FaCheck />
              <p>{data[1].max_user_session} Users</p>
            </div>
            <div className="flex items-center gap-x-4">
              <FaCheck />
              <p>
                {data[1].max_request_per_month} Request per{" "}
                {data[1].period == "monthly" ? "month" : "year"}
              </p>
            </div>
            <div className="flex items-center gap-x-4">
              <FaCheck />
              <p>Third party Integration</p>
            </div>
          </div>
          <div>
            <a
              role="button"
              className="w-full h-14 mt-7 bg-[#EDD447] rounded-xl shadow-lg flex items-center justify-center"
              href={`/subscription/${data[1].identifier}`}
            >
              <span className="text-lg">Get Started</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
