'use client';
import { useMemo, useState } from 'react';
import { useFormState } from 'react-dom';
import { toast } from 'sonner';
import { Search, Users, Phone, MessageCircle, CheckCircle2, Clock } from 'lucide-react';
import EmptyState from '@/components/ui/EmptyState';
import type { Customer } from '@/types';
import { formatMoney, relativeTime } from '@/lib/utils';
import { toggleCustomerPaymentStatus } from '@/lib/actions/customers';
import type { ActionState } from '@/lib/actions/auth';

type PaymentFilter = 'all' | 'paid' | 'unpaid';

function PaymentBadge({ customer }: { customer: Customer }) {
  const [state, formAction] = useFormState<ActionState, FormData>(toggleCustomerPaymentStatus, {});

  useMemo(() => {
    if (state.success) toast.success(state.success);
    if (state.error) toast.error(state.error);
    return null;
  }, [state]);

  const paid = customer.payment_status === 'paid';

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={customer.id} />
      <input type="hidden" name="status" value={paid ? 'unpaid' : 'paid'} />
      <button
        type="submit"
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
          paid
            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
            : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
        }`}
        aria-label={paid ? `Mark ${customer.name ?? customer.phone} as unpaid` : `Mark ${customer.name ?? customer.phone} as paid`}
        title={paid ? 'Click to mark unpaid' : 'Click to mark paid'}
      >
        {paid ? <CheckCircle2 className="w-3.5 h-3.5" aria-hidden /> : <Clock className="w-3.5 h-3.5" aria-hidden />}
        {paid ? 'Paid' : 'Unpaid'}
      </button>
    </form>
  );
}

export default function CustomersTable({
  customers,
  currency,
}: {
  customers: Customer[];
  currency: string;
}) {
  const [query, setQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>('all');

  const counts = useMemo(() => {
    const c: Record<PaymentFilter, number> = { all: customers.length, paid: 0, unpaid: 0 };
    for (const cust of customers) c[cust.payment_status] += 1;
    return c;
  }, [customers]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return customers.filter((c) => {
      const matchesPayment = paymentFilter === 'all' || c.payment_status === paymentFilter;
      const matchesQuery =
        !q ||
        (c.name ?? '').toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        (c.address ?? '').toLowerCase().includes(q);
      return matchesPayment && matchesQuery;
    });
  }, [customers, query, paymentFilter]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
        <p className="text-slate-600 mt-1">
          {customers.length} customer{customers.length === 1 ? '' : 's'} from your orders
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="p-4 border-b border-slate-100 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden />
            <input
              type="text"
              placeholder="Search by name, phone or address..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search customers"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {(['all', 'paid', 'unpaid'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setPaymentFilter(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  paymentFilter === s
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {s === 'all' ? 'All' : s === 'paid' ? 'Paid' : 'Unpaid'}
                <span className="ml-1.5 opacity-60">{counts[s]}</span>
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            title={customers.length === 0 ? 'No customers yet' : 'No matching customers'}
            description={
              customers.length === 0
                ? 'Customers are added automatically when they place an order.'
                : 'Try a different search term or filter.'
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Customer</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase hidden sm:table-cell">Contact</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Orders</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Spent</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase hidden md:table-cell">Last Order</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Payment</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Reach</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-semibold text-sm flex-shrink-0">
                          {(c.name ?? '?').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900 text-sm truncate">{c.name || 'Unknown'}</p>
                          {c.address && <p className="text-xs text-slate-400 truncate max-w-[220px]">{c.address}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 hidden sm:table-cell">
                      <span className="inline-flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" aria-hidden />
                        {c.phone}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-slate-700">{c.total_orders}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-slate-900">
                      {formatMoney(c.total_spent, currency)}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500 hidden md:table-cell">
                      {c.last_order_at ? relativeTime(c.last_order_at) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <PaymentBadge customer={c} />
                        {c.payment_status === 'paid' && c.paid_at && (
                          <span className="text-xs text-slate-400 hidden lg:block" title="Paid at">
                            {relativeTime(c.paid_at)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <a
                        href={`https://wa.me/${c.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-medium rounded-lg transition-colors"
                        aria-label={`Message ${c.name ?? c.phone} on WhatsApp`}
                      >
                        <MessageCircle className="w-3.5 h-3.5" aria-hidden />
                        Chat
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {customers.length === 0 && (
        <div className="mt-6 flex items-center gap-3 p-4 bg-slate-50 rounded-xl text-sm text-slate-500">
          <Users className="w-5 h-5" aria-hidden />
          Every WhatsApp order automatically creates or updates a customer profile here.
        </div>
      )}
    </div>
  );
}