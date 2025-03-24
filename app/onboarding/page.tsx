'use client'

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import fullLogo from "@/public/full-logo.png"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Building2, User } from "lucide-react"

export default function OnboardingPage() {
  const searchParams = useSearchParams()

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const code = searchParams.get("code")

    if (!code) {
      setTimeout(() => setStatus("error"), 5000)
      return
    }

    const fetchUser = async () => {
      try {
        const res = await fetch(`http://localhost:8000/google/callback?code=${code}&env=frontend_local`)
        const data = await res.json()

        if (res.ok) {
          setUser(data.user)
          setStatus("success")
        } else {
          console.error(data)
          setTimeout(() => setStatus("error"), 5000)
        }
      } catch (err) {
        console.error(err)
        setTimeout(() => setStatus("error"), 5000)
      }
    }

    fetchUser()
  }, [searchParams])

  const onGoogleLogin = () => {
    window.location.href = "/dashboard"
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

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex items-center gap-2 self-center font-medium">
          <Image src={fullLogo} alt="Agentec Logo" width={120} height={40} />
        </div>

        <div className={cn("flex flex-col gap-6")}>
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Welcome, {user?.name?.split(" ")[0]}</CardTitle>
              <CardDescription>Who are you joining Agentec as?</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/dashboard" onClick={onGoogleLogin}>
                    <Building2 className="mr-2 h-4 w-4" />
                    Organisation
                  </Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/dashboard" onClick={onGoogleLogin}>
                    <User className="mr-2 h-4 w-4" />
                    Individual
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary">
            By clicking continue, you agree to our{" "}
            <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
          </div>
        </div>
      </div>
    </div>
  )
}