'use client';
import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  Store,
  MessageCircle,
  Palette,
  PackagePlus,
  ArrowLeft,
  ArrowRight,
  Check,
  PartyPopper,
} from 'lucide-react';

const THEME_PRESETS = [
  { name: 'Emerald', primary: '#10B981', secondary: '#64748B', accent: '#F59E0B' },
  { name: 'Rose', primary: '#F43F5E', secondary: '#78716C', accent: '#EC4899' },
  { name: 'Blue', primary: '#3B82F6', secondary: '#6B7280', accent: '#06B6D4' },
  { name: 'Purple', primary: '#8B5CF6', secondary: '#71717A', accent: '#A855F7' },
  { name: 'Orange', primary: '#F97316', secondary: '#78716C', accent: '#EF4444' },
  { name: 'Dark', primary: '#1E293B', secondary: '#64748B', accent: '#10B981' },
];

interface WizardState {
  storeName: string;
  whatsappNumber: string;
  theme: (typeof THEME_PRESETS)[0];
  productName: string;
  productPrice: string;
  productCategory: string;
  productImage: string;
}

const initialSaved = {
  storeName: 'Lumière Boutique',
  whatsappNumber: '1234567890',
  theme: THEME_PRESETS[0],
  productName: 'Premium Cotton Shirt',
  productPrice: '45',
  productCategory: 'Tops',
  productImage: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=400&q=80',
};

const STEPS = [
  { id: 1, title: 'Store Details', subtitle: 'Tell us about your business', icon: Store },
  { id: 2, title: 'Choose Theme', subtitle: 'Pick a look that fits your brand', icon: Palette },
  { id: 3, title: 'First Product', subtitle: 'Add your first item', icon: PackagePlus },
];

