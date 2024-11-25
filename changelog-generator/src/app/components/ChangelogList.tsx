'use client';

import { useEffect, useState } from 'react';

// Define the type for changelog
interface Changelog {
  id: number;
  repo_url: string;
  since_date: string;
  summary: string;
}

export default function ChangelogList() {
  const [changelogs, setChangelogs] = useState<Changelog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchChangelogs() {
      try {
        const response = await fetch('/api/generate');
        const data = await response.json();
        setChangelogs(data);
      } catch (err) {
        console.error('Error fetching changelogs:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchChangelogs();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (!changelogs.length) return <p>No changelogs available.</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Changelog Summaries</h1>
      {changelogs.map((log) => (
        <div key={log.id} className="mb-6 p-4 bg-white rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Repository: {log.repo_url}</h2>
          <p className="text-sm text-gray-600">Since: {log.since_date}</p>
          <div className="mt-4">
            <h3 className="text-lg font-semibold">Summary:</h3>
            <p className="mt-2 p-4 bg-gray-100 rounded border">{log.summary}</p>
          </div>
        </div>
      ))}
    </div>
  );
}