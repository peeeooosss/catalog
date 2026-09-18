'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Smartphone, MessageCircle, Layout, Send } from 'lucide-react';

const SCREENSHOTS = [
  {
    id: 1,
    title: 'Product Catalog',
    description: 'Beautiful grid layout optimized for mobile browsing',
    icon: Layout,
    gradient: 'from-emerald-400 to-teal-500',
  },
  {
    id: 2,
    title: 'Shopping Cart',
    description: 'Frictionless checkout with instant WhatsApp redirect',
    icon: Smartphone,
    gradient: 'from-blue-400 to-indigo-500',
  },
  {
    id: 3,
    title: 'Product Details',
    description: 'Rich product pages with variants and image galleries',
    icon: Layout,
    gradient: 'from-purple-400 to-pink-500',
  },
  {
    id: 4,
    title: 'WhatsApp Order',
    description: 'One-click order sent directly to seller WhatsApp',
    icon: Send,
    gradient: 'from-green-400 to-emerald-500',
  },
];

export default function Screenshots() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % SCREENSHOTS.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + SCREENSHOTS.length) % SCREENSHOTS.length);

  const current = SCREENSHOTS[currentIndex];

  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">See It In Action</h2>
          <p className="text-xl text-slate-600">Every screen designed for maximum conversions</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Phone Mockup */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-slate-900 rounded-[2.8rem] shadow-[0_0_0_2px_#1a1a1a,0_0_0_4px_#333,0_20px_60px_rgba(0,0,0,0.3)]">
                <div className="absolute -left-[2px] top-24 w-[3px] h-10 bg-slate-700 rounded-l" aria-hidden></div>
                <div className="absolute -right-[2px] top-32 w-[3px] h-16 bg-slate-700 rounded-r" aria-hidden></div>
              </div>
              <div className="relative w-[280px] max-w-full h-[560px] p-[7px]">
                <div className="absolute top-[12px] left-1/2 -translate-x-1/2 w-24 h-5 bg-slate-900 rounded-full flex items-center justify-end pr-2 z-20">
                  <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                </div>
                <div className="absolute top-[16px] left-1/2 -translate-x-1/2 w-16 h-[6px] bg-slate-800/80 rounded-full z-20" aria-hidden></div>
                <div className="w-full h-full bg-white rounded-[2rem] overflow-hidden relative">
                  <div className="h-8 bg-white flex items-end justify-between px-6 pb-1">
                    <span className="text-[9px] font-semibold text-slate-700">9:41</span>
                    <div className="flex items-end gap-[2px]">
                      <div className="w-[3px] h-[6px] bg-slate-600 rounded-sm"></div>
                      <div className="w-[3px] h-[8px] bg-slate-600 rounded-sm"></div>
                      <div className="w-[3px] h-[10px] bg-slate-600 rounded-sm"></div>
                    </div>
                  </div>
                  <div className={`h-[calc(100%-2rem)] bg-gradient-to-br ${current.gradient} p-6 flex flex-col items-center justify-center text-center`}>
                    <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mb-4">
                      <current.icon className="w-8 h-8 text-white" aria-hidden />
                    </div>
                    <h3 className="text-white text-xl font-bold mb-2">{current.title}</h3>
                    <p className="text-white/80 text-sm">{current.description}</p>
                    <div className="mt-6 w-full bg-white/10 backdrop-blur rounded-xl p-4">
                      <div className="space-y-2">
                        <div className="h-2 bg-white/30 rounded w-3/4 mx-auto"></div>
                        <div className="h-2 bg-white/20 rounded w-1/2 mx-auto"></div>
                        <div className="h-2 bg-white/20 rounded w-2/3 mx-auto"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div>
            <div className="mb-8" aria-live="polite">
              <motion.h3
                key={current.title}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-bold text-slate-900 mb-2"
              >
                {current.title}
              </motion.h3>
              <motion.p
                key={`${current.title}-desc`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-slate-600 text-lg"
              >
                {current.description}
              </motion.p>
            </div>

            <div className="flex items-center gap-4 mb-8">
              <button
                onClick={prevSlide}
                className="p-3 bg-white rounded-full shadow-lg hover:bg-slate-50 transition-all border border-slate-100"
                aria-label="Previous screenshot"
              >
                <ChevronLeft className="w-5 h-5 text-slate-700" aria-hidden />
              </button>
              <div className="flex gap-2">
                {SCREENSHOTS.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`h-2 rounded-full transition-all ${
                      currentIndex === index ? 'w-8 bg-emerald-500' : 'w-2 bg-slate-300 hover:bg-slate-400'
                    }`}
                    aria-label={`Go to screenshot ${index + 1}`}
                    aria-current={currentIndex === index ? 'true' : undefined}
                  />
                ))}
              </div>
              <button
                onClick={nextSlide}
                className="p-3 bg-white rounded-full shadow-lg hover:bg-slate-50 transition-all border border-slate-100"
                aria-label="Next screenshot"
              >
                <ChevronRight className="w-5 h-5 text-slate-700" aria-hidden />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {SCREENSHOTS.map((screenshot, index) => (
                <button
                  key={screenshot.id}
                  onClick={() => setCurrentIndex(index)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    currentIndex === index
                      ? 'border-emerald-500 bg-emerald-50 shadow-md'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <screenshot.icon
                      className={`w-4 h-4 ${currentIndex === index ? 'text-emerald-500' : 'text-slate-400'}`}
                      aria-hidden
                    />
                    <span className={`text-sm font-semibold ${currentIndex === index ? 'text-emerald-700' : 'text-slate-700'}`}>
                      {screenshot.title}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-1">{screenshot.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}