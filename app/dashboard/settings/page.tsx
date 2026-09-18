import { requireStore } from '@/lib/auth';
import SettingsForm from '@/components/dashboard/SettingsForm';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const { store } = await requireStore();

  return (
    <div className="pt-16 md:pt-0">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-600 mt-1">Manage your store profile, contact details and offers.</p>
      </div>
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