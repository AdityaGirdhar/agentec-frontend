'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CheckCircle2, CircleDotDashed, Hourglass } from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb"

interface Agent {
  name: string
  description: string
  tags: string
  supported_providers: string[]
  developer_contact: string
  cost_per_execution: string
  onboarding: {
    final_state: string
    steps_completed: number
    repository_url?: string
    zip_file_url?: string
    uploaded: boolean
    uploaded_time?: string
    onboarded: boolean
    onboarded_time?: string
    admin_approved: boolean
    admin_approved_time?: string
  }
}

const dummyAgents: Agent[] = [
  {
    name: "Smart Summarizer",
    description: "Summarizes long documents intelligently",
    tags: "nlp, summarization",
    supported_providers: ["OpenAI", "Anthropic"],
    developer_contact: "dev@example.com",
    cost_per_execution: "$0.002",
    onboarding: {
      final_state: "onboarded",
      steps_completed: 3,
      uploaded: true,
      uploaded_time: "2024-04-01",
      repository_url: "https://github.com/example/summarizer",
      zip_file_url: "",
      onboarded: true,
      onboarded_time: "2024-04-05",
      admin_approved: true,
      admin_approved_time: "2024-04-03",
    }
  },
  {
    name: "Email Optimizer",
    description: "Improves cold email outreach for better conversion",
    tags: "marketing, nlp",
    supported_providers: ["OpenAI"],
    developer_contact: "emailwiz@agents.com",
    cost_per_execution: "$0.005",
    onboarding: {
      final_state: "admin_approved",
      steps_completed: 2,
      uploaded: true,
      uploaded_time: "2024-04-07",
      repository_url: "https://github.com/example/email-optimizer",
      zip_file_url: "",
      onboarded: false,
      onboarded_time: "",
      admin_approved: true,
      admin_approved_time: "2024-04-09",
    }
  },
  {
    name: "Trend Detector",
    description: "Detects emerging trends from social media feeds",
    tags: "trends, real-time",
    supported_providers: ["Anthropic"],
    developer_contact: "trends@insights.io",
    cost_per_execution: "$0.004",
    onboarding: {
      final_state: "submitted",
      steps_completed: 1,
      uploaded: true,
      uploaded_time: "2024-04-12",
      repository_url: "https://github.com/example/trend-detector",
      zip_file_url: "",
      onboarded: false,
      onboarded_time: "",
      admin_approved: false,
      admin_approved_time: "",
    }
  }
]

const OnboardingStatus = ({ step }: { step: number }) => {
  const statusSteps = ["Submitted", "Approved", "Onboarded"]
  const colors = ["bg-blue-500", "bg-yellow-400", "bg-emerald-500"]

  return (
    <div className="flex items-center gap-4">
      {statusSteps.map((label, index) => (
        <div key={label} className="flex items-center">
          <div className="flex flex-col items-center">
            <div className={`w-4 h-4 rounded-full ${index <= step - 1 ? colors[index] : 'bg-gray-300'}`}></div>
            <span className="text-xs mt-1 text-muted-foreground">{label}</span>
          </div>
          {index < statusSteps.length - 1 && (
            <div className="mb-5 mx-2 w-10 h-px bg-gray-300" />
          )}
        </div>
      ))}
    </div>
  )
}

export default function YourAgentsPage() {
  const [agents, setAgents] = useState<Agent[]>(dummyAgents)

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const data = Object.fromEntries(formData.entries())
    console.log("Submitted Agent Data:", JSON.stringify(data, null, 2))
  }

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
                <BreadcrumbLink href="#">Your Agents</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <header className="flex items-center justify-between p-4">
          <h1 className="text-2xl font-semibold">Your Agents</h1>
          <Dialog>
            <DialogTrigger asChild>
              <Button>Add Agent</Button>
            </DialogTrigger>
            <DialogContent>
              <form className="grid gap-4" onSubmit={handleSubmit}>
                <div className="grid gap-2">
                  <Label>Name</Label>
                  <Input name="name" placeholder="Agent name" />
                </div>
                <div className="grid gap-2">
                  <Label>Description</Label>
                  <Input name="description" placeholder="Short description" />
                </div>
                <div className="grid gap-2">
                  <Label>Supported Providers</Label>
                  <Input name="supported_providers" placeholder="e.g., OpenAI, Anthropic" />
                </div>
                <div className="grid gap-2">
                  <Label>Cost Per Execution</Label>
                  <Input name="cost_per_execution" placeholder="$0.01" />
                </div>
                <div className="grid gap-2">
                  <Label>Repository or ZIP File Link</Label>
                  <Input name="repository_or_zip" placeholder="https://drive.google.com/... or GitHub URL" />
                </div>
                <div className="text-sm text-muted-foreground -mt-2">
                  Uploading either a public GitHub repo or a shareable ZIP file link is required to submit.
                </div>
                <Button type="submit">Submit</Button>
              </form>
            </DialogContent>
          </Dialog>
        </header>

        <div className="grid gap-6 px-4 pt-8 pb-8">
          {agents.map((agent) => (
            <Card key={agent.name} className="flex flex-col md:flex-row justify-between items-start p-4 gap-4">
              <div className="flex-1 space-y-2">
                <CardHeader className="p-0">
                  <CardTitle className="text-lg font-semibold">{agent.name}</CardTitle>
                </CardHeader>
                <CardContent className="p-0 text-sm text-muted-foreground">
                  <p>{agent.description}</p>
                  <p className="mt-2"><strong>Tags:</strong> {agent.tags}</p>
                  <p><strong>Providers:</strong> {agent.supported_providers.join(", ")}</p>
                  <p><strong>Contact:</strong> {agent.developer_contact}</p>
                  <p><strong>Cost:</strong> {agent.cost_per_execution}</p>
                </CardContent>
              </div>
              <div className="w-full md:w-auto md:min-w-[240px] flex justify-center items-center">
                <OnboardingStatus step={agent.onboarding.steps_completed} />
              </div>
            </Card>
          ))}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
