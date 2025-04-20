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
import {
  Bug,
  Tags,
  Mail,
  DollarSign,
  DatabaseZap,
  FileSignature,
} from "lucide-react"

interface Agent {
  agent_id: string
  name: string
  description: string
  tags: string
  supported_providers: string[]
  developer_contact: string
  cost_per_execution: string
}

export default function MarketplacePage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [savedAgents, setSavedAgents] = useState<Set<string>>(new Set())
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem("user")
    if (stored) {
      const parsed = JSON.parse(stored)
      setUserId(parsed.id)
      fetch(`http://localhost:8000/users/get_saved_agents?user_id=${parsed.id}`)
        .then(res => res.json())
        .then((data: string[]) => setSavedAgents(new Set(data)))
        .catch(err => console.error("Failed to fetch saved agents", err))
    }

    fetch("http://localhost:8000/marketplace/get_all_agent_info")
      .then(res => res.json())
      .then(setAgents)
      .catch(err => console.error("Failed to fetch agents", err))
  }, [])

  const handleSave = async (agentId: string) => {
    if (!userId) return
    try {
      await fetch("http://localhost:8000/users/save_agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ user_id: userId, agent_id: agentId }),
      })
      setSavedAgents((prev) => new Set(prev).add(agentId))
    } catch (err) {
      console.error("Failed to save agent", err)
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="#">Marketplace</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="flex flex-col gap-4 px-6 pb-10">
          <h1 className="text-2xl font-semibold pt-2">Marketplace</h1>

          <div className="grid gap-6 grid-cols-1">
            {agents.map((agent) => {
              const isSaved = savedAgents.has(agent.agent_id)
              return (
                <div
                  key={agent.agent_id}
                  className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 hover:shadow-md transition flex justify-between"
                >
                  <div className="flex-1 pr-6 flex flex-col gap-2">
                    <h2 className="text-xl font-bold text-gray-900 mt-1">
                      {agent.name.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                    </h2>
                    <p className="text-gray-700 text-sm">{agent.description}</p>

                    <div className="text-sm mt-2 flex items-start gap-2">
                      <Tags className="w-4 h-4 text-muted-foreground mt-1" />
                      <div className="flex flex-wrap gap-2">
                        {agent.tags.split(",").map((tag, idx) => (
                          <span
                            key={idx}
                            className="bg-black text-white px-2 py-1 rounded-full text-xs font-medium"
                          >
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-sm flex items-center gap-2">
                      <DatabaseZap className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium text-gray-800">Supported Providers:</span> {agent.supported_providers.join(", ")}
                    </div>
                    <div className="text-sm flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium text-gray-800">Developer Contact:</span> {agent.developer_contact}
                    </div>
                    <div className="text-sm flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium text-gray-800">Cost per Execution:</span> ${agent.cost_per_execution}
                    </div>
                  </div>

                  <div className="flex flex-col justify-between items-end gap-2">
                    <div className="flex flex-col gap-2">
                      <Button variant="outline" size="sm" className="flex items-center gap-2">
                        <Bug size={16} /> Report Bug
                      </Button>
                    </div>
                    <Button
                      variant={isSaved ? "outline" : "default"}
                      size="sm"
                      disabled={isSaved}
                      onClick={() => handleSave(agent.agent_id)}
                      className="mt-4"
                    >
                      {isSaved ? "Already in Repository" : "Save to Repository"}
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}