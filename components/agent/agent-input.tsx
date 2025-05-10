'use client'

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronUp, X, Share2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface AgentInputProps {
  baseApi: string
  inputFields: Record<string, any>
  agentName: string
  agentId: string
  taskId: string
  userId: string
  onDeselectAgent: () => void
  refreshExecutions: () => void
}

interface KeyItem {
  id: string
  name: string
  shared?: boolean
}

export default function AgentInput({
  baseApi,
  inputFields,
  agentName,
  agentId,
  taskId,
  userId,
  onDeselectAgent,
  refreshExecutions
}: AgentInputProps) {
  const [fieldValues, setFieldValues] = useState<Record<string, any>>({})
  const [query, setQuery] = useState("")
  const [keys, setKeys] = useState<KeyItem[]>([])
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null)

  useEffect(() => {
    const fetchKeys = async () => {
      try {
        const [ownRes, sharedRes] = await Promise.all([
          fetch(`http://localhost:8000/users/get_keys?user_id=${userId}`),
          fetch(`http://localhost:8000/users/keys-shared-with-you?user_id=${userId}`)
        ])

        const ownKeys = await ownRes.json()

        const sharedRaw = await sharedRes.json()
        const sharedKeys = await Promise.all(
          sharedRaw.map(async (item: any) => {
            try {
              const keyInfoRes = await fetch(`http://localhost:8000/users/get_key_info?key_id=${item.key_id}`)
              const keyInfo = await keyInfoRes.json()
              return { id: keyInfo.id, name: keyInfo.name, shared: true }
            } catch {
              return null
            }
          })
        )

        setKeys([
          ...ownKeys.map((k: any) => ({ id: k.id, name: k.name })),
          ...sharedKeys.filter(Boolean)
        ])
      } catch (err) {
        console.error("Failed to fetch keys", err)
      }
    }

    fetchKeys()
  }, [userId])

  const allFieldsSelected = () => {
    return Object.keys(inputFields).every(key => {
      if (inputFields[key].dropdown_select) return fieldValues[key]
      if (inputFields[key].key_select !== undefined) return fieldValues[key]
      return true
    }) && query.trim() !== ""
  }

  const handleSend = async () => {
    const payload = { ...fieldValues, query }

    toast({
      title: "Execution Started",
      description: "The agent is now processing your input.",
    })

    try {
      const res = await fetch(`http://localhost:8000/${baseApi}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (data.status === "Success") {
        const executionPayload = {
          user_id: userId,
          task_id: taskId,
          agent_id: agentId,
          key_id: fieldValues["key_id"],
          input: payload,
          output: data.output,
        }

        await fetch(`http://localhost:8000/tasks/create-execution`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(executionPayload),
        })

        refreshExecutions()

        toast({
          title: "Execution Completed",
          description: "Execution saved successfully.",
          variant: "success",
        })
      } else if (data.status === "Failed") {
        toast({
          title: "Execution Failed",
          description: data.message || "Agent returned an error.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Unexpected Response",
          description: "Unknown status received from the agent.",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Failed to send data", err)
      toast({
        title: "Execution Failed",
        description: "Something went wrong while sending data.",
        variant: "destructive",
      })
    }
  }

  const toggleDropdown = (key: string) => {
    setDropdownOpen(dropdownOpen === key ? null : key)
  }

  const clearField = (key: string, e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation()
    setFieldValues(prev => ({ ...prev, [key]: undefined }))
    setDropdownOpen(null)
  }

  const formatLabel = (text: string) => {
    if (text.toLowerCase() === "key_id") return "Key"
    return text.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-4 pb-2">
        <div className="w-full">
          <textarea
            placeholder="Enter your query..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="text-[15px] w-full min-h-[20px] p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300 resize-y overflow-auto"
          />
        </div>
      </div>

      <div className="border-t pt-2 flex items-center justify-between gap-2">
        <div className="flex gap-2 flex-wrap items-center relative z-10">
          {Object.keys(inputFields).map((key) => {
            const isDropdown = inputFields[key].dropdown_select
            const isKeySelect = inputFields[key].key_select !== undefined
            if (!isDropdown && !isKeySelect) return null

            return (
              <div key={key} className="relative flex flex-col items-start">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleDropdown(key)}
                  className="flex items-center gap-1 relative z-20"
                >
                  {fieldValues[key] ? `${formatLabel(key)}: ${
                    isDropdown
                      ? fieldValues[key]
                      : keys.find(k => k.id === fieldValues[key])?.name || "Selected"
                  }` : formatLabel(key)}
                  {fieldValues[key] && (
                    <button
                      onClick={(e) => clearField(key, e)}
                      className="ml-1 p-0.5 rounded-full hover:bg-gray-200"
                      type="button"
                    >
                      <X size={12} />
                    </button>
                  )}
                </Button>

                {dropdownOpen === key && (
                  <div className="absolute left-0 bottom-full mb-2 w-52 bg-white border rounded-md shadow-md z-50">
                    {(isDropdown ? inputFields[key].dropdown_select : keys).map((item: any, idx: number) => (
                      <button
                        key={isDropdown ? idx : item.id}
                        className={`flex items-center gap-2 w-full px-4 py-2 text-[13px] hover:bg-gray-100 text-left ${idx !== 0 ? 'border-t border-gray-200' : ''}`}
                        onClick={() => {
                          setFieldValues(prev => ({ ...prev, [key]: isDropdown ? item : item.id }))
                          setDropdownOpen(null)
                        }}
                      >
                        {!isDropdown && item.shared && (
                          <Share2 size={12} className="text-muted-foreground" />
                        )}
                        {isDropdown ? item : item.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Button
              variant="default"
              className="bg-black text-white hover:ring-2 hover:ring-gray-300 rounded-md px-4 flex items-center gap-1 cursor-default"
            >
              {agentName}
            </Button>
            <button
              type="button"
              onClick={onDeselectAgent}
              className="absolute -right-2 -top-2 bg-white border border-gray-300 text-red-600 rounded-full p-1 hover:bg-gray-100"
            >
              <X size={14} />
            </button>
          </div>
          <Button
            size="icon"
            className="bg-black text-white hover:bg-black/90"
            disabled={!allFieldsSelected()}
            onClick={handleSend}
          >
            <ChevronUp size={20} />
          </Button>
        </div>
      </div>
    </div>
  )
}