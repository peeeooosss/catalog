interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="relative w-24 h-24 mb-5">
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-emerald-50 to-sky-50" aria-hidden />
        <svg
          className="relative w-24 h-24 text-slate-200"
          viewBox="0 0 96 96"
          fill="none"
          aria-hidden
        >
          <rect width="96" height="96" rx="24" fill="currentColor" fillOpacity="0.35" />
          <g stroke="#94a3b8" strokeWidth="2" strokeLinecap="round">
            <rect x="32" y="30" width="32" height="36" rx="4" fill="#fff" />
            <line x1="36" y1="40" x2="60" y2="40" />
            <line x1="36" y1="48" x2="56" y2="48" />
            <line x1="36" y1="56" x2="52" y2="56" />
            <path d="M42 30v-6h14v6" fill="#fff" />
          </g>
          <g stroke="#f59e0b" strokeWidth="3" strokeLinecap="round">
            <line x1="64" y1="26" x2="74" y2="36" />
            <line x1="74" y1="26" x2="64" y2="36" />
          </g>
        </svg>
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-1">{title}</h3>
      {description && <p className="text-sm text-slate-500 max-w-sm mb-5 leading-relaxed">{description}</p>}
      {action}
    </div>
  );
}
