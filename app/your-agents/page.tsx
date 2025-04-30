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
import { Bug, User2, Bot, Clock3 } from "lucide-react"
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

  useEffect(() => {
    const fetchData = async () => {
      const stored = localStorage.getItem("user")
      if (!stored) return

      const parsed = JSON.parse(stored)

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
    <>
      <style>{`
        @keyframes glow {
          0% { box-shadow: 0 0 0px rgba(0,0,0,0); }
          50% { box-shadow: 0 0 12px rgba(0,0,0,0.4); }
          100% { box-shadow: 0 0 0px rgba(0,0,0,0); }
        }
        .glow-button {
          animation: glow 3s ease-in-out infinite;
        }
      `}</style>

      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="#">Your Agents</BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>

          <div className="flex flex-col gap-4 px-6 pb-10">
            <h1 className="text-2xl font-semibold">Your Agents</h1>

            <div className="border border-gray-200 bg-white rounded-xl p-6 shadow-sm text-center">
  <h2 className="text-lg font-semibold mb-3">Agent Management</h2>
  <p className="text-sm text-muted-foreground mb-6 mx-auto">
    All agent management actions require admin support. Estimated response time is shown on each option.
  </p>

  <div className="flex justify-center mb-4">
    <div className="flex gap-4">
      <Button className="glow-button flex flex-col items-center justify-center gap-1 w-56 h-14">
        <span>Onboard New Agent</span>
        <span className="flex gap-1 text-xs text-muted-foreground">
          <Clock3 size={14} /> 1 Hour Response
        </span>
      </Button>
      <Button className="glow-button flex flex-col items-center justify-center gap-1 w-56 h-14">
        <span>Update Your Agent</span>
        <span className="flex gap-1 text-xs text-muted-foreground">
          <Clock3 size={14} /> 10 Hour Response
        </span>
      </Button>
    </div>
  </div>

  <div className="flex justify-center">
    <Button className="glow-button flex flex-col items-center justify-center gap-1 w-56 h-14">
      <span>Remove Your Agent</span>
      <span className="flex gap-1 text-xs text-muted-foreground">
        <Clock3 size={14} /> 3 Hour Response
      </span>
    </Button>
  </div>
</div>

            <h2 className="text-xl font-semibold mt-8">Bug Reports</h2>

            {bugs.length === 0 ? (
              <p className="text-sm text-muted-foreground mt-2">No bugs found for your agents.</p>
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
        </SidebarInset>
      </SidebarProvider>
    </>
  )
}