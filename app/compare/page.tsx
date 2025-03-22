"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AgentSchema } from "@/types/agent";
import { Star, Download, Database, List, Search } from "lucide-react";
import Link from "next/link";

const dummyAgents: AgentSchema[] = [
  {
    id: 1,
    name: "Meta Llama",
    owner_name: "Meta",
    owner_github_id: "meta-llama",
    description: ["Inference code for Llama models."],
    downloads: 100,
    tasks_executed: 50,
    stars: 10,
    size: 10,
    repository: "https://github.com/meta-llama/llama",
  },
  {
    id: 2,
    name: "Whisper",
    owner_name: "OpenAI",
    owner_github_id: "openai",
    description: ["Robust Speech Recognition via Large-Scale Weak Supervision."],
    downloads: 500,
    tasks_executed: 250,
    stars: 50,
    size: 50,
    repository: "https://github.com/openai/whisper",
  },
  {
    id: 3,
    name: "TensorStore",
    owner_name: "Google",
    owner_github_id: "google",
    description: ["A scalable, transactional key-value store for deep learning."],
    downloads: 1000,
    tasks_executed: 500,
    stars: 100,
    size: 100,
    repository: "https://github.com/google/tensorstore",
  },
];

export default function ComparePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [agents, setAgents] = useState<(AgentSchema | null)[]>([null, null, null]);

  useEffect(() => {
    const ids = [searchParams.get("a"), searchParams.get("b"), searchParams.get("c")].map((id) =>
      id ? dummyAgents.find((agent) => agent.id.toString() === id) ?? null : null
    );
    setAgents(ids);
  }, [searchParams]);

  const handleSelectAgent = (index: number, newId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(["a", "b", "c"][index], newId);
    router.push(`/compare?${params.toString()}`);
  };

  return (
    <div
      className="relative min-h-screen bg-black flex flex-col items-center justify-center text-white py-10 px-4"
    >

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-md"></div>

      {/* Content */}
      <div className="relative w-full max-w-6xl">
        <h1 className="text-5xl font-extrabold text-center mb-8 bg-clip-text text-transparent text-black">
          Compare Agents
        </h1>

        {/* Comparison Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent, index) => (
            <div
              key={index}
              className="p-6 bg-zinc-800 bg-opacity-90 rounded-2xl shadow-lg border border-gray-700 
              backdrop-blur-lg transition-transform duration-300 hover:scale-105 relative z-10"
            >
              {/* Header */}
              <h2 className="text-2xl font-semibold text-center mb-4">
                {agent ? agent.name : "Select an Agent"}
              </h2>

              {/* Avatar */}
              <div className="flex justify-center mb-4">
                {agent ? (
                  <img
                    src={`https://github.com/${agent.owner_github_id}.png`}
                    alt={agent.owner_name}
                    className="w-20 h-20 rounded-full border-2 border-gray-500 shadow-md"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gray-600 rounded-full flex items-center justify-center">
                    <Search size={28} className="text-gray-300" />
                  </div>
                )}
              </div>

              {/* Dropdown */}
              <select
                className="w-full bg-zinc-700 text-white p-3 rounded-lg border border-gray-600 
                cursor-pointer hover:border-blue-500 transition-all"
                onChange={(e) => handleSelectAgent(index, e.target.value)}
              >
                <option value="">Choose an agent</option>
                {dummyAgents.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>

              {/* Metrics */}
              <div className="mt-6 space-y-3 text-left">
                <p className="flex items-center gap-2 text-lg">
                  <Star className="text-yellow-400" size={20} /> <span className="font-medium">Stars:</span>{" "}
                  {agent?.stars ?? "N/A"}
                </p>
                <p className="flex items-center gap-2 text-lg">
                  <Download className="text-blue-400" size={20} />{" "}
                  <span className="font-medium">Downloads:</span> {agent?.downloads ?? "N/A"}
                </p>
                <p className="flex items-center gap-2 text-lg">
                  <Database className="text-green-400" size={20} />{" "}
                  <span className="font-medium">Size:</span> {agent?.size ?? "N/A"} KB
                </p>
                <p className="flex items-center gap-2 text-lg">
                  <List className="text-purple-400" size={20} />{" "}
                  <span className="font-medium">Tasks Executed:</span> {agent?.tasks_executed ?? "N/A"}
                </p>
              </div>

              {/* View Details */}
              {agent && (
                <Link
                  href={`/dashboard/marketplace?agent=${agent.id}`}
                  className="mt-6 inline-block w-full text-center text-white bg-gradient-to-r from-blue-500 to-purple-500 
                  py-2 rounded-lg shadow-lg font-semibold transition-all duration-300 hover:brightness-110 hover:scale-105"
                >
                  View Details →
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}