export default function OnboardingWizard() {
  const [step, setStep] = useState(1);
  const [saved, setSaved] = useState<WizardState>(initialSaved);
  const [completed, setCompleted] = useState(false);

  const canProceed = useMemo(() => {
    if (step === 1) {
      return saved.storeName.trim().length > 0 && saved.whatsappNumber.replace(/\D/g, '').length >= 8;
    }
    if (step === 2) return true;
    return saved.productName.trim().length > 0 && Number(saved.productPrice) > 0;
  }, [step, saved]);

  const next = () => {
    if (!canProceed) {
      toast.error('Please complete the required fields first');
      return;
    }
    if (step < 3) {
      setStep((s) => s + 1);
    } else {
      setCompleted(true);
      toast.success('Your store is ready. Welcome to CatalogPro! 🎉');
    }
  };

  const back = () => {
    if (step > 1) setStep((s) => s - 1);
  };

  if (completed) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 14 }}
          className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <PartyPopper className="w-10 h-10 text-emerald-600" aria-hidden />
        </motion.div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Your store is ready! 🎉</h1>
        <p className="text-slate-600 mb-8">
          <span className="font-semibold">{saved.storeName}</span> is now live.
          Share your link to start receiving orders on WhatsApp.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/my-store"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors"
          >
            View My Store
            <ArrowRight className="w-4 h-4" aria-hidden />
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center px-6 py-3 bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 font-bold rounded-xl transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const CurrentStep = STEPS.find((s) => s.id === step)!;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Set Up Your Store</h1>
        <p className="text-slate-600 mt-1">Complete these 3 steps to launch your catalog</p>
      </div>

      {/* Stepper */}
      <ol className="flex items-center gap-2 mb-8" aria-label="Setup progress">
        {STEPS.map((s) => {
          const isActive = s.id === step;
          const isDone = s.id < step;
          return (
            <li key={s.id} className="flex items-center gap-2 flex-1">
              <button
                onClick={() => isDone && setStep(s.id)}
                disabled={!isDone}
                className={`flex items-center gap-2 flex-1 px-3 py-2 rounded-xl border-2 transition-colors text-left ${
                  isActive ? 'border-emerald-500 bg-emerald-50' : isDone ? 'border-emerald-300 bg-emerald-50/60' : 'border-slate-200'
                } ${!isDone ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                aria-current={isActive ? 'step' : undefined}
              >
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    isDone ? 'bg-emerald-500 text-white' : isActive ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {isDone ? <Check className="w-3.5 h-3.5" aria-hidden /> : s.id}
                </span>
                <span className={`text-sm font-semibold hidden sm:block ${isActive ? 'text-emerald-700' : isDone ? 'text-emerald-600' : 'text-slate-500'}`}>
                  {s.title}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      {/* Progress bar */}
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-8" aria-hidden>
        <motion.div
          className="h-full bg-emerald-500 rounded-full"
          initial={false}
          animate={{ width: `${(step / 3) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
            <CurrentStep.icon className="w-5 h-5 text-emerald-600" aria-hidden />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{CurrentStep.title}</h2>
            <p className="text-sm text-slate-500">{CurrentStep.subtitle}</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.25 }}
          >
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="storeName" className="block text-sm font-medium text-slate-700 mb-2">
                    Store Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="storeName"
                    type="text"
                    value={saved.storeName}
                    onChange={(e) => setSaved({ ...saved, storeName: e.target.value })}
                    placeholder="e.g. Lumière Boutique"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="whatsapp" className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-2">
                    <MessageCircle className="w-4 h-4 text-emerald-500" aria-hidden />
                    WhatsApp Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="whatsapp"
                    type="tel"
                    value={saved.whatsappNumber}
                    onChange={(e) => setSaved({ ...saved, whatsappNumber: e.target.value.replace(/[^\d]/g, '') })}
                    placeholder="e.g. 1234567890"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm"
                  />
                  <p className="text-xs text-slate-400 mt-1.5">Orders will come directly to this number.</p>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <div role="radiogroup" aria-label="Choose a theme" className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {THEME_PRESETS.map((theme) => {
                    const isSelected = saved.theme.name === theme.name;
                    return (
                      <button
                        key={theme.name}
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => setSaved({ ...saved, theme })}
                        className={`p-3 rounded-xl border-2 transition-all text-left ${
                          isSelected ? 'border-slate-900 bg-slate-50 shadow-md' : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 rounded-full shadow-sm" style={{ backgroundColor: theme.primary }}></div>
                          <span className="text-sm font-medium text-slate-900">{theme.name}</span>
                        </div>
                        <div className="flex gap-1">
                          <div className="h-1 flex-1 rounded" style={{ backgroundColor: theme.primary }}></div>
                          <div className="h-1 flex-1 rounded" style={{ backgroundColor: theme.secondary }}></div>
                          <div className="h-1 flex-1 rounded" style={{ backgroundColor: theme.accent }}></div>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-slate-400 mt-3">You can change this anytime from the Theme Customizer.</p>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="productName" className="block text-sm font-medium text-slate-700 mb-2">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="productName"
                    type="text"
                    value={saved.productName}
                    onChange={(e) => setSaved({ ...saved, productName: e.target.value })}
                    placeholder="e.g. Premium Cotton Shirt"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="productPrice" className="block text-sm font-medium text-slate-700 mb-2">
                      Price ($) <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="productPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      value={saved.productPrice}
                      onChange={(e) => setSaved({ ...saved, productPrice: e.target.value })}
                      placeholder="0.00"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="productCategory" className="block text-sm font-medium text-slate-700 mb-2">
                      Category
                    </label>
                    <select
                      id="productCategory"
                      value={saved.productCategory}
                      onChange={(e) => setSaved({ ...saved, productCategory: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm bg-white"
                    >
                      {['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Accessories', 'Other'].map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label htmlFor="productImage" className="block text-sm font-medium text-slate-700 mb-2">
                    Image URL
                  </label>
                  <div className="flex gap-3">
                    {saved.productImage ? (
                      <div className="w-16 h-16 rounded-xl overflow-hidden relative flex-shrink-0 border border-slate-200">
                        <Image src={saved.productImage} alt="Product preview" fill sizes="64px" className="object-cover" unoptimized />
                      </div>
                    ) : null}
                    <input
                      id="productImage"
                      type="url"
                      value={saved.productImage}
                      onChange={(e) => setSaved({ ...saved, productImage: e.target.value })}
                      placeholder="Leave empty to use a placeholder"
                      className="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm"
                    />
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
          <button
            onClick={back}
            disabled={step === 1}
            className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-slate-200 hover:border-slate-300 text-slate-700 font-bold rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden />
            Back
          </button>
          <button
            onClick={next}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98]"
          >
            {step === 3 ? 'Finish Setup' : 'Continue'}
            <ArrowRight className="w-4 h-4" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}