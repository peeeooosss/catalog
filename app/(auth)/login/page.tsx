import type { Metadata } from 'next';
import LoginForm from '@/components/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Sign In',
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: { disabled?: string };
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Welcome back</h1>
      <p className="text-slate-600 text-sm mb-6">Sign in to manage your catalog and orders.</p>
      <LoginForm disabled={searchParams.disabled === '1'} />
    </div>
  );
}
