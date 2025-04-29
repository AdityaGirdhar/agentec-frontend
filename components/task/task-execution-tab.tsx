'use client'

import { useEffect, useState } from "react"
import AgentInput from "@/components/agent/agent-input"
import AgentSelectionModal from "@/components/modal/agent-selection"

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

  const handleSelectAgent = (agentId: string) => {
    setSelectedAgent(agentId)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Execution History Box */}
      <div className="relative overflow-hidden border rounded-xl bg-muted/50 flex flex-col min-h-[200px]">
        <div className="flex-1 overflow-y-auto px-4 pt-4 space-y-4 scrollbar-thin">
          {executions.length === 0 ? (
            <div className="flex justify-center items-center text-muted-foreground text-lg h-full min-h-[160px]">
              No Past Executions
            </div>
          ) : (
            <div className="space-y-4">
              {/* Replace this with actual execution rendering */}
              {executions.map((exec: any, idx: number) => (
                <div
                  key={exec.id || idx}
                  className="border bg-white px-4 py-3 rounded-md shadow-sm"
                >
                  <div className="text-sm font-medium">Execution #{exec.sequence_number || idx + 1}</div>
                  <div className="text-xs text-gray-600">{new Date(exec.creation_time).toLocaleString()}</div>
                  <div className="mt-2">
                    <strong>Prompt:</strong> {exec.input_text}
                  </div>
                  <div className="mt-1">
                    <strong>Output:</strong>
                    <pre className="text-sm mt-1 whitespace-pre-wrap">{exec.output_text}</pre>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Agent Input or Selection */}
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
            <AgentSelectionModal
              agents={agents}
              open={modalOpen}
              setOpen={setModalOpen}
              onSelect={handleSelectAgent}
              executionCount={executions.length}
            />
            <div className="text-sm text-muted-foreground text-center max-w-sm">
              You must select an agent to proceed with execution.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}