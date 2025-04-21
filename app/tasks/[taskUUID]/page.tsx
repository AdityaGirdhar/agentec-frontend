'use client'

import { useEffect, useState, useRef } from "react"
import { useParams } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset, SidebarProvider, SidebarTrigger
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Pencil, Download, Trash2, Share2 } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export default function TaskPage() {
  const { taskUUID } = useParams()
  const [task, setTask] = useState<any>(null)
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState("")
  const [prompt, setPrompt] = useState("")
  const [markdownText, setMarkdownText] = useState("")
  const [renderCode, setRenderCode] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [agents, setAgents] = useState<any[]>([])
  const [keys, setKeys] = useState<any[]>([])
  const [selectedAgent, setSelectedAgent] = useState("")
  const [selectedKey, setSelectedKey] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [managementMode, setManagementMode] = useState(false)
  const pdfRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchData = async () => {
      const storedUser = localStorage.getItem("user")
      if (!storedUser) return
  
      const parsed = JSON.parse(storedUser)
      setUserEmail(parsed.email)
  
      try {
        // ✅ Fetch keys using user_id
        const keysRes = await fetch(`http://localhost:8000/users/get_keys?user_id=${parsed.id}`)
        const keysData = await keysRes.json()
        setKeys(Array.isArray(keysData) ? keysData : [])
  
        // ✅ Fetch saved agent IDs
        const savedAgentsRes = await fetch(`http://localhost:8000/users/get_saved_agents?user_id=${parsed.id}`)
        const savedAgentIds: string[] = await savedAgentsRes.json()
  
        // ✅ Fetch each agent's info
        const agentDetails = await Promise.all(
          savedAgentIds.map(async (agentId) => {
            const res = await fetch(`http://localhost:8000/agents/get_agent_info?agent_id=${agentId}`)
            return res.ok ? await res.json() : null
          })
        )
  
        setAgents(agentDetails.filter(Boolean))
      } catch (err) {
        console.error("Failed to fetch keys or agents", err)
        setAgents([])
        setKeys([])
      }
    }
  
    fetchData()
  
    if (taskUUID) {
      fetch(`http://localhost:8000/tasks/get-task-info?task_id=${taskUUID}`)
        .then(res => res.json())
        .then(data => {
          setTask(data)
          setName(data.name)
        })
        .catch(() => console.error("Failed to load task info"))
    }
  }, [taskUUID])

  const handleEditName = async () => {
    try {
      await fetch("http://localhost:8000/tasks/edit-task-name", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ id: taskUUID, new_name: name }),
      })
      setEditing(false)
    } catch (err) {
      console.error("Failed to update name")
    }
  }

  const handleDownloadPDF = async () => {
    const html2pdf = (await import("html2pdf.js")).default
    if (!pdfRef.current) return
    html2pdf().from(pdfRef.current).set({
      margin: 0.5,
      filename: `${name || "task"}.pdf`,
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    }).save()
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex flex-col h-screen w-full">
          <header className="flex h-16 items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/tasks">Tasks</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{name || "Untitled"}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>

          <div className="flex-1 flex flex-col gap-4 px-6 ">
  <div className="rounded-xl bg-muted/50 p-4">
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
      {editing ? (
          <div className="flex gap-2">
            <Input value={name} onChange={(e) => setName(e.target.value)} />
            <Button onClick={handleEditName} size="sm">Save</Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setName(task?.name || "")
                setEditing(false)
              }}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            {name}
            <Button variant="ghost" size="icon" onClick={() => setEditing(true)}>
              <Pencil size={16} />
            </Button>
          </h1>
        )}
        <div className="flex gap-2 ml-4">
          <Button size="sm" variant="outline"><Share2 size={16} /></Button>
          <Button size="sm" variant="outline" onClick={handleDownloadPDF}><Download size={16} /></Button>
          <Button size="sm" variant="outline" className="text-red-600 border-red-300"><Trash2 size={16} /></Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Label htmlFor="mode-toggle" className="text-sm">Management</Label>
        <Switch
          id="mode-toggle"
          checked={managementMode}
          onCheckedChange={setManagementMode}
        />
      </div>
    </div>
  </div>

  <div className="flex-1 flex flex-col mb-4">
  <div className="flex-1 rounded-xl bg-muted/50 p-4">
    {!managementMode ? (
      <div className="flex flex-col h-full gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select onValueChange={setSelectedAgent}>
  <SelectTrigger>
    <SelectValue placeholder="Choose an agent" />
  </SelectTrigger>
  <SelectContent>
    {agents.length > 0 ? (
      agents.map((agent) => (
        <SelectItem key={agent.id} value={agent.id}>
          {agent.name.replace(/_/g, " ")}
        </SelectItem>
      ))
    ) : (
      <div className="text-sm text-muted-foreground px-3 py-1">No agents found</div>
    )}
  </SelectContent>
</Select>

<Select onValueChange={setSelectedKey}>
  <SelectTrigger>
    <SelectValue placeholder="Choose a key" />
  </SelectTrigger>
  <SelectContent>
    {keys.length > 0 ? (
      keys.map((key) => (
        <SelectItem key={key.id} value={key.id}>
          {key.name}
        </SelectItem>
      ))
    ) : (
      <div className="text-sm text-muted-foreground px-3 py-1">No keys found</div>
    )}
  </SelectContent>
</Select>
        </div>

        <div className="relative flex-1 overflow-hidden">
  <div className="flex h-full">
  <div className="w-full rounded-xl p-4 h-full overflow-y-auto scrollbar-thin bg-white pb-32">
      {loading ? (
        <div className="text-muted-foreground text-lg text-center flex justify-center items-center h-full animate-pulse">
          Loading output...
        </div>
      ) : markdownText ? (
        <>
          <ReactMarkdown className="prose w-full max-w-full text-left">
            {markdownText}
          </ReactMarkdown>
          {renderCode.map((html, index) => (
            <div
              key={index}
              className="mt-6 border rounded-lg p-4 bg-white"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          ))}
        </>
      ) : (
      <div className="text-muted-foreground text-lg text-center flex justify-center items-center h-full w-full px-4">
          No Task Output
        </div>
      )}
    </div>
  </div>

  {/* Fixed prompt input at the bottom */}
  <div className="absolute bottom-0 left-0 w-full py-2 border-t bg-muted/50">
    <div className="flex items-center gap-2">
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Ask something..."
        className="flex-1 resize-none rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring overflow-y-auto scrollbar-thin"
      />
      <Button
        className="bg-black text-white hover:bg-black/90"
        onClick={() => {}}
        disabled={loading}
      >
        Send
      </Button>
    </div>
  </div>
</div>
      </div>
    ) : (
      <div className="flex-1 rounded-xl bg-muted/50 text-muted-foreground text-center flex items-center justify-center h-full">
        Management View (coming soon)
      </div>
    )}
  </div>
</div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}