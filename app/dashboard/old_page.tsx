"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./navbar";

export default function DashboardPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth");
      return;
    }

    fetch("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setUser(data));
  });

  return (
    <div className="flex h-screen bg-black text-white">
      <Sidebar />
      <div className="flex flex-col h-screen p-20">
        <h1 className="font-black text-6xl mb-4">Dashboard</h1>
        {user ? (
          <div>
            <img src={user.avatar_url} alt="Avatar" className="w-24 h-24 rounded-full" />
            <h2 className="text-xl mt-2">{user.name || user.login}</h2>
            <p>@{user.login}</p>
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </div>
  );
}
