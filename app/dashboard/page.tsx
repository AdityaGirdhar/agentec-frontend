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
import Link from "next/link"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import { KeysModal } from "./keysModal"

const costData = [
  { name: "Total", value: 250 },
  { name: "Projected", value: 400 },
]

const COLORS = ["#E5E7EB", "#6366F1"]

export default function Page() {
  const [limits, setLimits] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const [timeframe, setTimeframe] = useState("day")
  const [showModal, setShowModal] = useState(false)
  const [isBlurred, setIsBlurred] = useState(false)

  useEffect(() => {
    const storedLimits = localStorage.getItem("taskLimits")
    if (storedLimits) setLimits(JSON.parse(storedLimits))

    if (localStorage.getItem("show_key_modal") === "true") {
      setShowModal(true)
      setIsBlurred(true)
    } else {
      setShowModal(false)
      setIsBlurred(false)
    }
  }, [])

  const addLimit = (limit: any) => {
    const updated = [...limits, limit]
    setLimits(updated)
    localStorage.setItem("taskLimits", JSON.stringify(updated))
  }

  const deleteLimit = (index: number) => {
    const updated = [...limits.slice(0, index), ...limits.slice(index + 1)]
    setLimits(updated)
    localStorage.setItem("taskLimits", JSON.stringify(updated))
  }

  const handleModalClose = () => {
    localStorage.setItem("show_key_modal", "false")
    setShowModal(false)
    setIsBlurred(false)
  }

  return (
    <>
      <div
        className={`transition-all duration-200 ${
          isBlurred ? 'blur-sm pointer-events-none' : ''
        }`}
      >
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
                      <BreadcrumbLink href="#">Dashboard</BreadcrumbLink>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </header>

            <div className="flex flex-1 flex-col gap-4 p-4 pt-0 pr-6">
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
                      <div className="text-5xl font-bold">$250</div>
                      <div className="text-muted-foreground">Total Cost</div>
                    </div>
                    <div>
                      <div className="text-4xl font-semibold text-gray-600">$400</div>
                      <div className="text-muted-foreground">Projected Cost</div>
                    </div>
                    <div className="w-24 h-24">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={costData} dataKey="value" outerRadius={40} innerRadius={25}>
                            {costData.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
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
                      <div className="text-5xl font-bold">82</div>
                      <div className="text-muted-foreground">Tasks Executed</div>
                    </div>
                    <div>
                      <div className="text-4xl font-semibold text-green-600">76</div>
                      <div className="text-muted-foreground">Successful Executions</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="animate-in zoom-in-90 duration-200">
            <KeysModal onClose={handleModalClose} />
          </div>
        </div>
      )}
    </>
  )
}