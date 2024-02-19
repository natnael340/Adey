import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Api from "./Api";

export const authApi = async () => {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/auth/login");
  }
  // @ts-ignore
  return new Api(session?.accessToken);
};
