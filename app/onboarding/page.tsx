'use client';

import { cn } from "@/lib/utils"
import fullLogo from "@/public/full-logo.png"
import Image from "next/image"
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Building2, User } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const onGoogleLogin = () => {
    window.location.href = "/dashboard";
  }
  const onGithubLogin = () => {
    alert("Github login not implemented yet.");
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="flex items-center justify-center rounded-md text-primary-foreground">
            <Image src={fullLogo} alt="" width={120} height={40} />
          </div>
        </a>
        <div className={cn("flex flex-col gap-6")}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome, Aditya</CardTitle>
          <CardDescription>
            Who are you joining Agentec as?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="grid gap-6">
              <div className="flex flex-col gap-4">
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/onboarding`} onClick={onGoogleLogin}>
                    <Building2 className="mr-2 h-4 w-4" />
                    Organisation
                  </Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/onboarding`} onClick={onGoogleLogin}>
                    <User className="mr-2 h-4 w-4" />
                    Individual
                  </Link>
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary  ">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
      </div>
    </div>
  )
}
