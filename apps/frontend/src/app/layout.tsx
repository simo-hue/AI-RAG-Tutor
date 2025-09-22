import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI RAG Tutor',
  description: 'Sistema avanzato di valutazione speech basato su RAG per analisi di presentazioni orali',
  keywords: ['AI', 'RAG', 'Speech Evaluation', 'Education', 'Tutor'],
  authors: [{ name: 'AI RAG Tutor Team' }],
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it" className="h-full">
      <body className="h-full">
        {children}
      </body>
    </html>
  );
}