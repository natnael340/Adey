import React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/ui/dashboard-sidebar";
import { authApi } from "../components/protected_api";

type Props = {
  children: React.ReactElement;
};
async function layout({ children }: Props) {
  const api = await authApi();
  const user = await api.get_user_info();

  return (
    <SidebarProvider>
      <DashboardSidebar username={user.email} />
      <section className="container p-5 bg-[#F8F9FC] h-screen">
        {children}
      </section>
    </SidebarProvider>
  );
}

export default layout;
