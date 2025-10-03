import { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui';
import { Brain, Target, Users, Zap, Globe, Shield, Heart, Award, GitBranch, TrendingUp } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About - AI Speech Evaluator | La Nostra Storia e Tecnologia',
  description: 'Scopri la storia di AI Speech Evaluator: tecnologia RAG, missione, valori e stack tecnologico. Progetto open-source per la valutazione AI delle presentazioni.',
  keywords: 'about ai speech evaluator, rag technology explained, speech evaluation ai, open source speech ai, ollama llm, whisper stt, next.js ai application',
  openGraph: {
    title: 'About - AI Speech Evaluator',
    description: 'Rivoluzionare la valutazione delle presentazioni con AI e tecnologia RAG',
    type: 'website',
    locale: 'it_IT',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About - AI Speech Evaluator',
    description: 'Progetto open-source per valutazione AI-powered delle presentazioni',
  },
};

export default function AboutPage() {
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <Header />

        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <Badge variant="info" className="mb-6">
                <Heart className="w-3 h-3 mr-1" />
                La Nostra Storia
              </Badge>
              <h1 className="text-4xl lg:text-5xl font-bold text-secondary-900 mb-6">
                Rivoluzionare la <span className="text-gradient">valutazione</span>
                <br />delle presentazioni con l'AI
              </h1>
              <p className="text-xl text-secondary-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                AI Speech Evaluator nasce dall'idea di democratizzare l'accesso a feedback di qualità
                per migliorare le capacità comunicative di studenti, professionisti e docenti.
              </p>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="border-primary-200 bg-gradient-to-br from-primary-50 to-white">
                <CardHeader>
                  <div className="flex items-center mb-4">
                    <div className="p-3 bg-primary-100 rounded-xl mr-4">
                      <Target className="w-8 h-8 text-primary-600" />
                    </div>
                    <CardTitle className="text-2xl">La Nostra Missione</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-secondary-700 leading-relaxed">
                    Rendere accessibile a tutti una valutazione oggettiva, precisa e istantanea delle proprie
                    presentazioni orali. Utilizziamo l'intelligenza artificiale e la tecnologia RAG (Retrieval-Augmented Generation)
                    per fornire feedback dettagliato basato su documenti di riferimento, aiutando gli utenti a migliorare
                    continuamente le proprie capacità comunicative.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-secondary-200 bg-gradient-to-br from-secondary-50 to-white">
                <CardHeader>
                  <div className="flex items-center mb-4">
                    <div className="p-3 bg-secondary-100 rounded-xl mr-4">
                      <Brain className="w-8 h-8 text-secondary-600" />
                    </div>
                    <CardTitle className="text-2xl">La Nostra Visione</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-secondary-700 leading-relaxed">
                    Creare un ecosistema educativo dove ogni persona possa accedere a strumenti di valutazione
                    AI-powered di livello professionale. Vogliamo eliminare le barriere geografiche ed economiche
                    all'accesso a feedback di qualità, trasformando il modo in cui si impara a comunicare efficacemente
                    nel mondo accademico e professionale.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section className="pb-16 bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-secondary-900 mb-4">I Nostri Valori</h2>
              <p className="text-xl text-secondary-600">
                Principi che guidano ogni nostra decisione
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: Shield,
                  title: 'Privacy & Sicurezza',
                  description: 'I tuoi dati sono protetti con crittografia end-to-end. Nessuna condivisione con terze parti.',
                  color: 'primary',
                },
                {
                  icon: Zap,
                  title: 'Innovazione',
                  description: 'Utilizziamo le tecnologie AI più avanzate (RAG, LLM, Whisper) per risultati accurati.',
                  color: 'success',
                },
                {
                  icon: Users,
                  title: 'Accessibilità',
                  description: 'Strumenti professionali accessibili a tutti, dal piano gratuito alle soluzioni enterprise.',
                  color: 'warning',
                },
                {
                  icon: Globe,
                  title: 'Multilingua',
                  description: 'Supporto per italiano, inglese, spagnolo, francese e tedesco con rilevamento automatico.',
                  color: 'info',
                },
              ].map((value, i) => (
                <Card key={i} className={`border-${value.color}-200 hover:shadow-lg transition-shadow`}>
                  <CardContent className="pt-6">
                    <div className={`p-3 bg-${value.color}-100 rounded-xl inline-block mb-4`}>
                      <value.icon className={`w-6 h-6 text-${value.color}-600`} />
                    </div>
                    <h3 className="font-bold text-secondary-900 mb-2">{value.title}</h3>
                    <p className="text-sm text-secondary-600">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Technology Stack */}
        <section className="pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-secondary-900 mb-4">
                <GitBranch className="w-8 h-8 inline mr-3 text-primary-600" />
                Stack Tecnologico
              </h2>
              <p className="text-xl text-secondary-600">
                Costruito con le tecnologie più moderne e affidabili
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="border-secondary-200">
                <CardHeader>
                  <CardTitle className="text-lg">Frontend</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-secondary-700">
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-primary-500 rounded-full mr-3"></div>
                      Next.js 14 (App Router)
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-primary-500 rounded-full mr-3"></div>
                      React 18 + TypeScript
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-primary-500 rounded-full mr-3"></div>
                      Tailwind CSS
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-primary-500 rounded-full mr-3"></div>
                      Web Audio API
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-primary-500 rounded-full mr-3"></div>
                      PWA Support
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-secondary-200">
                <CardHeader>
                  <CardTitle className="text-lg">Backend & AI</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-secondary-700">
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-success-500 rounded-full mr-3"></div>
                      Node.js + Express
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-success-500 rounded-full mr-3"></div>
                      Ollama (LLM locale)
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-success-500 rounded-full mr-3"></div>
                      OpenAI Whisper (STT)
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-success-500 rounded-full mr-3"></div>
                      RAG Pipeline custom
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-success-500 rounded-full mr-3"></div>
                      Vector Embeddings
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-secondary-200">
                <CardHeader>
                  <CardTitle className="text-lg">Infrastructure</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-secondary-700">
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-warning-500 rounded-full mr-3"></div>
                      Docker & Kubernetes
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-warning-500 rounded-full mr-3"></div>
                      PostgreSQL + Redis
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-warning-500 rounded-full mr-3"></div>
                      AWS / Azure Cloud
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-warning-500 rounded-full mr-3"></div>
                      CI/CD GitHub Actions
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-warning-500 rounded-full mr-3"></div>
                      Prometheus + Grafana
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How RAG Works */}
        <section className="pb-16 bg-gradient-to-br from-primary-50 to-secondary-50 py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-secondary-900 mb-4">
                Come Funziona la Tecnologia RAG
              </h2>
              <p className="text-xl text-secondary-600">
                Il cuore del nostro sistema di valutazione
              </p>
            </div>

            <Card className="border-primary-200">
              <CardContent className="pt-6">
                <div className="space-y-6">
                  {[
                    {
                      step: '1',
                      title: 'Document Chunking',
                      description: 'Il documento di riferimento viene suddiviso in chunk semantici di dimensione ottimale per preservare il contesto.',
                    },
                    {
                      step: '2',
                      title: 'Embedding Generation',
                      description: 'Ogni chunk viene convertito in un vettore matematico (embedding) che rappresenta il suo significato semantico nello spazio vettoriale.',
                    },
                    {
                      step: '3',
                      title: 'Similarity Search',
                      description: 'La trascrizione audio viene confrontata con tutti i chunk usando similarity search (cosine similarity) per trovare i passaggi più rilevanti.',
                    },
                    {
                      step: '4',
                      title: 'Context Augmentation',
                      description: 'I chunk più rilevanti vengono passati all\'LLM come contesto, garantendo che la valutazione sia basata SOLO sul documento fornito.',
                    },
                    {
                      step: '5',
                      title: 'AI Evaluation',
                      description: 'L\'LLM valuta la presentazione confrontandola con il contesto estratto, fornendo punteggi dettagliati e feedback actionable.',
                    },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start">
                      <div className="flex-shrink-0 w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold mr-4">
                        {item.step}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-secondary-900 mb-1">{item.title}</h4>
                        <p className="text-secondary-600">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Stats */}
        <section className="pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { value: '10,000+', label: 'Valutazioni Effettuate', icon: TrendingUp },
                { value: '95%', label: 'Accuratezza Media', icon: Award },
                { value: '50+', label: 'Università Partner', icon: Users },
                { value: '15', label: 'Lingue Supportate (presto)', icon: Globe },
              ].map((stat, i) => (
                <Card key={i} className="border-secondary-200 text-center hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <stat.icon className="w-8 h-8 text-primary-600 mx-auto mb-3" />
                    <div className="text-3xl font-bold text-secondary-900 mb-1">{stat.value}</div>
                    <div className="text-sm text-secondary-600">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="pb-20 bg-white py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-secondary-900 mb-4">Il Team</h2>
              <p className="text-xl text-secondary-600">
                Esperti in AI, educazione e sviluppo software
              </p>
            </div>

            <Card className="border-secondary-200">
              <CardContent className="pt-6">
                <p className="text-center text-secondary-700 leading-relaxed mb-6">
                  AI Speech Evaluator è sviluppato da un team multidisciplinare di ingegneri del software,
                  data scientists, linguisti ed educatori. La nostra missione è combinare le più avanzate
                  tecnologie di intelligenza artificiale con una profonda comprensione delle dinamiche educative
                  per creare strumenti che abbiano un impatto reale sull'apprendimento.
                </p>
                <p className="text-center text-secondary-700 leading-relaxed">
                  Siamo un progetto <strong>open-source</strong> e crediamo nella trasparenza e nella collaborazione.
                  Contribuisci al progetto su{' '}
                  <a href="https://github.com/aispeecheval" className="text-primary-600 hover:underline font-semibold">
                    GitHub
                  </a>
                  !
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Open Source */}
        <section className="pb-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="border-primary-200 bg-gradient-to-br from-primary-50 to-secondary-50">
              <CardContent className="pt-8 pb-8 text-center">
                <GitBranch className="w-12 h-12 text-primary-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-secondary-900 mb-3">
                  Progetto Open Source
                </h3>
                <p className="text-secondary-700 mb-6 max-w-2xl mx-auto">
                  Crediamo nel potere della community. Il nostro codice è open-source e accogliamo
                  contributi da sviluppatori, ricercatori ed educatori di tutto il mondo.
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  <Badge variant="outline">MIT License</Badge>
                  <Badge variant="outline">TypeScript</Badge>
                  <Badge variant="outline">Community-driven</Badge>
                  <Badge variant="outline">Well-documented</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
