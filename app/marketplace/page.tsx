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
  ExternalLink
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

interface Agent {
  agent_id: string
  name: string
  description: string
  tags: string
  supported_providers: string[]
  developer_contact: string
  cost_per_execution: string
}

interface Tool {
  id: string
  name: string
  description: string
  provider: string
  base_url: string
  official_docs_url: string
}

export default function MarketplacePage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [tools, setTools] = useState<Tool[]>([])
  const [savedAgents, setSavedAgents] = useState<Set<string>>(new Set())
  const [userId, setUserId] = useState<string | null>(null)
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)
  const [bugName, setBugName] = useState("")
  const [bugDescription, setBugDescription] = useState("")
  const [openDialog, setOpenDialog] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [view, setView] = useState<"agents" | "tools">("agents")
  const [showHelpModal, setShowHelpModal] = useState(false)

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

    fetch("http://localhost:8000/marketplace/get-all-tools")
      .then(res => res.json())
      .then(setTools)
      .catch(err => console.error("Failed to fetch tools", err))
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

  const handleSubmitBug = async () => {
    if (!userId || !selectedAgentId || !bugName || !bugDescription) return
    try {
      await fetch("http://localhost:8000/agents/create_bug", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          agent_id: selectedAgentId,
          reported_user_id: userId,
          name: bugName,
          description: bugDescription,
          status: "open"
        }),
      })
      setOpenDialog(false)
      setBugName("")
      setBugDescription("")
    } catch (err) {
      console.error("Failed to report bug", err)
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="relative flex h-16 shrink-0 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="#">Marketplace</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <Button
            size="sm"
            variant="outline"
            className="absolute right-4"
            onClick={() => setShowHelpModal(true)}
          >
            Help
          </Button>
        </header>

        <div className="flex flex-col gap-4 px-6 pb-10">
          <h1 className="text-2xl font-semibold pt-2">Marketplace</h1>

          <div className="flex flex-col md:flex-row gap-4 items-center mb-4">
            <Input
              type="text"
              placeholder="Search agents or tools..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full max-w-md"
            />
            <ToggleGroup
              type="single"
              value={view}
              onValueChange={(value) => value && setView(value as "agents" | "tools")}
            >
              <ToggleGroupItem value="agents">Agents</ToggleGroupItem>
              <ToggleGroupItem value="tools">Tools</ToggleGroupItem>
            </ToggleGroup>
          </div>

          {view === "agents" && (
            <div className="grid gap-6 grid-cols-1">
              {agents
                .filter(agent => {
                  const query = searchTerm.toLowerCase()
                  return (
                    agent.name.toLowerCase().includes(query) ||
                    agent.description.toLowerCase().includes(query) ||
                    agent.tags.toLowerCase().includes(query)
                  )
                })
                .map(agent => {
                  const isSaved = savedAgents.has(agent.agent_id)
                  return (
                    <div
                      key={agent.agent_id}
                      className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 hover:shadow-md transition flex justify-between"
                    >
                      <div className="flex-1 pr-6 flex flex-col gap-2">
                        <h2 className="text-xl font-bold text-gray-900 mt-1">
                          {agent.name.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
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
                          <span className="font-medium text-gray-800">Supported Provider (s):</span> {agent.supported_providers.join(", ")}
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
                        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-2"
                              onClick={() => setSelectedAgentId(agent.agent_id)}
                            >
                              <Bug size={16} /> Report Bug
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle>Report Bug</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <Input
                                placeholder="Bug Title"
                                value={bugName}
                                onChange={(e) => setBugName(e.target.value)}
                              />
                              <Textarea
                                placeholder="Bug Description"
                                value={bugDescription}
                                onChange={(e) => setBugDescription(e.target.value)}
                              />
                              <Button
                                onClick={handleSubmitBug}
                                disabled={!bugName || !bugDescription}
                              >
                                Submit
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Button
                          variant={isSaved ? "outline" : "default"}
                          size="sm"
                          disabled={isSaved}
                          onClick={() => handleSave(agent.agent_id)}
                        >
                          {isSaved ? "Already in Repository" : "Save to Repository"}
                        </Button>
                      </div>
                    </div>
                  )
                })}
            </div>
          )}

          {view === "tools" && (
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
              {tools
                .filter(tool => {
                  const query = searchTerm.toLowerCase()
                  return (
                    tool.name.toLowerCase().includes(query) ||
                    tool.description.toLowerCase().includes(query) ||
                    tool.provider.toLowerCase().includes(query)
                  )
                })
                .map(tool => (
                  <div
                    key={tool.id}
                    className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div className="flex-1 flex flex-col gap-2">
                      <h2 className="text-xl font-bold text-gray-900">{tool.name}</h2>
                      <p className="text-gray-700 text-sm">{tool.description}</p>
                      <p className="text-sm text-muted-foreground">
                        Provider: <span className="font-medium">{tool.provider}</span>
                      </p>
                      <p className="text-sm truncate text-blue-600">{tool.base_url}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4 flex items-center gap-1"
                      asChild
                    >
                      <a href={tool.official_docs_url} target="_blank" rel="noopener noreferrer">
                        View Docs <ExternalLink size={14} />
                      </a>
                    </Button>
                  </div>
                ))}
            </div>
          )}
        </div>

        {showHelpModal && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-30 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-full max-w-xl shadow-xl relative">
              <h2 className="text-lg font-semibold mb-4">Help - Marketplace</h2>
              <div className="space-y-4 text-sm text-muted-foreground">
                <p><strong>Search:</strong> Filter agents or tools using the search box.</p>
                <p><strong>Agents:</strong> Save to repository or report bugs for specific agents.</p>
                <p><strong>Tools:</strong> Explore available tools, and visit their documentation directly.</p>
              </div>
              <Button
                className="absolute top-3 right-3 text-sm px-2 py-1"
                variant="ghost"
                onClick={() => setShowHelpModal(false)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </SidebarInset>
    </SidebarProvider>
  )
}