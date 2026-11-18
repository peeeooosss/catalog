'use client';
import { motion } from 'framer-motion';
import { Smartphone, MessageCircle, Palette, Share2, Zap, Shield } from 'lucide-react';

const FEATURES = [
  { icon: Smartphone, title: 'Mobile-First Design', description: 'Built for how customers actually browse. Fast, clean, and easy on any phone.' },
  { icon: MessageCircle, title: 'WhatsApp Ordering', description: 'Customers place orders directly via WhatsApp. No login, no friction, just sales.' },
  { icon: Palette, title: 'Custom Themes', description: 'Pick from four beautiful storefront templates and tune colors to match your brand.' },
  { icon: Share2, title: 'Easy Sharing', description: 'Share your catalog link on WhatsApp, Instagram, Facebook, or anywhere else.' },
  { icon: Zap, title: 'Lightning Fast', description: 'Built with Next.js for instant page loads and a smooth browsing experience.' },
  { icon: Shield, title: 'Secure & Reliable', description: 'Secure by design with dependable hosting. Your store and customer data stay safe.' },
];

export default function Features() {
  return (
    <section id="features" className="bg-slate-50/70 py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-16 text-center">
          <p className="eyebrow">Why sellers choose us</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Everything You Need to <span className="gradient-text">Sell More</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
            Powerful features designed specifically for small businesses.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.35, delay: index * 0.05 }}
              whileHover={{ y: -4 }}
              className="surface-card surface-card-hover group p-6"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 transition-all group-hover:scale-110 group-hover:bg-emerald-200">
                <feature.icon className="h-6 w-6 text-emerald-600" aria-hidden />
              </div>
              <h3 className="mb-2 text-lg font-bold text-slate-900">{feature.title}</h3>
              <p className="leading-relaxed text-slate-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
