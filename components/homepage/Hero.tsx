'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export default function Hero() {
  const trustBadges = [
    'Free for 14 days',
    'No credit card required',
    'Cancel anytime',
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-emerald-50 pt-32 pb-20">
      {/* Decorative blobs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" aria-hidden></div>
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }} aria-hidden></div>

      <div className="max-w-6xl mx-auto px-4 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6"
        >
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" aria-hidden></span>
          Trusted by 1,000+ small businesses
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="text-4xl md:text-6xl lg:text-7xl font-bold text-slate-900 mb-6 leading-tight tracking-tight"
        >
          Your Digital Catalog,
          <br />
          <span className="gradient-text">Ready in 5 Minutes</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed"
        >
          Create a beautiful mobile catalog, share it on WhatsApp &amp; Instagram,
          and receive orders instantly. No app development needed.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-10"
        >
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 transition-all active:scale-95"
          >
            Start Free Trial
            <ArrowRight className="w-5 h-5" aria-hidden />
          </Link>
          <Link
            href="#preview"
            className="inline-flex items-center justify-center px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl border-2 border-slate-200 hover:border-slate-300 transition-all"
          >
            See Live Demo
          </Link>
        </motion.div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500">
          {trustBadges.map((badge) => (
            <div key={badge} className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" aria-hidden />
              {badge}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}