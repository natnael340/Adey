"use client";

import React, { useEffect } from "react";
import Api from "../components/Api";
import { signOut, useSession } from "next-auth/react";

type ParamList = {
  children: React.ReactElement;
  setApi: (api: Api) => void;
};
const _layout = ({ children, setApi }: ParamList) => {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated: () => {
      console.log("un auth");
      signOut({
        redirect: true,
        callbackUrl: "/auth/login/",
      });
    },
  });
  useEffect(() => {
    if (session) {
      // @ts-ignore
      setApi(new Api(session?.accessToken));
    }
  }, [session]);

  return children;
};

export default _layout;
