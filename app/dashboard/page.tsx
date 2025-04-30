'use client'

import { useEffect, useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"

const dummyActivity = [
  { id: 1, title: "Created Task", subtitle: "Image Classifier", timestamp: "2 mins ago" },
  { id: 2, title: "Executed Agent", subtitle: "Market Tracker", timestamp: "5 mins ago" },
  { id: 3, title: "Shared API Key", subtitle: "OpenAI Key A", timestamp: "10 mins ago" },
  { id: 4, title: "Created Budget", subtitle: "April Spend Cap", timestamp: "1 hour ago" },
  { id: 5, title: "Viewed Report", subtitle: "Weekly Summary", timestamp: "2 hours ago" },
  { id: 6, title: "Edited Agent", subtitle: "Data Cleaner", timestamp: "3 hours ago" },
  { id: 7, title: "Deleted Task", subtitle: "Old Generator", timestamp: "Yesterday" },
  { id: 8, title: "Joined Org", subtitle: "Agentec Team", timestamp: "2 days ago" },
]

export default function Page() {
  const [timeframe, setTimeframe] = useState("day")
  const [executionData, setExecutionData] = useState({ task_count: 0, execution_count: 0 })
  const [budgetData, setBudgetData] = useState({ current_cost: 0, projected_cost: 0 })

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (!storedUser) return
    const userId = JSON.parse(storedUser).id

    fetch(`http://localhost:8000/analytics/total_tasks_executed?user_id=${userId}&period=${timeframe}`)
      .then(res => res.json())
      .then(setExecutionData)
      .catch(err => console.error("Execution fetch error", err))

    fetch(`http://localhost:8000/analytics/total_budget_consumed?user_id=${userId}&period=${timeframe}`)
      .then(res => res.json())
      .then(setBudgetData)
      .catch(err => console.error("Budget fetch error", err))
  }, [timeframe])

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="flex flex-col gap-4 px-6 pb-10 pt-2">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Dashboard</h1>
            <ToggleGroup
              type="single"
              value={timeframe}
              onValueChange={(value) => value && setTimeframe(value)}
            >
              <ToggleGroupItem value="day">Day</ToggleGroupItem>
              <ToggleGroupItem value="week">Week</ToggleGroupItem>
              <ToggleGroupItem value="month">Month</ToggleGroupItem>
            </ToggleGroup>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl bg-muted/50 p-8 flex flex-col justify-between space-y-4">
              <h2 className="text-lg font-medium">Cost</h2>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <div className="text-5xl font-bold">${budgetData.current_cost.toFixed(2)}</div>
                  <div className="text-muted-foreground">Total Cost</div>
                </div>
                <div>
                  <div className="text-4xl font-semibold text-gray-600">${budgetData.projected_cost.toFixed(2)}</div>
                  <div className="text-muted-foreground">Projected Cost</div>
                </div>
                <div className="w-24 h-24">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Total", value: budgetData.current_cost },
                          { name: "Projected", value: budgetData.projected_cost }
                        ]}
                        dataKey="value"
                        outerRadius={40}
                        innerRadius={25}
                      >
                        <Cell fill="#E5E7EB" />
                        <Cell fill="#6366F1" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-muted/50 p-8 flex flex-col justify-between space-y-4">
              <h2 className="text-lg font-medium">Executions</h2>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <div className="text-5xl font-bold">{executionData.task_count}</div>
                  <div className="text-muted-foreground">Tasks Created</div>
                </div>
                <div>
                  <div className="text-4xl font-semibold text-green-600">{executionData.execution_count}</div>
                  <div className="text-muted-foreground">Successful Executions</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {dummyActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="border rounded-lg bg-white p-4 shadow-sm hover:shadow transition"
                >
                  <h3 className="text-sm font-medium">{activity.title}</h3>
                  <p className="text-xs text-muted-foreground">{activity.subtitle}</p>
                  <p className="mt-2 text-[11px] text-muted-foreground">{activity.timestamp}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}