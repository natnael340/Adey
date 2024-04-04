import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Api from "./Api";

export const authToken = async (redirect_url?: string) => {
  const session = await getServerSession(authOptions);
  if (!session) {
    let path = "/auth/login";
    if (redirect_url) {
      path += "?redirect_url=" + redirect_url;
    }
    redirect(path);
  }
  // @ts-ignore
  return session?.accessToken;
};

export const authApi = async (redirect_url?: string) => {
  let token = await authToken();

  return new Api(token);
};
