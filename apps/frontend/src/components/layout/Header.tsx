'use client';

import { GraduationCap, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui';
import Link from 'next/link';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="glass-effect border-b border-white/20 sticky top-0 z-50" role="banner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
            aria-label="Torna alla homepage di AI Speech Evaluator"
          >
            <div className="flex items-center justify-center w-10 h-10 bg-primary-600 rounded-xl">
              <GraduationCap className="w-6 h-6 text-white" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gradient">AI Speech Evaluator</h1>
              <p className="text-xs text-secondary-500">Valutazione Intelligente Presentazioni</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6" role="navigation" aria-label="Menu principale">
            <Link
              href="/#features"
              className="text-secondary-600 hover:text-primary-600 transition-colors duration-200 font-medium"
              aria-label="Scopri le caratteristiche avanzate di AI Speech Evaluator"
            >
              Features
            </Link>
            <Link
              href="/pricing"
              className="text-secondary-600 hover:text-primary-600 transition-colors duration-200 font-medium"
              aria-label="Scopri i nostri piani e prezzi"
            >
              Pricing
            </Link>
            <Link
              href="/api-docs"
              className="text-secondary-600 hover:text-primary-600 transition-colors duration-200 font-medium"
              aria-label="Documentazione API REST"
            >
              API
            </Link>
            <Link
              href="/docs"
              className="text-secondary-600 hover:text-primary-600 transition-colors duration-200 font-medium"
              aria-label="Leggi la documentazione completa e i tutorial"
            >
              Docs
            </Link>
            <Link
              href="/about"
              className="text-secondary-600 hover:text-primary-600 transition-colors duration-200 font-medium"
              aria-label="Scopri di più sul progetto"
            >
              About
            </Link>
          </nav>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Link href="/upload">
              <Button>
                Inizia Ora
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg text-secondary-600 hover:text-primary-600 hover:bg-white/50 transition-all duration-200"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-4 animate-fade-in">
            <Link
              href="/#features"
              className="block text-secondary-600 hover:text-primary-600 transition-colors duration-200 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </Link>
            <Link
              href="/pricing"
              className="block text-secondary-600 hover:text-primary-600 transition-colors duration-200 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link
              href="/api-docs"
              className="block text-secondary-600 hover:text-primary-600 transition-colors duration-200 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              API
            </Link>
            <Link
              href="/docs"
              className="block text-secondary-600 hover:text-primary-600 transition-colors duration-200 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Docs
            </Link>
            <Link
              href="/about"
              className="block text-secondary-600 hover:text-primary-600 transition-colors duration-200 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <Link
              href="/contact"
              className="block text-secondary-600 hover:text-primary-600 transition-colors duration-200 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
            <div className="pt-2">
              <Link href="/upload">
                <Button className="w-full">
                  Inizia Ora
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};