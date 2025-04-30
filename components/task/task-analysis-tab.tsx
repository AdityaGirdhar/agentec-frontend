'use client'

import { useEffect, useState } from 'react'
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { format } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'

interface Execution {
  id: string
  sequence_number: number
  creation_time: string
  agent_name: string
  key_name: string
  user_name: string
  cost_incurred: number
}

export default function TaskAnalysisTab({ taskUUID }: { taskUUID: string }) {
  const [executions, setExecutions] = useState<Execution[]>([])
  const [filteredExecutions, setFilteredExecutions] = useState<Execution[]>([])
  const [filter, setFilter] = useState<'day' | 'week' | 'month' | 'all'>('day')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`http://localhost:8000/tasks/task-analysis?task_id=${taskUUID}`)
      .then(res => res.json())
      .then(data => {
        setExecutions(data)
        setLoading(false)
      })
      .catch(() => {
        setExecutions([])
        setLoading(false)
      })
  }, [taskUUID])

  useEffect(() => {
    const now = new Date()
    const filtered = executions.filter(exec => {
      const execDate = new Date(exec.creation_time)

      if (filter === 'day') {
        return (
          execDate.getFullYear() === now.getFullYear() &&
          execDate.getMonth() === now.getMonth() &&
          execDate.getDate() === now.getDate()
        )
      } else if (filter === 'week') {
        const oneWeekAgo = new Date(now)
        oneWeekAgo.setDate(now.getDate() - 7)
        return execDate >= oneWeekAgo
      } else if (filter === 'month') {
        return (
          execDate.getFullYear() === now.getFullYear() &&
          execDate.getMonth() === now.getMonth()
        )
      }
      return true
    })
    setFilteredExecutions(filtered)
  }, [executions, filter])

  const totalExecutions = filteredExecutions.length
  const totalCost = filteredExecutions.reduce((sum, e) => sum + e.cost_incurred, 0)

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border bg-muted/50 p-6 min-h-[200px]">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center text-muted-foreground text-lg h-[200px]"
            >
              Loading analysis...
            </motion.div>
          ) : executions.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center text-muted-foreground text-lg h-[200px]"
            >
              No Executions to analyze
            </motion.div>
          ) : (
            <motion.div
              key="data"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex gap-10 items-baseline">
                  <div className="text-xl font-semibold text-gray-700">
                    Executions: <span className="text-black text-2xl">{totalExecutions}</span>
                  </div>
                  <div className="text-xl font-semibold text-gray-700">
                    Cost: <span className="text-black text-2xl">${totalCost.toFixed(2)}</span>
                  </div>
                </div>
                <ToggleGroup
                  type="single"
                  value={filter}
                  onValueChange={(val) => setFilter(val as any)}
                  className="bg-white border rounded-md"
                >
                  <ToggleGroupItem value="day">Day</ToggleGroupItem>
                  <ToggleGroupItem value="week">Week</ToggleGroupItem>
                  <ToggleGroupItem value="month">Month</ToggleGroupItem>
                  <ToggleGroupItem value="all">All</ToggleGroupItem>
                </ToggleGroup>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border rounded-md bg-white">
                  <thead className="bg-gray-100 text-gray-700">
                    <tr>
                      <th className="px-4 py-2">#</th>
                      <th className="px-4 py-2">Time</th>
                      <th className="px-4 py-2">Agent</th>
                      <th className="px-4 py-2">Key</th>
                      <th className="px-4 py-2">User</th>
                      <th className="px-4 py-2">Cost (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredExecutions.map(exec => (
                      <tr key={exec.id} className="border-t hover:bg-gray-50 transition">
                        <td className="px-4 py-2">{exec.sequence_number}</td>
                        <td className="px-4 py-2">{format(new Date(exec.creation_time), 'PPpp')}</td>
                        <td className="px-4 py-2">{exec.agent_name}</td>
                        <td className="px-4 py-2">{exec.key_name}</td>
                        <td className="px-4 py-2">{exec.user_name}</td>
                        <td className="px-4 py-2">{exec.cost_incurred.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}