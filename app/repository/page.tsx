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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff, Copy, Share, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"

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

  // Form state for modal
  const [keyName, setKeyName] = useState("")
  const [provider, setProvider] = useState("")
  const [secretKey, setSecretKey] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [showHelpModal, setShowHelpModal] = useState(false)

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
              <BreadcrumbItem>
                <BreadcrumbLink href="#">Repository</BreadcrumbLink>
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

        <div className="flex flex-col gap-8 px-6 pb-10">
          <div>
            <h2 className="text-xl font-semibold mb-4">Your Agents</h2>
            {agents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No agents found.</p>
            ) : (
              <div className="rounded-xl overflow-hidden border">
                <table className="w-full text-sm border-collapse table-fixed">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="text-left p-3 w-1/3">Name</th>
                      <th className="text-left p-3 w-1/3">Provider</th>
                      <th className="text-left p-3 w-1/3">Cost</th>
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
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Your Keys</h2>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus size={16} className="mr-1" /> Add Key
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-sm">
                  <DialogHeader>
                    <DialogTitle>Add API Key</DialogTitle>
                  </DialogHeader>
                  <div className="flex flex-col gap-4 py-2">
                    <Input placeholder="Key Name" value={keyName} onChange={e => setKeyName(e.target.value)} />
                    <Select value={provider} onValueChange={setProvider}>
                      <SelectTrigger><SelectValue placeholder="Choose Provider" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="OpenAI">OpenAI</SelectItem>
                        <SelectItem value="Anthropic">Anthropic</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="relative">
                      <Input
                        placeholder="API Key"
                        type={showKey ? "text" : "password"}
                        value={secretKey}
                        onChange={e => setSecretKey(e.target.value)}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-2 text-muted-foreground"
                        onClick={() => setShowKey(prev => !prev)}
                      >
                        {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <Button
                      className="w-full mt-2"
                      onClick={handleAddKey}
                      disabled={!keyName || !provider || !secretKey}
                    >
                      Add
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {keys.length === 0 ? (
              <p className="text-sm text-muted-foreground">No keys found.</p>
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
                    {keys.map((key) => {
                      const isRevealed = revealedKey[key.id]
                      const masked = "•".repeat(key.key.length)
                      return (
                        <tr key={key.id} className="border-t hover:bg-gray-50">
                          <td className="p-3">{key.name}</td>
                          <td className="p-3">{key.provider}</td>
                          <td className="p-3 font-mono">
                            <div className="flex justify-between items-center bg-gray-100 px-3 py-1.5 rounded-md">
                              <span className="truncate">{isRevealed ? key.key : masked}</span>
                              <button
                                className="ml-2 text-muted-foreground hover:text-black"
                                onClick={() => toggleReveal(key.id)}
                              >
                                {isRevealed ? <EyeOff size={16} /> : <Eye size={16} />}
                              </button>
                            </div>
                          </td>
                          <td className="p-3 flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(key.key)}
                              title="Copy to clipboard"
                            >
                              <Copy size={16} />
                            </Button>
                            {/* <Button size="sm" variant="ghost" title="Share Key">
                              <Share size={16} />
                            </Button> */}
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
        {showHelpModal && (
  <div className="fixed inset-0 z-50 bg-black bg-opacity-30 flex items-center justify-center">
    <div className="bg-white rounded-lg p-6 w-full max-w-xl shadow-xl relative">
      <h2 className="text-lg font-semibold mb-4">Help - Repository</h2>
      <div className="space-y-4 text-sm text-muted-foreground">
        <p><strong>Your Agents:</strong> This section displays agents you’ve created or saved. You can view their name, providers, and cost per execution.</p>
        <p><strong>Your Keys:</strong> Manage API keys linked to your profile. You can add, reveal, and copy them securely.</p>
        <p><strong>Reveal/Hide:</strong> Use the eye icon to toggle visibility of your stored key values.</p>
        <p><strong>Copy:</strong> Quickly copy any key by clicking the copy icon.</p>
        <p><strong>Add Key:</strong> Use the 'Add Key' button to input a new provider key and store it in your profile.</p>
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