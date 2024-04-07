import ProtectedRoute from "@/app/components/ProtectedRoute";
import React from "react";
import { CircleX } from "lucide-react";

const page = async () => {
  return (
    <ProtectedRoute>
      <div className="h-screen w-screen flex items-center justify-center flex-col">
        <div className="w-64 p-10 rounded-lg flex justify-center items-center flex-col bg-white shadow-xl gap-y-5">
          <div className="w-32 h-32 rounded-full bg-[#F8FAF5] flex items-center justify-center">
            <CircleX size={42} color="#111" />
          </div>
          <div>
            <p>Subscription canceled.</p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default page;
