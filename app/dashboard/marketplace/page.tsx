"use client";

import { useEffect, useState } from "react";
import Sidebar from "../navbar";
import AgentCard from "./AgentCard";
import AgentModal from "./AgentModal";
import { AgentSchema } from "@/types/agent";
import { useSearchParams } from "next/navigation";

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
    repository: "https://github.com/meta-llama/llama"
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
  {
    id: 10,
    name: "Tank Stars",
    owner_name: "Aditya Girdhar",
    owner_github_id: "AdityaGirdhar",
    description: ["A simple tank game made using Java and libGDX."],
    downloads: 100,
    tasks_executed: 50,
    stars: 10,
    size: 10,
    repository: "https://github.com/AdityaGirdhar/Tank-Stars" 
  },
  {
    id: 20,
    name: "Shoppr",
    owner_name: "Ahmed Hanoon",
    owner_github_id: "Hanoon02",
    description: ["Full stack online shopping website"],
    downloads: 200,
    tasks_executed: 100,
    stars: 20,
    size: 20,
    repository: "https://github.com/Hanoon02/Shoppr",
  },
  {
    id: 30,
    name: "DashCab",
    owner_name: "Aditya Girdhar",
    owner_github_id: "AdityaGirdhar",
    description: ["A Cab Booking System made using MySQL, Python and the Tkinter GUI library"],
    downloads: 50,
    tasks_executed: 20,
    stars: 5,
    size: 5,
    repository: "https://github.com/AdityaGirdhar/DashCab",
  },
];

export default function MarketplacePage() {
  const [selectedAgent, setSelectedAgent] = useState<AgentSchema | null>(null);

  const searchParams = useSearchParams();

  useEffect(() => {
    const agentId = searchParams.get("agent");
    if (agentId) {
      const agent = dummyAgents.find((agent) => agent.id === parseInt(agentId));
      if (agent) setSelectedAgent(agent);
    }
  }, [searchParams]);

  // Close modal on "Esc" key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedAgent(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
  
  return (
    <div className="flex h-screen bg-black text-white">
      <Sidebar />
      <div className="flex flex-col h-screen p-20">
        <h1 className="font-black text-6xl mb-4">Marketplace</h1>
        <h4 className="font-bold">Popular Agents</h4>
        
        {/* <Cards/> */}
        <div className="grid mt-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full max-w-5xl">
          {dummyAgents.map((agent: AgentSchema) => (
            <AgentCard key={agent.id} agent={agent} onClick={() => setSelectedAgent(agent)} />
          ))}
        </div>

        {/* Modal */}
        {selectedAgent && (
          <AgentModal agent={selectedAgent} onClose={() => setSelectedAgent(null)} />
        )}
      </div>
    </div>
  );
}