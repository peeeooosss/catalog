'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';

export default function CTA() {
  return (
    <section className="py-20 bg-gradient-to-br from-emerald-500 to-teal-600 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" aria-hidden></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" aria-hidden></div>

      <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-bold text-white mb-6"
        >
          Ready to Start Selling?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.05 }}
          className="text-xl text-emerald-50 mb-8"
        >
          Create your digital catalog in 5 minutes. No credit card required.
        </motion.p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-slate-100 text-emerald-600 font-bold rounded-xl shadow-lg transition-all active:scale-95"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" aria-hidden />
          </Link>
          <Link
            href="#preview"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl border-2 border-white/30 transition-all"
          >
            <Play className="w-5 h-5" aria-hidden />
            Watch Demo
          </Link>
        </div>
        <p className="mt-6 text-emerald-100 text-sm">Join 1,000+ businesses already using CatalogPro</p>
      </div>
    </section>
  );
}