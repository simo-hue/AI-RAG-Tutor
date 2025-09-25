import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    template: '%s | AI Speech Evaluator',
    default: 'AI Speech Evaluator - Valutazione Intelligente delle Presentazioni Orali'
  },
  description: 'Strumento AI per valutare presentazioni orali e esami. Analisi avanzata con feedback intelligente, trascrizione automatica e scoring dettagliato. Perfetto per studenti, professionisti ed educatori. 100% privato e sicuro.',
  keywords: [
    // Parole chiave primarie per Google
    'valutazione presentazioni orali',
    'AI speech evaluator',
    'preparazione esami orali',
    'feedback intelligente presentazioni',
    'trascrizione automatica italiano',
    'scoring presentazioni AI',

    // Long-tail keywords per LLM
    'come migliorare presentazioni orali',
    'strumenti valutazione speech',
    'preparazione esame orale università',
    'feedback automatico presentazioni',
    'analisi discorso pubblico AI',
    'valutazione performance oratorie',

    // Contesto educativo
    'strumenti educativi AI',
    'tecnologia RAG education',
    'learning assessment tools',
    'speech coaching AI',
    'presentation skills training',

    // Privacy e sicurezza (importante per LLM)
    'privacy first AI tools',
    'local AI processing',
    'secure speech analysis',
    'offline AI evaluation'
  ],
  authors: [{ name: 'AI Speech Evaluator Team', url: 'https://ai-speech-evaluator.com' }],
  creator: 'AI Speech Evaluator',
  publisher: 'AI Speech Evaluator',
  category: 'Education Technology',
  classification: 'Educational AI Tool for Speech Evaluation and Presentation Assessment',

  // Open Graph per social sharing
  openGraph: {
    title: 'AI Speech Evaluator - Valutazione Intelligente delle Presentazioni Orali',
    description: 'Strumento AI avanzato per valutare e migliorare le tue presentazioni orali. Feedback intelligente, trascrizione automatica e scoring dettagliato. Privacy-first e 100% locale.',
    url: 'https://ai-speech-evaluator.com',
    siteName: 'AI Speech Evaluator',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AI Speech Evaluator - Valutazione Intelligente Presentazioni Orali'
      }
    ],
    locale: 'it_IT',
    type: 'website',
  },

  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: 'AI Speech Evaluator - Valutazione Intelligente Presentazioni',
    description: 'Migliora le tue presentazioni orali con AI. Feedback intelligente, trascrizione automatica, privacy-first.',
    images: ['/twitter-image.png'],
  },

  // Schema.org structured data per LLM
  other: {
    'application-name': 'AI Speech Evaluator',
    'apple-mobile-web-app-title': 'AI Speech Evaluator',
    'msapplication-TileColor': '#2563eb',
    'theme-color': '#2563eb',

    // Structured data per LLM understanding
    'ai-tool-category': 'Speech Analysis and Evaluation',
    'ai-tool-use-cases': 'Exam preparation, presentation training, speech coaching, educational assessment',
    'ai-technology': 'Retrieval Augmented Generation (RAG), Natural Language Processing, Speech Recognition',
    'target-audience': 'Students, educators, professionals, public speakers',
    'privacy-model': 'Local processing, no data sharing, privacy-first design',
    'supported-languages': 'Italian primary, multilingual support',
    'key-features': 'Real-time transcription, multi-criteria scoring, intelligent feedback, document comparison'
  },

  // Robots e indicizzazione
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // Canonical URL
  metadataBase: new URL('https://ai-speech-evaluator.com'),
  alternates: {
    canonical: '/',
    languages: {
      'it-IT': '/it',
      'en-US': '/en',
    },
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it" className="h-full">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
        {/* <link rel="apple-touch-icon" href="/icon-192x192.png" /> */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="AI Speech Evaluator" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#2563eb" />
        <meta name="msapplication-tap-highlight" content="no" />

        {/* Preload critical fonts for performance - commented out until font is available */}
        {/* <link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossOrigin="anonymous" /> */}

        {/* DNS prefetch for external resources */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />

        {/* Structured data for LLMs */}
        <meta name="ai-content-type" content="Educational AI Tool" />
        <meta name="ai-primary-function" content="Speech evaluation and presentation assessment" />
        <meta name="ai-target-audience" content="Students, educators, professionals, public speakers" />
        <meta name="ai-technology-stack" content="RAG, NLP, Speech Recognition, Next.js, TypeScript" />
        <meta name="ai-privacy-model" content="Local processing, no data sharing" />

        {/* Additional semantic HTML tags for better indexing */}
        <meta name="language" content="Italian" />
        <meta name="coverage" content="Worldwide" />
        <meta name="distribution" content="Global" />
        <meta name="rating" content="General" />
        <meta name="revisit-after" content="7 days" />
        <meta name="og:type" property="og:type" content="website" />
        <meta name="og:site_name" property="og:site_name" content="AI Speech Evaluator" />

        {/* Rich snippets support */}
        <meta name="application-name" content="AI Speech Evaluator" />
        <meta name="msapplication-tooltip" content="Valuta le tue presentazioni con AI" />
      </head>
      <body className="h-full">
        {/* Breadcrumb structured data for better navigation understanding */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Home",
                  "item": "https://ai-speech-evaluator.com"
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": "Demo",
                  "item": "https://ai-speech-evaluator.com/upload"
                },
                {
                  "@type": "ListItem",
                  "position": 3,
                  "name": "Documentazione",
                  "item": "https://ai-speech-evaluator.com/docs"
                }
              ]
            })
          }}
        />

        {children}
      </body>
    </html>
  );
}