"use client"

import * as React from "react"
import {
  Bot,
  CircleCheckBig,
  CircleDollarSign,
  GalleryVerticalEnd,
  LayoutDashboard,
  ShoppingCart,
  Plus,
  Eye,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import fullLogo from "@/public/full-logo.png"
import accountIcon from "@/public/account.png"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [user, setUser] = React.useState<{ id: string; name: string; email: string; avatar: string } | null>(null)
  const [orgs, setOrgs] = React.useState<Array<{ name: string; id: string; logo: any; plan: string }>>([])

  const [showDialog, setShowDialog] = React.useState(false)
  const [inviteToken, setInviteToken] = React.useState("")
  const [joinStatus, setJoinStatus] = React.useState<"idle" | "loading" | "success" | "error">("idle")
  const [joinMessage, setJoinMessage] = React.useState("")

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

      localStorage.setItem("user", JSON.stringify({
        id: fullUser.id,
        name: fullUser.name,
        email: fullUser.email,
        avatar: fullUser.picture || accountIcon.src,
        organization: formatted[0]?.id || "",
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

  const handleJoin = async () => {
    try {
      const stored = localStorage.getItem("user")
      if (!stored) throw new Error("No user")
      const parsed = JSON.parse(stored)

      setJoinStatus("loading")
      const res = await fetch("http://localhost:8000/users/join_organization", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ user_id: parsed.id, invite_token: inviteToken }),
      })

      const data = await res.json()

      if (!res.ok) {
        setJoinStatus("error")
        setJoinMessage(data.detail || "Failed to join organization")
        return
      }

      setJoinStatus("success")
      setJoinMessage(data.message)

      localStorage.setItem("user", JSON.stringify({ ...parsed, organization: data.organization_id }))
    } catch (err) {
      setJoinStatus("error")
      setJoinMessage("Something went wrong.")
    }
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <Image className="pl-4 pt-8 pb-3 pr-14" src={fullLogo} alt="Logo" />
      <SidebarHeader>
  {orgs.length > 0 ? (
    <TeamSwitcher
      teams={orgs}
      currentTeam={orgs[0]}
      onTeamChange={(team) => {
        const stored = localStorage.getItem("user")
        if (!stored) return
        const parsed = JSON.parse(stored)
        localStorage.setItem("user", JSON.stringify({ ...parsed, organization: team.id }))
        location.reload()
      }}
      footerContent={
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 w-full justify-start"
            >
              <Plus size={16} /> Join or Create Organization
            </Button>
          </DialogTrigger>
        </Dialog>
      }
    />
  ) : (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2 w-full justify-start"
        >
          <Plus size={16} /> Join or Create Organization
        </Button>
      </DialogTrigger>
    </Dialog>
  )}
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