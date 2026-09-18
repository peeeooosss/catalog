import { requireStore } from '@/lib/auth';
import ThemeEditor from '@/components/dashboard/ThemeEditor';

export const dynamic = 'force-dynamic';

export default async function ThemePage() {
  const { store } = await requireStore();
  return <ThemeEditor initial={store.theme} />;
}
