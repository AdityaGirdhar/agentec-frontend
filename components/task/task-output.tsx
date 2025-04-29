'use client'

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X } from "lucide-react"

interface TaskOutputProps {
  executions: any[]
}

export default function TaskOutput({ executions }: TaskOutputProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  const selectedExecution =
    selectedIndex !== null ? executions[selectedIndex] : executions[executions.length - 1]
  const hasExecutions = executions.length > 0

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
        {/* Execution Content */}
        <div className="flex-1 overflow-y-auto px-4 pt-4 scrollbar-thin">
          <AnimatePresence mode="wait">
            {selectedExecution ? (
              <motion.div
                key={selectedExecution.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.4 }}
                className="border bg-white px-4 py-3 rounded-md shadow-sm min-h-[250px]"
              >
                <div className="text-sm font-medium">
                  Execution #{selectedExecution.sequence_number || executions.length}
                </div>
                <div className="text-xs text-gray-600">
                  {new Date(selectedExecution.creation_time).toLocaleString()}
                </div>
                <div className="mt-2">
                  <strong>Prompt:</strong> {selectedExecution.input.query}
                </div>
                <div className="mt-1">
                  <strong>Output:</strong>
                  <pre className="text-sm mt-1 whitespace-pre-wrap">
                    {selectedExecution.output.output_text}
                  </pre>
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

        {/* Side Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              className="absolute left-0 top-0 h-full w-64 bg-white z-20 border-r shadow-lg flex flex-col"
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

                {executions.map((exec, idx) => (
                  <button
                    key={exec.id || idx}
                    className={`w-full text-left border p-2 rounded text-sm transition ${
                      selectedIndex === idx ? "bg-gray-100" : "hover:bg-gray-50"
                    }`}
                    onClick={() => {
                      setSelectedIndex(idx)
                      setMenuOpen(false)
                    }}
                  >
                    <div className="font-medium">Execution #{exec.sequence_number || idx + 1}</div>
                    <div className="text-xs text-gray-600">
                      {new Date(exec.creation_time).toLocaleString()}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}