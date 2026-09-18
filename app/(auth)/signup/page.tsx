import type { Metadata } from 'next';
import SignupForm from '@/components/auth/SignupForm';

export const metadata: Metadata = {
  title: 'Create Your Store',
};

export default function SignupPage() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Start selling today</h1>
      <p className="text-slate-600 text-sm mb-6">Create your free account — no credit card required.</p>
      <SignupForm />
    </div>
  );
}
