'use client';

import { LoginForm } from "@/components/login-form"
import fullLogo from "@/public/full-logo.png"
import Image from "next/image"

export default function LoginPage() {
  const onGoogleLogin = () => {
    window.open(
      "https://accounts.google.com/o/oauth2/v2/auth?client_id=412838508050-80mfevfc7md6difcnt54jok1q5blknip.apps.googleusercontent.com&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fonboarding&response_type=code&scope=openid+email+profile&access_type=offline&prompt=consent"
      ,"_blank");
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
        <LoginForm onGoogleLogin={onGoogleLogin} onGithubLogin={onGithubLogin} />
      </div>
    </div>
  )
}
