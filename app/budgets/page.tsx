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
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

const COLORS = ["#4ade80", "#facc15", "#f87171"]; // green, yellow, red

const dummySpend = 450
const dummyLimit = 500

export default function Page() {
  const [open, setOpen] = useState(false)
  const [selectedRange, setSelectedRange] = useState("month")
  const [showHelpModal, setShowHelpModal] = useState(false)

  const [limit, setLimit] = useState(dummyLimit)
  const [spend, setSpend] = useState(dummySpend)

  const costData = [
    { name: 'Spent', value: dummySpend },
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
    <>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="#">Budgets</BreadcrumbLink>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>

          <div className="flex flex-1 flex-col gap-4 p-4 pt-0 pr-10">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold">Budgets</h1>

              {/* Day/Week/Month Selector */}
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
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">Edit Limit</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogTitle>Update Limit</DialogTitle>
                    <form className="grid gap-4" onSubmit={(e) => {
                      e.preventDefault()
                      const formData = new FormData(e.currentTarget)
                      const newLimit = formData.get("amount")
                      if (newLimit) {
                        setLimit(Number(newLimit))
                      }
                      setOpen(false)
                    }}>
                      <div className="grid gap-2">
                        <Label>Amount</Label>
                        <Input name="amount" type="number" required defaultValue={limit} />
                      </div>
                      <Button type="submit">Save</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Flex container for PieChart + Spend + Limit */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-8 px-40 py-2">
                
                {/* Pie Chart */}
                <div className="relative w-36 h-36">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        startAngle={90}
                        endAngle={-270}
                        data={[
                          { name: 'Spent', value: spend },
                          { name: 'Remaining', value: Math.max(limit - spend, 0) },
                        ]}
                        dataKey="value"
                        innerRadius={60}
                        outerRadius={70}
                        animationDuration={800}
                        isAnimationActive
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

                {/* Total Spend */}
                <div className="flex flex-col items-center">
                  <div className="text-5xl font-bold" style={{ color: utilizationColor }}>
                    ${spend}
                  </div>
                  <div className="text-muted-foreground">Total Spend</div>
                </div>

                {/* Current Limit */}
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
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium">Task Spend History</h2>
              </div>
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
        {showHelpModal && (
  <div className="fixed inset-0 z-50 bg-black bg-opacity-30 flex items-center justify-center">
    <div className="bg-white rounded-lg p-6 w-full max-w-xl shadow-xl relative">
      <h2 className="text-lg font-semibold mb-4">Help - Budgets Page</h2>
      <div className="space-y-4 text-sm text-muted-foreground">
        <p><strong>Limits:</strong> You can set custom spending limits for specific date ranges. These are stored in your browser's local storage.</p>
        <p><strong>Adding Limits:</strong> Click "Set limits" to add a new budget limit by selecting start and end dates and a budget amount.</p>
        <p><strong>Deleting Limits:</strong> Use the "Delete" button beside a limit to remove it.</p>
        <p><strong>Alerts:</strong> This section will show budget breach alerts in the future, once integrated with task execution tracking.</p>
      </div>
      <Button
        className="absolute top-3 right-3 text-sm px-2 py-1"
        variant="ghost"
        onClick={() => setShowHelpModal(false)}
      >
        Close
      </Button>
    </div>
  </div>
)}
      </SidebarProvider>
    </>
  )
}
