import { requireStore } from '@/lib/auth';
import SettingsForm from '@/components/dashboard/SettingsForm';
import PageHeader from '@/components/ui/PageHeader';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const { store } = await requireStore();

  return (
    <div className="pt-16 md:pt-0">
      <PageHeader
        eyebrow="Store"
        title="Settings"
        description="Manage your store profile, contact details and offers."
      />
      <SettingsForm
        store={{
          business_name: store.business_name,
          whatsapp_number: store.whatsapp_number,
          description: store.description,
          currency: store.currency,
          address: store.address,
          offer_text: store.offer_text,
          offer_active: store.offer_active,
          logo_url: store.logo_url,
        }}
      />
    </div>
  );
}