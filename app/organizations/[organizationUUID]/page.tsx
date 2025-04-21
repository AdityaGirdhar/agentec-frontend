'use client'

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { Copy, DollarSign, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface User {
  id: string
  name: string
  email: string
  picture: string
}

interface OrganizationData {
  id: string
  name: string
  wallet: number
  invite_token: string
  admin: User
  members: User[]
}

export default function OrganizationPage() {
  const params = useParams()
  const orgId = params.organizationUUID as string 
  const [org, setOrg] = useState<OrganizationData | null>(null)

  useEffect(() => {
    if (!orgId) return

    fetch(`http://localhost:8000/organizations/get_organization_details?org_id=${orgId}`)
      .then(res => res.json())
      .then(setOrg)
      .catch(err => console.error("Failed to fetch organization", err))
  }, [orgId])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="#">Organization</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="flex flex-col gap-6 px-6 pb-10">
          <h1 className="text-2xl font-semibold pt-2">Organization</h1>

          {!org ? (
            <p className="text-sm text-muted-foreground mt-4">Loading organization details...</p>
          ) : (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">{org.name}</h2>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Wallet:</span>
                    <span className="text-green-600 font-semibold">
                      ${org.wallet.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Invite Token:</span>
                    <code className="bg-muted px-2 py-1 rounded text-sm">
                      {org.invite_token}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard(org.invite_token)}
                      title="Copy to clipboard"
                    >
                      <Copy size={16} />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold mb-4">Members</h3>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="border rounded-lg p-3 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full overflow-hidden">
                      {org.admin.picture ? (
                        <Image
                          src={org.admin.picture}
                          alt="Admin"
                          width={40}
                          height={40}
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 flex items-center justify-center bg-gray-200 text-xs text-gray-500">
                          {org.admin.name[0]}
                        </div>
                      )}
                    </div>
                    <div className="text-sm">
                      <div className="font-medium">{org.admin.name}</div>
                      <div className="text-muted-foreground">{org.admin.email}</div>
                      <Badge className="mt-1" variant="secondary">Admin</Badge>
                    </div>
                  </div>

                  {org.members.map((member) => (
                    <div key={member.id} className="border rounded-lg p-3 flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full overflow-hidden">
                        {member.picture ? (
                          <Image
                            src={member.picture}
                            alt={member.name}
                            width={40}
                            height={40}
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 flex items-center justify-center bg-gray-200 text-xs text-gray-500">
                            {member.name[0]}
                          </div>
                        )}
                      </div>
                      <div className="text-sm">
                        <div className="font-medium">{member.name}</div>
                        <div className="text-muted-foreground">{member.email}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}