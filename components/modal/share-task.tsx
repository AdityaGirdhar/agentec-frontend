'use client'

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

interface ShareTaskModalProps {
  taskId: string
  user: any
  orgMembers: any[]
  sharedInfoMap: Record<string, any[]>
  onClose: () => void
  onShared: () => void
}

export default function ShareTaskModal({
  taskId,
  user,
  orgMembers,
  sharedInfoMap,
  onClose,
  onShared
}: ShareTaskModalProps) {
  const filteredMembers = orgMembers.filter(member => member.id !== user?.id)

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-30 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl relative">
        <h2 className="text-lg font-semibold mb-4">Share Task</h2>

        {!user?.organization ? (
          <div className="text-sm text-muted-foreground">
            You are not part of any organization. Sharing is unavailable.
          </div>
        ) : filteredMembers.length === 0 ? (
          <p className="text-sm text-muted-foreground">No other organization members found.</p>
        ) : (
          <ul className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {filteredMembers.map((member: any) => (
              <li
                key={member.id}
                className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md border"
              >
                <div>
                  <p className="text-sm font-medium">{member.name}</p>
                  <p className="text-xs text-muted-foreground">{member.email}</p>
                </div>
                {sharedInfoMap[taskId]?.some(s => s.reciever_id === member.id) ? (
                  <Button size="sm" variant="outline" disabled>
                    Shared
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      try {
                        const res = await fetch("http://localhost:8000/tasks/share-task", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            sender_id: user.id,
                            reciever_id: member.id,
                            task_id: taskId,
                          }),
                        })

                        const data = await res.json()
                        if (data.shared) {
                          onShared()
                        }
                      } catch (err) {
                        console.error("Failed to share task", err)
                      }
                    }}
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