"use client"

import * as React from "react"
import {
  AudioWaveform,
  Bot,
  CircleCheckBig,
  CircleDollarSign,
  ClipboardPlus,
  Command,
  GalleryVerticalEnd,
  LayoutDashboard,
  ShoppingCart,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import Image from "next/image"
import fullLogo from "@/public/full-logo.png"

// This is sample data.
const data = {
  user: {
    name: "Ahmed Hanoon",
    email: "ahmed21006@iiitd.ac.in",
    avatar: "@/public/account.png",
  },
  teams: [
    {
      name: "MIDAS Lab",
      logo: GalleryVerticalEnd,
      plan: "Enterprise Plan",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    // {
    //   title: "Playground",
    //   url: "#",
    //   icon: SquareTerminal,
    //   isActive: true,
    //   items: [
    //     {
    //       title: "History",
    //       url: "#",
    //     },
    //     {
    //       title: "Starred",
    //       url: "#",
    //     },
    //     {
    //       title: "Settings",
    //       url: "#",
    //     },
    //   ],
    // },
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Tasks",
      url: "/tasks",
      icon: CircleCheckBig,
    },
    {
      title: "Agents",
      url: "/agents",
      icon: Bot,
    },
    {
      title: "Marketplace",
      url: "/marketplace",
      icon: ShoppingCart,
    },

    {
      title: "Budgets",
      url: "#",
      icon: CircleDollarSign,
    },
    {
      title: "Reports",
      url: "#",
      icon: ClipboardPlus,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <Image className="pl-4 pt-8 pb-3 pr-14" src={fullLogo} alt="" />
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavProjects projects={data.projects} /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
