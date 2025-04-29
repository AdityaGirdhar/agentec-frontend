'use client'

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator
} from "@/components/ui/breadcrumb"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, Share2, Pencil } from "lucide-react"
import TaskExecutionTab from "@/components/task/task-execution-tab"
import TaskAnalysisTab from "@/components/task/task-analysis-tab"

export default function TaskPage() {
  const { taskUUID } = useParams()
  const [activeTab, setActiveTab] = useState<"execution" | "analysis">("execution")
  const [name, setName] = useState("Untitled")
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    if (taskUUID) {
      fetch(`http://localhost:8000/tasks/get-task-info?task_id=${taskUUID}`)
        .then(res => res.json())
        .then(data => {
          if (data?.name) setName(data.name)
        })
        .catch(err => console.error("Failed to fetch task", err))
    }
  }, [taskUUID])

  const handleEditName = async () => {
    try {
      await fetch("http://localhost:8000/tasks/edit-task-name", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
                  <BreadcrumbPage>{name}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>

          <div className="px-6 pb-4">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                {editing ? (
                  <>
                    <Input
                      className="w-64"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                    <Button size="sm" onClick={handleEditName}>Save</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
                  </>
                ) : (
                  <>
                    <h1 className="text-2xl font-semibold flex items-center gap-2">
                      {name}
                      <Button variant="ghost" size="icon" onClick={() => setEditing(true)}>
                        <Pencil size={16} />
                      </Button>
                    </h1>
                    <Button size="sm" variant="outline">
                      <Share2 size={16} />
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600 border-red-300">
                      <Trash2 size={16} />
                    </Button>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant={activeTab === "execution" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveTab("execution")}
                >
                  Execution
                </Button>
                <Button
                  variant={activeTab === "analysis" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveTab("analysis")}
                >
                  Analysis
                </Button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-auto px-6">
            {activeTab === "execution"
              ? <TaskExecutionTab taskUUID={taskUUID as string} />
              : <TaskAnalysisTab taskUUID={taskUUID as string} />
            }
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}