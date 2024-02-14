"use client";

import Api from "@/app/components/Api";
import Layout from "@/app/subscription/_layout";
import { AxiosError } from "axios";
import React, { useEffect, useState } from "react";
import { AiOutlineCheck, AiFillCloud } from "react-icons/ai";

const page = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [api, setApi] = useState<Api>();
  const [message, setMessage] = useState("");

  const check = async (_api: Api, checkout_id: string) => {
    try {
      const data = await _api.check_status(checkout_id);
      setMessage(data.message);
    } catch (err) {
      console.error(err);
      if (err instanceof AxiosError && err.response?.data) {
        setError(err.response.data["message"]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (api) {
      // @ts-ignore
      const checkout_id = new URLSearchParams(window.location.search).get(
        "checkout_id"
      );
      if (checkout_id) {
        check(api, checkout_id);
      } else {
        setLoading(false);
        setError("Checkout Id not provided.");
      }
    }
  }, [api]);

  return (
    <Layout setApi={setApi}>
      <div className="h-screen w-screen flex items-center justify-center flex-col">
        <div className="w-64 p-10 rounded-lg flex justify-center items-center flex-col bg-white shadow-xl">
          <div className="w-32 h-32 rounded-full bg-[#F8FAF5] flex items-center justify-center">
            {loading ? (
              <AiFillCloud size={40} color="#111" />
            ) : (
              <AiOutlineCheck size={40} color="#9ABC66" />
            )}
          </div>
          <p>{loading ? "Checking" : error ? error : message}</p>
        </div>
      </div>
    </Layout>
  );
};

export default page;
