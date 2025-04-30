'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"

interface SharedTask {
  id: string
  task_id: string
  created_time: string
  sender_name?: string
  task_name?: string
}

interface SharedKey {
  id: string
  key_id: string
  reciever_id: string
  created_time: string
  sender_id: string
  name?: string
  provider?: string
  key?: string
  sender_name?: string
}

export default function SharedResources() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<"tasks" | "keys">("tasks")
  const [loading, setLoading] = useState(false)

  const [sharedTasks, setSharedTasks] = useState<SharedTask[]>([])
  const [sharedKeys, setSharedKeys] = useState<SharedKey[]>([])
  const [revealMap, setRevealMap] = useState<{ [key: string]: boolean }>({})

  useEffect(() => {
    const stored = localStorage.getItem("user")
    if (!stored) return
    const parsed = JSON.parse(stored)
    setUser(parsed)

    fetchSharedTasks(parsed.id)
    fetchSharedKeys(parsed.id)
  }, [])

  const fetchSharedTasks = async (userId: string) => {
    setLoading(true)
    try {
      const res = await fetch(`http://localhost:8000/tasks/fetch-tasks-shared-with-you?user_id=${userId}`)
      const sharedRaw: SharedTask[] = await res.json()

      const enriched: SharedTask[] = await Promise.all(
        sharedRaw.map(async (shared) => {
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
          } catch {
            return shared
          }
        })
      )

      setSharedTasks(enriched)
    } catch (err) {
      console.error("Failed to fetch shared tasks:", err)
    } finally {
      setLoading(false)
    }
  }

  const fetchSharedKeys = async (userId: string) => {
    try {
      const res = await fetch(`http://localhost:8000/users/keys-shared-with-you?user_id=${userId}`)
      const sharedList: SharedKey[] = await res.json()

      const enriched: SharedKey[] = await Promise.all(
        sharedList.map(async (entry) => {
          try {
            const keyRes = await fetch(`http://localhost:8000/users/get_key_info?key_id=${entry.key_id}`)
            const keyInfo = await keyRes.json()

            const senderRes = await fetch(`http://localhost:8000/users/get_user_info?user_id=${entry.sender_id}`)
            const senderInfo = await senderRes.json()

            return {
              ...entry,
              ...keyInfo,
              sender_name: senderInfo.name,
            }
          } catch {
            return entry
          }
        })
      )

      setSharedKeys(enriched)
    } catch (err) {
      console.error("Failed to fetch shared keys:", err)
    }
  }

  const toggleReveal = (id: string) => {
    setRevealMap(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const copyToClipboard = (value: string) => {
    navigator.clipboard.writeText(value)
  }

  const clip = (str?: string, len = 30) =>
  str && str.length > len ? str.slice(0, len) + "..." : str ?? ""

  return (
    <div className="rounded-xl bg-muted/50 p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-medium">Shared Resources</h2>
        <ToggleGroup
          type="single"
          value={activeTab}
          onValueChange={(val: "tasks" | "keys") => val && setActiveTab(val)}
        >
          <ToggleGroupItem
            value="tasks"
            aria-label="Shared Tasks"
            className={cn(
              "px-3 py-1.5 text-sm rounded-md border",
              activeTab === "tasks"
                ? "bg-black text-white"
                : "bg-white text-black hover:bg-gray-100"
            )}
          >
            Tasks
          </ToggleGroupItem>
          <ToggleGroupItem
            value="keys"
            aria-label="Shared Keys"
            className={cn(
              "px-3 py-1.5 text-sm rounded-md border",
              activeTab === "keys"
                ? "bg-black text-white"
                : "bg-white text-black hover:bg-gray-100"
            )}
          >
            Keys
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {activeTab === "tasks" ? (
        loading ? (
          <p className="text-sm text-muted-foreground">Loading shared tasks...</p>
        ) : sharedTasks.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {user?.organization
              ? "No tasks shared with you yet."
              : "Join an organization to receive shared tasks."}
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
                  <Button
                    size="sm"
                    variant="outline"
                    title="View Task"
                    onClick={() => router.push(`/tasks/${task.task_id}`)}
                  >
                    <Eye size={16} />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )
      ) : sharedKeys.length === 0 ? (
        <p className="text-sm text-muted-foreground">No keys shared with you yet.</p>
      ) : (
        <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white shadow-sm">
          {sharedKeys.map((key) => {
            const revealed = revealMap[key.key_id]
            const displayKey = clip(revealed ? key.key : "•".repeat(30))

            return (
              <li
                key={key.id}
                className="p-3 hover:bg-gray-50 transition"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium truncate">{key.name || "Untitled Key"}</p>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm">{displayKey}</span>
                    <button
                      className="text-muted-foreground hover:text-black"
                      onClick={() => toggleReveal(key.key_id)}
                    >
                      {revealed ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <button
                      className="text-muted-foreground hover:text-black"
                      onClick={() => copyToClipboard(key.key || "")}
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Shared by {key.sender_name || "Unknown"} on {new Date(key.created_time).toLocaleString()}
                </p>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}