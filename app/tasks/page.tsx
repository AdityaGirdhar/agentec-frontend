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

interface Task {
  id: string
  name: string
  key_used: string
  agent_used: string
  input_prompt: string
  task_output: string
}

export default function Page() {
  const [tasks, setTasks] = useState<Task[]>([])

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (!storedUser) return

    const { email } = JSON.parse(storedUser)

    const fetchTasks = async () => {
      try {
        const res = await fetch(`http://localhost:8000/users/get_tasks?email=${email}`)
        const data = await res.json()
        setTasks(data)
      } catch (err) {
        console.error("Failed to fetch tasks:", err)
      }
    }

    fetchTasks()
  }, [])

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
              <Button className="bg-black text-white hover:bg-black/90">
                New Task
              </Button>
            </Link>
            <Link href="/tasks/new_task">
              <Button variant="outline">New Schedule</Button>
            </Link>
          </div>

          {tasks.length > 0 && (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-sm border border-gray-200 rounded-lg">
                <thead className="bg-gray-100 text-left">
                  <tr>
                    <th className="p-2">Name</th>
                    <th className="p-2">Agent</th>
                    <th className="p-2">Key</th>
                    <th className="p-2">Prompt</th>
                    <th className="p-2">Output</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task) => (
                    <tr key={task.id} className="border-t">
                      <td className="p-2 max-w-[140px] truncate">{task.name}</td>
                      <td className="p-2 max-w-[120px] truncate">{task.agent_used}</td>
                      <td className="p-2 max-w-[100px] truncate">{task.key_used}</td>
                      <td className="p-2 max-w-[200px] truncate">{task.input_prompt}</td>
                      <td className="p-2 max-w-[200px] truncate">{task.task_output}</td>
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