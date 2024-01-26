"use server";

import { ChatFormType } from "../types/types";
import { redirect } from "next/navigation";

export const formUpdated = (current: any, prev: any) => {
  const data: any = {};
  Object.keys(current).forEach((key) => {
    // @ts-ignore
    if (current[key] !== prev[key]) {
      // @ts-ignore
      data[key] = current[key];
    }
  });

  return { data, status: Object.keys(data).length !== 0 };
};

export const navigate = async (url: string) => {
  redirect(url);
};
