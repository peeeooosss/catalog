'use client';
import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useFormState } from 'react-dom';
import { toast } from 'sonner';
import {
  Store,
  Palette,
  PackagePlus,
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
} from 'lucide-react';
import { INDUSTRY_TEMPLATES } from '@/lib/templates';
import type { ActionState } from '@/lib/actions/auth';
import { createStoreAction } from '@/lib/actions/store';

const THEME_PRESETS = [
  { name: 'Emerald', primary: '#10B981', secondary: '#64748B', accent: '#F59E0B' },
  { name: 'Rose', primary: '#F43F5E', secondary: '#78716C', accent: '#EC4899' },
  { name: 'Blue', primary: '#3B82F6', secondary: '#6B7280', accent: '#06B6D4' },
  { name: 'Purple', primary: '#8B5CF6', secondary: '#71717A', accent: '#A855F7' },
  { name: 'Orange', primary: '#F97316', secondary: '#78716C', accent: '#EF4444' },
  { name: 'Slate', primary: '#1E293B', secondary: '#64748B', accent: '#10B981' },
];

const STEPS = [
  { id: 1, title: 'Store Details', subtitle: 'Tell us about your business', icon: Store },
  { id: 2, title: 'Choose Theme', subtitle: 'Pick a look that fits your brand', icon: Palette },
  { id: 3, title: 'First Product', subtitle: 'Optional — add an item to start', icon: PackagePlus },
];

export default function OnboardingWizard() {
  const [step, setStep] = useState(1);
  const [storeName, setStoreName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [industry, setIndustry] = useState('general');
  const [selectedTheme, setSelectedTheme] = useState(THEME_PRESETS[0]);
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');

  const [state, formAction] = useFormState<ActionState, FormData>(createStoreAction, {});
  const pending = state === undefined;

  useMemo(() => {
    if (state.success) toast.success('Store created! 🎉');
    if (state.error) toast.error(state.error);
    return null;
  }, [state]);

  const canProceed =
    step === 1
      ? storeName.trim().length >= 2 && whatsapp.replace(/\D/g, '').length >= 8
      : step === 2
        ? true
        : productName.trim().length === 0 || (productName.trim().length > 0 && Number(productPrice) > 0);

  const next = () => {
    if (!canProceed) {
      toast.error(step === 1 ? 'Enter a store name and a valid WhatsApp number.' : 'Enter a valid product price.');
      return;
    }
    setStep((s) => s + 1);
  };

  const back = () => setStep((s) => Math.max(1, s - 1));

  const CurrentStep = STEPS.find((s) => s.id === step)!;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Set Up Your Store</h1>
        <p className="text-slate-600 mt-1">Complete these 3 steps to launch your catalog — you can edit everything later.</p>
      </div>

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
                    isDone || isActive ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
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

      <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-8" aria-hidden>
        <motion.div
          className="h-full bg-emerald-500 rounded-full"
          initial={false}
          animate={{ width: `${(step / 3) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <form action={formAction} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8">
        <input type="hidden" name="storeName" value={storeName} />
        <input type="hidden" name="whatsapp" value={whatsapp} />
        <input type="hidden" name="industry" value={industry} />
        <input type="hidden" name="primary" value={selectedTheme.primary} />
        <input type="hidden" name="secondary" value={selectedTheme.secondary} />
        <input type="hidden" name="accent" value={selectedTheme.accent} />
        <input type="hidden" name="productName" value={productName} />
        <input type="hidden" name="productPrice" value={productPrice} />

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
              <div className="space-y-5">
                <div>
                  <label htmlFor="storeName" className="block text-sm font-medium text-slate-700 mb-2">
                    Store Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="storeName"
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="e.g. GreenLeaf Grocers"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="whatsapp" className="block text-sm font-medium text-slate-700 mb-2">
                    WhatsApp Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="whatsapp"
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value.replace(/[^\d+]/g, ''))}
                    placeholder="e.g. +1 555 123 4567"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm"
                  />
                  <p className="text-xs text-slate-400 mt-1.5">Orders will come directly to this number.</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-2">What do you sell?</p>
                  <div role="radiogroup" aria-label="Business type" className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {INDUSTRY_TEMPLATES.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        role="radio"
                        aria-checked={industry === t.id}
                        onClick={() => {
                          setIndustry(t.id);
                          setSelectedTheme(THEME_PRESETS[0]);
                        }}
                        className={`p-3 rounded-xl border-2 text-left transition-all ${industry === t.id ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'}`}
                      >
                        <div className="text-lg mb-1">{t.emoji}</div>
                        <p className="text-sm font-medium text-slate-900">{t.label}</p>
                        <p className="text-xs text-slate-500">{t.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <div role="radiogroup" aria-label="Choose a theme" className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {THEME_PRESETS.map((theme) => {
                    const isSelected = selectedTheme.name === theme.name;
                    return (
                      <button
                        key={theme.name}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => setSelectedTheme(theme)}
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
                <p className="text-xs text-slate-400 mt-3">You can fine-tune colors anytime from the Theme Customizer.</p>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="productName" className="block text-sm font-medium text-slate-700 mb-2">
                    Product Name <span className="text-slate-400">(optional)</span>
                  </label>
                  <input
                    id="productName"
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="e.g. Farm Fresh Tomatoes — 1kg"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="productPrice" className="block text-sm font-medium text-slate-700 mb-2">
                    Price
                  </label>
                  <input
                    id="productPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={productPrice}
                    onChange={(e) => setProductPrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm"
                  />
                </div>
                <p className="text-xs text-slate-400">You can add more products with photos right from your dashboard after this.</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
          <button
            type="button"
            onClick={back}
            disabled={step === 1}
            className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-slate-200 hover:border-slate-300 text-slate-700 font-bold rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden />
            Back
          </button>
          {step < 3 ? (
            <button
              type="button"
              onClick={next}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98]"
            >
              Continue
              <ArrowRight className="w-4 h-4" aria-hidden />
            </button>
          ) : (
            <button
              type="submit"
              disabled={pending}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98]"
            >
              {pending ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden /> : null}
              {pending ? 'Creating...' : 'Create Store'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}