'use client'

import { useEffect, useState } from "react"
import AgentInput from "@/components/agent/agent-input"
import AgentSelectionModal from "@/components/modal/agent-selection"
import TaskOutput from "@/components/task/task-output"

export default function TaskExecutionTab({ taskUUID }: { taskUUID: string }) {
  const [executions, setExecutions] = useState<any[]>([])
  const [selectedAgent, setSelectedAgent] = useState("")
  const [agents, setAgents] = useState<any[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [userId, setUserId] = useState<string>("")

  const fetchExecutions = async () => {
    const res = await fetch(`http://localhost:8000/tasks/get-executions?task_id=${taskUUID}`)
    const data = await res.json()
    setExecutions(Array.isArray(data) ? data : [])
  }

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (!storedUser) return

    const parsed = JSON.parse(storedUser)
    setUserId(parsed.id)

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

    fetchExecutions()
  }, [taskUUID])

  const clearAgentSelection = () => {
    setSelectedAgent("")
  }

  const handleSelectAgent = (agentId: string) => {
    setSelectedAgent(agentId)
  }

  return (
    <div className="flex flex-col gap-4">
      <TaskOutput executions={executions} />

      <div className="border rounded-xl bg-muted/50 p-6">
        {selectedAgent ? (
          <AgentInput
            baseApi={agents.find(agent => agent.id === selectedAgent)?.technical_info?.base_api || ""}
            inputFields={agents.find(agent => agent.id === selectedAgent)?.technical_info?.input_fields || {}}
            agentName={agents.find(agent => agent.id === selectedAgent)?.name.replace(/_/g, " ") || ""}
            agentId={selectedAgent}
            taskId={taskUUID}
            userId={userId}
            onDeselectAgent={clearAgentSelection}
            refreshExecutions={fetchExecutions}
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