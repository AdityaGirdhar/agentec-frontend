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
import { Badge } from "@/components/ui/badge"
import { Bug, User2, Bot } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"

interface BugItem {
  name: string
  id: string
  status: string
  reported_user_id: string
  description: string
  agent_id: string
}

interface User {
  id: string
  name: string
  email: string
}

interface Agent {
  id: string
  name: string
}

export default function ToolsPage() {
  const [bugs, setBugs] = useState<BugItem[]>([])
  const [users, setUsers] = useState<{ [key: string]: User }>({})
  const [agents, setAgents] = useState<{ [key: string]: Agent }>({})
  const [statusMap, setStatusMap] = useState<{ [key: string]: string }>({})
  const [userId, setUserId] = useState<string | null>(null)
  const [showOnboardingModal, setShowOnboardingModal] = useState(false)
  const [onboardingForm, setOnboardingForm] = useState({
    name: "",
    description: "",
    developer_contact: "",
    url: ""
  })

  useEffect(() => {
    const fetchData = async () => {
      const stored = localStorage.getItem("user")
      if (!stored) return

      const parsed = JSON.parse(stored)
      setUserId(parsed.id)

      const agentRes = await fetch(`http://localhost:8000/users/get-agents?user_id=${parsed.id}`)
      const agentList: Agent[] = await agentRes.json()
      const agentMap: any = {}

      const allBugs: BugItem[] = []
      for (const agent of agentList) {
        agentMap[agent.id] = agent
        const bugRes = await fetch(`http://localhost:8000/agents/fetch_bugs?agent_id=${agent.id}`)
        const bugsForAgent = await bugRes.json()
        allBugs.push(...bugsForAgent)
      }

      setAgents(agentMap)
      setBugs(allBugs)
      setStatusMap(Object.fromEntries(allBugs.map(b => [b.id, b.status])))

      const userIds = new Set(allBugs.map(b => b.reported_user_id))
      const userMap: any = {}
      await Promise.all(Array.from(userIds).map(async (uid) => {
        const res = await fetch(`http://localhost:8000/users/get_user_info?user_id=${uid}`)
        const data = await res.json()
        userMap[uid] = data
      }))
      setUsers(userMap)
    }

    fetchData()
  }, [])

  const updateBugStatus = async (bugId: string, newStatus: string) => {
    try {
      await fetch("http://localhost:8000/agents/bug_status_update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ bug_id: bugId, status: newStatus }),
      })
    } catch (err) {
      console.error("Failed to update bug status", err)
    }
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
                <BreadcrumbLink href="#">Tools</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="flex flex-col gap-4 px-6 pb-10">
          <div className="flex items-center justify-between pt-2">
            <h1 className="text-2xl font-semibold">Bug Reports</h1>
            <Button onClick={() => setShowOnboardingModal(true)}>
              Initiate Agent Onboarding
            </Button>
          </div>

          {bugs.length === 0 ? (
            <p className="text-sm text-muted-foreground mt-4">No bugs found for your agents.</p>
          ) : (
            <div className="space-y-4">
              {bugs.map((bug) => {
                const user = users[bug.reported_user_id]
                const agent = agents[bug.agent_id]
                return (
                  <div
                    key={bug.id}
                    className="border rounded-xl p-4 bg-white shadow-sm hover:shadow transition"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-sm text-gray-800">
                        <Bug className="w-4 h-4 text-red-600" />
                        <span className="font-medium text-base">{bug.name}</span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-4">{bug.description}</p>

                    <div className="flex justify-between items-end gap-4 flex-wrap">
                      <div className="flex flex-col gap-1 text-sm text-gray-700">
                        <div className="flex items-center gap-2">
                          <User2 className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">Reported by:</span> {user?.name}
                        </div>
                        <div className="flex items-center gap-2">
                          <Bot className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">Agent:</span> {agent?.name}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-muted-foreground">Status:</span>
                        <Select
                          value={statusMap[bug.id]}
                          onValueChange={(value) => {
                            setStatusMap((prev) => ({ ...prev, [bug.id]: value }))
                            updateBugStatus(bug.id, value)
                          }}
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {showOnboardingModal && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-30 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl relative">
              <h2 className="text-lg font-semibold mb-4">Onboard New Agent</h2>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Agent Name"
                  className="w-full border px-3 py-2 rounded-md text-sm"
                  value={onboardingForm.name}
                  onChange={(e) => setOnboardingForm({ ...onboardingForm, name: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Description"
                  className="w-full border px-3 py-2 rounded-md text-sm"
                  value={onboardingForm.description}
                  onChange={(e) => setOnboardingForm({ ...onboardingForm, description: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Developer Contact"
                  className="w-full border px-3 py-2 rounded-md text-sm"
                  value={onboardingForm.developer_contact}
                  onChange={(e) => setOnboardingForm({ ...onboardingForm, developer_contact: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="URL"
                  className="w-full border px-3 py-2 rounded-md text-sm"
                  value={onboardingForm.url}
                  onChange={(e) => setOnboardingForm({ ...onboardingForm, url: e.target.value })}
                />
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setShowOnboardingModal(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={async () => {
                    try {
                      await fetch("http://localhost:8000/agents/create_onboarding_info", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(onboardingForm),
                      })
                      setShowOnboardingModal(false)
                      setOnboardingForm({ name: "", description: "", developer_contact: "", url: "" })
                    } catch (err) {
                      console.error("Failed to create onboarding info", err)
                    }
                  }}
                >
                  Submit
                </Button>
              </div>
            </div>
          </div>
        )}
      </SidebarInset>
    </SidebarProvider>
  )
}