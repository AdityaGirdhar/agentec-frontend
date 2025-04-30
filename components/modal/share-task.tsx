'use client'

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

interface ShareTaskModalProps {
  taskId: string
  user: any
  onClose: () => void
  onShared: () => void
}

export default function ShareTaskModal({ taskId, user, onClose, onShared }: ShareTaskModalProps) {
  const [orgMembers, setOrgMembers] = useState<any[]>([])
  const [sharedInfo, setSharedInfo] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.organization || !taskId) return
  
    const fetchData = async () => {
      try {
        const delay = new Promise(res => setTimeout(res, 400))  // 400ms wait
        const membersRes = fetch(`http://localhost:8000/organizations/get_members?org_id=${user.organization}&user_id=${user.id}`)
        const sharedRes = fetch(`http://localhost:8000/tasks/fetch-tasks-you-shared?user_id=${user.id}`)
  
        const [membersResFinal, sharedResFinal] = await Promise.all([membersRes, sharedRes, delay])
  
        const members = await membersResFinal.json()
        const shared = await sharedResFinal.json()
  
        setOrgMembers(members.filter((m: any) => m.id !== user.id))
        setSharedInfo(shared.filter((s: any) => s.task_id === taskId))
      } catch (err) {
        console.error("Error loading share data", err)
      } finally {
        setLoading(false)
      }
    }
  
    fetchData()
  }, [taskId, user])

  const handleShare = async (memberId: string) => {
    try {
      const res = await fetch("http://localhost:8000/tasks/share-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender_id: user.id,
          reciever_id: memberId,
          task_id: taskId,
        }),
      })

      const data = await res.json()
      if (data.shared) {
        setSharedInfo(prev => [...prev, { reciever_id: memberId }])
        onShared()
      }
    } catch (err) {
      console.error("Failed to share task", err)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-30 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl relative">
        <h2 className="text-lg font-semibold mb-4">Share Task</h2>

        {!user?.organization ? (
          <div className="text-sm text-muted-foreground">
            You are not part of any organization. Sharing is unavailable.
          </div>
        ) : loading ? (
            <div className="flex items-center justify-center py-8">
              <motion.div
                className="w-6 h-6 border-4 border-black border-t-transparent rounded-full animate-spin"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            </div>
        ) : orgMembers.length === 0 ? (
          <p className="text-sm text-muted-foreground">No other organization members found.</p>
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
                {sharedInfo.some(s => s.reciever_id === member.id) ? (
                  <Button size="sm" variant="outline" disabled>
                    Shared
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleShare(member.id)}
                  >
                    Share
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}

        <Button
          className="absolute top-3 right-3 text-sm px-2 py-1"
          variant="ghost"
          onClick={onClose}
        >
          Close
        </Button>
      </div>
    </div>
  )
}