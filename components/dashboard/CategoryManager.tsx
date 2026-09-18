'use client';
import { useEffect, useState } from 'react';
import { useFormState } from 'react-dom';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown, ListTree } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import EmptyState from '@/components/ui/EmptyState';
import ConfirmSubmit from '@/components/ui/ConfirmSubmit';
import SubmitButton from '@/components/auth/SubmitButton';
import type { Category } from '@/types';
import type { ActionState } from '@/lib/actions/auth';
import {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
  moveCategoryAction,
} from '@/lib/actions/categories';

const inputClass =
  'w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm';
const EMOJI_SUGGESTIONS = ['🛍️', '⭐', '🔥', '🍎', '🥦', '👕', '📱', '💐', '🎂', '💊', '🍔', '🏷️', '🆕', '🎁'];

function CategoryForm({
  action,
  initial,
  onDone,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  initial?: Category;
  onDone: () => void;
}) {
  const [state, formAction] = useFormState<ActionState, FormData>(action, {});
  const [icon, setIcon] = useState(initial?.icon ?? '');

  useEffect(() => {
    if (state.success) {
      toast.success(state.success);
      onDone();
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state, onDone]);

  return (
    <form action={formAction} className="space-y-4">
      {initial && <input type="hidden" name="id" value={initial.id} />}
      <input type="hidden" name="icon" value={icon} />
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Category name</label>
        <input name="name" defaultValue={initial?.name} required placeholder="e.g. Fresh Vegetables" className={inputClass} />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Icon (optional)</label>
        <div className="flex flex-wrap items-center gap-2">
          <div className="w-12 h-12 rounded-xl border border-slate-200 flex items-center justify-center text-xl bg-slate-50">
            {icon || '—'}
          </div>
          <input
            value={icon}
            onChange={(e) => setIcon([...e.target.value].slice(0, 2).join(''))}
            placeholder="Paste emoji"
            className="w-28 px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <div className="flex flex-wrap gap-1">
            {EMOJI_SUGGESTIONS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setIcon(e)}
                className="w-9 h-9 rounded-lg hover:bg-slate-100 text-lg"
                aria-label={`Use ${e}`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>
      </div>
      <SubmitButton className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-70 text-white font-bold rounded-xl">
        {initial ? 'Save Category' : 'Add Category'}
      </SubmitButton>
    </form>
  );
}

export default function CategoryManager({
  categories,
  counts,
}: {
  categories: Category[];
  counts: Record<string, number>;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  return (
    <div>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Categories</h1>
          <p className="text-slate-600 mt-1">Organize your catalog your way — for any business type.</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" aria-hidden />
          Add Category
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
        {categories.length === 0 ? (
          <EmptyState
            title="No categories yet"
            description="Create categories like 'Fruits', 'Dresses' or 'Smartphones' to group your products."
          />
        ) : (
          <ul className="divide-y divide-slate-50">
            {categories.map((cat, index) => (
              <li key={cat.id} className="flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors">
                <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-xl flex-shrink-0">
                  {cat.icon || <ListTree className="w-5 h-5 text-slate-400" aria-hidden />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 truncate">{cat.name}</p>
                  <p className="text-xs text-slate-500">{counts[cat.id] ?? 0} products</p>
                </div>
                <div className="flex items-center gap-1">
                  <form action={moveCategoryAction}>
                    <input type="hidden" name="id" value={cat.id} />
                    <input type="hidden" name="direction" value="up" />
                    <button
                      type="submit"
                      disabled={index === 0}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg disabled:opacity-30"
                      aria-label={`Move ${cat.name} up`}
                    >
                      <ChevronUp className="w-4 h-4" aria-hidden />
                    </button>
                  </form>
                  <form action={moveCategoryAction}>
                    <input type="hidden" name="id" value={cat.id} />
                    <input type="hidden" name="direction" value="down" />
                    <button
                      type="submit"
                      disabled={index === categories.length - 1}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg disabled:opacity-30"
                      aria-label={`Move ${cat.name} down`}
                    >
                      <ChevronDown className="w-4 h-4" aria-hidden />
                    </button>
                  </form>
                  <button
                    onClick={() => setEditing(cat)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                    aria-label={`Edit ${cat.name}`}
                  >
                    <Pencil className="w-4 h-4" aria-hidden />
                  </button>
                  <form action={deleteCategoryAction}>
                    <input type="hidden" name="id" value={cat.id} />
                    <ConfirmSubmit
                      message={`Delete category "${cat.name}"? Products will become uncategorized.`}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                      ariaLabel={`Delete ${cat.name}`}
                    >
                      <Trash2 className="w-4 h-4" aria-hidden />
                    </ConfirmSubmit>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add category">
        <CategoryForm action={createCategoryAction} onDone={() => setShowAdd(false)} />
      </Modal>
      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title="Edit category">
        {editing && <CategoryForm action={updateCategoryAction} initial={editing} onDone={() => setEditing(null)} />}
      </Modal>
    </div>
  );
}
