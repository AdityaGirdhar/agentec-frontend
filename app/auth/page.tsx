"use client";

import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();

  const handleLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
    const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI;
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user`;

    router.push(githubAuthUrl);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl mb-4">GitHub Login</h1>
      <button onClick={handleLogin} className="px-4 py-2 bg-black text-white rounded">
        Login with GitHub
      </button>
    </div>
  );
}
