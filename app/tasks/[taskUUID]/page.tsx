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
  const [executions, setExecutions] = useState<any[]>([])
  const [selectedAgent, setSelectedAgent] = useState("")
  const [selectedKey, setSelectedKey] = useState("")
  const [userId, setUserId] = useState("")
  const [managementMode, setManagementMode] = useState(false)
  const [agentNames, setAgentNames] = useState<{ [id: string]: string }>({})
  const [keyNames, setKeyNames] = useState<{ [id: string]: string }>({})
  const pdfRef = useRef<HTMLDivElement>(null)
  const [totalCost, setTotalCost] = useState<number | null>(null)
  const [activeSharedModal, setActiveSharedModal] = useState<string | null>(null)
  const [orgMembers, setOrgMembers] = useState<any[]>([])
  const [sharedInfoMap, setSharedInfoMap] = useState<Record<string, any[]>>({})

  const enrichExecutionMetadata = async (execs: any[]) => {
    const newAgentNames: any = {}
    const newKeyNames: any = {}
  
    await Promise.all(execs.map(async (exec) => {
      if (!agentNames[exec.agent_id]) {
        const res = await fetch(`http://localhost:8000/agents/get_agent_info?agent_id=${exec.agent_id}`)
        if (res.ok) {
          const data = await res.json()
          newAgentNames[exec.agent_id] = data.name
        }
      }
      if (!keyNames[exec.key_id]) {
        const res = await fetch(`http://localhost:8000/users/get_key_info?key_id=${exec.key_id}`)
        if (res.ok) {
          const data = await res.json()
          newKeyNames[exec.key_id] = data.name
        }
      }
    }))
  
    setAgentNames(prev => ({ ...prev, ...newAgentNames }))
    setKeyNames(prev => ({ ...prev, ...newKeyNames }))
  }

  useEffect(() => {
    const fetchData = async () => {
      const storedUser = localStorage.getItem("user")
      if (!storedUser) return

      const parsed = JSON.parse(storedUser)
      setUserId(parsed.id)

      try {
        const keysRes = await fetch(`http://localhost:8000/users/get_keys?user_id=${parsed.id}`)
        const keysData = await keysRes.json()
        setKeys(Array.isArray(keysData) ? keysData : [])

        const savedAgentsRes = await fetch(`http://localhost:8000/users/get_saved_agents?user_id=${parsed.id}`)
        const savedAgentIds: string[] = await savedAgentsRes.json()

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

        fetch(`http://localhost:8000/tasks/get-executions?task_id=${taskUUID}`)
        .then(res => res.json())
        .then(data => {
          const execData = Array.isArray(data) ? data : []
          setExecutions(execData)
          enrichExecutionMetadata(execData)
        })

        fetch(`http://localhost:8000/tasks/get_task_total_cost?task_id=${taskUUID}`)
        .then(res => res.json())
        .then(data => setTotalCost(data.total_cost))
        .catch(err => console.error("Failed to fetch total cost", err))


        const stored = localStorage.getItem("user")
  if (stored) {
    const parsed = JSON.parse(stored)
    const orgId = parsed.organization
    if (orgId) {
      fetch(`http://localhost:8000/organizations/get_members?org_id=${orgId}&user_id=${parsed.id}`)
        .then(res => res.json())
        .then(setOrgMembers)
    }

    fetch(`http://localhost:8000/tasks/fetch-tasks-you-shared?user_id=${parsed.id}`)
      .then(res => res.json())
      .then(data => {
        const grouped: Record<string, any[]> = {}
        for (const item of data) {
          if (!grouped[item.task_id]) grouped[item.task_id] = []
          grouped[item.task_id].push(item)
        }
        setSharedInfoMap(grouped)
      })
  }
      
    }
    

  }, [taskUUID])
  

  const handleSend = async () => {
    if (!selectedAgent || !selectedKey || !prompt.trim()) return

    setLoading(true)

    try {
      const techRes = await fetch(`http://localhost:8000/agents/fetch_agent_technical_info?agent_id=${selectedAgent}`)
      const techInfo = await techRes.json()

      const apiUrl = `http://localhost:8000/${techInfo.execution_api}`
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ input_text: prompt, key_id: selectedKey }),
      })

      const result = await res.json()
      const outputText = result.output_text || ""
      setMarkdownText(outputText)
      setRenderCode(result.render_code || [])

      await fetch("http://localhost:8000/tasks/create-execution", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          user_id: userId,
          task_id: taskUUID,
          input_text: prompt,
          output_text: outputText,
          agent_id: selectedAgent,
          key_id: selectedKey,
        }),
      })

      const executionsRes = await fetch(`http://localhost:8000/tasks/get-executions?task_id=${taskUUID}`)
      const executionsData = await executionsRes.json()
      setExecutions(executionsData)
    } catch (err) {
      console.error("Execution error", err)
    } finally {
      setLoading(false)
    }
  }

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
        <div className="flex flex-col h-screen w-full pt-4">
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

          <div className="flex-1 flex flex-col gap-4 px-6 pt-3">
            <div className="rounded-xl bg-muted/50 p-4">
              <div className="flex justify-between items-center">
              <div className="flex justify-between items-center w-full">
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
  </div>

  <div className="flex items-center gap-4 ml-auto">
    <div className="text-sm min-w-[80px] text-right">
      {totalCost !== null ? `$${totalCost.toFixed(2)}` : '...'}
    </div>
    <Button size="sm" variant="outline" onClick={() => setActiveSharedModal(taskUUID)}>
  <Share2 size={16} />
