'use client'

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"

export function LoginForm({
  className,
  onGoogleLogin,
  onGithubLogin,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & { onGoogleLogin: () => void; onGithubLogin: () => void }) {
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)

  return (
    <>
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Welcome back!</CardTitle>
            <CardDescription>Login with your Google account</CardDescription>
          </CardHeader>
          <CardContent>
            <form>
              <div className="grid gap-6">
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/onboarding`} onClick={onGoogleLogin}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <path
                        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                        fill="currentColor"
                        strokeWidth="0.8"
                        stroke="currentColor"
                      />
                    </svg>
                    Login with Google
                  </Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="text-center text-xs text-muted-foreground">
          By clicking continue, you agree to our{" "}
          <button className="underline" onClick={() => setShowPrivacyModal(true)}>
            Privacy Policy
          </button>
        </div>
      </div>

      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg max-w-4xl w-full h-[90vh] overflow-y-scroll shadow-lg p-8 relative">
            <h1 className="text-2xl font-bold mb-1">Agentec Privacy Policy</h1>
            <p className="text-sm text-muted-foreground mb-6">
              Effective Date: April 2025 &nbsp;|&nbsp; Last Updated: April 2025
            </p>

            <div className="space-y-6 text-sm text-gray-800">
              <div>
                <h2 className="text-lg font-semibold">1. What We Collect</h2>
                <Separator className="my-2" />
                <p>We collect your name, email, and profile image through your user account. API keys are stored securely. We also gather metadata about agents you interact with, bugs you report, tasks you run, and content you share or bookmark.</p>
              </div>

              <div>
                <h2 className="text-lg font-semibold">2. How We Use Your Data</h2>
                <Separator className="my-2" />
                <p>Your data is used to run the Agentec platform effectively, enable agent execution, track bug reports, and enhance collaboration within organizations. Execution logs help improve transparency and accountability.</p>
              </div>

              <div>
                <h2 className="text-lg font-semibold">3. Human-Centered AI</h2>
                <Separator className="my-2" />
                <p>We ensure all AI actions are user-initiated, traceable, and explainable. Agentec never runs autonomous agents without your prompt, and we provide contextual execution logs.</p>
              </div>

              <div>
                <h2 className="text-lg font-semibold">4. Data Sharing & Storage</h2>
                <Separator className="my-2" />
                <p>Your data is never sold. All content is stored securely and only visible to authorized users. API keys are hashed, and data is retained until you delete it or leave an organization.</p>
              </div>

              <div>
                <h2 className="text-lg font-semibold">5. User Rights</h2>
                <Separator className="my-2" />
                <p>You can view and delete your data, revoke shared access, and leave or remove yourself from organizations. All these actions are accessible in the dashboard.</p>
              </div>

              <div>
                <h2 className="text-lg font-semibold">6. Security Measures</h2>
                <Separator className="my-2" />
                <p>We use secure encrypted communication, hashed key storage, scoped permissions, and enforce access controls across the platform.</p>
              </div>

              <div>
                <h2 className="text-lg font-semibold">7. AI Ethics & Safety</h2>
                <Separator className="my-2" />
                <p>Every output is explainable and logged. Agents are bounded by safe context and prompt constraints. We actively support bug reporting for agent behavior corrections.</p>
              </div>

              <div>
                <h2 className="text-lg font-semibold">10. Contact Us</h2>
                <Separator className="my-2" />
                <p>
                  Email: <a href="mailto:admin@agentec.dev" className="underline text-blue-600">admin@agentec.dev</a><br />
                  Website: <a href="https://www.agentec.dev" target="_blank" className="underline text-blue-600">www.agentec.dev</a>
                </p>
              </div>
            </div>

            <Button
              className="absolute top-4 right-4 text-sm"
              variant="ghost"
              onClick={() => setShowPrivacyModal(false)}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </>
  )
}