'use client';
import { useMemo, useState, type KeyboardEvent, useRef } from 'react';
import { useFormState } from 'react-dom';
import { Palette, Eye } from 'lucide-react';
import { toast } from 'sonner';
import MobilePreview from '@/components/dashboard/MobilePreview';
import SubmitButton from '@/components/auth/SubmitButton';
import type { Theme } from '@/types';
import type { ActionState } from '@/lib/actions/auth';
import { updateThemeAction } from '@/lib/actions/store';

const THEMES: { name: string; theme: Theme }[] = [
  { name: 'Emerald', theme: { primary: '#10B981', secondary: '#64748B', accent: '#F59E0B' } },
  { name: 'Rose', theme: { primary: '#F43F5E', secondary: '#78716C', accent: '#EC4899' } },
  { name: 'Blue', theme: { primary: '#3B82F6', secondary: '#6B7280', accent: '#06B6D4' } },
  { name: 'Purple', theme: { primary: '#8B5CF6', secondary: '#71717A', accent: '#A855F7' } },
  { name: 'Orange', theme: { primary: '#F97316', secondary: '#78716C', accent: '#EF4444' } },
  { name: 'Slate', theme: { primary: '#1E293B', secondary: '#64748B', accent: '#10B981' } },
];

export default function ThemeEditor({ initial }: { initial: Theme }) {
  const [state, formAction] = useFormState<ActionState, FormData>(updateThemeAction, {});
  const [colors, setColors] = useState<Theme>(initial);
  const [presetName, setPresetName] = useState(
    THEMES.find((t) => t.theme.primary.toLowerCase() === initial.primary.toLowerCase())?.name ?? 'Custom'
  );
  const themeRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useMemo(() => {
    if (state.success) toast.success(state.success);
    if (state.error) toast.error(state.error);
    return null;
  }, [state]);

  const setColor = (key: keyof Theme, value: string) => {
    setColors((prev) => ({ ...prev, [key]: value }));
    setPresetName('Custom');
  };

  const handleThemeKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex = index;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') nextIndex = (index + 1) % THEMES.length;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') nextIndex = (index - 1 + THEMES.length) % THEMES.length;
    else if (e.key === 'Home') nextIndex = 0;
    else if (e.key === 'End') nextIndex = THEMES.length - 1;
    else return;
    e.preventDefault();
    setColors(THEMES[nextIndex].theme);
    setPresetName(THEMES[nextIndex].name);
    themeRefs.current[nextIndex]?.focus();
  };

  return (
    <div className="pt-16 md:pt-0">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Theme Customizer</h1>
        <p className="text-slate-600 mt-1">Pick a preset or fine-tune colors — your storefront updates instantly.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Palette className="w-5 h-5" aria-hidden />
              Presets
            </h2>
            <div role="radiogroup" aria-label="Theme presets" className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {THEMES.map((t, index) => {
                const isSelected = presetName === t.name;
                return (
                  <button
                    key={t.name}
                    ref={(el) => {
                      themeRefs.current[index] = el;
                    }}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => {
                      setColors(t.theme);
                      setPresetName(t.name);
                    }}
                    onKeyDown={(e) => handleThemeKeyDown(e, index)}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      isSelected ? 'border-slate-900 bg-slate-50 shadow-md' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full shadow-sm" style={{ backgroundColor: t.theme.primary }} />
                      <span className="text-sm font-medium text-slate-900">{t.name}</span>
                    </div>
                    <div className="flex gap-1">
                      <div className="h-1 flex-1 rounded" style={{ backgroundColor: t.theme.primary }} />
                      <div className="h-1 flex-1 rounded" style={{ backgroundColor: t.theme.secondary }} />
                      <div className="h-1 flex-1 rounded" style={{ backgroundColor: t.theme.accent }} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <form action={formAction} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Custom Colors</h2>
            <input type="hidden" name="primary" value={colors.primary} />
            <input type="hidden" name="secondary" value={colors.secondary} />
            <input type="hidden" name="accent" value={colors.accent} />
            {(['primary', 'secondary', 'accent'] as const).map((key) => (
              <div key={key}>
                <label className="block text-sm font-medium text-slate-700 mb-2 capitalize" htmlFor={`color-${key}`}>
                  {key} Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    id={`color-${key}`}
                    type="color"
                    value={colors[key]}
                    onChange={(e) => setColor(key, e.target.value)}
                    aria-label={`${key} color picker`}
                    className="w-12 h-12 rounded-lg cursor-pointer border-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={colors[key]}
                    onChange={(e) => setColor(key, e.target.value)}
                    aria-label={`${key} hex value`}
                    className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>
            ))}
            <SubmitButton className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-70 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20">
              Save Theme
            </SubmitButton>
          </form>
        </div>

        <div className="lg:sticky lg:top-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Eye className="w-5 h-5" aria-hidden />
                Live Preview
              </h2>
              <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">Mobile View</span>
            </div>
            <div className="flex justify-center">
              <MobilePreview theme={colors} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
