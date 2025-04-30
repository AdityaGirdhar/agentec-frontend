'use client'

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import fullLogo from "@/public/full-logo.png"
import Image from "next/image"

export default function OnboardingPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)

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
        }

        const checkUserRes = await fetch(`http://localhost:8000/users/get_user?email=${userData.email}`)
        if (checkUserRes.ok) {
          userData.id = (await checkUserRes.json()).id
        } else {
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
        }

        localStorage.setItem("user", JSON.stringify(userData))
        toast({ variant: "success", title: `Welcome, ${userData.name.split(" ")[0]}!` })
        router.push("/dashboard")
      } catch {
        toast({ variant: "destructive", title: "Unknown Error", description: "Check network or server logs." })
        router.push("/")
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [searchParams, router])

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-muted">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-black border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <Image src={fullLogo} alt="Agentec Logo" width={140} height={48} />
    </div>
  )
}