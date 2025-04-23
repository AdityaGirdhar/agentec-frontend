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

export default function Page() {
  const [limits, setLimits] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const [showHelpModal, setShowHelpModal] = useState(false)

  useEffect(() => {
    const storedLimits = localStorage.getItem("taskLimits")
    if (storedLimits) setLimits(JSON.parse(storedLimits))
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

  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
        <header className="relative flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
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
  <Button
    size="sm"
    variant="outline"
    className="absolute right-4"
    onClick={() => setShowHelpModal(true)}
  >
    Help
  </Button>
</header>

          <div className="flex flex-1 flex-col gap-4 p-4 pt-0 pr-10">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold">Budgets</h1>
            </div>

            <div className="grid auto-rows-min gap-4 md:grid-cols-2">
              <div className="aspect-video rounded-xl bg-muted/50 p-4">
                <h2 className="text-lg font-medium">Limits</h2>
                {limits.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No task limits set up</p>
                ) : (
                  <div className="mt-2 overflow-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left">
                          <th className="pr-4">Start Date</th>
                          <th className="pr-4">End Date</th>
                          <th className="pr-4">Amount</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {limits.map((limit, idx) => (
                          <tr key={idx}>
                            <td className="pr-4">{limit.start}</td>
                            <td className="pr-4">{limit.end}</td>
                            <td className="pr-4">{limit.amount}</td>
                            <td>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => deleteLimit(idx)}
                              >
                                Delete
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              <div className="aspect-video rounded-xl bg-muted/50 p-4">
                <h2 className="text-lg font-medium">Alerts</h2>
                <p className="text-sm text-muted-foreground">No alerts have been raised till now.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-black text-white hover:bg-black/90">Set limits</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogTitle className="sr-only">Set Task Limits</DialogTitle>
                  <form className="grid gap-4" onSubmit={(e) => {
                    e.preventDefault()
                    const formData = new FormData(e.currentTarget)
                    const data = {
                      start: formData.get("start-date"),
                      end: formData.get("end-date"),
                      amount: formData.get("amount"),
                    }
                    addLimit(data)
                    setOpen(false)
                  }}>
                    <div className="grid gap-2">
                      <Label>Start Date</Label>
                      <Input name="start-date" type="date" required />
                    </div>
                    <div className="grid gap-2">
                      <Label>End Date</Label>
                      <Input name="end-date" type="date" required />
                    </div>
                    <div className="grid gap-2">
                      <Label>Amount</Label>
                      <Input name="amount" type="number" required />
                    </div>
                    <Button type="submit">Add Limit</Button>
                  </form>
                </DialogContent>
              </Dialog>
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
