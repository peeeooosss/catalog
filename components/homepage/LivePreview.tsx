'use client';
import { useRef, useState, type KeyboardEvent } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Search, ShoppingBag, Plus, Heart, Check } from 'lucide-react';

const DEMO_PRODUCTS = [
  { id: 1, name: 'Premium Cotton Shirt', price: 45.0, image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=400&q=80', category: 'Tops' },
  { id: 2, name: 'Classic Denim Jeans', price: 65.0, image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=400&q=80', category: 'Bottoms' },
  { id: 3, name: 'Summer Maxi Dress', price: 89.0, image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=400&q=80', category: 'Dresses' },
  { id: 4, name: 'Leather Biker Jacket', price: 120.0, image: 'https://images.unsplash.com/photo-1551028719-00575905b463?auto=format&fit=crop&w=400&q=80', category: 'Outerwear' },
];

const THEMES = [
  { name: 'Emerald', primary: '#10B981', secondary: '#64748B' },
  { name: 'Rose', primary: '#F43F5E', secondary: '#78716C' },
  { name: 'Blue', primary: '#3B82F6', secondary: '#6B7280' },
  { name: 'Purple', primary: '#8B5CF6', secondary: '#71717A' },
];

const BENEFITS = [
  'Mobile-optimized catalog',
  'WhatsApp ordering',
  'Custom branding',
  'Instant sharing links',
  'Real-time inventory',
  'Analytics dashboard',
];

export default function LivePreview() {
  const [activeTheme, setActiveTheme] = useState(THEMES[0]);
  const [activeCategory, setActiveCategory] = useState('All');
  const themeRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const filteredProducts =
    activeCategory === 'All'
      ? DEMO_PRODUCTS
      : DEMO_PRODUCTS.filter((p) => p.category === activeCategory);

  const handleThemeKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next = index;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (index + 1) % THEMES.length;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (index - 1 + THEMES.length) % THEMES.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = THEMES.length - 1;
    else return;
    e.preventDefault();
    setActiveTheme(THEMES[next]);
    themeRefs.current[next]?.focus();
  };

  return (
    <section id="preview" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            See How Your Catalog Will Look
          </h2>
          <p className="text-xl text-slate-600">
            Customize colors and see the changes instantly
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Theme Selector */}
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Choose Your Theme</h3>
              <div role="radiogroup" aria-label="Preview theme" className="grid grid-cols-2 gap-4">
                {THEMES.map((theme, index) => {
                  const isSelected = activeTheme.name === theme.name;
                  return (
                    <button
                      key={theme.name}
                      ref={(el) => {
                        themeRefs.current[index] = el;
                      }}
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => setActiveTheme(theme)}
                      onKeyDown={(e) => handleThemeKeyDown(e, index)}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        isSelected
                          ? 'border-slate-900 bg-slate-50 shadow-md'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className="w-8 h-8 rounded-full shadow-sm"
                          style={{ backgroundColor: theme.primary }}
                        ></div>
                        <span className="font-semibold text-slate-900">{theme.name}</span>
                        {isSelected && (
                          <Check className="w-4 h-4 text-emerald-500 ml-auto" aria-hidden />
                        )}
                      </div>
                      <div className="flex gap-1">
                        <div className="h-2 flex-1 rounded" style={{ backgroundColor: theme.primary }}></div>
                        <div className="h-2 flex-1 rounded" style={{ backgroundColor: theme.secondary }}></div>
                      </div>
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-slate-400 mt-3">Use arrow keys to switch themes</p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl">
              <h4 className="font-semibold text-slate-900 mb-4">What you get:</h4>
              <ul className="grid grid-cols-2 gap-3">
                {BENEFITS.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-2 text-slate-600 text-sm">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full flex-shrink-0" aria-hidden></span>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right: Phone Mockup */}
          <div className="flex justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5 }}
            >
              <div className="relative">
                {/* Realistic phone frame */}
                <div className="absolute inset-0 bg-slate-900 rounded-[3rem] shadow-[0_0_0_2px_#1a1a1a,0_0_0_4px_#333,0_20px_60px_rgba(0,0,0,0.3)]">
                  <div className="absolute -left-[2px] top-24 w-[3px] h-10 bg-slate-700 rounded-l" aria-hidden></div>
                  <div className="absolute -left-[2px] top-40 w-[3px] h-14 bg-slate-700 rounded-l" aria-hidden></div>
                  <div className="absolute -right-[2px] top-32 w-[3px] h-16 bg-slate-700 rounded-r" aria-hidden></div>
                </div>

                <div className="relative w-[300px] max-w-full h-[620px] p-[7px]">
                  {/* Dynamic island + speaker */}
                  <div className="absolute top-[14px] left-1/2 -translate-x-1/2 w-28 h-6 bg-slate-900 rounded-full z-20">
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                  </div>
                  <div className="absolute top-[19px] left-1/2 -translate-x-1/2 w-20 h-[7px] bg-slate-800/80 rounded-full z-20" aria-hidden></div>

                  <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden relative">
                    {/* Status Bar */}
                    <div className="h-10 bg-white flex items-end justify-between px-6 pb-1 relative z-10">
                      <span className="text-[10px] font-semibold text-slate-700">9:41</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[8px] text-slate-500">5G</span>
                        <div className="flex items-end gap-[2px]">
                          <div className="w-[3px] h-[6px] bg-slate-600 rounded-sm"></div>
                          <div className="w-[3px] h-[8px] bg-slate-600 rounded-sm"></div>
                          <div className="w-[3px] h-[10px] bg-slate-600 rounded-sm"></div>
                        </div>
                      </div>
                    </div>

                    {/* Catalog Content */}
                    <div className="h-[calc(100%-2.5rem)] overflow-y-auto bg-slate-50 scrollbar-hide">
                      <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 py-3 z-10">
                        <div className="flex items-center justify-between">
                          <h1 className="text-base font-bold text-slate-900">Lumière Boutique</h1>
                          <Search className="w-4 h-4 text-slate-600" aria-hidden />
                        </div>
                      </div>

                      <div className="sticky top-[49px] bg-slate-50 px-4 py-2 overflow-x-auto flex gap-2 z-10 scrollbar-hide">
                        {['All', 'Tops', 'Bottoms', 'Dresses'].map((cat) => (
                          <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            aria-pressed={activeCategory === cat}
                            className={`whitespace-nowrap px-3 py-1 rounded-full text-[11px] font-medium transition-all ${
                              activeCategory === cat
                                ? 'text-white shadow-sm'
                                : 'bg-white text-slate-600 border border-slate-200'
                            }`}
                            style={activeCategory === cat ? { backgroundColor: activeTheme.primary } : {}}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>

                      <div className="p-3 grid grid-cols-2 gap-2">
                        {filteredProducts.map((product) => (
                          <div
                            key={product.id}
                            className="bg-white rounded-xl overflow-hidden border border-slate-100 shadow-sm"
                          >
                            <div className="aspect-square bg-slate-100 relative overflow-hidden">
                              <Image
                                src={product.image}
                                alt={product.name}
                                fill
                                sizes="150px"
                                className="object-cover"
                              />
                              <button className="absolute top-1.5 right-1.5 p-1 bg-white/80 backdrop-blur rounded-full" aria-label={`Add ${product.name} to wishlist`}>
                                <Heart className="w-2.5 h-2.5 text-slate-600" aria-hidden />
                              </button>
                            </div>
                            <div className="p-2">
                              <h3 className="text-[10px] font-semibold line-clamp-1 mb-1">
                                {product.name}
                              </h3>
                              <div className="flex items-center justify-between">
                                <span
                                  className="text-[11px] font-bold"
                                  style={{ color: activeTheme.primary }}
                                >
                                  ${product.price}
                                </span>
                                <button
                                  className="p-0.5 rounded-full"
                                  style={{ backgroundColor: `${activeTheme.primary}20` }}
                                  aria-label={`Add ${product.name} to cart`}
                                >
                                  <Plus
                                    className="w-2.5 h-2.5"
                                    style={{ color: activeTheme.primary }}
                                    aria-hidden
                                  />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Floating Cart */}
                    <div className="absolute bottom-3 left-3 right-3 z-20">
                      <button
                        className="w-full text-white font-bold py-2.5 rounded-xl shadow-lg flex items-center justify-between px-4 text-sm"
                        style={{ backgroundColor: activeTheme.primary }}
                        aria-label="View cart"
                      >
                        <div className="flex items-center gap-2">
                          <ShoppingBag className="w-3.5 h-3.5" aria-hidden />
                          <span>View Cart</span>
                        </div>
                        <div className="bg-white/20 px-2 py-0.5 rounded-full text-[10px] font-bold">2</div>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="absolute -top-6 -right-6 w-24 h-24 bg-emerald-200 rounded-full blur-2xl opacity-40" aria-hidden></div>
                <div className="absolute -bottom-6 -left-6 w-28 h-28 bg-cyan-200 rounded-full blur-2xl opacity-40" aria-hidden></div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}