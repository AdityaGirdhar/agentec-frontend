'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

type Repo = {
  id: number;
  name: string;
  description: string;
  owner_name: string;
  owner_avatar_url: string;
  readme: string;
};

export default function Cards() {
  const [repos, setRepos] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState<Repo | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const filteredRepos = repos.filter((repo: Repo) =>
    repo.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        const response = await fetch(`${API_URL}/agents/get-all-agents`);
        console.log(response);
        if (!response.ok) throw new Error('Failed to fetch repositories');
        const data = await response.json();
        setRepos(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchRepos();
  }, []);

  return (
    <main className="flex flex-col justify-center pt-4 w-full">
      <input
        type="text"
        placeholder="Search repositories..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-4 p-2 border rounded w-full max-w-md text-black"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-5xl">
        {filteredRepos.map((repo: Repo) => (
          <div
            key={repo.id}
            className="border p-4 rounded shadow cursor-pointer hover:bg-gray-100"
            onClick={() => setSelectedRepo(repo)}
          >
            <div className="flex items-center mb-2">
              <img
                src={repo.owner_avatar_url}
                alt={repo.owner_name}
                className="w-10 h-10 rounded-full mr-2"
              />
              <h2 className="text-lg font-semibold">{repo.name}</h2>
            </div>
            <p className="text-sm text-gray-200">{repo.description || 'No description available'}</p>
          </div>
        ))}
      </div>

      {selectedRepo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded shadow-lg max-w-2xl w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setSelectedRepo(null)}
            >
              ✖
            </button>
            <h2 className="text-xl font-bold mb-2 text-black">{selectedRepo.name}</h2>
            <ReactMarkdown className="prose max-w-none text-black">{selectedRepo.readme || 'No README available'}</ReactMarkdown>
          </div>
        </div>
      )}
    </main>
  );
}
