'use client';
import { motion } from 'framer-motion';
import { Smartphone, MessageCircle, Palette, Share2, Zap, Shield } from 'lucide-react';

const FEATURES = [
  { icon: Smartphone, title: 'Mobile-First Design', description: 'Optimized for 95% of users who browse on mobile. Feels like a native app.' },
  { icon: MessageCircle, title: 'WhatsApp Ordering', description: 'Customers place orders directly via WhatsApp. No login, no friction, just sales.' },
  { icon: Palette, title: 'Custom Themes', description: 'Choose from beautiful color schemes or create your own. Match your brand perfectly.' },
  { icon: Share2, title: 'Easy Sharing', description: 'Share your catalog link on WhatsApp, Instagram, Facebook, or anywhere else.' },
  { icon: Zap, title: 'Lightning Fast', description: 'Built with Next.js for instant page loads. Images auto-optimized for mobile.' },
  { icon: Shield, title: 'Secure & Reliable', description: 'Enterprise-grade security with automatic backups. Your data is always safe.' },
];

export default function Features() {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Everything You Need to Sell</h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Powerful features designed specifically for small businesses
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURES.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.35, delay: index * 0.05 }}
              whileHover={{ y: -4 }}
              className="p-6 bg-slate-50 rounded-2xl hover:shadow-lg transition-shadow duration-300 group"
            >
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-emerald-200 transition-all">
                <feature.icon className="w-6 h-6 text-emerald-600" aria-hidden />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{feature.title}</h3>
              <p className="text-slate-600 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}