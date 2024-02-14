"use client";

import Api from "@/app/components/Api";
import { Spinner } from "flowbite-react";
import { signOut, useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import Layout from "@/app/subscription/_layout";

type ParamList = {
  params: {
    identifier: string;
  };
};
const page = ({ params: { identifier } }: ParamList) => {
  const [api, setApi] = useState<Api>();
  const [loadingStage, setLoadingStage] = useState<number>(0);
  const [error, setError] = useState<string>("");
  const [url, setUrl] = useState<string>("");

  const checkout = async (_api: Api) => {
    try {
      const data = await _api.checkout(identifier);
      setUrl(data.redirect_url);
      setLoadingStage(2);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (loadingStage === 2) {
      // @ts-ignore
      window.location = url;
    }
  }, [loadingStage]);

  useEffect(() => {
    if (api) {
      setLoadingStage(1);
      // @ts-ignore
      checkout(api);
    }
  }, [api]);

  return (
    <Layout setApi={setApi}>
      <div className="w-screen h-screen flex items-center justify-center flex-col space-y-5">
        <Spinner size="xl" color="info" />
        <p>
          {loadingStage == 0
            ? "Authenticating user...."
            : loadingStage == 1
            ? "Preparing checkout..."
            : "Redirecting ..."}
        </p>
      </div>
    </Layout>
  );
};

export default page;
