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
      <main className="flex-1 min-h-screen bg-gray-50/80">
        <div className="container max-w-7xl mx-auto p-6 lg:p-8">
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
}

export default layout;
