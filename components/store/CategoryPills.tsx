'use client';

interface CategoryPillsProps {
  categories: { id: string; name: string; icon?: string | null }[];
  activeCategory: string;
  onCategoryChange: (id: string) => void;
  theme: { primary: string };
}

export default function CategoryPills({
  categories,
  activeCategory,
  onCategoryChange,
  theme,
}: CategoryPillsProps) {
  return (
    <nav
      className="sticky top-[61px] z-10 bg-slate-50 px-4 py-3 overflow-x-auto scrollbar-hide"
      aria-label="Product categories"
    >
      <div className="flex gap-2">
        <button
          onClick={() => onCategoryChange('all')}
          aria-pressed={activeCategory === 'all'}
          className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
            activeCategory === 'all' ? 'text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200'
          }`}
          style={activeCategory === 'all' ? { backgroundColor: theme.primary } : {}}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onCategoryChange(cat.id)}
            aria-pressed={activeCategory === cat.id}
            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              activeCategory === cat.id ? 'text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200'
            }`}
            style={activeCategory === cat.id ? { backgroundColor: theme.primary } : {}}
          >
            {cat.icon ? `${cat.icon} ` : ''}
            {cat.name}
          </button>
        ))}
      </div>
    </nav>
  );
}