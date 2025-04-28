'use client'

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import fullLogo from "@/public/full-logo.png"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Building2, User, ArrowLeft } from "lucide-react"
import { Input } from "@/components/ui/input"

type Step = "role" | "org_choice" | "create_org" | "join_org"

export default function OnboardingPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [status, setStatus] = useState<"loading" | "success" | "error" | "org_created">("loading")
  const [user, setUser] = useState<any>(null)
  const [step, setStep] = useState<Step>("role")
  const [orgName, setOrgName] = useState("")
  const [inviteToken, setInviteToken] = useState("")
  const [joinStatus, setJoinStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [joinMessage, setJoinMessage] = useState("")

  useEffect(() => {
    const code = searchParams.get("code")

    if (!code) {
      setTimeout(() => setStatus("error"), 5000)
      return
    }

    const fetchUser = async () => {
      try {
        const callbackRes = await fetch(`http://localhost:8000/google/callback?code=${code}&env=frontend_local`)
        const callbackData = await callbackRes.json()

        if (!callbackRes.ok || !callbackData.refresh_token) {
          console.error("Callback error or no refresh token:", callbackData)
          setTimeout(() => setStatus("error"), 5000)
          return
        }

        const userInfoRes = await fetch(
          `http://localhost:8000/google/get-user-info?refresh_token=${encodeURIComponent(callbackData.refresh_token)}`,
          {
            method: "POST",
            headers: { Accept: "application/json" },
          }
        )
        const userInfoData = await userInfoRes.json()

        if (!userInfoRes.ok) {
          console.error("User info fetch failed:", userInfoData)
          setTimeout(() => setStatus("error"), 5000)
          return
        }

        const userData = {
          id: "",
          name: userInfoData.user.name,
          email: userInfoData.user.email,
          picture: userInfoData.user.picture,
          refresh_token: callbackData.refresh_token,
          organization: ""
        }

        const checkUserRes = await fetch(`http://localhost:8000/users/get_user?email=${userData.email}`)
        if (checkUserRes.ok) {
          userData.id = (await checkUserRes.json()).id
          localStorage.setItem("user", JSON.stringify(userData))
          setUser(userData)
          router.push("/dashboard")
          return
        }

        const createUserRes = await fetch(`http://localhost:8000/users/create_user`, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        })

        if (!createUserRes.ok) {
          console.error("Failed to create user")
          setTimeout(() => setStatus("error"), 5000)
          return
        }
        const createdUserData = await createUserRes.json()
        userData.id = createdUserData.id
        localStorage.setItem("user", JSON.stringify(userData))
        setUser(userData)
        setStatus("success")
      } catch (err) {
        console.error(err)
        setTimeout(() => setStatus("error"), 5000)
      }
    }

    fetchUser()
  }, [searchParams, router])

  const handleCreateOrganization = async () => {
    const userData = JSON.parse(localStorage.getItem("user") || "{}")
    const email = userData.email

    if (!email || !orgName.trim()) {
      console.error("Missing email or organization name.")
      return
    }

    try {
      const checkUserRes = await fetch(`http://localhost:8000/users/get_user?email=${email}`)
      const user = await checkUserRes.json()

      if (!user.id) {
        console.error("User ID not found.")
        return
      }

      const createOrgRes = await fetch("http://localhost:8000/organizations/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: orgName,
          admin_id: user.id,
          wallet: 0,
        }),
      })

      if (!createOrgRes.ok) {
        console.error("Failed to create organization")
        return
      }

      const orgData = await createOrgRes.json()
      console.log("Organization created:", orgData)
      setStatus("org_created")
      setTimeout(() => router.push("/dashboard"), 1500)
    } catch (err) {
      console.error("Error creating organization:", err)
      setStatus("error")
    }
  }

  const handleJoinOrganization = async () => {
    const stored = localStorage.getItem("user")
    if (!stored) return
  
    const parsed = JSON.parse(stored)
  
    setJoinStatus("loading")
    try {
      const res = await fetch("http://localhost:8000/users/join_organization", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ user_id: parsed.id, invite_token: inviteToken }),
      })
  
      const data = await res.json()
  
      if (!res.ok) {
        setJoinStatus("error")
        setJoinMessage(data.detail || "Failed to join organization")
        return
      }
  
      setJoinStatus("success")
      setJoinMessage(data.message)
  
      localStorage.setItem("user", JSON.stringify({ ...parsed, organization: data.organization_id }))
      setTimeout(() => router.push("/dashboard"), 1500)
    } catch (err) {
      setJoinStatus("error")
      setJoinMessage("Something went wrong.")
    }
  }

  const goBack = () => {
    if (step === "create_org") setStep("org_choice")
    else if (step === "org_choice") setStep("role")
  }

  if (status === "loading") {
    return (
      <div className="flex min-h-svh items-center justify-center bg-muted">
        <p className="text-lg text-muted-foreground">Logging you in...</p>
      </div>
    )
  }

  if (status === "error") {
    return (
      <div className="flex min-h-svh items-center justify-center bg-muted">
        <p className="text-lg text-red-500">Login failed. Please try again.</p>
      </div>
    )
  }

  if (status === "org_created") {
    return (
      <div className="flex min-h-svh items-center justify-center bg-muted">
        <p className="text-lg text-green-600 font-medium">Organization Successfully Created</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex items-center gap-2 self-center font-medium">
          <Image src={fullLogo} alt="Agentec Logo" width={120} height={40} />
        </div>

        <div className={cn("flex flex-col gap-6")}>
          <Card>
          <CardHeader className="relative text-center px-2">
              <Button
                variant="ghost"
                className="absolute left-0 top-1 text-sm text-muted-foreground flex items-center gap-1"
                onClick={goBack}
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>

              <CardTitle className="text-xl">Welcome, {user?.name?.split(" ")[0]}</CardTitle>
              <CardDescription className="text-sm text-muted-foreground mt-1">
                {{
                  role: "Who are you joining Agentec as?",
                  org_choice: "Choose an option to join as an organization",
                  create_org: "Create your new organization",
                }[step]}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {step === "role" && (
                <div className="flex flex-col gap-4">
                  <Button variant="outline" className="w-full" onClick={() => setStep("org_choice")}>
                    <Building2 className="mr-2 h-4 w-4" />
                    Organization
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/dashboard">
                      <User className="mr-2 h-4 w-4" />
                      Individual
                    </Link>
                  </Button>
                </div>
              )}

              {step === "org_choice" && (
                <div className="flex flex-col gap-4">
                  <Button variant="outline" className="w-full" onClick={() => setStep("join_org")}>
                    Join Existing Organization
                  </Button>
                  <Button className="w-full" onClick={() => setStep("create_org")}>
                    Create New Organization
                  </Button>
                </div>
              )}

              {step === "create_org" && (
                <div className="flex flex-col gap-4">
                  <Input
                    placeholder="Organization name"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                  />
                  <Button
                    className="w-full"
                    disabled={!orgName.trim()}
                    onClick={handleCreateOrganization}
                  >
                    Continue
                  </Button>
                </div>
              )}
              {step === "join_org" && (
                <div className="flex flex-col gap-4">
                  <Input
                    placeholder="Enter invite token"
                    value={inviteToken}
                    onChange={(e) => setInviteToken(e.target.value)}
                  />
                  <Button
                    onClick={handleJoinOrganization}
                    disabled={!inviteToken.trim()}
                  >
                    Join Organization
                  </Button>
                  {joinStatus === "success" && (
                    <p className="text-sm text-green-600">{joinMessage}</p>
                  )}
                  {joinStatus === "error" && (
                    <p className="text-sm text-red-600">{joinMessage}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary">
            By clicking continue, you agree to our{" "}
            <a href="/privacy target=_blank" className="underline">
              Terms of Service
            </a>{" "}
          </div>
        </div>
      </div>
    </div>
  )
}