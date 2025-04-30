"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface JoinCreateOrganizationModalProps {
  open: boolean
  setOpen: (val: boolean) => void
  user: any
}

export default function JoinCreateOrganizationModal({
  open,
  setOpen,
  user,
}: JoinCreateOrganizationModalProps) {
  const [inviteToken, setInviteToken] = useState("")
  const [newOrgName, setNewOrgName] = useState("")
  const [joinMode, setJoinMode] = useState<"join" | "create">("join")
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const handleJoin = async () => {
    try {
      const res = await fetch("http://localhost:8000/users/join_organization", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id, invite_token: inviteToken }),
      })

      const data = await res.json()
      if (!res.ok) {
        setStatusMessage(data.detail || "Failed to join organization")
        return
      }

      localStorage.setItem("user", JSON.stringify({ ...user, organization: data.organization_id }))
      setOpen(false)
      location.reload()
    } catch {
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
      if (!res.ok) {
        setStatusMessage("Failed to create organization")
        return
      }

      localStorage.setItem("user", JSON.stringify({ ...user, organization: data.id }))
      setOpen(false)
      location.reload()
    } catch {
      setStatusMessage("Something went wrong.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
          {statusMessage && <p className="text-sm text-red-600">{statusMessage}</p>}
        </div>
      </DialogContent>
    </Dialog>
  )
}