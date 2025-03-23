'use client'

import { useState } from "react"
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
  const [output, setOutput] = useState("")
  const [loading, setLoading] = useState(false)

  const handleRunTask = async () => {
    if (!prompt.trim()) return
    setLoading(true)
    setOutput("")

    try {
      const response = await fetch("http://localhost:8000/external_agents/analyst", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ prompt }),
      })

      const data = await response.json()
      setOutput(data.response)
    } catch (error) {
      setOutput("Failed to fetch output.")
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
                <Label className="mb-1 block">Choose your agent</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="finbot">Finbot</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1 block">Choose key</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose default" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="main">Main</SelectItem>
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

            <div className="w-full md:w-3/4 bg-muted/50 rounded-xl p-6 flex items-center justify-center text-center overflow-y-auto">
              {loading ? (
                <div className="text-muted-foreground text-lg">Loading output...</div>
              ) : output ? (
                <ReactMarkdown className="prose w-full max-w-full">{output}</ReactMarkdown>
              ) : (
                <div className="text-muted-foreground text-lg">No Task Output</div>
              )}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}