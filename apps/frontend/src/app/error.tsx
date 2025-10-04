'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui';
import { AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-error-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-error-600" />
        </div>
        <h1 className="text-2xl font-bold text-secondary-900 mb-2">
          Qualcosa è andato storto
        </h1>
        <p className="text-secondary-600 mb-6">
          Si è verificato un errore imprevisto. Prova a ricaricare la pagina.
        </p>
        {error.message && (
          <p className="text-sm text-error-600 mb-6 bg-error-50 p-3 rounded">
            {error.message}
          </p>
        )}
        <div className="flex gap-4 justify-center">
          <Button onClick={reset} variant="primary">
            Riprova
          </Button>
          <Button onClick={() => window.location.href = '/'} variant="secondary">
            Torna alla Home
          </Button>
        </div>
      </div>
    </div>
  );
}
