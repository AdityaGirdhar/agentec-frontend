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
  const API_URL = 'http://localhost:8000';

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        const response = await fetch(`${API_URL}/database/get-all-repos`);
        if (!response.ok) throw new Error('Failed to fetch repositories');
        const data = await response.json();
        setRepos(data);
      } catch (error) {
        console.error(error);
        alert('Error fetching repositories');
      }
    };
    fetchRepos();
  }, []);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">GitHub Repositories</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-5xl">
        {repos.map((repo: Repo) => (
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
            <p className="text-sm text-gray-600">{repo.description || 'No description available'}</p>
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
            <h2 className="text-xl font-bold mb-2">{selectedRepo.name}</h2>
            <ReactMarkdown className="prose max-w-none">{selectedRepo.readme || 'No README available'}</ReactMarkdown>
          </div>
        </div>
      )}
    </main>
  );
}
