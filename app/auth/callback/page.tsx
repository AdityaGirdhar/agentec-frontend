"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function CallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code");

  useEffect(() => {
    if (!code) return;

    const exchangeCodeForToken = async () => {
      try {
        const res = await fetch(`/api/github-auth?code=${code}`);
        const data = await res.json();

        if (data.access_token) {
          localStorage.setItem("token", data.access_token);
          router.push("/dashboard");
        }
      } catch (error) {
        console.error("GitHub authentication failed", error);
      }
    };

    exchangeCodeForToken();
  }, [code]);

  return <p>Logging in...</p>;
}
