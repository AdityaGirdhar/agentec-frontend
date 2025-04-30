'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import ShareTaskModal from "@/components/modal/share-task"
import HelpTaskModal from "@/components/modal/help-task"
import SharedResources from "@/components/task/shared-resources"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger
} from "@/components/ui/sidebar"
import { Eye, Trash2, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Task {
  id: string
  name: string
  created_time: string
}

export default function Page() {
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [sharedInfoMap, setSharedInfoMap] = useState<Record<string, any[]>>({})
  const [activeSharedModal, setActiveSharedModal] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [creatingTask, setCreatingTask] = useState(false)
  const [showHelpModal, setShowHelpModal] = useState(false)

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
      const [ownRes, sharedByYouRes] = await Promise.all([
        fetch(`http://localhost:8000/tasks/get-tasks?user_id=${id}`),
        fetch(`http://localhost:8000/tasks/fetch-tasks-you-shared?user_id=${id}`),
      ])

      const ownData = await ownRes.json()
      const sharedByYouRaw = await sharedByYouRes.json()
      const sharedByYou = Array.isArray(sharedByYouRaw) ? sharedByYouRaw : []

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

      const groupedSharedByTask: Record<string, any[]> = {}
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
      setSharedInfoMap(groupedSharedByTask)
    } catch (err) {
      console.error("Failed to fetch tasks:", err)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:8000/tasks/delete-task?task_id=${id}`, {
        method: "DELETE",
      })

      if (res.ok) {
        setTasks(prev => prev.filter(task => task.id !== id))
      }
    } catch (err) {
      console.error("Error deleting task:", err)
    }
  }

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (!storedUser) return
    setUser(JSON.parse(storedUser))
    fetchTasks()
  }, [])

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="relative flex h-16 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="#">Tasks</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <Button
            size="sm"
            variant="outline"
            className="absolute right-4"
            onClick={() => setShowHelpModal(true)}
          >
            Help
          </Button>
        </header>

        <div className="flex flex-col gap-6 p-4 pt-0 pr-10">
          <h1 className="text-2xl font-semibold">Tasks</h1>

          <SharedResources />

          <div className="flex gap-3">
            <Button
              className="bg-black text-white hover:bg-black/90"
              onClick={handleCreateNewTask}
              disabled={creatingTask}
            >
              {creatingTask ? "Creating..." : "New Task"}
            </Button>
          </div>

          {tasks.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-2 text-muted-foreground">Your Tasks</h2>
              <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-left">
                    <tr>
                      <th className="p-2 w-12">No</th>
                      <th className="p-2">Name</th>
                      <th className="p-2">Created</th>
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
                              onClick={() => router.push(`/tasks/${task.id}`)}
                            >
                              <Eye size={16} />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
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
          <ShareTaskModal
            taskId={activeSharedModal}
            user={user}
            onClose={() => setActiveSharedModal(null)}
            onShared={() => fetchTasks()}
          />
        )}

        {showHelpModal && <HelpTaskModal onClose={() => setShowHelpModal(false)} />}
      </SidebarInset>
    </SidebarProvider>
  )
}