interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <svg
        className="w-24 h-24 mb-4 text-slate-200"
        viewBox="0 0 96 96"
        fill="none"
        aria-hidden
      >
        <rect width="96" height="96" rx="20" fill="currentColor" fillOpacity="0.4" />
        <g stroke="#94a3b8" strokeWidth="2" strokeLinecap="round">
          <rect x="32" y="30" width="32" height="36" rx="4" fill="#fff" />
          <line x1="36" y1="40" x2="60" y2="40" />
          <line x1="36" y1="48" x2="56" y2="48" />
          <line x1="36" y1="56" x2="52" y2="56" />
          <line x1="40" y1="36" x2="40" y2="36" />
          <line x1="46" y1="36" x2="46" y2="36" />
          <path d="M42 30v-6h14v6" fill="#fff" />
        </g>
        <g stroke="#f59e0b" strokeWidth="3" strokeLinecap="round">
          <line x1="64" y1="26" x2="74" y2="36" />
          <line x1="74" y1="26" x2="64" y2="36" />
        </g>
      </svg>
      <h3 className="text-lg font-bold text-slate-900 mb-1">{title}</h3>
      {description && <p className="text-sm text-slate-500 max-w-sm mb-4">{description}</p>}
      {action}
    </div>
  );
}