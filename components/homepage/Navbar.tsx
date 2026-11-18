'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, ShoppingBag } from 'lucide-react';

const navLinks = [
  { href: '#preview', label: 'Preview' },
  { href: '#features', label: 'Features' },
  { href: '#pricing', label: 'Pricing' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2" aria-label="CatalogPro home">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500 shadow-sm">
              <ShoppingBag className="h-4 w-4 text-white" aria-hidden />
            </span>
            <span className="text-xl font-bold tracking-tight text-slate-900">CatalogPro</span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
              >
                {link.label}
              </a>
            ))}
            <Link
              href="/login"
              className="text-sm font-medium text-slate-700 transition-colors hover:text-slate-900"
            >
              Sign In
            </Link>
            <Link href="/signup" className="btn-primary px-5 py-2 text-sm">
              Start Free
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen((open) => !open)}
            className="rounded-lg p-2 transition-colors hover:bg-slate-100"
            aria-label="Toggle menu"
            aria-expanded={isOpen}
          >
            {isOpen ? <X className="h-6 w-6" aria-hidden /> : <Menu className="h-6 w-6" aria-hidden />}
          </button>
        </div>

        {isOpen && (
          <div className="space-y-1 border-t border-slate-100 py-4 md:hidden">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="block rounded-lg px-4 py-2 text-slate-600 hover:bg-slate-50"
              >
                {link.label}
              </a>
            ))}
            <div className="space-y-2 pt-2">
              <Link
                href="/login"
                className="block rounded-lg border border-slate-200 px-4 py-2 text-center font-medium text-slate-700"
              >
                Sign In
              </Link>
              <Link href="/signup" className="btn-primary block py-2.5 text-center text-sm">
                Start Free
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
