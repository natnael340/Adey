"use client";

import React, { useState } from "react";
import { MdError } from "react-icons/md";

const page = () => {
  return (
    <div className="h-screen w-screen flex items-center justify-center flex-col">
      <div className="w-64 p-10 rounded-lg flex justify-center items-center flex-col bg-white shadow-xl gap-y-5">
        <div className="w-32 h-32 rounded-full bg-[#F8FAF5] flex items-center justify-center">
          <MdError size={40} color="#111" />
        </div>
        <div>
          <p>Subscription canceled.</p>
        </div>
      </div>
    </div>
  );
};

export default page;
