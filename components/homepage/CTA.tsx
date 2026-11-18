'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';

export default function CTA() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 py-20">
      <div className="grid-pattern absolute inset-0 opacity-20" aria-hidden />
      <div className="absolute -left-32 -top-32 h-64 w-64 rounded-full bg-white/10" aria-hidden />
      <div className="absolute -bottom-48 -right-32 h-96 w-96 rounded-full bg-white/5" aria-hidden />

      <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-6 text-4xl font-bold text-white md:text-5xl"
        >
          Ready to Start Selling?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.05 }}
          className="mb-8 text-xl text-emerald-50"
        >
          Create your digital catalog in 5 minutes. No credit card required.
        </motion.p>
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 font-bold text-emerald-600 shadow-lg transition-all hover:bg-slate-100 active:scale-95"
          >
            Get Started Free
            <ArrowRight className="h-5 w-5" aria-hidden />
          </Link>
          <Link
            href="#preview"
            className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white/30 bg-emerald-600 px-8 py-4 font-bold text-white transition-all hover:bg-emerald-700"
          >
            <Play className="h-5 w-5" aria-hidden />
            Watch Demo
          </Link>
        </div>
        <p className="mt-6 text-sm text-emerald-100">Your first catalog is a few clicks away.</p>
      </div>
    </section>
  );
}
