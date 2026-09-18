import { redirect } from 'next/navigation';
import { requireSeller } from '@/lib/auth';
import OnboardingWizard from '@/components/dashboard/OnboardingWizard';

export const dynamic = 'force-dynamic';

export default async function OnboardingPage() {
  const { store } = await requireSeller();
  if (store) redirect('/dashboard');

  return (
    <div className="pt-16 md:pt-0">
      <OnboardingWizard />
    </div>
  );
}