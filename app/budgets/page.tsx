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
import { Button } from "@/components/ui/button"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Input } from "@/components/ui/input"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Pencil } from "lucide-react"

const COLORS = ["#4ade80", "#facc15", "#f87171"] // green, yellow, red

const dummySpend = 450
const dummyLimit = 500

export default function Page() {
  const [selectedRange, setSelectedRange] = useState("month")
  const [showHelpModal, setShowHelpModal] = useState(false)
  const [limit, setLimit] = useState(dummyLimit)
  const [spend, setSpend] = useState(dummySpend)
  const [editing, setEditing] = useState(false)
  const [newLimit, setNewLimit] = useState(limit)

  const costData = [
    { name: 'Spent', value: spend },
    { name: 'Remaining', value: Math.max(limit - spend, 0) },
  ]

  const [tableData, setTableData] = useState([
    { date: '2025-04-27', task: 'Task A', count: 10, cost: 100 },
    { date: '2025-04-27', task: 'Task B', count: 5, cost: 200 },
    { date: '2025-04-26', task: 'Task C', count: 2, cost: 50 },
  ])

  const utilization = (spend / limit) * 100
  const utilizationColor = utilization < 90 ? "#4ade80" : utilization <= 100 ? "#facc15" : "#f87171"

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">Budgets</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0 pr-10">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Budgets</h1>
            <ToggleGroup
              type="single"
              value={selectedRange}
              onValueChange={(value) => value && setSelectedRange(value)}
            >
              <ToggleGroupItem value="day">Day</ToggleGroupItem>
              <ToggleGroupItem value="week">Week</ToggleGroupItem>
              <ToggleGroupItem value="month">Month</ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* Spends Section */}
          <div className="rounded-xl bg-muted/50 p-8 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">Spends</h2>
              {!editing ? (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setNewLimit(limit)
                    setEditing(true)
                  }}
                >
                  <Pencil size={16} />
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={newLimit}
                    onChange={(e) => setNewLimit(Number(e.target.value))}
                    className="h-8 w-24"
                  />
                  <Button
                    size="sm"
                    onClick={() => {
                      setLimit(newLimit)
                      setEditing(false)
                    }}
                  >
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setEditing(false)
                      setNewLimit(limit)
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>

            {/* Chart + Spend + Limit */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-8 px-40 py-2">
              <div className="relative w-36 h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      startAngle={90}
                      endAngle={-270}
                      data={costData}
                      dataKey="value"
                      innerRadius={60}
                      outerRadius={70}
                    >
                      <Cell fill={utilizationColor} />
                      <Cell fill="#e5e7eb" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold">{Math.round(utilization)}%</span>
                  <span className="text-xs text-muted-foreground">Utilized</span>
                </div>
              </div>

              <div className="flex flex-col items-center">
                <div className="text-5xl font-bold" style={{ color: utilizationColor }}>
                  ${spend}
                </div>
                <div className="text-muted-foreground">Total Spend</div>
              </div>

              <div className="flex flex-col items-center">
                <div className="text-5xl font-bold text-gray-700">
                  ${limit}
                </div>
                <div className="text-muted-foreground">Current Limit</div>
              </div>
            </div>
          </div>

          {/* Table Section */}
          <div className="rounded-xl bg-muted/50 p-4">
            <h2 className="text-lg font-medium mb-4">Task Spend History</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>S.no</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Task Name</TableHead>
                  <TableHead>Execution Count</TableHead>
                  <TableHead>Total Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableData.map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell>{row.date}</TableCell>
                    <TableCell>{row.task}</TableCell>
                    <TableCell>{row.count}</TableCell>
                    <TableCell>${row.cost}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}