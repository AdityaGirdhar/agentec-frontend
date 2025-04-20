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
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"

interface Agent {
  name: string
  description: string
  provider: string
}

export default function Page() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [provider, setProvider] = useState("All")
  const [bookmarked, setBookmarked] = useState<{ [key: string]: boolean }>({})
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    const dummyAgents: Agent[] = [
      {
        name: "Custom Agent 1",
        description: "A demo agent for Anthropic.",
        provider: "Anthropic",
      },
      {
        name: "Custom Agent 2",
        description: "A sample agent by Deepseek.",
        provider: "Deepseek",
      },
      {
        name: "Custom Agent 3",
        description: "An OpenAI powered bot.",
        provider: "OpenAI",
      },
    ]

    const dummyBookmarks: Agent[] = [
      {
        name: "FinBot",
        description: "APIs Used: GMail API, Google Drive, ...",
        provider: "Google Gemini",
      },
      {
        name: "StockAgent",
        description: "APIs Used: GMail API, Google Drive, ...",
        provider: "OpenAI",
      },
    ]

    setAgents([...dummyAgents, ...dummyBookmarks])

    setBookmarked((prev) => {
      const all = [...dummyAgents, ...dummyBookmarks]
      const initial: any = {}
      all.forEach((a) => (initial[a.name] = false))
      return initial
    })

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

  const bookmarkedEntries = agents.filter((a) => bookmarked[a.name])

  const filteredAgents = agents.filter((agent) => {
    const matchesSearch =
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesProvider = provider === "All" || agent.provider === provider
    return matchesSearch && matchesProvider && !bookmarked[agent.name]
  })

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
                <BreadcrumbLink href="#">Agents</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="flex flex-col gap-4 p-6 pr-10">

          {/* Bookmarked Section */}
          {bookmarkedEntries.length > 0 && (
            <>
              <h2 className="text-2xl font-semibold">Bookmarked Agents</h2>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {bookmarkedEntries.map((agent) => (
                  <div
                    key={agent.name}
                    className="relative bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition"
                  >
                    <button
                      onClick={() => toggleBookmark(agent.name)}
                      className="absolute top-4 right-4 p-1 rounded-full"
                    >
                      <Bookmark size={20} fill="black" color="black" />
                    </button>
                    <h2 className="text-lg font-semibold mb-2">{agent.name}</h2>
                    <p className="text-sm text-gray-600 mb-4">
                      {agent.description}
                    </p>
                    <Button variant="outline" size="sm">
                      Create Task
                    </Button>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Your Agents Section */}
          <div className="flex justify-between items-center pt-4">
            <h1 className="text-2xl font-semibold">Your Agents</h1>
            <Select value={provider} onValueChange={setProvider}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
                <SelectItem value="Anthropic">Anthropic</SelectItem>
                <SelectItem value="Deepseek">Deepseek</SelectItem>
                <SelectItem value="Google Gemini">Google Gemini</SelectItem>
                <SelectItem value="OpenAI">OpenAI</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Search Input */}
          <SearchBar onSearch={(query) => setSearchQuery(query)} />

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
                <h2 className="text-lg font-semibold mb-2">{agent.name}</h2>
                <p className="text-sm text-gray-600 mb-4">{agent.description}</p>
                <Button variant="outline" size="sm">
                  Create Task
                </Button>
              </div>
            ))}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
