"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, GalleryVerticalEnd, Plus } from "lucide-react"

import { TeamSwitcher } from "@/components/team-switcher"
import { Button } from "@/components/ui/button"
import JoinCreateOrganizationModal from "@/components/modal/join-create-organization"

export default function OrganizationControl() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [orgs, setOrgs] = useState<any[]>([])
  const [selectedOrg, setSelectedOrg] = useState<any>(null)
  const [showDialog, setShowDialog] = useState(false)

  useEffect(() => {
    const load = async () => {
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

      const activeOrg = parsed.organization || formatted[0]?.id
      setSelectedOrg(formatted.find((o: any) => o.id === activeOrg) || formatted[0])
      localStorage.setItem("user", JSON.stringify({ ...parsed, organization: activeOrg }))
    }

    load()
  }, [])

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
                <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => setShowDialog(true)}>
                  <Plus size={16} className="mr-2" /> Join or Create
                </Button>
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
        <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => setShowDialog(true)}>
          <Plus size={16} className="mr-2" /> Join or Create
        </Button>
      )}

      <JoinCreateOrganizationModal open={showDialog} setOpen={setShowDialog} user={user} />
    </div>
  )
}