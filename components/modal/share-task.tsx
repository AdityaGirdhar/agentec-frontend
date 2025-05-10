'use client'

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { ChevronDown, ChevronRight } from "lucide-react"

interface ShareTaskModalProps {
  taskId: string
  user: any
  onClose: () => void
  onShared: () => void
}

export default function ShareTaskModal({ taskId, user, onClose, onShared }: ShareTaskModalProps) {
  const [orgs, setOrgs] = useState<any[]>([])
  const [expandedOrgIds, setExpandedOrgIds] = useState<string[]>([])
  const [sharedInfo, setSharedInfo] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id || !taskId) return

    const fetchData = async () => {
      try {
        const orgsRes = await fetch(`http://localhost:8000/users/get_your_organizations?user_id=${user.id}`)
        const orgList = await orgsRes.json()

        const sharedRes = await fetch(`http://localhost:8000/tasks/fetch-tasks-you-shared?user_id=${user.id}`)
        const sharedList = await sharedRes.json()

        const orgsWithMembers = await Promise.all(
          orgList.map(async (org: any) => {
            const membersRes = await fetch(`http://localhost:8000/organizations/get_members?org_id=${org.id}&user_id=${user.id}`)
            const members = await membersRes.json()
            return {
              ...org,
              members: members.filter((m: any) => m.id !== user.id),
            }
          })
        )

        setOrgs(orgsWithMembers)
        setSharedInfo(sharedList.filter((s: any) => s.task_id === taskId))
      } catch (err) {
        console.error("Error loading share data", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [taskId, user])

  const handleToggleExpand = (orgId: string) => {
    setExpandedOrgIds(prev =>
      prev.includes(orgId) ? prev.filter(id => id !== orgId) : [...prev, orgId]
    )
  }

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

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <motion.div
              className="w-6 h-6 border-4 border-black border-t-transparent rounded-full animate-spin"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          </div>
        ) : orgs.length === 0 ? (
          <p className="text-sm text-muted-foreground">You are not part of any organization.</p>
        ) : (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            {orgs.map(org => (
              <div key={org.id} className="border rounded-md">
                <button
                  onClick={() => handleToggleExpand(org.id)}
                  className="w-full flex items-center justify-between px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-t-md text-left"
                >
                  <span className="text-sm font-medium">{org.name}</span>
                  {expandedOrgIds.includes(org.id) ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  )}
                </button>

                {expandedOrgIds.includes(org.id) && (
                  <ul className="px-3 py-2 space-y-2 bg-white">
                    {org.members.length === 0 ? (
                      <p className="text-xs text-muted-foreground px-1 py-2">No other members in this organization.</p>
                    ) : (
                      org.members.map((member: any) => (
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
                      ))
                    )}
                  </ul>
                )}
              </div>
            ))}
          </div>
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