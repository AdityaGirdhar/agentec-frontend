'use client'

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"
import fullLogo from "@/public/full-logo.png"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Building2, User } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

type Step = "role" | "org_choice" | "create_org" | "join_org"

export default function OnboardingPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [user, setUser] = useState<any>(null)
  const [step, setStep] = useState<Step>("role")
  const [orgName, setOrgName] = useState("")
  const [inviteToken, setInviteToken] = useState("")
  const [joinStatus, setJoinStatus] = useState<"idle" | "loading">("idle")
  const [loading, setLoading] = useState(true)
  const [isReturningUser, setIsReturningUser] = useState(false)

  useEffect(() => {
    const code = searchParams.get("code")
    if (!code) {
      toast({
        variant: "destructive",
        title: "Missing Authorization Code",
        description: "Redirecting back to login.",
      })
      router.push("/")
      return
    }

    const fetchUser = async () => {
      try {
        toast({ title: "Logging you in..." })

        const callbackRes = await fetch(`http://localhost:8000/google/callback?code=${code}&env=frontend_local`)
        const callbackData = await callbackRes.json()

        if (!callbackRes.ok || !callbackData.refresh_token) {
          toast({
            variant: "destructive",
            title: "Login Failed",
            description: "Invalid callback or token missing.",
          })
          router.push("/")
          return
        }

        const userInfoRes = await fetch(
          `http://localhost:8000/google/get-user-info?refresh_token=${encodeURIComponent(callbackData.refresh_token)}`,
          { method: "POST", headers: { Accept: "application/json" } }
        )
        const userInfoData = await userInfoRes.json()

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
          setIsReturningUser(true)
          setUser(userData)
          toast({ variant: "success", title: `Welcome back, ${userData.name.split(" ")[0]}!` })
          setTimeout(() => router.push("/dashboard"), 1000)
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

        const createdUserData = await createUserRes.json()
        userData.id = createdUserData.id
        localStorage.setItem("user", JSON.stringify(userData))
        setUser(userData)
        toast({ variant: "success", title: "Logged in successfully!" })
      } catch (err) {
        toast({ variant: "destructive", title: "Unknown Error", description: "Check network or server logs." })
        router.push("/")
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [searchParams, router])

  const handleCreateOrganization = async () => {
    const userData = JSON.parse(localStorage.getItem("user") || "{}")

    if (!userData.email || !orgName.trim()) {
      toast({ variant: "destructive", title: "Missing Fields", description: "Organization name is required." })
      return
    }

    try {
      const userRes = await fetch(`http://localhost:8000/users/get_user?email=${userData.email}`)
      const user = await userRes.json()

      const res = await fetch("http://localhost:8000/organizations/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: orgName, admin_id: user.id, wallet: 0 }),
      })

      const data = await res.json()
      localStorage.setItem("user", JSON.stringify({ ...user, organization: data.id }))
      toast({ variant: "success", title: "Organization Created" })
      setTimeout(() => router.push("/dashboard"), 1000)
    } catch {
      toast({ variant: "destructive", title: "Failed to create organization" })
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: parsed.id, invite_token: inviteToken }),
      })

      const data = await res.json()
      if (!res.ok) {
        toast({ variant: "destructive", title: "Join Failed", description: data.detail || "Invalid token" })
        return
      }

      localStorage.setItem("user", JSON.stringify({ ...parsed, organization: data.organization_id }))
      toast({ variant: "success", title: "Joined organization successfully!" })
      setTimeout(() => router.push("/dashboard"), 1000)
    } catch {
      toast({ variant: "destructive", title: "Unexpected error joining organization" })
    } finally {
      setJoinStatus("idle")
    }
  }

  const goBack = () => {
    if (step === "create_org") setStep("org_choice")
    else if (step === "org_choice") setStep("role")
  }

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-muted">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-black border-t-transparent" />
      </div>
    )
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="onboarding"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -30 }}
        transition={{ duration: 0.4 }}
        className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10"
      >
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

                <CardTitle className="text-xl">
                  {isReturningUser ? `Welcome back, ${user?.name?.split(" ")[0]}` : `Welcome, ${user?.name?.split(" ")[0]}`}
                </CardTitle>
                {!isReturningUser && (
                  <CardDescription className="text-sm text-muted-foreground mt-1">
                    {{
                      role: "Who are you joining Agentec as?",
                      org_choice: "Choose how you'd like to continue",
                      create_org: "Create your new organization",
                      join_org: "Enter invite token to join one",
                    }[step]}
                  </CardDescription>
                )}
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
                    <Input placeholder="Organization name" value={orgName} onChange={(e) => setOrgName(e.target.value)} />
                    <Button className="w-full" onClick={handleCreateOrganization} disabled={!orgName.trim()}>
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
                    <Button onClick={handleJoinOrganization} disabled={!inviteToken.trim() || joinStatus === "loading"}>
                      {joinStatus === "loading" ? "Joining..." : "Join Organization"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="text-center text-xs text-muted-foreground [&_a]:underline">
              By clicking continue, you agree to our{" "}
              <a href="/privacy" target="_blank">Terms of Service</a>.
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}