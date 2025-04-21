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

interface OnboardedAgent {
  id: string
  name: string
  description: string
  developer_contact: string
  url: string
}

export default function AgentOnboardingListPage() {
  const [agents, setAgents] = useState<OnboardedAgent[]>([])

  useEffect(() => {
    const fetchOnboardedAgents = async () => {
      try {
        const res = await fetch("http://localhost:8000/agents/fetch_all_onboarding_info")
        const data = await res.json()
        setAgents(data)
      } catch (err) {
        console.error("Failed to fetch onboarding info", err)
      }
    }

    fetchOnboardedAgents()
  }, [])

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
                <BreadcrumbLink href="#">Tools</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem>
                <BreadcrumbLink href="#">Onboarding Info</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="flex flex-col gap-4 px-6 pb-10 pt-2">
          <h1 className="text-2xl font-semibold mb-2">Agents to Onboard</h1>

          {agents.length === 0 ? (
            <p className="text-sm text-muted-foreground mt-4">No onboarded agents found.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {agents.map(agent => (
                <div
                  key={agent.id}
                  className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition"
                >
                  <div className="mb-2">
                    <h2 className="text-lg font-semibold text-gray-900">{agent.name}</h2>
                    <p className="text-sm text-muted-foreground">{agent.description}</p>
                  </div>
                  <div className="text-sm text-gray-700 mt-3 space-y-1">
                    <div>
                      <span className="font-medium">Contact:</span> {agent.developer_contact}
                    </div>
                    <div>
                      <span className="font-medium">URL:</span>{" "}
                      <a
                        href={agent.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {agent.url}
                      </a>
                    </div>
                    <div className="text-xs text-muted-foreground pt-2">ID: {agent.id}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}