'use client'

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, Info, KeyRound, Bot } from "lucide-react"

interface TaskOutputProps {
  executions: any[]
}

export default function TaskOutput({ executions }: TaskOutputProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [keyInfo, setKeyInfo] = useState<any | null>(null)
  const [agentInfo, setAgentInfo] = useState<any | null>(null)
  const [userInfo, setUserInfo] = useState<any | null>(null)
  const [userMap, setUserMap] = useState<Record<string, string>>({})

  const selectedExecution =
    selectedIndex !== null ? executions[selectedIndex] : executions[executions.length - 1]

  const hasExecutions = executions.length > 0

  // Fetch user names for all executions
  useEffect(() => {
    const uniqueUserIds = Array.from(new Set(executions.map(exec => exec.user_id)))

    Promise.all(
      uniqueUserIds.map(id =>
        fetch(`http://localhost:8000/users/get_user_info?user_id=${id}`)
          .then(res => res.json())
          .then(data => ({ id, name: data.name }))
          .catch(() => ({ id, name: "Unknown User" }))
      )
    ).then(userList => {
      const map: Record<string, string> = {}
      userList.forEach(u => (map[u.id] = u.name))
      setUserMap(map)
    })
  }, [executions])

  // Fetch additional info for selected execution
  useEffect(() => {
    if (!selectedExecution) return

    const { input, agent_id, user_id } = selectedExecution
    const keyId = input?.key_id

    if (keyId) {
      fetch(`http://localhost:8000/users/get_key_info?key_id=${keyId}`)
        .then(res => res.json())
        .then(setKeyInfo)
        .catch(() => setKeyInfo(null))
    } else {
      setKeyInfo(null)
    }

    if (agent_id) {
      fetch(`http://localhost:8000/agents/get_agent_info?agent_id=${agent_id}`)
        .then(res => res.json())
        .then(setAgentInfo)
        .catch(() => setAgentInfo(null))
    } else {
      setAgentInfo(null)
    }

    if (user_id) {
      fetch(`http://localhost:8000/users/get_user_info?user_id=${user_id}`)
        .then(res => res.json())
        .then(setUserInfo)
        .catch(() => setUserInfo(null))
    } else {
      setUserInfo(null)
    }
  }, [selectedExecution])

  return (
    <div className="relative overflow-hidden border rounded-xl bg-muted/50 flex flex-col min-h-[320px]">
      {hasExecutions && !menuOpen && (
        <button
          className="absolute top-2 left-2 z-10 p-1 rounded-md backdrop-blur-md bg-black/30 hover:bg-black/70 text-white transition"
          onClick={() => setMenuOpen(true)}
        >
          <Menu size={18} />
        </button>
      )}

      <div className="relative flex-1 flex overflow-hidden min-h-[320px]">
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              className="absolute inset-0 bg-black/10 backdrop-blur-sm z-10 cursor-pointer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Main Output */}
        <div className="flex-1 overflow-y-auto px-6 py-4 scrollbar-thin relative z-0">
          <AnimatePresence mode="wait">
            {selectedExecution ? (
              <motion.div
                key={selectedExecution.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.4 }}
                className="bg-white p-6 rounded-md shadow-md relative"
              >
                {/* Info Icon */}
                <div className="absolute top-4 right-4 group">
                  <Info size={18} className="text-gray-400 group-hover:text-black transition" />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 bg-black text-white text-xs rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap text-left">
                    <div>
                      {new Date(selectedExecution.creation_time).toLocaleString()}
                    </div>
                    <div>
                      Execution #{selectedExecution.sequence_number || executions.length}
                    </div>
                    {userInfo?.name && (
                      <div className="mt-1 text-gray-300">By {userInfo.name}</div>
                    )}
                  </div>
                </div>

                {/* Query */}
                <div className="mb-6">
                  <div className="text-xs uppercase text-gray-500 mb-2 tracking-widest">Your Query</div>
                  <div className="bg-gray-50 rounded-md p-4 text-sm whitespace-pre-wrap mb-3">
                    {selectedExecution.input.query}
                  </div>

                  {/* Input Params */}
                  <div className="flex flex-wrap gap-3 items-center text-xs text-gray-600">
                    {selectedExecution.input.provider && (
                      <div className="px-2 py-1 bg-gray-100 rounded">
                        Provider: <span className="font-medium text-gray-800">{selectedExecution.input.provider}</span>
                      </div>
                    )}
                    {keyInfo && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded">
                        <KeyRound size={14} className="text-gray-700" />
                        <span className="font-medium text-gray-800">{keyInfo.name}</span>
                      </div>
                    )}
                    {agentInfo && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded">
                        <Bot size={14} className="text-gray-700" />
                        <span className="font-medium text-gray-800">{agentInfo.name}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Output */}
                <div>
                  <div className="text-xs uppercase text-gray-500 mb-2 tracking-widest">Agent Response</div>
                  <div className="bg-gray-50 rounded-md p-4 text-sm whitespace-pre-wrap">
                    {selectedExecution.output.output_text}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="no-execution"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex justify-center items-center text-muted-foreground text-lg h-full min-h-[250px]"
              >
                No Past Executions
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              className="absolute left-0 top-0 h-full w-80 bg-white z-20 border-r shadow-lg flex flex-col"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3 }}
            >
              <div className="flex items-center justify-between p-4 border-b">
                <span className="text-sm font-semibold">Execution History</span>
                <button onClick={() => setMenuOpen(false)}>
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-2 space-y-2">
                <button
                  className="w-full bg-black text-white text-sm px-3 py-2 rounded hover:bg-gray-900 transition"
                  onClick={() => {
                    setSelectedIndex(null)
                    setMenuOpen(false)
                  }}
                >
                  Show Latest
                </button>

                {executions.map((exec, idx) => {
                  const isSelected = selectedIndex === idx || (selectedIndex === null && idx === executions.length - 1)
                  return (
                    <motion.button
                      key={exec.id || idx}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`w-full text-left border p-2 rounded text-sm transition relative ${
                        isSelected
                          ? "bg-black text-white shadow-md"
                          : "hover:bg-gray-50"
                      }`}
                      onClick={() => {
                        setSelectedIndex(idx)
                        setMenuOpen(false)
                      }}
                    >
                      <div className="flex justify-between items-center font-medium">
                        <span>Execution #{exec.sequence_number || idx + 1}</span>
                        <span className="text-xs opacity-70">
                          {new Date(exec.creation_time).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="text-xs mt-1 text-gray-500">
                        {userMap[exec.user_id] || "Unknown User"}
                      </div>
                    </motion.button>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}