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
import accountIcon from "@/public/account.png"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [user, setUser] = React.useState<{ name: string; email: string; avatar: string } | null>(null)

  React.useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser)
      console.log(parsedUser.picture)
      setUser({
        name: parsedUser.name || "Unknown User",
        email: parsedUser.email || "No Email",
        avatar: parsedUser.picture || accountIcon.src, // Default avatar if none provided
      })
    }
  }, [])

  const data = {
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
        url: "#",
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

  return (
    <Sidebar collapsible="icon" {...props}>
      <Image className="pl-4 pt-8 pb-3 pr-14" src={fullLogo} alt="Logo" />
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        {user && <NavUser user={user} />}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}