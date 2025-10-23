"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Grid,
  Bot,
  Plug,
  UserCircle,
  MessageCircle,
  File,
  LogOut,
  User2,
  ChevronUp,
} from "lucide-react";
import Image from "next/image";
import { signOut } from "next-auth/react";

const BUILD_FEATURES = [
  { title: "Dashboard", icon: Grid, href: "/dashboard" },
  { title: "Bots", icon: Bot, href: "/dashboard/bots" },
  { title: "Messages", icon: MessageCircle, href: "/dashboard/messages" },
  { title: "Integrations", icon: Plug, href: "/dashboard/integrations" },
  { title: "Docs", icon: File, href: "/docs" },
];

const ACCOUNT = [
  { title: "Account", icon: UserCircle, href: "/dashboard/account" },
  { title: "Logout", icon: LogOut, href: "/api/auth/signout" },
];

type PropType = {
  username: string;
};

export function DashboardSidebar({ username }: PropType) {
  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a href="/" className="text-xl">
                <Image
                  className="w-8 h-8 sm:h-9 sm:w-9"
                  src="/adey_logo.png"
                  alt="logo"
                  width={75}
                  height={75}
                />
                <span className="text-black font-bold">Adey</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Build your bot</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {BUILD_FEATURES.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.href} className="text-lg text-[#15192C]">
                      <item.icon size={24} />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <User2 /> {username}
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-popper-anchor-width]"
              >
                <DropdownMenuItem>
                  <span>Account</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    signOut({ redirect: true, callbackUrl: "/auth/login" })
                  }
                >
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
