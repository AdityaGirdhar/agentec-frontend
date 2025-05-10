'use client'

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface AgentInfoModalProps {
  agentId: string
  onClose: () => void
}

export default function AgentInfoModal({ agentId, onClose }: AgentInfoModalProps) {
  const [agent, setAgent] = useState<any>(null)

  useEffect(() => {
    if (!agentId) return
    fetch(`http://localhost:8000/agents/get_agent_info?agent_id=${agentId}`)
      .then(res => res.json())
      .then(setAgent)
      .catch(() => setAgent(null))
  }, [agentId])

  if (!agent) return null

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Agent Info - {agent.name.replace(/_/g, " ")}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left side - Marketplace Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Marketplace Info</h3>
            <div className="text-sm space-y-2">
              <p><strong>Description:</strong> {agent.marketplace_info?.description || "N/A"}</p>
              <p><strong>Tags:</strong> {agent.marketplace_info?.tags || "None"}</p>
              <p><strong>Supported Providers:</strong> {agent.marketplace_info?.supported_providers?.join(", ") || "N/A"}</p>
              <p><strong>Cost per Execution:</strong> ${agent.marketplace_info?.cost_per_execution || "N/A"}</p>
              <p><strong>Developer Contact:</strong> {agent.marketplace_info?.developer_contact || "N/A"}</p>
            </div>
          </div>

          {/* Right side - Technical Info */}
          <div className="bg-muted/50 p-4 rounded-md space-y-4">
            <h3 className="text-lg font-medium">Technical Info</h3>
            <div className="text-sm space-y-2">
              <p><strong>Base API:</strong> {agent.technical_info?.base_api || "N/A"}</p>

              <div>
                <strong>Input Fields:</strong>
                {agent.technical_info?.input_fields ? (
                  <ul className="list-disc pl-5 mt-1">
                    {Object.entries(agent.technical_info.input_fields).map(([key, val]: any) => (
                      <li key={key}>{key}: {typeof val === "object" ? JSON.stringify(val) : val}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">None</p>
                )}
              </div>

              <div>
                <strong>Output Fields:</strong>
                {agent.technical_info?.output_fields ? (
                  <ul className="list-disc pl-5 mt-1">
                    {Object.entries(agent.technical_info.output_fields).map(([key, val]: any) => (
                      <li key={key}>{key}: {typeof val === "object" ? JSON.stringify(val) : val}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">None</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}