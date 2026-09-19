'use client';
import { useMemo, useState } from 'react';
import { useFormState } from 'react-dom';
import { toast } from 'sonner';
import ImageUploader from '@/components/dashboard/ImageUploader';
import SubmitButton from '@/components/auth/SubmitButton';
import type { ActionState } from '@/lib/actions/auth';
import { updateStoreAction } from '@/lib/actions/store';
import { CURRENCIES } from '@/lib/utils';

const inputClass =
  'w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm';
const labelClass = 'block text-sm font-medium text-slate-700 mb-2';

export default function SettingsForm({
  store,
}: {
  store: {
    business_name: string;
    whatsapp_number: string;
    description: string | null;
    currency: string;
    address: string | null;
    offer_text: string | null;
    offer_active: boolean;
    logo_url: string | null;
  };
}) {
  const [state, formAction] = useFormState<ActionState, FormData>(updateStoreAction, {});
  const [logo, setLogo] = useState(store.logo_url ?? '');

  useMemo(() => {
    if (state.success) toast.success(state.success);
    if (state.error) toast.error(state.error);
    return null;
  }, [state]);

  return (
    <form action={formAction} className="space-y-6 max-w-3xl">
      <input type="hidden" name="logo_url" value={logo} />

      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5">
        <h2 className="text-lg font-bold text-slate-900">Store Details</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="business_name" className={labelClass}>
              Store Name <span className="text-rose-500">*</span>
            </label>
            <input id="business_name" name="business_name" defaultValue={store.business_name} required className={inputClass} />
          </div>
          <div>
            <label htmlFor="whatsapp_number" className={labelClass}>
              WhatsApp Number <span className="text-rose-500">*</span>
            </label>
            <input
              id="whatsapp_number"
              name="whatsapp_number"
              defaultValue={store.whatsapp_number}
              required
              placeholder="9876543210"
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label htmlFor="description" className={labelClass}>
            Store Description
          </label>
          <textarea id="description" name="description" rows={2} defaultValue={store.description ?? ''} className={`${inputClass} resize-none`} />
        </div>

        <div>
          <label htmlFor="address" className={labelClass}>
            Business Address
          </label>
          <input id="address" name="address" defaultValue={store.address ?? ''} placeholder="Street, City, State" className={inputClass} />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="currency" className={labelClass}>
              Currency
            </label>
            <select id="currency" name="currency" defaultValue={store.currency} className={`${inputClass} bg-white`}>
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Store Logo</label>
            <ImageUploader value={logo} onChange={setLogo} label="Logo" />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Offer Banner</h2>
        <div>
          <label htmlFor="offer_text" className={labelClass}>
            Banner Text
          </label>
          <input
            id="offer_text"
            name="offer_text"
            defaultValue={store.offer_text ?? ''}
            placeholder="e.g. Free delivery on orders above ₹499"
            className={inputClass}
          />
        </div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" name="offer_active" defaultChecked={store.offer_active} className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500" />
          <span className="text-sm text-slate-700">Show the offer banner on my storefront</span>
        </label>
      </div>

      <SubmitButton className="w-full sm:w-auto px-8 py-3.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-70 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20">
        Save Settings
      </SubmitButton>
    </form>
  );
}