</Button>
    {/* <Button size="sm" variant="outline" onClick={handleDownloadPDF}><Download size={16} /></Button> */}
    <Button
  size="sm"
  variant="outline"
  className="text-red-600 border-red-300"
  onClick={async () => {
    try {
      const res = await fetch(`http://localhost:8000/tasks/delete-task?task_id=${taskUUID}`, {
        method: "DELETE",
      })
      if (res.ok) window.location.href = "/tasks"
    } catch (err) {
      console.error("Delete failed", err)
    }
  }}
>
  <Trash2 size={16} />
</Button>
  </div>
</div>

                {/* <div className="flex items-center gap-2">
                  <Label htmlFor="mode-toggle" className="text-sm">Management</Label>
                  <Switch id="mode-toggle" checked={managementMode} onCheckedChange={setManagementMode} />
                </div> */}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Select onValueChange={setSelectedAgent}>
                <SelectTrigger><SelectValue placeholder="Choose an agent" /></SelectTrigger>
                <SelectContent>
                  {agents.length > 0 ? agents.map(agent => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name.replace(/_/g, " ")}
                    </SelectItem>
                  )) : (
                    <div className="text-sm text-muted-foreground px-3 py-1">No agents found</div>
                  )}
                </SelectContent>
              </Select>

              <Select onValueChange={setSelectedKey}>
                <SelectTrigger><SelectValue placeholder="Choose a key" /></SelectTrigger>
                <SelectContent>
                  {keys.length > 0 ? keys.map(key => (
                    <SelectItem key={key.id} value={key.id}>
                      {key.name}
                    </SelectItem>
                  )) : (
                    <div className="text-sm text-muted-foreground px-3 py-1">No keys found</div>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="relative flex-1 overflow-hidden border rounded-xl bg-muted/50 flex flex-col mb-2">
  <div className="flex-1 overflow-y-auto px-4 pt-4 space-y-4 scrollbar-thin">
    {executions.length === 0 ? (
      <div className="text-muted-foreground text-lg text-center h-full flex items-center justify-center">
        No Executions
      </div>
    ) : (
      executions.map(exec => (
        <details
  key={exec.id}
  className="bg-white border rounded-xl shadow-sm transition-all duration-300 open:shadow-md open:bg-white open:ring-1 open:ring-gray-300"
>
  <summary className="cursor-pointer select-none px-4 py-3 flex justify-between items-center text-sm font-medium text-muted-foreground">
    <span>Execution #{exec.sequence_number}</span>
    <span className="text-xs">{new Date(exec.creation_time).toLocaleString()}</span>
  </summary>

  <div
    className="text-sm px-4 pb-4 pt-2"
    onClick={(e) => e.stopPropagation()}
    onDoubleClick={(e) => e.stopPropagation()}
  >
    <div>
      <strong>Prompt:</strong> {exec.input_text}
    </div>
    <div className="w-full mt-2">
      <strong>Output:</strong>
      <pre className="whitespace-pre-wrap text-sm text-gray-800 mt-1">{exec.output_text}</pre>
    </div>
    <div className="flex flex-col gap-1 pt-2">
      <span>Agent: <code>{agentNames[exec.agent_id] || exec.agent_id}</code></span>
      <span>Key: <code>{keyNames[exec.key_id] || exec.key_id}</code></span>
    </div>
  </div>
</details>
      ))
    )}
  </div>

  <div className="shrink-0 py-3 border-t bg-muted/50 px-4 mt-2">
    <div className="flex items-center gap-2">
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Ask something..."
        className="flex-1 resize-none rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      />
      <Button
  className="bg-black text-white hover:bg-black/90 flex items-center gap-2"
  onClick={handleSend}
  disabled={loading || !selectedAgent || !selectedKey || !prompt.trim()}
>
  {loading ? (
    <>
      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z" />
      </svg>
      Waiting...
    </>
  ) : (
    "Send"
  )}
</Button>
    </div>
  </div>
</div>
          </div>
        </div>
        {activeSharedModal && (
  <div className="fixed inset-0 z-50 bg-black bg-opacity-30 flex items-center justify-center">
    <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl relative">
      <h2 className="text-lg font-semibold mb-4">Share Task</h2>

      <ul className="space-y-3 max-h-64 overflow-y-auto pr-1">
        {orgMembers.map((member: any) => (
          <li
            key={member.id}
            className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md border"
          >
            <div>
              <p className="text-sm font-medium">{member.name}</p>
              <p className="text-xs text-muted-foreground">{member.email}</p>
            </div>

            {sharedInfoMap[activeSharedModal || ""]?.some(s => s.reciever_id === member.id) ? (
              <Button size="sm" variant="outline" disabled>Shared</Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  try {
                    const res = await fetch("http://localhost:8000/tasks/share-task", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        sender_id: userId,
                        reciever_id: member.id,
                        task_id: activeSharedModal,
                      }),
                    })

                    const data = await res.json()
                    if (data.shared) {
                      const updated = [...(sharedInfoMap[activeSharedModal || ""] || []), { reciever_id: member.id }]
                      setSharedInfoMap(prev => ({ ...prev, [activeSharedModal!]: updated }))
                    }
                  } catch (err) {
                    console.error("Failed to share task", err)
                  }
                }}
              >
                Share
              </Button>
            )}
          </li>
        ))}
      </ul>

      <Button
        className="absolute top-3 right-3 text-sm px-2 py-1"
        variant="ghost"
        onClick={() => setActiveSharedModal(null)}
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