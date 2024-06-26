"use client";

import { PlanType } from "@/app/types/types";
import React, { useState } from "react";
import { ChevronDown, Check } from "lucide-react";

type PropType = {
  data: PlanType;
};
const Features = ({ data }: PropType) => {
  const [show, setShow] = useState<boolean>(false);

  return (
    <div>
      <button
        className="flex justify-between items-center w-60 py-2 border-b border-gray-500 "
        onClick={() => setShow(!show)}
      >
        <p className="text-gray-500">Features</p>
        <ChevronDown size={16} className="text-gray-500" />
      </button>
      <div
        className={`w-full transition-all  space-y-3 pt-3 *:text-gray-700 ${
          show ? "h-48 opacity-100" : "h-0 opacity-0"
        }`}
      >
        <div className="flex items-center gap-x-4">
          <Check size={16} />
          <p>{data.max_chatbot} Chat Bots</p>
        </div>
        <div className="flex items-center gap-x-4">
          <Check size={16} />
          <p>{data.max_webapp_per_bot} Web App per Chat Bot</p>
        </div>
        <div className="flex items-center gap-x-4">
          <Check size={16} />
          <p>{data.max_user_session} Users</p>
        </div>
        <div className="flex items-center gap-x-4">
          <Check size={16} />
          <p>
            {data.max_request_per_month} Request per{" "}
            {data.period == "monthly" ? "month" : "year"}
          </p>
        </div>
        <div className="flex items-center gap-x-4">
          <Check size={16} />
          <p>Third party Integration</p>
        </div>
      </div>
    </div>
  );
};

export default Features;
