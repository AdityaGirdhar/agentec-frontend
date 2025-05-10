'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, Plus } from "lucide-react"

import { AppSidebar } from "@/components/app-sidebar"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList } from "@/components/ui/breadcrumb"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import JoinCreateOrganizationModal from "@/components/modal/join-create-organization"

export default function OrganizationsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [orgs, setOrgs] = useState<any[]>([])
  const [showDialog, setShowDialog] = useState(false)
  const [loading, setLoading] = useState(true)

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
        plan: org.status === "admin" ? "Admin" : "Member",
      }))
      setOrgs(formatted)
      setLoading(false)
    }

    load()
  }, [])

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="relative flex h-16 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="#">Organizations</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="px-6 pb-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Organizations</h2>
            <Button size="sm" onClick={() => setShowDialog(true)}>
              <Plus size={16} className="mr-1" /> Join or Create
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center pt-12">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-black border-t-transparent" />
            </div>
          ) : orgs.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              You are not part of any organizations yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {orgs.map((org) => (
                <div
                  key={org.id}
                  className="border border-gray-200 bg-white rounded-xl shadow-sm p-6 flex flex-col justify-between"
                >
                  <div>
                    <h3 className="text-lg font-semibold">{org.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{org.plan}</p>
                  </div>
                  <div className="mt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/organizations/${org.id}`)}
                    >
                      <Eye size={16} className="mr-1" />
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {user && (
          <JoinCreateOrganizationModal open={showDialog} setOpen={setShowDialog} user={user} />
        )}
      </SidebarInset>
    </SidebarProvider>
  )
}