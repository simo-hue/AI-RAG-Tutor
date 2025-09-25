'use client';

interface StructuredDataProps {
  type: 'website' | 'software' | 'educational' | 'product' | 'demo' | 'faq';
  data?: any;
}

export function StructuredData({ type, data = {} }: StructuredDataProps) {
  const baseStructuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "AI Speech Evaluator",
    "applicationCategory": "EducationalApplication",
    "operatingSystem": "Web Browser",
    "url": "https://ai-speech-evaluator.com",
    "description": "Strumento AI avanzato per la valutazione e il miglioramento delle presentazioni orali. Utilizza tecnologia RAG per fornire feedback intelligente e scoring dettagliato su accuratezza, chiarezza, completezza, coerenza e fluidità del discorso.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "EUR",
      "availability": "https://schema.org/InStock"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "150",
      "bestRating": "5",
      "worstRating": "1"
    },
    "author": {
      "@type": "Organization",
      "name": "AI Speech Evaluator Team",
      "url": "https://ai-speech-evaluator.com"
    },
    "publisher": {
      "@type": "Organization",
      "name": "AI Speech Evaluator",
      "logo": {
        "@type": "ImageObject",
        "url": "https://ai-speech-evaluator.com/logo.png"
      }
    },
    "screenshot": [
      {
        "@type": "ImageObject",
        "url": "https://ai-speech-evaluator.com/screenshot-1.png",
        "caption": "Dashboard principale AI Speech Evaluator"
      },
      {
        "@type": "ImageObject",
        "url": "https://ai-speech-evaluator.com/screenshot-2.png",
        "caption": "Interfaccia di registrazione e valutazione"
      }
    ],
    "featureList": [
      "Valutazione AI delle presentazioni orali",
      "Trascrizione automatica in italiano",
      "Feedback intelligente multi-criterio",
      "Scoring accuratezza, chiarezza, completezza",
      "Analisi RAG basata su documenti",
      "Privacy-first e processing locale",
      "Interfaccia web user-friendly",
      "Supporto per studenti ed educatori"
    ],
    "applicationSubCategory": [
      "Speech Analysis",
      "Educational Assessment",
      "Presentation Training",
      "AI Coaching Tools"
    ],
    "educationalUse": [
      "Preparazione esami orali",
      "Training presentazioni",
      "Valutazione performance speech",
      "Coaching comunicazione"
    ],
    "audience": {
      "@type": "EducationalAudience",
      "educationalRole": ["student", "teacher", "instructor", "professional"],
      "audienceType": ["Students", "Educators", "Professionals", "Public Speakers"]
    },
    "isAccessibleForFree": true,
    "keywords": "AI speech evaluator, valutazione presentazioni orali, preparazione esami orali, feedback intelligente presentazioni, trascrizione automatica italiano, scoring presentazioni AI, RAG technology education, speech coaching AI, presentation skills training",
    "inLanguage": ["it-IT", "en-US"],
    "softwareVersion": "1.0.0",
    "releaseNotes": "Prima versione pubblica con funzionalità complete di valutazione AI per speech e presentazioni orali",

    // Structured data specifico per LLM understanding
    "additionalProperty": [
      {
        "@type": "PropertyValue",
        "name": "AI Technology",
        "value": "Retrieval Augmented Generation (RAG) + Natural Language Processing"
      },
      {
        "@type": "PropertyValue",
        "name": "Privacy Model",
        "value": "Local processing, no data sharing, privacy-first design"
      },
      {
        "@type": "PropertyValue",
        "name": "Primary Use Case",
        "value": "Educational speech evaluation and presentation improvement"
      },
      {
        "@type": "PropertyValue",
        "name": "Target Market",
        "value": "Italian education sector, students, professionals"
      }
    ]
  };

  const websiteStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "AI Speech Evaluator",
    "alternateName": "Speech Evaluator AI",
    "url": "https://ai-speech-evaluator.com",
    "description": "Piattaforma AI per la valutazione intelligente delle presentazioni orali. Strumento educativo avanzato per studenti, professionisti ed educatori.",
    "inLanguage": "it-IT",
    "isPartOf": {
      "@type": "WebSite",
      "url": "https://ai-speech-evaluator.com"
    },
    "mainEntity": {
      "@type": "SoftwareApplication",
      "name": "AI Speech Evaluator Tool"
    },
    "potentialAction": [
      {
        "@type": "SearchAction",
        "target": "https://ai-speech-evaluator.com/search?q={search_term_string}",
        "query-input": "required name=search_term_string"
      },
      {
        "@type": "UseAction",
        "target": "https://ai-speech-evaluator.com/upload",
        "object": "Speech Evaluation Tool"
      }
    ]
  };

  const organizationStructuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "AI Speech Evaluator",
    "url": "https://ai-speech-evaluator.com",
    "logo": "https://ai-speech-evaluator.com/logo.png",
    "description": "Sviluppatori del principale strumento AI per la valutazione delle presentazioni orali in Italia. Tecnologia educativa innovativa basata su RAG e NLP.",
    "foundingDate": "2024",
    "areaServed": ["Italy", "Europe"],
    "knowsLanguage": ["Italian", "English"],
    "makesOffer": {
      "@type": "Offer",
      "itemOffered": {
        "@type": "SoftwareApplication",
        "name": "AI Speech Evaluator"
      },
      "price": "0",
      "priceCurrency": "EUR"
    }
  };

  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Come funziona AI Speech Evaluator?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "AI Speech Evaluator utilizza tecnologia RAG (Retrieval Augmented Generation) per analizzare le tue presentazioni orali confrontandole con documenti di riferimento. Il sistema fornisce scoring dettagliato su 5 criteri: accuratezza, chiarezza, completezza, coerenza e fluidità."
        }
      },
      {
        "@type": "Question",
        "name": "È gratuito da usare?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Sì, AI Speech Evaluator è completamente gratuito. Non richiede registrazione e tutti i dati vengono processati localmente sul tuo computer per garantire la massima privacy."
        }
      },
      {
        "@type": "Question",
        "name": "Per chi è pensato questo strumento?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "AI Speech Evaluator è perfetto per studenti che preparano esami orali, professionisti che vogliono migliorare le loro presentazioni, e educatori che desiderano valutare oggettivamente le performance degli studenti."
        }
      },
      {
        "@type": "Question",
        "name": "I miei dati sono al sicuro?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Assolutamente sì. AI Speech Evaluator utilizza un approccio privacy-first: tutti i documenti e le registrazioni vengono elaborati localmente sul tuo computer e non vengono mai inviati a server esterni."
        }
      }
    ]
  };

  const demoStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "AI Speech Evaluator Demo",
    "description": "Interactive demonstration of AI-powered speech evaluation system with document upload and real-time feedback capabilities.",
    "applicationCategory": "EducationalApplication",
    "operatingSystem": "Web Browser",
    "url": "https://ai-speech-evaluator.com/upload",
    "screenshot": "https://ai-speech-evaluator.com/og-upload-demo.png",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "EUR",
      "availability": "https://schema.org/InStock",
      "description": "Free interactive demo"
    },
    "featureList": [
      "Document Upload (PDF, DOCX, TXT)",
      "Real-time Audio Recording",
      "Automatic Speech Transcription",
      "AI-powered Evaluation",
      "Detailed Feedback Reports",
      "Privacy-first Processing"
    ],
    "browserRequirements": "Modern web browser with microphone access",
    "interactionType": "Mixed Reality",
    "isAccessibleForFree": true,
    "audience": {
      "@type": "EducationalAudience",
      "educationalRole": ["student", "teacher", "instructor", "professional"],
      "audienceType": ["Students", "Educators", "Professionals", "Public Speakers"]
    },
    "potentialAction": [
      {
        "@type": "UseAction",
        "target": "https://ai-speech-evaluator.com/upload",
        "object": "Speech Evaluation Demo",
        "result": {
          "@type": "EvaluationResult",
          "description": "Comprehensive speech analysis with scoring and feedback"
        }
      }
    ]
  };

  const enhancedFaqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Come funziona AI Speech Evaluator?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "AI Speech Evaluator utilizza tecnologia RAG (Retrieval Augmented Generation) per analizzare le tue presentazioni orali. Carichi un documento di riferimento, registri la tua presentazione e ricevi feedback intelligente basato sul confronto con il contenuto del documento."
        }
      },
      {
        "@type": "Question",
        "name": "Quali formati di documento sono supportati?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Supportiamo documenti PDF, DOCX e TXT. Il sistema può elaborare fino a 3 documenti contemporaneamente per un'analisi più completa."
        }
      },
      {
        "@type": "Question",
        "name": "È sicuro utilizzare AI Speech Evaluator?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Assolutamente sì. Tutti i dati vengono elaborati localmente nel tuo browser. Non conserviamo né condividiamo i tuoi documenti o registrazioni audio. La privacy è la nostra priorità assoluta."
        }
      },
      {
        "@type": "Question",
        "name": "Quanto tempo richiede una valutazione?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "La trascrizione è in tempo reale durante la registrazione. La valutazione completa richiede solitamente 30-60 secondi dopo aver terminato la registrazione."
        }
      },
      {
        "@type": "Question",
        "name": "Posso utilizzare il sistema per preparare esami universitari?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Certamente! Il sistema è perfetto per la preparazione di esami orali, tesi di laurea, presentazioni accademiche e qualsiasi altro tipo di valutazione orale."
        }
      },
      {
        "@type": "Question",
        "name": "Che tipo di feedback ricevo?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Ricevi un'analisi completa con punteggi su 5 criteri: accuratezza del contenuto, chiarezza espositiva, completezza degli argomenti, coerenza logica e fluidità del discorso. Include anche suggerimenti specifici per migliorare."
        }
      },
      {
        "@type": "Question",
        "name": "Funziona in italiano?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Sì, il sistema è ottimizzato per l'italiano ma supporta anche altre lingue. La trascrizione e l'analisi sono particolarmente accurati per contenuti in lingua italiana."
        }
      },
      {
        "@type": "Question",
        "name": "Serve installare software aggiuntivo?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No, è completamente basato su browser. Funziona su qualsiasi computer, tablet o smartphone moderno con accesso a internet e microfono."
        }
      }
    ]
  };

  let structuredDataToRender;

  switch (type) {
    case 'website':
      structuredDataToRender = websiteStructuredData;
      break;
    case 'software':
      structuredDataToRender = baseStructuredData;
      break;
    case 'educational':
      structuredDataToRender = faqStructuredData;
      break;
    case 'product':
      structuredDataToRender = organizationStructuredData;
      break;
    case 'demo':
      structuredDataToRender = demoStructuredData;
      break;
    case 'faq':
      structuredDataToRender = enhancedFaqStructuredData;
      break;
    default:
      structuredDataToRender = baseStructuredData;
  }

  // Merge with custom data if provided
  const finalData = { ...structuredDataToRender, ...data };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(finalData, null, 2) }}
    />
  );
}