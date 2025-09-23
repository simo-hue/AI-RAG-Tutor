import { GraduationCap, Github, ExternalLink, Linkedin, Mail, Instagram, Youtube, User } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-secondary-900 text-secondary-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 bg-primary-600 rounded-xl">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">AI RAG Tutor</h3>
                <p className="text-sm text-secondary-400">Speech Evaluation System</p>
              </div>
            </div>
            <p className="text-secondary-400 mb-4 max-w-md">
              Sistema avanzato di valutazione speech basato su RAG per l'analisi intelligente
              di presentazioni orali con feedback dettagliato e scoring automatico.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://github.com/simo-hue/AI-RAG-Tutor"
                className="text-secondary-400 hover:text-white transition-colors duration-200"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-white font-semibold mb-4">Prodotto</h4>
            <ul className="space-y-2">
              <li>
                <a href="#features" className="text-secondary-400 hover:text-white transition-colors duration-200">
                  Features
                </a>
              </li>
              <li>
                <a href="#pricing" className="text-secondary-400 hover:text-white transition-colors duration-200">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#docs" className="text-secondary-400 hover:text-white transition-colors duration-200">
                  Documentazione
                </a>
              </li>
              <li>
                <a href="#api" className="text-secondary-400 hover:text-white transition-colors duration-200">
                  API
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold mb-4">Supporto</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://github.com/simo-hue/AI-RAG-Tutor/issues"
                  className="text-secondary-400 hover:text-white transition-colors duration-200 flex items-center space-x-1"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>GitHub Issues</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="mailto:mattioli.simone.10@gmail.com"
                  className="text-secondary-400 hover:text-white transition-colors duration-200 flex items-center space-x-1"
                >
                  <span>Contatti</span>
                  <Mail className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a href="#community" className="text-secondary-400 hover:text-white transition-colors duration-200">
                  Community
                </a>
              </li>
            </ul>
          </div>

          {/* Developer */}
          <div>
            <h4 className="text-white font-semibold mb-4">Sviluppatore</h4>
            <div className="flex items-center space-x-2 mb-3">
              <User className="w-4 h-4 text-secondary-400" />
              <span className="text-secondary-300 font-medium">Simone Mattioli</span>
            </div>
            <div className="flex space-x-3 mb-3">
              <a
                href="https://github.com/simo-hue"
                className="text-secondary-400 hover:text-white transition-colors duration-200"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="https://www.linkedin.com/in/simonemattioli2003/"
                className="text-secondary-400 hover:text-white transition-colors duration-200"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="mailto:mattioli.simone.10@gmail.com"
                className="text-secondary-400 hover:text-white transition-colors duration-200"
              >
                <Mail className="w-4 h-4" />
              </a>
              <a
                href="https://www.youtube.com/@simonemattioli2003"
                className="text-secondary-400 hover:text-white transition-colors duration-200"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a
                href="https://www.instagram.com/simo___hue/"
                className="text-secondary-400 hover:text-white transition-colors duration-200"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-secondary-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-secondary-400 text-sm">
              © 2024 AI RAG Tutor. Tutti i diritti riservati.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#privacy" className="text-secondary-400 hover:text-white transition-colors duration-200 text-sm">
                Privacy Policy
              </a>
              <a href="#terms" className="text-secondary-400 hover:text-white transition-colors duration-200 text-sm">
                Termini di Servizio
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};