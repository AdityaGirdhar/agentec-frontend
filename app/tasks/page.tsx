'use client'

import { useEffect, useState } from "react"
import Link from "next/link"
import { AppSidebar } from "@/components/app-sidebar"
import accountIcon from "@/public/account.png"
import { useRouter } from "next/navigation"
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
import { Download, Eye, Trash2, Share2 } from "lucide-react"

interface Task {
  id: string
  name: string
  created_time: string
}

interface SharedTask {
  id: string
  task_id: string
  created_time: string
  sender_name?: string
  task_name?: string
}

export default function Page() {
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [sharedTasks, setSharedTasks] = useState<SharedTask[]>([])

  const [sharedInfoMap, setSharedInfoMap] = useState<Record<string, SharedTask[]>>({})
  const [activeSharedModal, setActiveSharedModal] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [creatingTask, setCreatingTask] = useState(false)
  const [orgMembers, setOrgMembers] = useState<any[]>([])
  const [loadingOrgMembers, setLoadingOrgMembers] = useState(false)

useEffect(() => {
  const storedUser = localStorage.getItem("user")
  if (!storedUser) return

  const parsedUser = JSON.parse(storedUser)
  setUser(parsedUser)
  const stored = localStorage.getItem("user")
  if (!stored) return
  const user = JSON.parse(stored)
  const orgId = user.organization
  if (!orgId) return

  const fetchMembers = async () => {
    try {
      setLoadingOrgMembers(true)
      const res = await fetch(`http://localhost:8000/organizations/get_members?org_id=${orgId}&user_id=${user.id}`)
      const data = await res.json()
      setOrgMembers(data)
    } catch (err) {
      console.error("Failed to load members", err)
    } finally {
      setLoadingOrgMembers(false)
    }
  }

  fetchMembers()
}, [])

const handleCreateNewTask = async () => {
  const storedUser = localStorage.getItem("user")
  if (!storedUser) return

  const { id: user_id } = JSON.parse(storedUser)

  try {
    setCreatingTask(true)
    const res = await fetch("http://localhost:8000/tasks/create-task", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id, name: "" }),
    })

    const data = await res.json()
    if (!res.ok) throw new Error("Failed to create task")

    router.push(`/tasks/${data.id}`)
  } catch (err) {
    console.error("Error creating task:", err)
  } finally {
    setCreatingTask(false)
  }
}

  const fetchTasks = async () => {
    const storedUser = localStorage.getItem("user")
    if (!storedUser) return
    const { id } = JSON.parse(storedUser)
  
    try {
      const [ownRes, sharedRes, sharedByYouRes] = await Promise.all([
        fetch(`http://localhost:8000/tasks/get-tasks?user_id=${id}`),
        fetch(`http://localhost:8000/tasks/fetch-tasks-shared-with-you?user_id=${id}`),
        fetch(`http://localhost:8000/tasks/fetch-tasks-you-shared?user_id=${id}`),
      ])
      
      const ownData = await ownRes.json()
      const sharedRaw = await sharedRes.json()
      const sharedByYouRaw = await sharedByYouRes.json()
      
      const sharedData = Array.isArray(sharedRaw) ? sharedRaw : []
      const sharedByYou = Array.isArray(sharedByYouRaw) ? sharedByYouRaw : []
  
      const enrichedShared = await Promise.all(sharedData.map(async (shared: SharedTask) => {
        try {
          const taskInfoRes = await fetch(`http://localhost:8000/tasks/get-task-info?task_id=${shared.task_id}`)
          const taskInfo = await taskInfoRes.json()
          const senderRes = await fetch(`http://localhost:8000/users/get_user_info?user_id=${taskInfo.user_id}`)
          const senderInfo = await senderRes.json()
  
          return {
            ...shared,
            task_name: taskInfo.name,
            sender_name: senderInfo.name,
          }
        } catch (err) {
          console.error("Failed to enrich shared task:", err)
          return shared
        }
      }))
  
      // Fetch all receiver names
      const receiverIdSet = [...new Set(sharedByYou.map(s => s.reciever_id))]
      const receiverInfoMap: Record<string, string> = {}
  
      await Promise.all(
        receiverIdSet.map(async (uid) => {
          try {
            const res = await fetch(`http://localhost:8000/users/get_user_info?user_id=${uid}`)
            const data = await res.json()
            receiverInfoMap[uid] = data.name
          } catch (err) {
            console.error(`Failed to fetch name for user ${uid}`)
          }
        })
      )
  
      // Group by task ID and add reciever_name
      const groupedSharedByTask: Record<string, SharedTask[]> = {}
      for (const item of sharedByYou) {
        if (!groupedSharedByTask[item.task_id]) {
          groupedSharedByTask[item.task_id] = []
        }
        groupedSharedByTask[item.task_id].push({
          ...item,
          reciever_name: receiverInfoMap[item.reciever_id] || "Unknown",
        })
      }
  
      setTasks(ownData)
      setSharedTasks(enrichedShared)
      setSharedInfoMap(groupedSharedByTask)
    } catch (err) {
      console.error("Failed to fetch tasks:", err)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  const handleDownloadPDF = async (taskId: string) => {
    const html2pdfModule = await import("html2pdf.js")
    const html2pdf = html2pdfModule.default || html2pdfModule
    const user = JSON.parse(localStorage.getItem("user") || "{}")

    const pdfContent = document.createElement('div')
    pdfContent.innerHTML = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <p><strong>User:</strong> ${user.email || "Unknown"}</p>
        <p><strong>Task ID:</strong> ${taskId}</p>
      </div>
    `
    html2pdf()
      .from(pdfContent)
      .set({
        margin: 0.5,
        filename: `shared-task.pdf`,
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
      }
    } catch (err) {
      console.error("Error deleting task:", err)
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">Tasks</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0 pr-10">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Tasks</h1>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl bg-muted/50 p-4">
              <h2 className="text-lg font-medium mb-2">Schedules</h2>
              <p className="text-sm text-muted-foreground">No tasks scheduled</p>
            </div>

            <div className="rounded-xl bg-muted/50 p-4">
              <h2 className="text-lg font-medium mb-2">Shared Tasks</h2>
              {sharedTasks.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {user?.organization
                    ? "No tasks shared with you"
                    : "You are not part of any organization. Shared tasks will appear here once you join one."}
                </p>
              ) : (
                <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white shadow-sm">
                  {sharedTasks.map((task) => (
                    <li
                      key={task.id}
                      className="p-3 flex items-center justify-between hover:bg-gray-50 transition"
                    >
                      <div>
                        <p className="text-sm font-medium">{task.task_name || "Untitled Task"}</p>
                        <p className="text-xs text-muted-foreground">
                          Shared by {task.sender_name || "Unknown"} on {new Date(task.created_time).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" title="View Task">
                          <Eye size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          title="Download PDF"
                          onClick={() => handleDownloadPDF(task.task_id)}
                        >
                          <Download size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-500 border-red-300 hover:bg-red-50"
                          title="Delete Shared Task"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="flex gap-3">
          <Button
              className="bg-black text-white hover:bg-black/90"
              onClick={handleCreateNewTask}
              disabled={creatingTask}
            >
              {creatingTask ? (
                <div className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    ></path>
                  </svg>
                  Creating New Task...
                </div>
              ) : (
                "New Task"
              )}
            </Button>
            <Button variant="outline">New Schedule</Button>
          </div>

          {tasks.length > 0 && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-2 text-muted-foreground">Your Tasks</h2>
              <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
                <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left">
                  <tr>
                    <th className="p-2 w-12 text-left">No</th>
                    <th className="p-2 text-left">Name</th>
                    <th className="p-2 text-left">Created</th>
                    <th className="p-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                    {tasks.map((task, index) => (
                      <tr key={task.id} className="hover:bg-gray-50 transition">
                        <td className="p-2">{index + 1}</td>
                        <td className="p-2 max-w-[250px] truncate">{task.name}</td>
                        <td className="p-2 text-muted-foreground">
                          {new Date(task.created_time).toLocaleString()}
                        </td>
                        <td className="p-2 text-right">
                          <div className="flex justify-end gap-2">
                          <Button
                              size="sm"
                              variant="outline"
                              title="View Task"
                              onClick={() => router.push(`/tasks/${task.id}`)}
                            >
                              <Eye size={16} />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              title="Download PDF"
                              onClick={() => handleDownloadPDF(task.id)}
                            >
                              <Download size={16} />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              title={user?.organization ? "Share Task" : "Only Organization Members can share"}
                              onClick={() => {
                                if (user?.organization) setActiveSharedModal(task.id)
                              }}
                              className="relative"
                              disabled={!user?.organization}
                            >
                              <Share2 size={16} />
                              {sharedInfoMap[task.id]?.length > 0 && (
                                <span className="absolute -top-1 -right-1 text-xs bg-blue-600 text-white rounded-full px-1.5">
                                  +{sharedInfoMap[task.id].length}
                                </span>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-500 border-red-300 hover:bg-red-50"
                              title="Delete Task"
                              onClick={() => handleDelete(task.id)}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
        {activeSharedModal && (
  <div className="fixed inset-0 z-50 bg-black bg-opacity-30 flex items-center justify-center">
    <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl relative">
      <h2 className="text-lg font-semibold mb-4">Share Task</h2>

      {!user?.organization ? (
        <div className="text-sm text-muted-foreground">
          You are not part of any organization. Sharing is unavailable.
        </div>
      ) : (
        <>
          {orgMembers === null ? (
            <p className="text-sm text-muted-foreground">Loading members...</p>
          ) : orgMembers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No other members found in your organization.</p>
          ) : (
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
                  <Button size="sm" variant="outline">
                    Share
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

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