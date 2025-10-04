'use client';

import { Button } from '@/components/ui';
import { FileQuestion } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-warning-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileQuestion className="w-8 h-8 text-warning-600" />
        </div>
        <h1 className="text-6xl font-bold text-secondary-900 mb-2">404</h1>
        <h2 className="text-2xl font-semibold text-secondary-800 mb-2">
          Pagina non trovata
        </h2>
        <p className="text-secondary-600 mb-6">
          La pagina che stai cercando non esiste o è stata spostata.
        </p>
        <Link href="/">
          <Button variant="primary">Torna alla Home</Button>
        </Link>
      </div>
    </div>
  );
}
