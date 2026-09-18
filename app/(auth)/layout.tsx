import Link from 'next/link';
import { ShoppingBag, ShieldCheck, Zap, MessageCircle } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white p-12 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-white/10 rounded-full blur-2xl" aria-hidden />
        <div className="absolute -bottom-24 -left-16 w-80 h-80 bg-emerald-400/20 rounded-full blur-3xl" aria-hidden />
        <Link href="/" className="flex items-center gap-2 relative z-10" aria-label="CatalogPro home">
          <div className="w-9 h-9 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-white" aria-hidden />
          </div>
          <span className="text-xl font-bold">CatalogPro</span>
        </Link>

        <div className="relative z-10 max-w-md">
          <h1 className="text-4xl font-bold leading-tight mb-4">
            Your catalog. Your customers. Your WhatsApp.
          </h1>
          <p className="text-emerald-50/90 mb-8">
            Create a beautiful mobile catalog in minutes, share the link anywhere, and receive orders
            straight in your chat.
          </p>
          <ul className="space-y-4">
            {[
              { icon: Zap, text: 'Set up in under 5 minutes — no coding' },
              { icon: MessageCircle, text: 'Orders land directly on WhatsApp' },
              { icon: ShieldCheck, text: 'Live sales, cart and customer analytics' },
            ].map((item) => (
              <li key={item.text} className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5" aria-hidden />
                </span>
                <span className="text-emerald-50">{item.text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-sm text-emerald-100/80">
          Trusted by boutiques, grocery stores, electronics shops and more.
        </p>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-10 bg-slate-50">
        <div className="w-full max-w-md">
          <Link href="/" className="lg:hidden flex items-center gap-2 justify-center mb-8" aria-label="CatalogPro home">
            <div className="w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-white" aria-hidden />
            </div>
            <span className="text-xl font-bold text-slate-900">CatalogPro</span>
          </Link>
          {children}
        </div>
      </div>
    </div>
  );
}
