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
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

export default function Page() {
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
                    <BreadcrumbLink href="#">
                      Budgets
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0 pr-10">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Budgets</h1>
          </div>

          <div className="grid auto-rows-min gap-4 md:grid-cols-2">
            <div className="aspect-video rounded-xl bg-muted/50 p-4">
              <h2 className="text-lg font-medium">Costs</h2>
              <p className="text-sm text-muted-foreground">No monitoring jobs set up</p>
            </div>
            <div className="aspect-video rounded-xl bg-muted/50 p-4">
              <h2 className="text-lg font-medium">Alerts</h2>
              <p className="text-sm text-muted-foreground">This screen serves as a hub for task automation and scheduling, where users can configure and manage routine AI-driven processes without needing to code.</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Link href="#">
              <Button className="bg-black text-white hover:bg-black/90">Set limits</Button>
            </Link>
            <Link href="#">
              <Button variant="outline">Set alerts</Button>
            </Link>
          </div>
          </div>
        </SidebarInset>
    </SidebarProvider>
    </>
  );
}