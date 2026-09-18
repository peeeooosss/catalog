'use client';
import { useRef, useState, type KeyboardEvent } from 'react';
import { Palette, Eye, Save } from 'lucide-react';
import { toast } from 'sonner';
import MobilePreview from '@/components/dashboard/MobilePreview';

const THEMES = [
  { name: 'Emerald', primary: '#10B981', secondary: '#64748B', accent: '#F59E0B' },
  { name: 'Rose', primary: '#F43F5E', secondary: '#78716C', accent: '#EC4899' },
  { name: 'Blue', primary: '#3B82F6', secondary: '#6B7280', accent: '#06B6D4' },
  { name: 'Purple', primary: '#8B5CF6', secondary: '#71717A', accent: '#A855F7' },
  { name: 'Orange', primary: '#F97316', secondary: '#78716C', accent: '#EF4444' },
  { name: 'Dark', primary: '#1E293B', secondary: '#64748B', accent: '#10B981' },
];

export default function ThemeCustomizer() {
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0]);
  const [customColors, setCustomColors] = useState({
    primary: '#10B981',
    secondary: '#64748B',
    accent: '#F59E0B',
  });
  const themeRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleThemeSelect = (theme: typeof THEMES[0]) => {
    setSelectedTheme(theme);
    setCustomColors({
      primary: theme.primary,
      secondary: theme.secondary,
      accent: theme.accent,
    });
  };

  const handleThemeKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex = index;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      nextIndex = (index + 1) % THEMES.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      nextIndex = (index - 1 + THEMES.length) % THEMES.length;
    } else if (e.key === 'Home') {
      nextIndex = 0;
    } else if (e.key === 'End') {
      nextIndex = THEMES.length - 1;
    } else {
      return;
    }
    e.preventDefault();
    handleThemeSelect(THEMES[nextIndex]);
    themeRefs.current[nextIndex]?.focus();
  };

  const handleColorChange = (key: keyof typeof customColors, value: string) => {
    setCustomColors((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="pt-16 md:pt-0">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Theme Customizer</h1>
        <p className="text-slate-600 mt-1">Customize your catalog&apos;s appearance with live preview</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Controls */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Palette className="w-5 h-5" aria-hidden />
              Choose a Preset
            </h2>
            <div
              role="radiogroup"
              aria-label="Theme presets"
              className="grid grid-cols-2 sm:grid-cols-3 gap-3"
            >
              {THEMES.map((theme, index) => {
                const isSelected = selectedTheme.name === theme.name;
                return (
                  <button
                    key={theme.name}
                    ref={(el) => {
                      themeRefs.current[index] = el;
                    }}
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => handleThemeSelect(theme)}
                    onKeyDown={(e) => handleThemeKeyDown(e, index)}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      isSelected
                        ? 'border-slate-900 bg-slate-50 shadow-md'
                        : 'border-slate-200 hover:border-slate-300'
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
            <p className="text-xs text-slate-400 mt-3">Use arrow keys to switch presets</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Custom Colors</h2>
            <div className="space-y-4">
              {(['primary', 'secondary', 'accent'] as const).map((colorKey) => (
                <div key={colorKey}>
                  <label className="block text-sm font-medium text-slate-700 mb-2 capitalize" htmlFor={`color-${colorKey}`}>
                    {colorKey} Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      id={`color-${colorKey}`}
                      type="color"
                      value={customColors[colorKey]}
                      onChange={(e) => handleColorChange(colorKey, e.target.value)}
                      aria-label={`${colorKey} color picker`}
                      className="w-12 h-12 rounded-lg cursor-pointer border-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={customColors[colorKey]}
                      onChange={(e) => handleColorChange(colorKey, e.target.value)}
                      aria-label={`${colorKey} color hex value`}
                      className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                      placeholder="#000000"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => toast.success('Theme saved successfully!')}
            className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <Save className="w-5 h-5" aria-hidden />
            Save Theme
          </button>
        </div>

        {/* Live Preview */}
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
              <MobilePreview theme={customColors} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}