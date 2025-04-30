"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  Bug,
  CircleCheckBig,
  CircleDollarSign,
  Eye,
  FolderGit2,
  GalleryVerticalEnd,
  LayoutDashboard,
  ShoppingCart,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar"
import Image from "next/image"
import fullLogo from "@/public/full-logo.png"
import accountIcon from "@/public/account.png"
import OrganizationControl from "@/components/organization-control"

const dummyUser = {
  id: "loading",
  name: "Loading...",
  email: "loading@example.com",
  avatar: "https://via.placeholder.com/40",
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [user, setUser] = React.useState<{
    id: string
    name: string
    email: string
    avatar: string
  } | null>(dummyUser)

  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const fetchUser = async () => {
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

      setLoading(false)
    }

    fetchUser()
  }, [])

  const navMain = [
    {
      title: "Platform",
      items: [
        { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
        { title: "Tasks", url: "/tasks", icon: CircleCheckBig },
        { title: "Repository", url: "/repository", icon: FolderGit2 },
        { title: "Marketplace", url: "/marketplace", icon: ShoppingCart },
        { title: "Budgets", url: "/budgets", icon: CircleDollarSign },
      ],
    },
    {
      title: "Developer",
      items: [{ title: "Tools", url: "/tools", icon: Bug }],
    },
  ]

  if (user?.email === "admin@agentec.dev") {
    navMain.push({
      title: "Admin",
      items: [{ title: "Console", url: "/console", icon: LayoutDashboard }],
    })
  }

  if (loading) return null

  return (
    <Sidebar collapsible="icon" {...props}>
      <Image className="pl-4 pt-8 pb-3 pr-14" src={fullLogo} alt="Logo" />
      
      <SidebarHeader>
        <OrganizationControl />
      </SidebarHeader>

      <SidebarContent>
        {navMain.map((section) => (
          <NavMain key={section.title} items={section.items} title={section.title} />
        ))}
      </SidebarContent>

      <SidebarFooter>{user && <NavUser user={user} />}</SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}