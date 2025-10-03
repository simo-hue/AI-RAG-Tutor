import { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button, Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui';
import { Check, X, Zap, Users, Building2, Rocket, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Pricing - AI Speech Evaluator | Piani e Prezzi',
  description: 'Scopri i piani di AI Speech Evaluator: Free, Pro ed Enterprise. Valutazione AI-powered delle presentazioni con tecnologia RAG. Inizia gratis oggi!',
  keywords: 'pricing ai speech evaluator, piani prezzi valutazione presentazioni, ai speech evaluation pricing, rag technology pricing, ollama ai pricing',
  openGraph: {
    title: 'Pricing - AI Speech Evaluator',
    description: 'Piani flessibili per ogni esigenza. Dal piano Free a soluzioni Enterprise personalizzate.',
    type: 'website',
    locale: 'it_IT',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pricing - AI Speech Evaluator',
    description: 'Scopri i nostri piani e inizia gratis oggi',
  },
};

export default function PricingPage() {
  const plans = [
    {
      name: 'Free',
      tagline: 'Per iniziare',
      price: '0',
      period: 'sempre gratis',
      description: 'Perfetto per studenti e uso personale',
      features: [
        'Fino a 10 valutazioni al mese',
        'Documenti fino a 5 pagine',
        'Registrazioni fino a 5 minuti',
        'Modelli AI base (Ollama locale)',
        'Analisi RAG di base',
        'Supporto community',
      ],
      limitations: [
        'Nessun supporto prioritario',
        'Funzionalità avanzate limitate',
      ],
      cta: 'Inizia Gratis',
      highlight: false,
      icon: Users,
    },
    {
      name: 'Pro',
      tagline: 'Per professionisti',
      price: '29',
      period: 'al mese',
      description: 'Ideale per professionisti e docenti',
      features: [
        'Valutazioni illimitate',
        'Documenti fino a 50 pagine',
        'Registrazioni fino a 30 minuti',
        'Tutti i modelli AI (GPT-4, Claude, Ollama)',
        'Analisi RAG avanzata',
        'Report dettagliati PDF',
        'Supporto multilingua completo',
        'Cronologia valutazioni',
        'Supporto prioritario email',
        'API access (100 req/giorno)',
      ],
      limitations: [],
      cta: 'Prova 14 Giorni Gratis',
      highlight: true,
      icon: Zap,
    },
    {
      name: 'Enterprise',
      tagline: 'Per organizzazioni',
      price: 'Custom',
      period: 'contattaci',
      description: 'Soluzioni personalizzate per università e aziende',
      features: [
        'Tutto di Pro, più:',
        'Installazione on-premise',
        'SSO e autenticazione custom',
        'Dashboard amministrativa',
        'Gestione team e gruppi',
        'Branding personalizzato',
        'Modelli AI custom fine-tuned',
        'SLA garantito 99.9%',
        'Account manager dedicato',
        'Training e onboarding',
        'API illimitata',
        'Integrazione LMS (Moodle, Canvas)',
      ],
      limitations: [],
      cta: 'Contatta il Team',
      highlight: false,
      icon: Building2,
    },
  ];

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <Header />

        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <Badge variant="info" className="mb-6">
                <Rocket className="w-3 h-3 mr-1" />
                Piani Flessibili per Ogni Esigenza
              </Badge>
              <h1 className="text-4xl lg:text-5xl font-bold text-secondary-900 mb-6">
                Scegli il piano perfetto per{' '}
                <span className="text-gradient">le tue presentazioni</span>
              </h1>
              <p className="text-xl text-secondary-600 mb-8 max-w-3xl mx-auto">
                Valutazione AI-powered con tecnologia RAG. Inizia gratis e scala quando ne hai bisogno.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {plans.map((plan, index) => {
                const IconComponent = plan.icon;
                return (
                  <Card
                    key={index}
                    className={`relative ${
                      plan.highlight
                        ? 'border-primary-500 border-2 shadow-2xl scale-105 z-10'
                        : 'border-secondary-200'
                    } transition-all duration-300 hover:shadow-xl`}
                  >
                    {plan.highlight && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <Badge variant="success" className="px-6 py-1.5">
                          ⭐ Più Popolare
                        </Badge>
                      </div>
                    )}

                    <CardHeader className="text-center pb-8 pt-10">
                      <div className="mb-4 flex justify-center">
                        <div className={`p-3 rounded-xl ${
                          plan.highlight ? 'bg-primary-100' : 'bg-secondary-100'
                        }`}>
                          <IconComponent className={`w-8 h-8 ${
                            plan.highlight ? 'text-primary-600' : 'text-secondary-600'
                          }`} />
                        </div>
                      </div>
                      <CardTitle className="text-2xl font-bold mb-2">{plan.name}</CardTitle>
                      <p className="text-sm text-secondary-500 mb-4">{plan.tagline}</p>
                      <div className="mb-4">
                        <span className="text-5xl font-bold text-secondary-900">
                          {plan.price === 'Custom' ? '' : '€'}
                          {plan.price}
                        </span>
                        {plan.price !== 'Custom' && (
                          <span className="text-secondary-500 ml-2">/{plan.period}</span>
                        )}
                        {plan.price === 'Custom' && (
                          <span className="text-secondary-500 text-xl ml-2">{plan.period}</span>
                        )}
                      </div>
                      <p className="text-secondary-600">{plan.description}</p>
                    </CardHeader>

                    <CardContent>
                      <ul className="space-y-4 mb-8">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-start">
                            <Check className="w-5 h-5 text-success-500 mr-3 mt-0.5 flex-shrink-0" />
                            <span className="text-secondary-700">{feature}</span>
                          </li>
                        ))}
                        {plan.limitations.map((limitation, i) => (
                          <li key={i} className="flex items-start opacity-50">
                            <X className="w-5 h-5 text-secondary-400 mr-3 mt-0.5 flex-shrink-0" />
                            <span className="text-secondary-500">{limitation}</span>
                          </li>
                        ))}
                      </ul>

                      <Link href={plan.name === 'Enterprise' ? '/contact' : '/upload'}>
                        <Button
                          className={`w-full ${
                            plan.highlight
                              ? 'bg-primary-600 hover:bg-primary-700'
                              : 'bg-secondary-600 hover:bg-secondary-700'
                          }`}
                          size="lg"
                        >
                          {plan.cta}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Features Comparison */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-secondary-900 mb-4">
                Confronto Dettagliato
              </h2>
              <p className="text-xl text-secondary-600">
                Scopri tutte le funzionalità disponibili in ogni piano
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-secondary-200">
                    <th className="text-left py-4 px-6 text-secondary-900 font-semibold">Funzionalità</th>
                    <th className="text-center py-4 px-6 text-secondary-900 font-semibold">Free</th>
                    <th className="text-center py-4 px-6 text-primary-600 font-semibold">Pro</th>
                    <th className="text-center py-4 px-6 text-secondary-900 font-semibold">Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feature: 'Valutazioni mensili', free: '10', pro: 'Illimitate', enterprise: 'Illimitate' },
                    { feature: 'Dimensione documenti', free: '5 pagine', pro: '50 pagine', enterprise: 'Illimitata' },
                    { feature: 'Durata registrazioni', free: '5 minuti', pro: '30 minuti', enterprise: 'Illimitata' },
                    { feature: 'Modelli AI', free: 'Ollama base', pro: 'Tutti (GPT-4, Claude)', enterprise: 'Custom fine-tuned' },
                    { feature: 'Analisi RAG', free: '✓ Base', pro: '✓ Avanzata', enterprise: '✓ Custom' },
                    { feature: 'Report PDF', free: '—', pro: '✓', enterprise: '✓' },
                    { feature: 'Supporto multilingua', free: 'Limitato', pro: '✓ Completo', enterprise: '✓ Completo' },
                    { feature: 'API Access', free: '—', pro: '100 req/giorno', enterprise: 'Illimitata' },
                    { feature: 'Installazione on-premise', free: '—', pro: '—', enterprise: '✓' },
                    { feature: 'SSO & Auth custom', free: '—', pro: '—', enterprise: '✓' },
                    { feature: 'Integrazione LMS', free: '—', pro: '—', enterprise: '✓' },
                    { feature: 'Supporto', free: 'Community', pro: 'Email prioritario', enterprise: 'Dedicato 24/7' },
                  ].map((row, i) => (
                    <tr key={i} className="border-b border-secondary-100 hover:bg-secondary-50 transition-colors">
                      <td className="py-4 px-6 text-secondary-700 font-medium">{row.feature}</td>
                      <td className="py-4 px-6 text-center text-secondary-600">{row.free}</td>
                      <td className="py-4 px-6 text-center text-primary-600 font-semibold">{row.pro}</td>
                      <td className="py-4 px-6 text-center text-secondary-600">{row.enterprise}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 bg-gradient-to-br from-secondary-50 to-primary-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-secondary-900 mb-4">
                Domande Frequenti
              </h2>
            </div>

            <div className="space-y-6">
              {[
                {
                  q: 'Posso passare da Free a Pro in qualsiasi momento?',
                  a: 'Sì, puoi fare upgrade o downgrade del tuo piano in qualsiasi momento. Il cambio sarà immediato e pagherai solo la differenza pro-rata.',
                },
                {
                  q: 'Come funziona la prova gratuita di 14 giorni?',
                  a: 'Ottieni accesso completo a tutte le funzionalità Pro per 14 giorni. Non è richiesta la carta di credito. Dopo il periodo di prova, puoi decidere se continuare con il piano Pro o tornare al piano Free.',
                },
                {
                  q: 'Quali metodi di pagamento accettate?',
                  a: 'Accettiamo carte di credito/debito (Visa, Mastercard, American Express), PayPal e bonifici bancari per i piani Enterprise.',
                },
                {
                  q: 'I dati sono al sicuro?',
                  a: 'Sì, utilizziamo crittografia end-to-end per tutti i dati. Per il piano Free e Pro, i dati sono hostati su server sicuri EU. Per Enterprise, offriamo anche installazione on-premise per il massimo controllo.',
                },
                {
                  q: 'Posso usare i miei modelli AI personalizzati?',
                  a: 'Con il piano Enterprise, sì. Puoi integrare modelli AI custom fine-tuned sulle tue esigenze specifiche. Contattaci per maggiori dettagli.',
                },
                {
                  q: 'Offrite sconti per università e istituzioni educative?',
                  a: 'Sì, offriamo sconti fino al 50% per università, scuole e istituzioni educative. Contatta il nostro team per un preventivo personalizzato.',
                },
              ].map((faq, i) => (
                <Card key={i} className="border-secondary-200 hover:border-primary-300 transition-colors">
                  <CardHeader>
                    <CardTitle className="text-lg text-secondary-900">{faq.q}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-secondary-600">{faq.a}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-secondary-900 mb-6">
              Pronto a migliorare le tue presentazioni?
            </h2>
            <p className="text-xl text-secondary-600 mb-8">
              Inizia gratis oggi e scopri il potere della valutazione AI-powered
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/upload">
                <Button size="lg" className="px-8 py-4">
                  Inizia Gratis
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="secondary" size="lg" className="px-8 py-4">
                  Contatta il Team
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
