import {
  BookOpen,
  ChartLine,
  LogOut,
  Receipt,
  Settings,
  Users2,
  WheatIcon,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { ModeToggle } from "./theme-mode-toggle";
import { Button } from "./ui/button";
import { SignOutButton } from "@clerk/nextjs";

// Menu items.
const items = [
  {
    title: "Analytics",
    url: "/",
    icon: ChartLine,
  },
  {
    title: "Users",
    url: "/users",
    icon: Users2,
  },
  {
    title: "Products",
    url: "/products",
    icon: WheatIcon,
  },
  {
    title: "Purchases",
    url: "#",
    icon: Receipt,
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
  },
];

export async function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
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
            <SignOutButton>
              <Button variant={"destructive"} className="w-full">
                <LogOut />
                <span className="text-sm">Sign Out</span>
              </Button>
            </SignOutButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          <SidebarMenuItem>
            <ModeToggle />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
