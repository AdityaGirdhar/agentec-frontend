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
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      const parsed = JSON.parse(storedUser)
      setUserEmail(parsed.email)
      fetch(`http://localhost:8000/users/get_keys?email=${parsed.email}`)
        .then(res => res.json())
        .then(setKeys)
    }

    fetch("http://localhost:8000/agents/get_agents")
      .then(res => res.json())
      .then(setAgents)

    if (taskUUID) {
      fetch(`http://localhost:8000/tasks/get-task-info?task_id=${taskUUID}`)
        .then(res => res.json())
        .then(data => {
          setTask(data)
          setName(data.name)
        })
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

          <div className="flex-1 flex flex-col gap-4 px-6 pt-4">
  <div className="rounded-xl bg-muted/50 p-6">
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

            <div className="flex-1 flex flex-col gap-4">
  <div className="flex-1 rounded-xl bg-muted/50 p-6 h-[calc(100vh-180px)]">
    {!managementMode ? (
      <div className="flex flex-col h-full gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select onValueChange={setSelectedAgent}>
            <SelectTrigger>
              <SelectValue placeholder="Choose an agent" />
            </SelectTrigger>
            <SelectContent>
              {agents.map((agent) => (
                <SelectItem key={agent.name} value={agent.name}>
                  {agent.name.replace(/_/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select onValueChange={setSelectedKey}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a key" />
            </SelectTrigger>
            <SelectContent>
              {keys.map((key) => (
                <SelectItem key={key.name} value={key.name}>
                  {key.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-1 flex-row gap-4 overflow-hidden">
          <div className="w-full md:w-1/4 p-2 rounded-xl flex flex-col gap-4 h-full overflow-hidden">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your task prompt"
              className="flex-1 resize-none rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring overflow-y-auto scrollbar-thin"
            />
            <Button
              className="bg-black text-white hover:bg-black/90 w-full"
              onClick={() => {}}
              disabled={loading}
            >
              Run Task
            </Button>
          </div>

          <div className="w-full md:w-3/4 rounded-xl p-4 h-full overflow-y-auto scrollbar-thin bg-white">
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
              <div className="text-muted-foreground text-lg text-center flex justify-center items-center h-full">
                No Task Output
              </div>
            )}
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