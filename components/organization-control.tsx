"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, GalleryVerticalEnd, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { TeamSwitcher } from "@/components/team-switcher"

export default function OrganizationControl() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [orgs, setOrgs] = useState<any[]>([])
  const [selectedOrg, setSelectedOrg] = useState<any>(null)

  const [showDialog, setShowDialog] = useState(false)
  const [inviteToken, setInviteToken] = useState("")
  const [newOrgName, setNewOrgName] = useState("")
  const [joinMode, setJoinMode] = useState<"join" | "create">("join")
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      const stored = localStorage.getItem("user")
      if (!stored) return
      const parsed = JSON.parse(stored)

      const res = await fetch(`http://localhost:8000/users/get_user?email=${parsed.email}`)
      const fullUser = await res.json()
      setUser(fullUser)

      const orgRes = await fetch(`http://localhost:8000/users/get_your_organizations?user_id=${fullUser.id}`)
      const data = await orgRes.json()
      const formatted = data.map((org: any) => ({
        name: org.name,
        id: org.id,
        logo: GalleryVerticalEnd,
        plan: org.status === "admin" ? "Admin" : "Member",
      }))

      setOrgs(formatted)

      const storedOrg = parsed.organization || formatted[0]?.id
      setSelectedOrg(formatted.find((o) => o.id === storedOrg) || formatted[0])

      localStorage.setItem("user", JSON.stringify({ ...parsed, organization: storedOrg }))
    }

    loadData()
  }, [])

  const handleJoin = async () => {
    try {
      const res = await fetch("http://localhost:8000/users/join_organization", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id, invite_token: inviteToken }),
      })

      const data = await res.json()
      if (!res.ok) return setStatusMessage(data.detail || "Failed to join organization")

      localStorage.setItem("user", JSON.stringify({ ...user, organization: data.organization_id }))
      location.reload()
    } catch (err) {
      setStatusMessage("Something went wrong.")
    }
  }

  const handleCreate = async () => {
    try {
      const res = await fetch("http://localhost:8000/organizations/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newOrgName,
          admin_id: user.id,
          wallet: 0,
        }),
      })

      const data = await res.json()
      if (!res.ok) return setStatusMessage("Failed to create organization")

      localStorage.setItem("user", JSON.stringify({ ...user, organization: data.id }))
      setShowDialog(false)
      location.reload()
    } catch (err) {
      setStatusMessage("Something went wrong.")
    }
  }

  if (!user) return null

  return (
    <div className="flex items-center justify-between gap-2">
      {orgs.length > 0 ? (
        <>
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
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Plus size={16} className="mr-2" /> Join or Create
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Join or Create Organization</DialogTitle>
                    </DialogHeader>
                    <div className="flex gap-2 mt-4">
                      <Button
                        variant={joinMode === "join" ? "default" : "outline"}
                        className="w-1/2"
                        onClick={() => setJoinMode("join")}
                      >
                        Join
                      </Button>
                      <Button
                        variant={joinMode === "create" ? "default" : "outline"}
                        className="w-1/2"
                        onClick={() => setJoinMode("create")}
                      >
                        Create
                      </Button>
                    </div>
                    <div className="mt-4 space-y-4">
                      {joinMode === "join" ? (
                        <>
                          <input
                            placeholder="Invite Token"
                            value={inviteToken}
                            onChange={(e) => setInviteToken(e.target.value)}
                            className="w-full px-3 py-2 border rounded text-sm"
                          />
                          <Button className="w-full" onClick={handleJoin}>
                            Join
                          </Button>
                        </>
                      ) : (
                        <>
                          <input
                            placeholder="Organization Name"
                            value={newOrgName}
                            onChange={(e) => setNewOrgName(e.target.value)}
                            className="w-full px-3 py-2 border rounded text-sm"
                          />
                          <Button className="w-full" onClick={handleCreate}>
                            Create
                          </Button>
                        </>
                      )}
                      {statusMessage && (
                        <p className="text-sm text-red-600">{statusMessage}</p>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              }
            />
          </div>
          <button
            title="Open Organization"
            onClick={() => router.push(`/organizations/${selectedOrg?.id}`)}
            className="p-2 hover:bg-muted rounded-md"
          >
            <Eye className="w-4 h-4 text-muted-foreground hover:text-foreground" />
          </button>
        </>
      ) : (
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="w-full justify-start">
              <Plus size={16} className="mr-2" /> Join or Create
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Join or Create Organization</DialogTitle>
            </DialogHeader>
            <div className="flex gap-2 mt-4">
              <Button
                variant={joinMode === "join" ? "default" : "outline"}
                className="w-1/2"
                onClick={() => setJoinMode("join")}
              >
                Join
              </Button>
              <Button
                variant={joinMode === "create" ? "default" : "outline"}
                className="w-1/2"
                onClick={() => setJoinMode("create")}
              >
                Create
              </Button>
            </div>
            <div className="mt-4 space-y-4">
              {joinMode === "join" ? (
                <>
                  <input
                    placeholder="Invite Token"
                    value={inviteToken}
                    onChange={(e) => setInviteToken(e.target.value)}
                    className="w-full px-3 py-2 border rounded text-sm"
                  />
                  <Button className="w-full" onClick={handleJoin}>
                    Join
                  </Button>
                </>
              ) : (
                <>
                  <input
                    placeholder="Organization Name"
                    value={newOrgName}
                    onChange={(e) => setNewOrgName(e.target.value)}
                    className="w-full px-3 py-2 border rounded text-sm"
                  />
                  <Button className="w-full" onClick={handleCreate}>
                    Create
                  </Button>
                </>
              )}
              {statusMessage && (
                <p className="text-sm text-red-600">{statusMessage}</p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}