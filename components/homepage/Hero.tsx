'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

const trustBadges = ['Live in minutes', 'No credit card required', 'Cancel anytime'];

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-emerald-50 pt-32 pb-20">
      <div className="grid-pattern absolute inset-0 opacity-40" aria-hidden />
      <div className="absolute -top-24 left-10 h-72 w-72 rounded-full bg-emerald-200 opacity-30 blur-3xl" aria-hidden />
      <div className="absolute -bottom-24 right-10 h-72 w-72 rounded-full bg-cyan-200 opacity-30 blur-3xl" aria-hidden />

      <div className="relative z-10 mx-auto max-w-6xl px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-700"
        >
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" aria-hidden />
          Built for WhatsApp-first shops
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="mb-6 text-4xl font-bold leading-tight tracking-tight text-slate-900 md:text-6xl lg:text-7xl"
        >
          Your Digital Catalog,
          <br />
          <span className="gradient-text">Ready in 5 Minutes</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-slate-600 md:text-xl"
        >
          Create a beautiful mobile catalog, share it on WhatsApp &amp; Instagram,
          and receive orders instantly. No app development needed.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="mb-10 flex flex-col justify-center gap-4 sm:flex-row"
        >
          <Link href="/signup" className="btn-primary px-8 py-4 text-base">
            Start Free Trial
            <ArrowRight className="h-5 w-5" aria-hidden />
          </Link>
          <Link
            href="#preview"
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-8 py-4 font-bold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98]"
          >
            See Live Demo
          </Link>
        </motion.div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500">
          {trustBadges.map((badge) => (
            <div key={badge} className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" aria-hidden />
              {badge}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
