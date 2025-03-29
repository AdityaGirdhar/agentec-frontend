'use client'

import { useEffect, useState } from "react"
import Link from "next/link"
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
import { Bookmark } from "lucide-react"
import SearchBar from "./searchBar"

interface Agent {
  name: string
  description: string
}

export default function Page() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>([])
  const [bookmarked, setBookmarked] = useState<{ [key: string]: boolean }>({})
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const res = await fetch("http://localhost:8000/agents/get_agents")
        const data = await res.json()
        const simplifiedAgents = data.map((agent: any) => ({
          name: agent.name,
          description: agent.description,
        }))
        setAgents(simplifiedAgents)
        setFilteredAgents(simplifiedAgents)
      } catch (err) {
        console.error("Failed to fetch agents:", err)
      }
    }

    fetchAgents()

    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser)
      setUserEmail(parsedUser.email)

      const storedBookmarks = localStorage.getItem(`bookmarks-${parsedUser.email}`)
      if (storedBookmarks) {
        setBookmarked(JSON.parse(storedBookmarks))
      }
    }
  }, [])

  const toggleBookmark = (name: string) => {
    setBookmarked((prev) => {
      const updated = { ...prev, [name]: !prev[name] }
      if (userEmail) {
        localStorage.setItem(`bookmarks-${userEmail}`, JSON.stringify(updated))
      }
      return updated
    })
  }

  return (
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
                  <BreadcrumbLink href="#">Marketplace</BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0 pr-10">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Marketplace</h1>
          </div>

          <SearchBar
            onSearch={(query) =>
              setFilteredAgents(
                agents.filter((a) =>
                  a.name.toLowerCase().includes(query.toLowerCase())
                )
              )
            }
          />

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredAgents.map((agent) => (
              <div
                key={agent.name}
                className="relative bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition"
              >
                <button
                  onClick={() => toggleBookmark(agent.name)}
                  className="absolute top-4 right-4 p-1 rounded-full"
                >
                  <Bookmark
                    size={20}
                    fill={bookmarked[agent.name] ? "black" : "white"}
                    color="black"
                  />
                </button>
                <h2 className="text-xl font-semibold mb-2">
                  {agent.name.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                </h2>
                <p className="text-sm text-gray-600">{agent.description}</p>
              </div>
            ))}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}