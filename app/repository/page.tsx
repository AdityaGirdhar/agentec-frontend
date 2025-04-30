'use client'

import { useEffect, useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList } from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff, Copy, Plus, BarChart, Share2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import AgentInfoModal from "@/components/modal/agent-info"
import HelpRepositoryModal from "@/components/modal/help-repository"
import ShareKeyModal from "@/components/modal/share-key"

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
  const [showKey, setShowKey] = useState(false)
  const [keyName, setKeyName] = useState("")
  const [provider, setProvider] = useState("")
  const [secretKey, setSecretKey] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [showHelpModal, setShowHelpModal] = useState(false)
  const [viewAgentId, setViewAgentId] = useState<string | null>(null)
  const [usageModalOpen, setUsageModalOpen] = useState(false)
  const [keyShareMap, setKeyShareMap] = useState<Record<string, number>>({})
  const [activeShareKey, setActiveShareKey] = useState<string | null>(null)

  useEffect(() => {
    const fetchAgents = async (userId: string) => {
      try {
        const savedRes = await fetch(`http://localhost:8000/users/get_saved_agents?user_id=${userId}`)
        const savedAgentIds: string[] = await savedRes.json()

        const agentInfos = await Promise.all(
          savedAgentIds.map(async (id) => {
            try {
              const res = await fetch(`http://localhost:8000/agents/get_agent_info?agent_id=${id}`)
              const agentData = await res.json()
              return {
                id: agentData.id,
                name: agentData.name,
                provider: agentData.marketplace_info.supported_providers,
                cost_per_execution: agentData.marketplace_info.cost_per_execution
              }
            } catch {
              return null
            }
          })
        )

        setAgents(agentInfos.filter(Boolean) as Agent[])
      } catch (error) {
        console.error("Failed to fetch saved agents", error)
      }
    }

    const stored = localStorage.getItem("user")
    if (stored) {
      const parsed = JSON.parse(stored)
      setUserId(parsed.id)
      fetchAgents(parsed.id)

      fetch(`http://localhost:8000/users/get_keys?user_id=${parsed.id}`)
        .then(res => res.json())
        .then(setKeys)
        .catch(err => console.error("Failed to fetch keys", err))

        fetch(`http://localhost:8000/users/keys-you-shared?user_id=${parsed.id}`)
        .then(res => res.json())
        .then((shared: any[]) => {
          if (!Array.isArray(shared)) return
          const countMap: Record<string, number> = {}
          shared.forEach(entry => {
            countMap[entry.key_id] = (countMap[entry.key_id] || 0) + 1
          })
          setKeyShareMap(countMap)
        })
        .catch(err => console.error("Failed to fetch shared key info", err))
    }
  }, [])

  const toggleReveal = (id: string) => {
    setRevealedKey(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const handleAddKey = async () => {
    if (!userId) return
    const url = `http://localhost:8000/users/add_key?user_id=${userId}&name=${keyName}&provider=${provider}&key=${secretKey}`
    try {
      const res = await fetch(url, { method: "POST", headers: { Accept: "application/json" } })
      const result = await res.json()
      if (result.message === "Key added") {
        setKeys(prev => [...prev, { id: Date.now().toString(), name: keyName, provider, user_id: userId, key: secretKey }])
        setKeyName("")
        setProvider("")
        setSecretKey("")
        setDialogOpen(false)
      }
    } catch (err) {
      console.error("Error adding key", err)
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="relative flex h-16 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem><BreadcrumbLink href="#">Repository</BreadcrumbLink></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <Button size="sm" variant="outline" className="absolute right-4" onClick={() => setShowHelpModal(true)}>Help</Button>
        </header>

        <div className="flex flex-col gap-8 px-6 pb-10">
          {/* Saved Agents */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Your Saved Agents</h2>
            {agents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No saved agents found.</p>
            ) : (
              <div className="rounded-xl overflow-hidden border">
                <table className="w-full text-sm border-collapse table-fixed">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="text-left p-3 w-1/4">Name</th>
                      <th className="text-left p-3 w-1/4">Providers</th>
                      <th className="text-left p-3 w-1/4">Cost</th>
                      <th className="text-left p-3 w-1/4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agents.map(agent => (
                      <tr key={agent.id} className="border-t hover:bg-gray-50">
                        <td className="p-3">{agent.name}</td>
                        <td className="p-3">{agent.provider.join(", ")}</td>
                        <td className="p-3">${agent.cost_per_execution}</td>
                        <td className="p-3 flex gap-2">
                          <Button variant="ghost" size="sm" title="View Details" onClick={() => setViewAgentId(agent.id)}><Eye size={16} /></Button>
                          <Button variant="ghost" size="sm" title="View Usage" onClick={() => setUsageModalOpen(true)}><BarChart size={16} /></Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* API Keys */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Your API Keys</h2>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm"><Plus size={16} className="mr-1" /> Add Key</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-sm">
                  <DialogHeader><DialogTitle>Add API Key</DialogTitle></DialogHeader>
                  <div className="flex flex-col gap-4 py-2">
                    <Input placeholder="Key Name" value={keyName} onChange={e => setKeyName(e.target.value)} />
                    <Select value={provider} onValueChange={setProvider}>
                      <SelectTrigger><SelectValue placeholder="Choose Provider" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="OpenAI">OpenAI</SelectItem>
                        <SelectItem value="Anthropic">Anthropic</SelectItem>
                        <SelectItem value="GoogleGemini">GoogleGemini</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="relative">
                      <Input placeholder="API Key" type={showKey ? "text" : "password"} value={secretKey} onChange={e => setSecretKey(e.target.value)} />
                      <button type="button" className="absolute right-3 top-2 text-muted-foreground" onClick={() => setShowKey(prev => !prev)}>
                        {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <Button className="w-full mt-2" onClick={handleAddKey} disabled={!keyName || !provider || !secretKey}>Add</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {keys.length === 0 ? (
              <p className="text-sm text-muted-foreground">No API keys found.</p>
            ) : (
              <div className="rounded-xl overflow-hidden border">
                <table className="w-full text-sm border-collapse table-fixed">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="text-left p-3 w-[25%]">Name</th>
                      <th className="text-left p-3 w-[20%]">Provider</th>
                      <th className="text-left p-3 w-[40%]">Key</th>
                      <th className="text-left p-3 w-[15%]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {keys.map(key => {
                      const isRevealed = revealedKey[key.id]
                      const masked = "•".repeat(key.key.length)
                      return (
                        <tr key={key.id} className="border-t hover:bg-gray-50">
                          <td className="p-3">{key.name}</td>
                          <td className="p-3">{key.provider}</td>
                          <td className="p-3 font-mono">
                            <div className="flex justify-between items-center bg-gray-100 px-3 py-1.5 rounded-md">
                              <span className="truncate">{isRevealed ? key.key : masked}</span>
                              <button className="ml-2 text-muted-foreground hover:text-black" onClick={() => toggleReveal(key.id)}>
                                {isRevealed ? <EyeOff size={16} /> : <Eye size={16} />}
                              </button>
                            </div>
                          </td>
                          <td className="p-3 flex items-center gap-2">
                            <Button size="sm" variant="ghost" onClick={() => copyToClipboard(key.key)} title="Copy"><Copy size={16} /></Button>
                            <Button size="sm" variant="ghost" onClick={() => setActiveShareKey(key.id)} title="Share" className="relative">
                              <Share2 size={16} />
                              {keyShareMap[key.id] > 0 && (
                                <span className="absolute -top-1 -right-1 text-xs bg-blue-600 text-white rounded-full px-1.5">
                                  +{keyShareMap[key.id]}
                                </span>
                              )}
                            </Button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {showHelpModal && <HelpRepositoryModal onClose={() => setShowHelpModal(false)} />}
        {viewAgentId && <AgentInfoModal agentId={viewAgentId} onClose={() => setViewAgentId(null)} />}
        {usageModalOpen && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-30 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl relative">
              <h2 className="text-lg font-semibold mb-4">Agent Usage</h2>
              <div className="text-muted-foreground text-sm">Coming soon.</div>
              <Button className="absolute top-3 right-3 text-sm px-2 py-1" variant="ghost" onClick={() => setUsageModalOpen(false)}>Close</Button>
            </div>
          </div>
        )}
        {activeShareKey && userId && (
          <ShareKeyModal
            keyId={activeShareKey}
            onClose={() => setActiveShareKey(null)}
            onShared={() => {
              setKeyShareMap(prev => ({
                ...prev,
                [activeShareKey]: (prev[activeShareKey] || 0) + 1
              }))
            }}
          />
        )}
      </SidebarInset>
    </SidebarProvider>
  )
}