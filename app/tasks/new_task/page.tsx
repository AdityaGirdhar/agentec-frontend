'use client'

import { useEffect, useState } from "react"
import Link from "next/link"
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import ReactMarkdown from "react-markdown"

export default function Page() {
  const [prompt, setPrompt] = useState("")
  const [name, setName] = useState("")
  const [output, setOutput] = useState("")
  const [loading, setLoading] = useState(false)
  const [agents, setAgents] = useState<any[]>([])
  const [keys, setKeys] = useState<any[]>([])
  const [selectedAgent, setSelectedAgent] = useState("")
  const [selectedKey, setSelectedKey] = useState("")
  const [userEmail, setUserEmail] = useState("")

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
  }, [])

  const handleRunTask = async () => {
    if (!prompt.trim() || !selectedAgent || !selectedKey) return

    setLoading(true)
    setOutput("")

    const agent = agents.find((a) => a.name === selectedAgent)
    const keyName = keys.find(k => k.name === selectedKey)?.name || "Unknown"

    try {
      const response = await fetch(`http://localhost:8000${agent.api_route}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ prompt }),
      })

      const data = await response.json()
      setOutput(data.response)

      await fetch("http://localhost:8000/users/add_task", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: userEmail,
          name: name || `${selectedAgent} task`,
          agent_used: selectedAgent,
          key_used: keyName,
          input_prompt: prompt,
          task_output: data.response,
        }),
      })
    } catch (err) {
      setOutput("Failed to fetch output.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex flex-col h-screen w-full">
          <header className="flex h-16 shrink-0 items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/tasks">Tasks</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>New Task</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>

          <div className="flex-1 flex flex-row gap-4 p-4 pr-10">
            <div className="w-full md:w-1/4 bg-muted/50 p-4 rounded-xl flex flex-col gap-4">
              <div>
                <Label className="mb-1 block">Task Name</Label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Give your task a name"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <Label className="mb-1 block">Choose your agent</Label>
                <Select onValueChange={setSelectedAgent}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose" />
                  </SelectTrigger>
                  <SelectContent>
                    {agents.map((agent) => (
                      <SelectItem key={agent.name} value={agent.name}>
                        {agent.name.charAt(0).toUpperCase() + agent.name.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1 block">Choose key</Label>
                <Select onValueChange={setSelectedKey}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose default" />
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
              <div className="flex flex-col flex-1">
                <Label className="mb-1 block">Enter your prompt</Label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Enter your task prompt"
                  className="flex-1 resize-none rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="flex justify-end">
                <Button className="bg-black text-white hover:bg-black/90" onClick={handleRunTask}>
                  Run Task
                </Button>
              </div>
            </div>

            <div className="w-full md:w-3/4 bg-muted/50 rounded-xl p-6 overflow-y-auto">
              {loading ? (
                <div className="text-muted-foreground text-lg">Loading output...</div>
              ) : output ? (
                <ReactMarkdown className="prose w-full max-w-full text-left">{output}</ReactMarkdown>
              ) : (
                <div className="text-muted-foreground text-lg text-center flex justify-center items-center h-full min-h-[300px]">
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