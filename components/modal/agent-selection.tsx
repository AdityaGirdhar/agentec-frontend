'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"

interface AgentSelectionModalProps {
  agents: any[]
  open: boolean
  setOpen: (open: boolean) => void
  onSelect: (agentId: string) => void
  executionCount: number
}

export default function AgentSelectionModal({
  agents,
  open,
  setOpen,
  onSelect,
  executionCount,
}: AgentSelectionModalProps) {
  const [expandedAgentId, setExpandedAgentId] = useState<string | null>(null)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="bg-black text-white px-6 py-3 rounded-md text-base font-medium flex flex-col items-center hover:bg-black/90 transition"
        >
          <span>Choose an Agent</span>
          <span className="text-xs text-muted-foreground">
            {executionCount === 0
              ? "First Execution"
              : `Execution ${executionCount + 1}`}
          </span>
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-6xl">
        <DialogHeader>
          <DialogTitle>Select an Agent</DialogTitle>
        </DialogHeader>

        <div className={`grid ${expandedAgentId ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"} gap-4`}>
          {agents.map(agent => {
            const isExpanded = expandedAgentId === agent.id

            if (isExpanded) {
              return (
                <div
                  key={agent.id}
                  className="w-full border rounded-lg p-6 shadow-md flex flex-col lg:flex-row gap-8"
                >
                  {/* Left side: Basic Info */}
                  <div className="flex-1 space-y-4">
                    <h3 className="text-2xl font-bold">{agent.name.replace(/_/g, " ")}</h3>

                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p><strong>Description:</strong> {agent.marketplace_info?.description || "No description"}</p>
                      <p><strong>Tags:</strong> {agent.marketplace_info?.tags || "None"}</p>
                      <p><strong>Supported Providers:</strong> {agent.marketplace_info?.supported_providers?.join(", ") || "N/A"}</p>
                      <p><strong>Cost per Execution:</strong> ${agent.marketplace_info?.cost_per_execution || "N/A"}</p>
                      <p><strong>Developer Contact:</strong> {agent.marketplace_info?.developer_contact || "N/A"}</p>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button
                        size="sm"
                        className="bg-black text-white hover:bg-black/90"
                        onClick={() => {
                          onSelect(agent.id)
                          setOpen(false)
                        }}
                      >
                        Select Agent
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setExpandedAgentId(null)}
                      >
                        Close Expanded View
                      </Button>
                    </div>
                  </div>

                  {/* Right side: Technical Info */}
                  <div className="flex-1 space-y-4 border rounded-md p-4 bg-muted/50">
                    <h4 className="text-lg font-semibold">Technical Info</h4>

                    <div className="text-sm space-y-2">
                      <p><strong>Base API:</strong> {agent.technical_info?.base_api || "N/A"}</p>

                      <div>
                        <strong>Input Fields:</strong>
                        {agent.technical_info?.input_fields
                          ? (
                            <ul className="list-disc pl-6 mt-1">
                              {Object.entries(agent.technical_info.input_fields).map(([key, value]: any) => (
                                <li key={key}>
                                  {key}: {typeof value === "object" ? JSON.stringify(value) : value}
                                </li>
                              ))}
                            </ul>
                          ) : <p className="text-muted-foreground">None</p>}
                      </div>

                      <div>
                        <strong>Output Fields:</strong>
                        {agent.technical_info?.output_fields
                          ? (
                            <ul className="list-disc pl-6 mt-1">
                              {Object.entries(agent.technical_info.output_fields).map(([key, value]: any) => (
                                <li key={key}>
                                  {key}: {typeof value === "object" ? JSON.stringify(value) : value}
                                </li>
                              ))}
                            </ul>
                          ) : <p className="text-muted-foreground">None</p>}
                      </div>
                    </div>
                  </div>
                </div>
              )
            }

            return (
              <div
                key={agent.id}
                className="border rounded-lg p-4 shadow-sm hover:shadow-md transition"
              >
                <h3 className="text-lg font-semibold mb-1">
                  {agent.name.replace(/_/g, " ")}
                </h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {agent.marketplace_info?.description || "No description"}
                </p>
                <div className="text-xs mb-3">
                  <strong>Providers:</strong>{" "}
                  {agent.marketplace_info?.supported_providers?.join(", ") || "N/A"}
                </div>

                <div className="flex flex-col gap-2 mt-3">
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => onSelect(agent.id)}
                  >
                    Select Agent
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => setExpandedAgentId(agent.id)}
                  >
                    View Info
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}