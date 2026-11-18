'use client';
import type { Theme } from '@/types';

interface CategoryPillsProps {
  categories: { id: string; name: string; icon?: string | null }[];
  counts?: Record<string, number>;
  activeCategory: string;
  onCategoryChange: (id: string) => void;
  theme: Theme;
}

export default function CategoryPills({
  categories,
  counts = {},
  activeCategory,
  onCategoryChange,
  theme,
}: CategoryPillsProps) {
  const pillClass = (active: boolean) =>
    `store-pill whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium shadow-sm ${
      active ? 'text-white shadow-none' : ''
    }`;

  return (
    <nav className="scrollbar-hide sticky top-[65px] z-20 overflow-x-auto bg-slate-50/95 px-4 py-3 backdrop-blur" aria-label="Product categories">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onCategoryChange('all')}
          aria-pressed={activeCategory === 'all'}
          className={pillClass(activeCategory === 'all')}
          style={activeCategory === 'all' ? { backgroundColor: theme.primary } : {}}
        >
          All <span className="ml-1 opacity-70">{counts.all ?? ''}</span>
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => onCategoryChange(category.id)}
            aria-pressed={activeCategory === category.id}
            className={pillClass(activeCategory === category.id)}
            style={activeCategory === category.id ? { backgroundColor: theme.primary } : {}}
          >
            {category.icon ? `${category.icon} ` : ''}
            {category.name}
            {counts[category.id] ? <span className="ml-1 opacity-70">{counts[category.id]}</span> : null}
          </button>
        ))}
      </div>
    </nav>
  );
}
