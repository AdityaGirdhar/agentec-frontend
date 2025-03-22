"use client";

import { useEffect, useState } from "react";
import { AgentSchema } from "@/types/agent";
import { Star, Download, CheckCircle } from "lucide-react";

export default function AgentCard({ agent, onClick }: { agent: AgentSchema, onClick: () => void }) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (agent.owner_github_id) {
      setAvatarUrl(`https://github.com/${agent.owner_github_id}.png`);
    }
  }, [agent.owner_github_id]);

  return (
    <div onClick={onClick} className="p-4 bg-zinc-800 hover:bg-zinc-700 transition rounded-lg shadow-md border border-zinc-700 flex flex-col gap-3">
      {/* Top Section: GitHub Avatar, Name & Owner */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {avatarUrl && (
            <img
              src={avatarUrl}
              alt={agent.owner_name}
              className="w-8 h-8 rounded-full border border-gray-600"
            />
          )}
          <h2 className="text-lg font-semibold">{agent.name}</h2>
        </div>
        <p className="text-sm text-gray-400">by {agent.owner_name}</p>
      </div>

      {/* Repo & External Links */}
      {/* <div className="flex items-center gap-2 text-sm text-gray-300">
        <Folder size={16} />
        <a
          href={agent.repository}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          Repository
        </a>
        <ExternalLink size={14} />
        {agent.external_links?.map((link, index) => (
          <a
            key={index}
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 text-blue-400 hover:text-blue-300"
          >
            <ExternalLink size={16} />
          </a>
        ))}
      </div> */}

      {/* Stats Section */}
      <div className="flex justify-between text-sm text-gray-300">
        <div className="flex items-center gap-1">
          <Star size={16} className="text-yellow-400" />
          <span>{agent.stars ?? 0}</span>
        </div>
        <div className="flex items-center gap-1">
          <Download size={16} className="text-green-400" />
          <span>{agent.downloads ?? 0}</span>
        </div>
        {/* <div className="flex items-center gap-1">
          <HardDrive size={16} className="text-purple-400" />
          <span>{agent.size ?? 0}</span>
        </div> */}
        <div className="flex items-center gap-1">
          <CheckCircle size={16} className="text-blue-400" />
          <span>{agent.tasks_executed ?? 0}</span>
        </div>
      </div>

      {/* Description */}
      {agent.description && (
        <p className="text-sm text-gray-400 line-clamp-2">{agent.description.join(" ")}</p>
      )}
    </div>
  );
}