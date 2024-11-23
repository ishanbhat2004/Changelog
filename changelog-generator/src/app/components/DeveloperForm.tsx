'use client';

import { useState } from 'react';

export default function DeveloperForm() {
  const [repoUrl, setRepoUrl] = useState('');
  const [since, setSince] = useState('');
  const [loading, setLoading] = useState(false);
  const [changelog, setChangelog] = useState<{ raw: any; summary: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ repoUrl, since }),
        });

        if (!response.ok) {
        throw new Error('Failed to generate changelog. Please check the repository details.');
        }

        const data = await response.json();
        setChangelog(data);
    } catch (err: any) {
        setError(err.message || 'An unexpected error occurred.');
    } finally {
        setLoading(false);
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="repoUrl" className="block text-sm font-medium text-gray-700">
            GitHub Repository URL
          </label>
          <input
            id="repoUrl"
            type="url"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            placeholder="https://github.com/user/repo"
            required
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="since" className="block text-sm font-medium text-gray-700">
            Since Commit/Date
          </label>
          <input
            id="since"
            type="text"
            value={since}
            onChange={(e) => setSince(e.target.value)}
            placeholder="e.g., HEAD~10 or 2023-01-01"
            required
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full px-4 py-2 font-semibold text-white bg-blue-600 rounded-md shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Generating...' : 'Generate Changelog'}
        </button>
      </form>

      {error && (
        <div className="mt-4 text-red-600 border border-red-300 bg-red-50 p-4 rounded">
          <p>{error}</p>
        </div>
      )}

      {changelog && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Changelog</h2>
          <div className="mb-6">
            <h3 className="text-xl font-semibold">Raw Commits:</h3>
            <pre className="mt-2 p-4 bg-gray-100 rounded border">{JSON.stringify(changelog.raw, null, 2)}</pre>
          </div>
          <div>
            <h3 className="text-xl font-semibold">Summarized Changelog:</h3>
            <p className="mt-2 p-4 bg-gray-100 rounded border">{changelog.summary}</p>
          </div>
        </div>
      )}
    </div>
  );
}
