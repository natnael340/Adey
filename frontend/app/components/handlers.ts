import { redirect } from "next/navigation";

export const navigate = async (url: string) => {
  redirect(url);
};
