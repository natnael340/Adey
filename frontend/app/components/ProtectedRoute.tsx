import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import React from "react";

type Props = {
  children: React.ReactElement;
};
const ProtectedRoute = async ({ children }: Props) => {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/auth/login");
  }
  return children;
};

export default ProtectedRoute;
