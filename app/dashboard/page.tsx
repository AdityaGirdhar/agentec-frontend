'use client'

import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { KeysModal } from "./keysModal"
import { useEffect, useState } from "react"

export default function Page() {
  const [showModal, setShowModal] = useState(false)
  const [isBlurred, setIsBlurred] = useState(false)

  useEffect(() => {
    if (localStorage.getItem("modalShown") === "false") {
    setShowModal(true)
    setIsBlurred(true)
    localStorage.setItem("modalShown", "true")
    } else {
    setShowModal(false)
    setIsBlurred(false);
    }
  }, [])

  const handleModalClose = () => {
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
                    <BreadcrumbLink href="#">
                      Dashboard
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0 pr-10">
            <h1 className="text-2xl font-semibold">Dashboard</h1>
            <div className="grid auto-rows-min gap-4 md:grid-cols-2">
              <div className="aspect-video rounded-xl bg-muted/50 p-4">
                <h2 className="text-lg font-medium">Costs</h2>
                <p className="text-sm text-muted-foreground">No sufficient data</p>
              </div>
              <div className="aspect-video rounded-xl bg-muted/50 p-4">
                <h2 className="text-lg font-medium">Summary</h2>
                <p className="text-sm text-muted-foreground">No sufficient data</p>
              </div>
            </div>
            <div className="grid auto-rows-min gap-4 md:grid-cols-2">
              <div className="aspect-video rounded-xl bg-muted/50 p-4">
                <h2 className="text-lg font-medium">Recommended Actions</h2>
                <p className="text-sm text-muted-foreground">No sufficient data</p>
              </div>
              <div className="aspect-video rounded-xl bg-muted/50 p-4">
                <h2 className="text-lg font-medium">Schedules</h2>
                <p className="text-sm text-muted-foreground">No schedules created</p>
              </div>
            </div>
          </div>
        </SidebarInset>
    </SidebarProvider>
    </div>
    
    {showModal && 
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="animate-in zoom-in-90 duration-200">
      <KeysModal onClose={handleModalClose} />
      </div>
    </div>
    }

    </>
  )
}