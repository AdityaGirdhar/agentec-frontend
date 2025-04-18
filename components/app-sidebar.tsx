"use client"

import * as React from "react"
import {
  Bot,
  CircleCheckBig,
  CircleDollarSign,
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
  const [user, setUser] = React.useState<{ id: string; name: string; email: string; avatar: string } | null>(null)
  const [orgs, setOrgs] = React.useState<Array<{ name: string; id: string; logo: any; plan: string }>>([])

  React.useEffect(() => {
    const fetchUserAndOrgs = async () => {
      const storedUser = localStorage.getItem("user")
      if (!storedUser) return

      const parsed = JSON.parse(storedUser)
      const res = await fetch(`http://localhost:8000/users/get_user?email=${parsed.email}`)
      if (!res.ok) return

      const fullUser = await res.json()
      setUser({
        id: fullUser.id,
        name: fullUser.name,
        email: fullUser.email,
        avatar: fullUser.picture || accountIcon.src,
      })

      const orgsRes = await fetch(`http://localhost:8000/users/get_your_organizations?user_id=${fullUser.id}`)
      if (!orgsRes.ok) return

      const orgData = await orgsRes.json()
      const formatted = orgData.map((org: any) => ({
        name: org.name,
        id: org.id,
        logo: GalleryVerticalEnd,
        plan: org.status === "admin" ? "Admin" : "Member",
      }))

      setOrgs(formatted)
    }

    fetchUserAndOrgs()
  }, [])

  const navMain = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Tasks", url: "/tasks", icon: CircleCheckBig },
    { title: "Agents", url: "/agents", icon: Bot },
    { title: "Marketplace", url: "/marketplace", icon: ShoppingCart },
    { title: "Budgets", url: "/budgets", icon: CircleDollarSign },
  ]

  return (
    <Sidebar collapsible="icon" {...props}>
      <Image className="pl-4 pt-8 pb-3 pr-14" src={fullLogo} alt="Logo" />
      <SidebarHeader>
        {orgs.length > 0 && <TeamSwitcher teams={orgs} />}
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        {user && <NavUser user={user} />}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}