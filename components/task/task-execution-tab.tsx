'use client'

import { useEffect, useState } from "react"
import AgentInput from "@/components/agent/agent-input"
import { Button } from "@/components/ui/button"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog"

export default function TaskExecutionTab({ taskUUID }: { taskUUID: string }) {
  const [executions, setExecutions] = useState<any[]>([])
  const [selectedAgent, setSelectedAgent] = useState("")
  const [agents, setAgents] = useState<any[]>([])
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (!storedUser) return

    const parsed = JSON.parse(storedUser)

    fetch(`http://localhost:8000/users/get_saved_agents?user_id=${parsed.id}`)
      .then(res => res.json())
      .then(async (agentIds: string[]) => {
        const agentDetails = await Promise.all(
          agentIds.map(async id =>
            fetch(`http://localhost:8000/agents/get_agent_info?agent_id=${id}`).then(res => res.json())
          )
        )
        setAgents(agentDetails)
      })

    fetch(`http://localhost:8000/tasks/get-executions?task_id=${taskUUID}`)
      .then(res => res.json())
      .then(data => {
        const execData = Array.isArray(data) ? data : []
        setExecutions(execData)
      })
  }, [taskUUID])

  const clearAgentSelection = () => {
    setSelectedAgent("")
  }

  return (
    <div className="flex flex-col gap-4">
      {executions.length > 0 && (
        <div className="relative flex-1 overflow-hidden border rounded-xl bg-muted/50 flex flex-col mb-2">
          <div className="flex-1 overflow-y-auto px-4 pt-4 space-y-4 scrollbar-thin">
            {/* Replace this with actual render logic */}
            <div>Execution list here</div>
          </div>
        </div>
      )}

      <div className="border rounded-xl bg-muted/50 p-6">
        {selectedAgent ? (
          <AgentInput
            baseApi={agents.find(agent => agent.id === selectedAgent)?.technical_info?.base_api || ""}
            inputFields={agents.find(agent => agent.id === selectedAgent)?.technical_info?.input_fields || {}}
            agentName={agents.find(agent => agent.id === selectedAgent)?.name.replace(/_/g, " ") || ""}
            onDeselectAgent={clearAgentSelection}
          />
        ) : (
          <div className="flex flex-col justify-center items-center gap-4">
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
              <DialogTrigger asChild>
                <button
                  onClick={() => setModalOpen(true)}
                  className="bg-black text-white px-6 py-3 rounded-md text-base font-medium flex flex-col items-center hover:bg-black/90 transition"
                >
                  <span>Choose an Agent</span>
                  <span className="text-xs text-muted-foreground">
                    {executions.length === 0
                      ? "First Execution"
                      : `Execution ${executions.length + 1}`}
                  </span>
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-5xl">
                <DialogHeader>
                  <DialogTitle>Select an Agent</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {agents.map(agent => (
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
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          setSelectedAgent(agent.id)
                          setModalOpen(false)
                        }}
                      >
                        Select Agent
                      </Button>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
            <div className="text-sm text-muted-foreground text-center max-w-sm">
              You must select an agent to proceed with execution.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}