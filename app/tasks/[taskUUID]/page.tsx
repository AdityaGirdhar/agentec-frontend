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
import { Pencil, Download } from "lucide-react"
import ReactMarkdown from "react-markdown"

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

          <div className="px-6 pt-4 pb-2 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              {editing ? (
                <div className="flex gap-2">
                  <Input value={name} onChange={(e) => setName(e.target.value)} />
                  <Button onClick={handleEditName} size="sm">Save</Button>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
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
          </div>

          <div className="flex-1 flex flex-row gap-4 p-6 pr-10 overflow-hidden">
            <div className="w-full md:w-1/4 bg-muted/50 p-4 rounded-xl flex flex-col gap-4 h-[calc(100vh-160px)] overflow-hidden">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter your task prompt"
                className="flex-1 resize-none rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring overflow-y-auto scrollbar-thin"
              />
              <div className="flex justify-between gap-2">
                <Button
                  className="bg-black text-white hover:bg-black/90 w-full"
                  onClick={() => {}}
                  disabled={loading}
                >
                  Run Task
                </Button>
                {markdownText && (
                  <Button variant="outline" onClick={handleDownloadPDF}>
                    <Download size={16} />
                  </Button>
                )}
              </div>
            </div>

            <div className="w-full md:w-3/4 bg-muted/50 rounded-xl p-6 h-[calc(100vh-160px)] overflow-y-auto scrollbar-thin">
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
      </SidebarInset>
    </SidebarProvider>
  )
}