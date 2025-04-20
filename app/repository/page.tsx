'use client'

import { useEffect, useState } from "react"
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
import { Button } from "@/components/ui/button"
import { Eye, EyeOff } from "lucide-react"

interface Agent {
  id: string
  name: string
  provider: string[]
  cost_per_execution: string
}

interface Key {
  id: string
  name: string
  provider: string
  user_id: string
  key: string
}

export default function RepositoryPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [keys, setKeys] = useState<Key[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [revealedKey, setRevealedKey] = useState<{ [keyId: string]: boolean }>({})

  useEffect(() => {
    const stored = localStorage.getItem("user")
    if (stored) {
      const parsed = JSON.parse(stored)
      setUserId(parsed.id)

      fetch(`http://localhost:8000/users/get-agents?user_id=${parsed.id}`)
        .then(res => res.json())
        .then(setAgents)
        .catch(err => console.error("Failed to fetch agents", err))

      fetch(`http://localhost:8000/users/get_keys?user_id=${parsed.id}`)
        .then(res => res.json())
        .then(setKeys)
        .catch(err => console.error("Failed to fetch keys", err))
    }
  }, [])

  const toggleReveal = (id: string) => {
    setRevealedKey(prev => ({ ...prev, [id]: !prev[id] }))
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
                <BreadcrumbLink href="#">Repository</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="flex flex-col gap-8 px-6 pb-10">
          <div>
            <h2 className="text-xl font-semibold mb-4">Your Agents</h2>
            {agents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No agents found.</p>
            ) : (
              <div className="rounded-xl overflow-hidden border">
                <table className="w-full text-sm border-collapse">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="text-left p-3">Name</th>
                      <th className="text-left p-3">Provider</th>
                      <th className="text-left p-3">Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agents.map((agent) => (
                      <tr key={agent.id} className="border-t hover:bg-gray-50">
                        <td className="p-3">{agent.name}</td>
                        <td className="p-3">{agent.provider.join(", ")}</td>
                        <td className="p-3">${agent.cost_per_execution}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Your Keys</h2>
            {keys.length === 0 ? (
              <p className="text-sm text-muted-foreground">No keys found.</p>
            ) : (
              <div className="rounded-xl overflow-hidden border">
                <table className="w-full text-sm border-collapse">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="text-left p-3">Name</th>
                      <th className="text-left p-3">Provider</th>
                      <th className="text-left p-3">Key</th>
                      <th className="text-left p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {keys.map((key) => (
                      <tr key={key.id} className="border-t hover:bg-gray-50">
                        <td className="p-3">{key.name}</td>
                        <td className="p-3">{key.provider}</td>
                        <td className="p-3 max-w-[240px] truncate">
                          {revealedKey[key.id] ? key.key : "••••••••••••••••••••••"}
                        </td>
                        <td className="p-3 flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleReveal(key.id)}
                          >
                            {revealedKey[key.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                          </Button>
                          <Button size="sm" variant="outline">Share</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}