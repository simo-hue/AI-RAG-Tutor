import { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button, Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui';
import { Mail, MessageSquare, Phone, MapPin, Send, CheckCircle, Github, Twitter, Linkedin, Globe } from 'lucide-react';
import { useState } from 'react';

export const metadata: Metadata = {
  title: 'Contattaci - AI Speech Evaluator | Supporto e Assistenza',
  description: 'Hai domande su AI Speech Evaluator? Contatta il nostro team di supporto. Email, live chat, telefono. Richiedi demo Enterprise personalizzata.',
  keywords: 'contact ai speech evaluator, supporto ai speech evaluation, demo enterprise ai, assistenza clienti ai, contatti speech evaluator',
  openGraph: {
    title: 'Contattaci - AI Speech Evaluator',
    description: 'Il nostro team è pronto ad aiutarti. Supporto tecnico, vendite e partnership.',
    type: 'website',
    locale: 'it_IT',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contattaci - AI Speech Evaluator',
    description: 'Hai domande? Siamo qui per aiutarti',
  },
};

'use client';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: 'general',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    setSubmitted(true);
    setLoading(false);

    // Reset form after 3 seconds
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        name: '',
        email: '',
        subject: '',
        category: 'general',
        message: '',
      });
    }, 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <Header />

        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <Badge variant="info" className="mb-6">
                <MessageSquare className="w-3 h-3 mr-1" />
                Siamo qui per aiutarti
              </Badge>
              <h1 className="text-4xl lg:text-5xl font-bold text-secondary-900 mb-6">
                Contattaci
              </h1>
              <p className="text-xl text-secondary-600 mb-8 max-w-3xl mx-auto">
                Hai domande, feedback o vuoi una demo personalizzata? Il nostro team è pronto ad aiutarti.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Info Cards */}
        <section className="pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: Mail,
                  title: 'Email',
                  value: 'support@aispeecheval.com',
                  description: 'Risposta entro 24h',
                  color: 'primary',
                  link: 'mailto:support@aispeecheval.com',
                },
                {
                  icon: MessageSquare,
                  title: 'Live Chat',
                  value: 'Chat in tempo reale',
                  description: 'Lun-Ven 9:00-18:00',
                  color: 'success',
                },
                {
                  icon: Phone,
                  title: 'Telefono',
                  value: '+39 02 1234 5678',
                  description: 'Solo piani Enterprise',
                  color: 'warning',
                  link: 'tel:+390212345678',
                },
                {
                  icon: MapPin,
                  title: 'Sede',
                  value: 'Milano, Italia',
                  description: 'Via Innovation 42',
                  color: 'info',
                },
              ].map((contact, i) => (
                <Card key={i} className={`border-${contact.color}-200 hover:shadow-lg transition-shadow`}>
                  <CardContent className="pt-6">
                    <div className={`p-3 bg-${contact.color}-100 rounded-xl inline-block mb-4`}>
                      <contact.icon className={`w-6 h-6 text-${contact.color}-600`} />
                    </div>
                    <h3 className="font-bold text-secondary-900 mb-1">{contact.title}</h3>
                    {contact.link ? (
                      <a
                        href={contact.link}
                        className={`text-${contact.color}-600 hover:underline font-medium block mb-1`}
                      >
                        {contact.value}
                      </a>
                    ) : (
                      <p className="text-secondary-900 font-medium mb-1">{contact.value}</p>
                    )}
                    <p className="text-sm text-secondary-600">{contact.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section className="pb-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="border-secondary-200">
              <CardHeader>
                <CardTitle className="text-2xl text-center">Invia un Messaggio</CardTitle>
                <p className="text-center text-secondary-600 mt-2">
                  Compila il form e ti risponderemo il prima possibile
                </p>
              </CardHeader>
              <CardContent>
                {submitted ? (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-success-100 rounded-full mb-4">
                      <CheckCircle className="w-8 h-8 text-success-600" />
                    </div>
                    <h3 className="text-xl font-bold text-secondary-900 mb-2">
                      Messaggio Inviato!
                    </h3>
                    <p className="text-secondary-600">
                      Grazie per averci contattato. Ti risponderemo entro 24 ore.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-secondary-700 mb-2">
                          Nome Completo *
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                          placeholder="Mario Rossi"
                        />
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-secondary-700 mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                          placeholder="mario@example.com"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="category" className="block text-sm font-medium text-secondary-700 mb-2">
                          Categoria *
                        </label>
                        <select
                          id="category"
                          name="category"
                          required
                          value={formData.category}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        >
                          <option value="general">Domanda Generale</option>
                          <option value="technical">Supporto Tecnico</option>
                          <option value="sales">Vendite & Pricing</option>
                          <option value="enterprise">Soluzioni Enterprise</option>
                          <option value="partnership">Partnership</option>
                          <option value="feedback">Feedback & Suggerimenti</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-secondary-700 mb-2">
                          Oggetto *
                        </label>
                        <input
                          type="text"
                          id="subject"
                          name="subject"
                          required
                          value={formData.subject}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                          placeholder="Come posso aiutarti?"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-secondary-700 mb-2">
                        Messaggio *
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        required
                        rows={6}
                        value={formData.message}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
                        placeholder="Scrivi qui il tuo messaggio..."
                      />
                    </div>

                    <div className="flex items-center justify-between pt-4">
                      <p className="text-sm text-secondary-600">
                        * Campi obbligatori
                      </p>
                      <Button
                        type="submit"
                        size="lg"
                        disabled={loading}
                        className="px-8"
                      >
                        {loading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Invio...
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5 mr-2" />
                            Invia Messaggio
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="pb-12 bg-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-secondary-900 mb-4">
                Domande Frequenti
              </h2>
              <p className="text-xl text-secondary-600">
                Trova risposte rapide alle domande più comuni
              </p>
            </div>

            <div className="space-y-4">
              {[
                {
                  q: 'Quanto tempo ci vuole per ricevere una risposta?',
                  a: 'Per il piano Free e Pro, rispondiamo entro 24 ore lavorative via email. I clienti Enterprise hanno supporto prioritario con risposta garantita entro 4 ore.',
                },
                {
                  q: 'Offrite supporto in italiano?',
                  a: 'Sì, il nostro team di supporto parla italiano, inglese, spagnolo e francese. Puoi scriverci nella tua lingua preferita.',
                },
                {
                  q: 'Posso richiedere una demo personalizzata?',
                  a: 'Assolutamente! Seleziona "Soluzioni Enterprise" nel form di contatto e organizzeremo una demo one-to-one per mostrarti tutte le funzionalità.',
                },
                {
                  q: 'Come posso segnalare un bug?',
                  a: 'Puoi segnalare bug direttamente su GitHub (siamo open-source!) o inviarci un\'email a support@aispeecheval.com con categoria "Supporto Tecnico".',
                },
                {
                  q: 'Dove posso trovare la documentazione tecnica?',
                  a: 'Tutta la documentazione è disponibile nella sezione "Documentazione" del sito. Per l\'API, visita la pagina API Docs.',
                },
              ].map((faq, i) => (
                <Card key={i} className="border-secondary-200">
                  <CardHeader>
                    <CardTitle className="text-base text-secondary-900">{faq.q}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-secondary-600">{faq.a}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Social Links */}
        <section className="pb-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="border-primary-200 bg-gradient-to-br from-primary-50 to-secondary-50">
              <CardContent className="pt-8 pb-8">
                <h3 className="text-2xl font-bold text-secondary-900 mb-4 text-center">
                  Seguici sui Social
                </h3>
                <p className="text-secondary-600 text-center mb-6">
                  Resta aggiornato sulle ultime novità e feature
                </p>
                <div className="flex justify-center gap-4">
                  {[
                    { icon: Github, label: 'GitHub', link: 'https://github.com/aispeecheval', color: 'secondary' },
                    { icon: Twitter, label: 'Twitter', link: 'https://twitter.com/aispeecheval', color: 'info' },
                    { icon: Linkedin, label: 'LinkedIn', link: 'https://linkedin.com/company/aispeecheval', color: 'primary' },
                    { icon: Globe, label: 'Blog', link: 'https://blog.aispeecheval.com', color: 'success' },
                  ].map((social, i) => (
                    <a
                      key={i}
                      href={social.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-3 bg-${social.color}-100 hover:bg-${social.color}-200 rounded-xl transition-colors`}
                      aria-label={social.label}
                    >
                      <social.icon className={`w-6 h-6 text-${social.color}-600`} />
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Enterprise CTA */}
        <section className="pb-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="border-secondary-200 bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
              <CardContent className="pt-12 pb-12 text-center">
                <h3 className="text-3xl font-bold mb-4">
                  Cerchi una Soluzione Enterprise?
                </h3>
                <p className="text-white/90 mb-8 text-lg max-w-2xl mx-auto">
                  Parliamo di come AI Speech Evaluator può integrarsi nella tua università,
                  scuola o azienda con soluzioni personalizzate, installazione on-premise e supporto dedicato.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    variant="secondary"
                    size="lg"
                    className="bg-white text-primary-600 hover:bg-gray-100"
                  >
                    <Mail className="w-5 h-5 mr-2" />
                    Richiedi Demo
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-white text-white hover:bg-white/10"
                  >
                    <Phone className="w-5 h-5 mr-2" />
                    Prenota Chiamata
                  </Button>
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
