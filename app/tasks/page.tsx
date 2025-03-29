'use client'

import { useEffect, useState } from "react"
import Link from "next/link"
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
import { Download, Trash2 } from "lucide-react"

interface Task {
  id: string
  name: string
  agent_name: string
  key_used: string
  input_prompt: string
  markdown_text: string
  render_code: string[]
}

export default function Page() {
  const [tasks, setTasks] = useState<Task[]>([])

  const fetchTasks = async () => {
    const storedUser = localStorage.getItem("user")
    if (!storedUser) return

    const { email } = JSON.parse(storedUser)
    try {
      const res = await fetch(`http://localhost:8000/users/get_tasks?email=${email}`)
      const data = await res.json()
      setTasks(data)
    } catch (err) {
      console.error("Failed to fetch tasks:", err)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  const handleDownloadPDF = async (task: Task) => {
    const html2pdfModule = await import("html2pdf.js")
    const html2pdf = html2pdfModule.default || html2pdfModule

    const user = JSON.parse(localStorage.getItem("user") || "{}")
    const { name, agent_name, key_used, input_prompt, markdown_text, render_code } = task

    const pdfContent = document.createElement('div')
    pdfContent.innerHTML = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <div style="margin-bottom: 20px;">
          <p><strong>User:</strong> ${user.email || "Unknown"}</p>
          <p><strong>Agent:</strong> ${agent_name}</p>
          <p><strong>Key:</strong> ${key_used}</p>
        </div>
        <hr style="margin: 20px 0;">
        <h2 style="font-size: 18px; font-weight: bold; margin-bottom: 10px;">Prompt</h2>
        <p style="margin-bottom: 20px; white-space: pre-wrap;">${input_prompt}</p>
        <hr style="margin: 20px 0;">
        <h2 style="font-size: 18px; font-weight: bold; margin-bottom: 10px;">Output</h2>
        <div>${markdown_text}</div>
        ${render_code.map(code => `<div style="margin-top: 20px;">${code}</div>`).join('')}
      </div>
    `

    html2pdf()
      .from(pdfContent)
      .set({
        margin: 0.5,
        filename: `${name || "task"}.pdf`,
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
      })
      .save()
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:8000/users/delete_task?task_id=${id}`, {
        method: "DELETE",
      })
      if (res.ok) {
        setTasks(prev => prev.filter(task => task.id !== id))
      } else {
        console.error("Delete failed")
      }
    } catch (err) {
      console.error("Error deleting task:", err)
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">Tasks</BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0 pr-10">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Tasks</h1>
          </div>

          <div className="grid auto-rows-min gap-4 md:grid-cols-2">
            <div className="aspect-video rounded-xl bg-muted/50 p-4">
              <h2 className="text-lg font-medium">Monitoring</h2>
              <p className="text-sm text-muted-foreground">No tasks to monitor</p>
            </div>
            <div className="aspect-video rounded-xl bg-muted/50 p-4">
              <h2 className="text-lg font-medium">Schedules</h2>
              <p className="text-sm text-muted-foreground">No tasks scheduled</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Link href="/tasks/new_task">
              <Button className="bg-black text-white hover:bg-black/90">New Task</Button>
            </Link>
            <Link href="/tasks/new_task">
              <Button variant="outline">New Schedule</Button>
            </Link>
          </div>

          {tasks.length > 0 && (
            <div className="mt-6 overflow-x-auto">
              <h2 className="text-lg font-semibold mb-2 text-muted-foreground">Your Tasks</h2>
              <table className="w-full text-sm border border-gray-200 rounded-lg">
                <thead className="bg-gray-100 text-left">
                  <tr>
                    <th className="p-2 w-12">No</th>
                    <th className="p-2">Name</th>
                    <th className="p-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task, index) => (
                    <tr key={task.id} className="border-t">
                      <td className="p-2">{index + 1}</td>
                      <td className="p-2 max-w-[300px] truncate">{task.name}</td>
                      <td className="p-2 text-right flex justify-end gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/tasks/view/${task.id}`}>View</Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadPDF(task)}
                          title="Download PDF"
                        >
                          <Download size={16} />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500 border-red-300 hover:bg-red-50"
                          onClick={() => handleDelete(task.id)}
                          title="Delete Task"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}