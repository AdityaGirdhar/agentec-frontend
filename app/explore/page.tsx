'use client';

import { useState } from 'react';
import Cards from './cards';

export default function Home() {
  const [repoUrl, setRepoUrl] = useState('');
  const API_URL = 'http://localhost:8000';

  console.log('API_URL:', API_URL);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/github/add-repos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify( [repoUrl] ),
      });
      if (!response.ok) throw new Error('Failed to add repo');
      console.log(response);
      alert('Repository added successfully!');
    } catch (error) {
      console.error(error);
      alert('Error adding repository');
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Add GitHub Repository</h1>
      <form onSubmit={handleSubmit} className="flex flex-col items-center">
        <input
          type="text"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          placeholder="Enter repository URL"
          className="border p-2 rounded w-80 mb-2"
          required
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Submit
        </button>
        <Cards />
      </form>
    </main>
  );
}
