import Link from 'next/link';
import { ArrowDownRight, ArrowUpRight, Minus, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function StatCard({
  label,
  value,
  icon: Icon,
  delta,
  hint,
  href,
  tone = 'emerald',
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  delta?: number;
  hint?: string;
  href?: string;
  tone?: 'emerald' | 'violet' | 'amber' | 'sky';
}) {
  const tones: Record<string, string> = {
    emerald: 'bg-emerald-50 text-emerald-600',
    violet: 'bg-violet-50 text-violet-600',
    amber: 'bg-amber-50 text-amber-600',
    sky: 'bg-sky-50 text-sky-600',
  };

  const content = (
    <>
      <div className="mb-4 flex items-start justify-between">
        <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl', tones[tone])}>
          <Icon className="h-5 w-5" aria-hidden />
        </div>
        {typeof delta === 'number' && (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 rounded-full px-2 py-1 text-[11px] font-bold',
              delta > 0 ? 'bg-emerald-50 text-emerald-700' : delta < 0 ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-500'
            )}
          >
            {delta > 0 ? <ArrowUpRight className="h-3 w-3" aria-hidden /> : null}
            {delta < 0 ? <ArrowDownRight className="h-3 w-3" aria-hidden /> : null}
            {delta === 0 ? <Minus className="h-3 w-3" aria-hidden /> : null}
            {delta === 0 ? 'Flat' : `${Math.abs(delta)}%`}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold tracking-tight text-slate-900">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{label}</p>
      {hint && <p className="mt-3 text-xs text-slate-400">{hint}</p>}
    </>
  );

  if (href) {
    return (
      <Link href={href} className="surface-card surface-card-hover block p-5">
        {content}
      </Link>
    );
  }

  return <div className="surface-card p-5">{content}</div>;
}
