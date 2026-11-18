'use client';
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useFormState } from 'react-dom';
import { LayoutTemplate, Palette, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import MobilePreview from '@/components/dashboard/MobilePreview';
import SubmitButton from '@/components/auth/SubmitButton';
import type { StorefrontTemplate, Theme } from '@/types';
import type { ActionState } from '@/lib/actions/auth';
import { updateThemeAction } from '@/lib/actions/store';
import { normalizeTheme } from '@/lib/utils';

const COLOR_PRESETS: { name: string; theme: Theme }[] = [
  { name: 'Emerald', theme: { primary: '#10B981', secondary: '#64748B', accent: '#F59E0B' } },
  { name: 'Rose', theme: { primary: '#F43F5E', secondary: '#78716C', accent: '#EC4899' } },
  { name: 'Blue', theme: { primary: '#3B82F6', secondary: '#6B7280', accent: '#06B6D4' } },
  { name: 'Purple', theme: { primary: '#8B5CF6', secondary: '#71717A', accent: '#A855F7' } },
  { name: 'Orange', theme: { primary: '#F97316', secondary: '#78716C', accent: '#EF4444' } },
  { name: 'Slate', theme: { primary: '#1E293B', secondary: '#64748B', accent: '#10B981' } },
];

const LAYOUT_PRESETS: { id: StorefrontTemplate; name: string; description: string; swatch: string }[] = [
  { id: 'classic', name: 'Classic', description: 'Clean, familiar and easy to scan', swatch: 'from-slate-100 to-white' },
  { id: 'modern', name: 'Modern', description: 'Soft gradients and elevated cards', swatch: 'from-emerald-400 to-teal-500' },
  { id: 'bold', name: 'Bold', description: 'High contrast with punchy accents', swatch: 'from-orange-400 to-rose-500' },
  { id: 'minimal', name: 'Minimal', description: 'Quiet spacing and flat surfaces', swatch: 'from-slate-300 to-slate-100' },
];

type ColorKey = 'primary' | 'secondary' | 'accent';

export default function ThemeEditor({ initial }: { initial: Theme }) {
  const [state, formAction] = useFormState<ActionState, FormData>(updateThemeAction, {});
  const [theme, setTheme] = useState<Required<Theme>>(() => normalizeTheme(initial));
  const [presetName, setPresetName] = useState(
    COLOR_PRESETS.find((item) => item.theme.primary.toLowerCase() === initial.primary.toLowerCase())?.name ?? 'Custom'
  );
  const themeRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (state.success) toast.success(state.success);
    if (state.error) toast.error(state.error);
  }, [state]);

  const setColor = (key: ColorKey, value: string) => {
    setTheme((prev) => ({ ...prev, [key]: value }));
    setPresetName('Custom');
  };

  const handleThemeKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex = index;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (index + 1) % COLOR_PRESETS.length;
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = (index - 1 + COLOR_PRESETS.length) % COLOR_PRESETS.length;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = COLOR_PRESETS.length - 1;
    else return;
    event.preventDefault();
    const next = normalizeTheme(COLOR_PRESETS[nextIndex].theme);
    setTheme((prev) => ({ ...next, template: prev.template, radius: prev.radius }));
    setPresetName(COLOR_PRESETS[nextIndex].name);
    themeRefs.current[nextIndex]?.focus();
  };

  return (
    <div className="pt-16 md:pt-0">
      <div className="mb-8">
        <p className="eyebrow mb-2">Storefront identity</p>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">Theme Customizer</h1>
        <p className="mt-1.5 text-sm text-slate-600">Pick a layout, tune your colors, and watch your storefront update instantly.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
        <div className="space-y-6">
          <section className="surface-card p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
              <LayoutTemplate className="h-5 w-5 text-emerald-500" aria-hidden />
              Layout style
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {LAYOUT_PRESETS.map((preset) => {
                const selected = theme.template === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setTheme((prev) => ({ ...prev, template: preset.id }))}
                    aria-pressed={selected}
                    className={`rounded-2xl border-2 p-3 text-left transition-all ${
                      selected ? 'border-emerald-500 bg-emerald-50/60 shadow-sm' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className={`mb-3 h-10 rounded-lg bg-gradient-to-r ${preset.swatch}`} aria-hidden />
                    <p className="text-sm font-bold text-slate-900">{preset.name}</p>
                    <p className="mt-0.5 text-[11px] leading-snug text-slate-500">{preset.description}</p>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="surface-card p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
              <Palette className="h-5 w-5 text-violet-500" aria-hidden />
              Color presets
            </h2>
            <div role="radiogroup" aria-label="Theme presets" className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {COLOR_PRESETS.map((item, index) => {
                const selected = presetName === item.name;
                return (
                  <button
                    key={item.name}
                    ref={(el) => {
                      themeRefs.current[index] = el;
                    }}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => {
                      setTheme((prev) => ({
                        ...normalizeTheme(item.theme),
                        template: prev.template,
                        radius: prev.radius,
                      }));
                      setPresetName(item.name);
                    }}
                    onKeyDown={(event) => handleThemeKeyDown(event, index)}
                    className={`rounded-xl border-2 p-3 transition-all ${
                      selected ? 'border-slate-900 bg-slate-50 shadow-sm' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full shadow-sm" style={{ backgroundColor: item.theme.primary }} />
                      <span className="text-sm font-medium text-slate-900">{item.name}</span>
                    </div>
                    <div className="flex gap-1">
                      <div className="h-1 flex-1 rounded" style={{ backgroundColor: item.theme.primary }} />
                      <div className="h-1 flex-1 rounded" style={{ backgroundColor: item.theme.secondary }} />
                      <div className="h-1 flex-1 rounded" style={{ backgroundColor: item.theme.accent }} />
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-xs text-slate-400">Use arrow keys to switch presets.</p>
          </section>

          <form action={formAction} className="surface-card space-y-5 p-6">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" aria-hidden />
              <h2 className="text-lg font-bold text-slate-900">Fine-tune</h2>
            </div>
            <input type="hidden" name="template" value={theme.template} />
            {(['primary', 'secondary', 'accent'] as ColorKey[]).map((key) => (
              <div key={key}>
                <label className="mb-2 block text-sm font-medium capitalize text-slate-700" htmlFor={`color-${key}`}>
                  {key} color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    id={`color-${key}`}
                    type="color"
                    value={theme[key]}
                    onChange={(event) => setColor(key, event.target.value)}
                    aria-label={`${key} color picker`}
                    className="h-12 w-12 cursor-pointer rounded-lg border-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={theme[key]}
                    onChange={(event) => setColor(key, event.target.value)}
                    aria-label={`${key} hex value`}
                    className="input-field flex-1 font-mono"
                  />
                </div>
              </div>
            ))}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700" htmlFor="radius">Corner radius</label>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">{theme.radius}px</span>
              </div>
              <input
                id="radius"
                name="radius"
                type="range"
                min="0"
                max="28"
                value={theme.radius}
                onChange={(event) => setTheme((prev) => ({ ...prev, radius: Number(event.target.value) }))}
                className="w-full accent-emerald-500"
              />
            </div>
            <SubmitButton className="btn-primary w-full py-3.5">Save Theme</SubmitButton>
          </form>
        </div>

        <div className="lg:sticky lg:top-8 lg:self-start">
          <section className="surface-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                <Sparkles className="h-5 w-5 text-emerald-500" aria-hidden />
                Live preview
              </h2>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">Mobile view</span>
            </div>
            <div className="flex justify-center">
              <MobilePreview theme={theme} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
