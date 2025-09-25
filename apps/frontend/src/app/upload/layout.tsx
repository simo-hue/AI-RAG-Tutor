import { Metadata } from 'next';

// Page metadata for optimal SEO and LLM discovery
export const metadata: Metadata = {
  title: 'Demo Valutazione AI | Carica e Analizza le tue Presentazioni Orali',
  description: 'Demo interattiva per testare l\'AI Speech Evaluator. Carica il tuo documento di riferimento, registra la presentazione e ricevi feedback intelligente immediato. Sistema RAG avanzato per valutazione precisa.',
  keywords: [
    'demo AI speech evaluator',
    'test valutazione presentazioni',
    'carica documento presentazione',
    'registra presentazione orale',
    'feedback immediato AI',
    'demo gratuita speech analysis',
    'prova valutatore presentazioni',
    'upload documento riferimento',
    'registrazione audio browser',
    'analisi RAG tempo reale',
    'demo interattiva education',
    'test preparazione esami',
    'simulazione valutazione orale',
    'prova gratuita AI coach'
  ],
  openGraph: {
    title: 'Demo AI Speech Evaluator - Testa la Valutazione Intelligente',
    description: 'Prova gratuitamente il nostro sistema AI. Carica documento, registra presentazione, ottieni feedback immediato con tecnologia RAG avanzata.',
    url: 'https://ai-speech-evaluator.com/upload',
    images: [
      {
        url: '/og-upload-demo.png',
        width: 1200,
        height: 630,
        alt: 'Demo AI Speech Evaluator - Interface di Upload e Registrazione'
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Demo AI Speech Evaluator - Valutazione Presentazioni',
    description: 'Prova gratis: carica documento, registra presentazione, feedback AI immediato.',
  },
  other: {
    'page-type': 'Interactive Demo',
    'demo-features': 'Document upload, audio recording, real-time transcription, AI evaluation',
    'user-journey': 'Upload reference document → Record presentation → Get AI feedback',
    'ai-capabilities': 'RAG analysis, multi-criteria evaluation, intelligent scoring',
    'supported-formats': 'PDF, DOCX, TXT documents; browser audio recording',
    'processing-time': 'Real-time transcription, instant evaluation results',
    'privacy-assured': 'Local processing, no data retention, secure analysis'
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function UploadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}