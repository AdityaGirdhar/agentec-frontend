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
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

const LOG_TABS = ["Tasks", "Agents", "Users", "Budgets"] as const
type LogCategory = (typeof LOG_TABS)[number]

export default function LogsPage() {
  const [activeTab, setActiveTab] = useState<LogCategory>("Tasks")

  // Simulated data for now – replace with real fetch logic per tab
  const dummyData = Array.from({ length: 15 }).map((_, i) => ({
    id: i + 1,
    message: `${activeTab} log event number ${i + 1}`,
    timestamp: new Date(Date.now() - i * 60000).toISOString(),
  }))

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="#">Tools</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem>
                <BreadcrumbLink href="#">Logs</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="flex flex-col px-6 pb-10">
          <h1 className="text-2xl font-semibold mb-4">Logs</h1>

          <div className="flex gap-3 border-b border-gray-200 pb-3">
            {LOG_TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "text-sm px-4 py-2 rounded-md font-medium transition-colors",
                  activeTab === tab
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="mt-3 overflow-auto rounded-lg border border-gray-200 shadow-sm bg-white">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-2 w-20">ID</th>
                  <th className="px-4 py-2">Message</th>
                  <th className="px-4 py-2">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {dummyData.map(entry => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-gray-800">{entry.id}</td>
                    <td className="px-4 py-2">{entry.message}</td>
                    <td className="px-4 py-2 text-muted-foreground">{new Date(entry.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}