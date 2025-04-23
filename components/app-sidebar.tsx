"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  Bot,
  CircleCheckBig,
  CircleDollarSign,
  GalleryVerticalEnd,
  LayoutDashboard,
  ShoppingCart,
  Plus,
  Eye,
  Bug,
  FolderGit2,
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

const dummyUser = {
  id: "loading",
  name: "Loading...",
  email: "loading@example.com",
  avatar: "https://via.placeholder.com/40", // Placeholder avatar
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter()
  const [user, setUser] = React.useState<{ id: string; name: string; email: string; avatar: string } | null>(dummyUser)
  const [orgs, setOrgs] = React.useState<Array<{ name: string; id: string; logo: any; plan: string }>>([])
  const [selectedOrg, setSelectedOrg] = React.useState<any>(null)

  const [showDialog, setShowDialog] = React.useState(false)
  const [inviteToken, setInviteToken] = React.useState("")
  const [joinStatus, setJoinStatus] = React.useState<"idle" | "loading" | "success" | "error">("idle")
  const [joinMessage, setJoinMessage] = React.useState("")
  const [newOrgName, setNewOrgName] = React.useState("")
  const [loading, setLoading] = React.useState(true)

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

      const existingUser = JSON.parse(localStorage.getItem("user") || "{}")
      const userOrg = existingUser.organization || formatted[0]?.id || ""

      localStorage.setItem("user", JSON.stringify({
        id: fullUser.id,
        name: fullUser.name,
        email: fullUser.email,
        avatar: fullUser.picture || accountIcon.src,
        organization: userOrg,
      }))

      setOrgs(formatted)
      const orgId = parsed.organization
      const activeOrg = formatted.find((org) => org.id === orgId) || formatted[0]
      setSelectedOrg(activeOrg)
      setLoading(false)
    }

    fetchUserAndOrgs()
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
      items: [
        // { title: "Your Agents", url: "/your-agents", icon: Bot },
        { title: "Tools", url: "/tools", icon: Bug },
      ],
    },
  ]
  
  if (user?.email === "admin@agentec.dev") {
    navMain.push({
      title: "Admin",
      items: [
        { title: "Console", url: "/console", icon: LayoutDashboard },
      ],
    })
  }

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
  
      const updatedUser = { ...parsed, organization: data.organization_id }
      localStorage.setItem("user", JSON.stringify(updatedUser))
      location.reload() // trigger reload to refresh org list
    } catch (err) {
      setJoinStatus("error")
      setJoinMessage("Something went wrong.")
    }
  }

  const handleCreateOrganization = async () => {
    try {
      const stored = localStorage.getItem("user")
      if (!stored) throw new Error("No user")
      const parsed = JSON.parse(stored)

      if (!newOrgName.trim()) {
        setJoinStatus("error")
        setJoinMessage("Organization name is required")
        return
      }

      const res = await fetch("http://localhost:8000/organizations/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: newOrgName,
          admin_id: parsed.id,
          wallet: 0,
        }),
      })

      if (!res.ok) {
        setJoinStatus("error")
        setJoinMessage("Failed to create organization")
        return
      }

      const data = await res.json()
      localStorage.setItem("user", JSON.stringify({ ...parsed, organization: data.id }))
      setShowDialog(false)
      location.reload()
    } catch (err) {
      setJoinStatus("error")
      setJoinMessage("Something went wrong.")
    }
  }

  if (loading) return null

  return (
    <Sidebar collapsible="icon" {...props}>
      <Image className="pl-4 pt-8 pb-3 pr-14" src={fullLogo} alt="Logo" />
      <SidebarHeader>
  {orgs.length === 0 ? (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2 w-full justify-start"
        >
          <Plus size={16} /> Join or Create
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md [&_button[data-dialog-close]]:hidden">
        <DialogHeader>
          <DialogTitle className="text-lg">Join or Create Organization</DialogTitle>
        </DialogHeader>
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setJoinStatus("idle")}
            className={`flex-1 text-sm font-medium py-2 rounded-md border ${
              joinStatus !== "create" ? "bg-black text-white" : "bg-muted"
            }`}
          >
            Join
          </button>
          <button
            onClick={() => setJoinStatus("create")}
            className={`flex-1 text-sm font-medium py-2 rounded-md border ${
              joinStatus === "create" ? "bg-black text-white" : "bg-muted"
            }`}
          >
            Create
          </button>
        </div>
        {joinStatus !== "create" ? (
          <div className="mt-6 space-y-3">
            <p className="text-sm font-semibold text-gray-700">Join with Invite Token</p>
            <input
              type="text"
              placeholder="Enter invite token"
              value={inviteToken}
              onChange={(e) => setInviteToken(e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
            <Button onClick={handleJoin} className="w-full">
              Join
            </Button>
            {joinStatus === "success" && <p className="text-sm text-green-600">{joinMessage}</p>}
            {joinStatus === "error" && <p className="text-sm text-red-600">{joinMessage}</p>}
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <p className="text-sm font-semibold text-gray-700">Create a New Organization</p>
            <input
              type="text"
              placeholder="Organization Name"
              value={newOrgName}
              onChange={(e) => setNewOrgName(e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
            <Button className="w-full" onClick={handleCreateOrganization}>
              Create
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  ) : (
    <div className="flex items-center justify-between gap-2">
      <div className="flex-1">
        <TeamSwitcher
          teams={orgs}
          currentTeam={selectedOrg}
          onTeamChange={(team) => {
            const stored = localStorage.getItem("user")
            if (!stored) return
            const parsed = JSON.parse(stored)
            localStorage.setItem("user", JSON.stringify({ ...parsed, organization: team.id }))
            setSelectedOrg(team)
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
                  <Plus size={16} /> Join or Create
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md [&_button[data-dialog-close]]:hidden">
                <DialogHeader>
                  <DialogTitle className="text-lg">Join or Create Organization</DialogTitle>
                </DialogHeader>
                {/* same join/create logic block here */}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => setJoinStatus("idle")}
                    className={`flex-1 text-sm font-medium py-2 rounded-md border ${
                      joinStatus !== "create" ? "bg-black text-white" : "bg-muted"
                    }`}
                  >
                    Join
                  </button>
                  <button
                    onClick={() => setJoinStatus("create")}
                    className={`flex-1 text-sm font-medium py-2 rounded-md border ${
                      joinStatus === "create" ? "bg-black text-white" : "bg-muted"
                    }`}
                  >
                    Create
                  </button>
                </div>
                {joinStatus !== "create" ? (
                  <div className="mt-6 space-y-3">
                    <p className="text-sm font-semibold text-gray-700">Join with Invite Token</p>
                    <input
                      type="text"
                      placeholder="Enter invite token"
                      value={inviteToken}
                      onChange={(e) => setInviteToken(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black"
                    />
                    <Button onClick={handleJoin} className="w-full">
                      Join
                    </Button>
                    {joinStatus === "success" && <p className="text-sm text-green-600">{joinMessage}</p>}
                    {joinStatus === "error" && <p className="text-sm text-red-600">{joinMessage}</p>}
                  </div>
                ) : (
                  <div className="mt-6 space-y-4">
                    <p className="text-sm font-semibold text-gray-700">Create a New Organization</p>
                    <input
                      type="text"
                      placeholder="Organization Name"
                      value={newOrgName}
                      onChange={(e) => setNewOrgName(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black"
                    />
                    <Button className="w-full" onClick={handleCreateOrganization}>
                      Create
                    </Button>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          }
        />
      </div>
      <button
        title="Open Organization"
        onClick={() => router.push(`/organizations/${selectedOrg?.id || ""}`)}
        className="p-2 hover:bg-muted rounded-md"
      >
        <Eye className="w-4 h-4 text-muted-foreground hover:text-foreground" />
      </button>
    </div>
  )}
</SidebarHeader>

      <SidebarContent>
        {navMain.map((section) => (
          <NavMain key={section.title} items={section.items} title={section.title} />
        ))}
      </SidebarContent>

      <SidebarFooter>
        {user && <NavUser user={user} />}
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}