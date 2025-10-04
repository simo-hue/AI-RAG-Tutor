'use client';

import { useEffect, useState } from 'react';

export default function TestAPIPage() {
  const [ollamaStatus, setOllamaStatus] = useState<any>(null);
  const [languages, setLanguages] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testAPIs = async () => {
      try {
        // Test Ollama Status
        console.log('Testing /api/ollama/status...');
        const ollamaRes = await fetch('/api/ollama/status', {
          headers: {
            'X-Requested-With': 'XMLHttpRequest'
          }
        });
        console.log('Ollama response status:', ollamaRes.status);
        const ollamaData = await ollamaRes.json();
        console.log('Ollama data:', ollamaData);
        setOllamaStatus(ollamaData);

        // Test Languages
        console.log('Testing /api/languages...');
        const langRes = await fetch('/api/languages', {
          headers: {
            'X-Requested-With': 'XMLHttpRequest'
          }
        });
        console.log('Languages response status:', langRes.status);
        const langData = await langRes.json();
        console.log('Languages data:', langData);
        setLanguages(langData);

      } catch (err) {
        console.error('Error testing APIs:', err);
        setError(err instanceof Error ? err.message : String(err));
      }
    };

    testAPIs();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">API Test Page</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error: {error}
        </div>
      )}

      <div className="space-y-6">
        <div className="border rounded p-4">
          <h2 className="text-xl font-semibold mb-2">Ollama Status</h2>
          <pre className="bg-gray-100 p-2 rounded overflow-auto">
            {JSON.stringify(ollamaStatus, null, 2)}
          </pre>
        </div>

        <div className="border rounded p-4">
          <h2 className="text-xl font-semibold mb-2">Languages</h2>
          <pre className="bg-gray-100 p-2 rounded overflow-auto">
            {JSON.stringify(languages, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
