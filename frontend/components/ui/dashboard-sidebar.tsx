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
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutGrid,
  Bot,
  Plug,
  MessageCircle,
  FileText,
  LogOut,
  User,
  ChevronUp,
  Settings,
} from "lucide-react";
import Image from "next/image";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const BUILD_FEATURES = [
  { title: "Dashboard", icon: LayoutGrid, href: "/dashboard" },
  { title: "Bots", icon: Bot, href: "/dashboard/bots" },
  { title: "Messages", icon: MessageCircle, href: "/dashboard/messages" },
  { title: "Integrations", icon: Plug, href: "/dashboard/integrations" },
];

const RESOURCES = [
  { title: "Documentation", icon: FileText, href: "/docs" },
];

type PropType = {
  username: string;
};

export function DashboardSidebar({ username }: PropType) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  return (
    <Sidebar className="border-r border-slate-200/60">
      <SidebarHeader className="pb-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <a
              href="/"
              className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-slate-100/80 transition-colors"
            >
              <div className="relative">
                <Image
                  className="w-8 h-8"
                  src="/adey_logo.png"
                  alt="logo"
                  width={32}
                  height={32}
                />
              </div>
              <span className="text-lg font-semibold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Adey
              </span>
            </a>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarSeparator className="mx-3 bg-slate-200/60" />

      <SidebarContent className="px-1">
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Build
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {BUILD_FEATURES.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                    className={cn(
                      "h-9 px-3 rounded-lg transition-all duration-200",
                      isActive(item.href)
                        ? "bg-slate-900 text-white hover:bg-slate-800 hover:text-white"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    )}
                  >
                    <a href={item.href} className="flex items-center gap-3">
                      <item.icon
                        className={cn(
                          "h-[18px] w-[18px]",
                          isActive(item.href)
                            ? "text-white"
                            : "text-slate-500"
                        )}
                      />
                      <span className="text-sm font-medium">{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Resources
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {RESOURCES.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                    className={cn(
                      "h-9 px-3 rounded-lg transition-all duration-200",
                      isActive(item.href)
                        ? "bg-slate-900 text-white hover:bg-slate-800 hover:text-white"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    )}
                  >
                    <a href={item.href} className="flex items-center gap-3">
                      <item.icon
                        className={cn(
                          "h-[18px] w-[18px]",
                          isActive(item.href)
                            ? "text-white"
                            : "text-slate-500"
                        )}
                      />
                      <span className="text-sm font-medium">{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="h-12 px-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/60 transition-all duration-200 data-[state=open]:bg-slate-100">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 text-white">
                      <User className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col items-start min-w-0">
                      <span className="text-sm font-medium text-slate-700 truncate w-full">
                        {username.split("@")[0]}
                      </span>
                      <span className="text-[11px] text-slate-400 truncate w-full">
                        {username}
                      </span>
                    </div>
                  </div>
                  <ChevronUp className="h-4 w-4 text-slate-400 shrink-0" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                align="start"
                className="w-56 rounded-xl p-1.5"
              >
                <DropdownMenuItem className="rounded-lg px-3 py-2 cursor-pointer">
                  <Settings className="h-4 w-4 mr-2.5 text-slate-500" />
                  <span>Account settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1" />
                <DropdownMenuItem
                  onClick={() =>
                    signOut({ redirect: true, callbackUrl: "/auth/login" })
                  }
                  className="rounded-lg px-3 py-2 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                >
                  <LogOut className="h-4 w-4 mr-2.5" />
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
