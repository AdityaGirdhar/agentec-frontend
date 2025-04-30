"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  ClipboardList,
  Settings2,
  Wallet,
  Building2,
  BookUser,
  FlaskConical,
  BugPlay,
  ClipboardSignature,
  TicketCheck,
  Store,
  FileStack,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
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
  const pathname = usePathname()

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
        { title: "Tasks", url: "/tasks", icon: ClipboardList },
        { title: "Repository", url: "/repository", icon: FileStack },
        { title: "Marketplace", url: "/marketplace", icon: Store },
        { title: "Budgets", url: "/budgets", icon: Wallet },
        { title: "Organizations", url: "/organizations", icon: Building2 },
      ],
    },
    {
      title: "Developer",
      items: [
        { title: "Your Agents", url: "/your-agents", icon: BugPlay },
        { title: "Test Agents", url: "/test-agents", icon: FlaskConical },
      ],
    },
  ]

  if (user?.email === "admin@agentec.dev") {
    navMain.push({
      title: "Admin",
      items: [
        { title: "Logs", url: "/logs", icon: Settings2 },
        { title: "Requests", url: "/requests", icon: ClipboardSignature },
        { title: "Tickets", url: "/tickets", icon: TicketCheck },
      ],
    })
  }

  if (loading) return null

  return (
    <Sidebar collapsible="icon" {...props}>
      <Image className="pl-4 pt-8 pr-14" src={fullLogo} alt="Logo" />

      <SidebarHeader />

      <SidebarContent>
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.15 }}
          >
            {navMain.map((section) => (
              <NavMain key={section.title} items={section.items} title={section.title} />
            ))}
          </motion.div>
        </AnimatePresence>
      </SidebarContent>

      <SidebarFooter>{user && <NavUser user={user} />}</SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}