'use client';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import Link from 'next/link';

const PLANS = [
  {
    name: 'Starter',
    price: '₹0',
    period: '/month',
    description: 'Perfect for getting started',
    features: ['Up to 50 products', '4 storefront templates', 'WhatsApp ordering', 'Custom link', 'Email support'],
    cta: 'Start Free',
    popular: false,
  },
  {
    name: 'Professional',
    price: '₹1,499',
    period: '/month',
    description: 'For growing businesses',
    features: ['Unlimited products', 'All templates + custom colors', 'Advanced analytics', 'Priority support', 'Remove branding', 'Bulk import/export'],
    cta: 'Start Trial',
    popular: true,
  },
  {
    name: 'Business',
    price: '₹3,999',
    period: '/month',
    description: 'For established brands',
    features: ['Everything in Pro', 'Multiple catalogs', 'Team collaboration', 'API access', 'Custom integrations', 'Dedicated support'],
    cta: 'Contact Sales',
    popular: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="bg-white py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-16 text-center">
          <p className="eyebrow">Pricing</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Simple, Transparent Pricing
          </h2>
          <p className="mt-4 text-lg text-slate-600">Start free, upgrade when you&apos;re ready.</p>
        </div>

        <div className="grid items-start gap-6 md:grid-cols-3">
          {PLANS.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.35, delay: index * 0.08 }}
              whileHover={{ y: -4 }}
              className={`relative rounded-2xl p-8 transition-shadow ${
                plan.popular
                  ? 'bg-slate-900 text-white shadow-2xl ring-2 ring-emerald-400 md:-mt-4'
                  : 'surface-card surface-card-hover'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-emerald-500 px-4 py-1 text-sm font-bold text-white">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className={`mb-2 text-2xl font-bold ${plan.popular ? 'text-white' : 'text-slate-900'}`}>
                  {plan.name}
                </h3>
                <p className={plan.popular ? 'text-slate-300' : 'text-slate-600'}>{plan.description}</p>
              </div>

              <div className="mb-6">
                <span className="text-5xl font-bold">{plan.price}</span>
                <span className={plan.popular ? 'text-slate-300' : 'text-slate-600'}>{plan.period}</span>
              </div>

              <ul className="mb-8 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check
                      className={`mt-0.5 h-5 w-5 flex-shrink-0 ${plan.popular ? 'text-emerald-400' : 'text-emerald-500'}`}
                      aria-hidden
                    />
                    <span className={plan.popular ? 'text-slate-200' : 'text-slate-700'}>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/signup"
                className={`block w-full rounded-xl py-3 text-center font-bold transition-all active:scale-[0.98] ${
                  plan.popular
                    ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                    : 'bg-slate-900 text-white hover:bg-slate-800'
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
