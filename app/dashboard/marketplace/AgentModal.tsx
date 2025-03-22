"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { AgentSchema } from "@/types/agent";
import {
  Star,
  Download,
  FolderOpen,
  FileText,
  X,
  Link,
  ExternalLink,
  HardDrive,
  CheckCircle,
  Scale,
} from "lucide-react";

async function fetchReadme(url: string): Promise<string> {
  const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (!match) return "Failed to load README.";

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, owner, repo] = match;
  const apiUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/README.md`;

  const res = await fetch(apiUrl);
  if (!res.ok) return "Failed to load README.";
  return await res.text();
}

const downloadRepo = (repoUrl: string) => {
  const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (!match) {
    console.error("Invalid GitHub URL");
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, owner, repo] = match;
  const zipUrl = `https://github.com/${owner}/${repo}/archive/refs/heads/main.zip`;

  // Create a temporary anchor element and trigger a download
  const link = document.createElement("a");
  link.href = zipUrl;
  link.download = `${repo}.zip`; // Set default file name
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export default function AgentModal({ agent, onClose }: { agent: AgentSchema; onClose: () => void }) {
  const router = useRouter();
  const [readme, setReadme] = useState("Loading README...");

  useEffect(() => {
    fetchReadme(agent.repository).then(setReadme);
  }, [agent.repository]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-zinc-900 bg-opacity-80 backdrop-blur-md">
      <div className="bg-zinc-800 text-white p-6 rounded-lg shadow-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto relative border border-zinc-700">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X size={20} />
        </button>

        {/* Header Section */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={`https://github.com/${agent.owner_github_id}.png`}
              alt={agent.owner_name}
              className="w-12 h-12 rounded-full border border-gray-600"
            />
            <div>
              <h2 className="text-2xl font-bold">{agent.name}</h2>
              <p className="text-gray-400 text-sm">by {agent.owner_name}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 mr-6">
            {/* Compare Link */}
            <button
              onClick={() => router.push(`/compare?a=${agent.id}`)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg shadow-md text-white font-semibold 
                        bg-gradient-to-r from-gray-700 to-gray-800 
                        transition-all duration-300 ease-in-out 
                        group hover:brightness-110 hover:scale-105 active:scale-95"
            >
              <Scale size={18} className="transition-transform duration-300 group-hover:rotate-[15deg]" />
              Compare
            </button>

            {/* Download Button */}
            <button
              onClick={() => downloadRepo(agent.repository)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg shadow-md text-white font-semibold 
                        bg-gradient-to-r from-blue-500 to-blue-600 
                        transition-all duration-300 ease-in-out 
                        group hover:brightness-110 hover:scale-105 active:scale-95"
            >
              <Download size={18} className="transition-transform duration-300 group-hover:rotate-[-15deg]" />
              Download
            </button>
          </div>
        </div>

        {/* Repository & Links */}
        <div className="mt-4 flex items-center gap-3 text-gray-300">
          <FolderOpen size={16} />
          <a
            href={agent.repository}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline text-blue-400 flex items-center gap-1"
          >
            Repository <ExternalLink size={14} />
          </a>
          {agent.external_links?.map((link, index) => (
            <a
              key={index}
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              <Link size={14} />
            </a>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-4 flex justify-between items-center bg-zinc-700 p-3 rounded-lg text-sm">
          <div className="flex items-center gap-2">
            <Star size={16} className="text-yellow-400" />
            <span>{agent.stars ?? 0} Stars</span>
          </div>
          <div className="flex items-center gap-2">
            <Download size={16} className="text-green-400" />
            <span>{agent.downloads ?? 0} Downloads</span>
          </div>
          <div className="flex items-center gap-2">
            <HardDrive size={16} className="text-purple-400" />
            <span>{agent.size ?? 0} KB</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle size={16} className="text-blue-400" />
            <span>{agent.tasks_executed ?? 0} Tasks Executed</span>
          </div>
        </div>

        {/* Description */}
        {agent.description && (
          <div className="mt-4 bg-zinc-700 p-4 rounded-lg text-gray-300 text-sm">
            <h3 className="text-lg font-semibold mb-2">📌 Description</h3>
            <p>{agent.description.join(" ")}</p>
          </div>
        )}

        {/* README Section */}
        <div className="mt-6 bg-zinc-700 text-white p-4 rounded-lg max-h-[300px] overflow-y-auto">
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2 text-white">
            <FileText size={16} /> README.md
          </h3>
          <ReactMarkdown 
            className="prose max-w-none text-gray-100 prose-headings:text-white"
            remarkPlugins={[remarkGfm]} 
            rehypePlugins={[rehypeRaw]}
          >
            {readme}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}