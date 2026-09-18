'use client';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import Link from 'next/link';

const PLANS = [
  {
    name: 'Starter',
    price: '$0',
    period: '/month',
    description: 'Perfect for getting started',
    features: ['Up to 50 products', 'Basic themes', 'WhatsApp ordering', 'Custom link', 'Email support'],
    cta: 'Start Free',
    popular: false,
  },
  {
    name: 'Professional',
    price: '$19',
    period: '/month',
    description: 'For growing businesses',
    features: ['Unlimited products', 'All themes + custom colors', 'Advanced analytics', 'Priority support', 'Remove branding', 'Bulk import/export'],
    cta: 'Start Trial',
    popular: true,
  },
  {
    name: 'Business',
    price: '$49',
    period: '/month',
    description: 'For established brands',
    features: ['Everything in Pro', 'Multiple catalogs', 'Team collaboration', 'API access', 'Custom integrations', 'Dedicated support'],
    cta: 'Contact Sales',
    popular: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 bg-slate-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Simple, Transparent Pricing</h2>
          <p className="text-xl text-slate-600">Start free, upgrade when you&apos;re ready</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 items-start">
          {PLANS.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.35, delay: index * 0.08 }}
              whileHover={{ y: -4 }}
              className={`relative p-8 rounded-2xl transition-shadow ${
                plan.popular
                  ? 'bg-slate-900 text-white shadow-2xl scale-105 md:-mt-4'
                  : 'bg-white border-2 border-slate-200 hover:border-slate-300 hover:shadow-lg'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-4 py-1 rounded-full text-sm font-bold whitespace-nowrap">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className={`text-2xl font-bold mb-2 ${plan.popular ? 'text-white' : 'text-slate-900'}`}>
                  {plan.name}
                </h3>
                <p className={plan.popular ? 'text-slate-300' : 'text-slate-600'}>{plan.description}</p>
              </div>

              <div className="mb-6">
                <span className="text-5xl font-bold">{plan.price}</span>
                <span className={plan.popular ? 'text-slate-300' : 'text-slate-600'}>{plan.period}</span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check
                      className={`w-5 h-5 flex-shrink-0 mt-0.5 ${plan.popular ? 'text-emerald-400' : 'text-emerald-500'}`}
                      aria-hidden
                    />
                    <span className={plan.popular ? 'text-slate-200' : 'text-slate-700'}>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/signup"
                className={`block w-full text-center py-3 rounded-xl font-bold transition-all active:scale-[0.98] ${
                  plan.popular
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                    : 'bg-slate-900 hover:bg-slate-800 text-white'
                }`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}