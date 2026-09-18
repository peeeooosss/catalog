'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, ShoppingBag } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { href: '#preview', label: 'Preview' },
    { href: '#features', label: 'Features' },
    { href: '#pricing', label: 'Pricing' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2" aria-label="CatalogPro home">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-white" aria-hidden />
            </div>
            <span className="text-xl font-bold text-slate-900">CatalogPro</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-slate-600 hover:text-slate-900 transition-colors text-sm font-medium"
              >
                {link.label}
              </a>
            ))}
            <Link
              href="/dashboard"
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-lg transition-all hover:shadow-lg hover:shadow-emerald-500/30 active:scale-95"
            >
              Start Free
            </Link>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Toggle menu"
            aria-expanded={isOpen}
          >
            {isOpen ? <X className="w-6 h-6" aria-hidden /> : <Menu className="w-6 h-6" aria-hidden />}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden py-4 space-y-1 border-t border-slate-100">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="block px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-2 space-y-2">
              <Link
                href="/dashboard"
                className="block px-4 py-2 text-center text-slate-700 font-medium rounded-lg border border-slate-200"
              >
                Sign In
              </Link>
              <Link
                href="/dashboard"
                className="block px-4 py-2 text-center bg-emerald-500 text-white font-bold rounded-lg"
              >
                Start Free
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}