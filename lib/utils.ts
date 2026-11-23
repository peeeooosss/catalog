import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Theme } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function normalizeTheme(theme: Theme): Required<Theme> {
  return {
    primary: theme.primary || '#10B981',
    secondary: theme.secondary || '#64748B',
    accent: theme.accent || '#F59E0B',
    template: theme.template ?? 'modern',
    radius: Math.min(28, Math.max(0, theme.radius ?? 18)),
  };
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
}

export function randomSuffix(length = 4) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let out = '';
  for (let i = 0; i < length; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export function makeId(input: string) {
  const base = slugify(input) || 'item';
  return `${base}-${randomSuffix()}`;
}

export function formatMoney(amount: number, currency = 'INR') {
  const symbols: Record<string, string> = {
    USD: '$',
    INR: '₹',
    EUR: '€',
    GBP: '£',
    AED: 'AED ',
    NGN: '₦',
    PKR: '₨',
    BDT: '৳',
    IDR: 'Rp',
    PHP: '₱',
    ZAR: 'R',
    KES: 'KSh',
  };
  const symbol = symbols[currency] ?? `${currency} `;
  const locale = currency === 'INR' ? 'en-IN' : undefined;
  return `${symbol}${amount.toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function discountPercent(price: number, compareAt?: number | null) {
  if (!compareAt || compareAt <= price) return 0;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

export function relativeTime(iso: string | null) {
  if (!iso) return '—';
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export const ORDER_STATUSES = [
  'submitted',
  'confirmed',
  'packed',
  'delivered',
  'completed',
  'cancelled',
] as const;

export const ORDER_STATUS_META: Record<
  string,
  { label: string; className: string }
> = {
  submitted: { label: 'New', className: 'bg-amber-100 text-amber-700' },
  confirmed: { label: 'Confirmed', className: 'bg-blue-100 text-blue-700' },
  packed: { label: 'Packed', className: 'bg-indigo-100 text-indigo-700' },
  delivered: { label: 'Delivered', className: 'bg-teal-100 text-teal-700' },
  completed: { label: 'Completed', className: 'bg-emerald-100 text-emerald-700' },
  cancelled: { label: 'Cancelled', className: 'bg-rose-100 text-rose-700' },
};

export const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'AED', 'NGN', 'PKR', 'BDT', 'IDR', 'PHP', 'ZAR', 'KES'];

export interface MessageTemplateContext {
  customerName: string;
  orderNumber?: string;
  total?: string;
  storeName: string;
  offerText?: string;
  catalogUrl?: string;
}

export interface MessageTemplate {
  id: string;
  label: string;
  emoji: string;
  build: (ctx: MessageTemplateContext) => string;
}

export const MESSAGE_TEMPLATES: MessageTemplate[] = [
  {
    id: 'thankYou',
    label: 'Thank You',
    emoji: '🙏',
    build: ({ customerName, storeName, orderNumber, total }) =>
      `Hi ${customerName}! 🙏 Thank you for ordering from ${storeName}${
        orderNumber ? ` (Order ${orderNumber}${total ? ` · ${total}` : ''})` : ''
      }. We've got your order and will be in touch shortly. For any questions, just reply here.`,
  },
  {
    id: 'orderConfirmed',
    label: 'Order Confirmed',
    emoji: '✅',
    build: ({ customerName, storeName, orderNumber, total }) =>
      `Hi ${customerName}! ✅ Your order${orderNumber ? ` ${orderNumber}` : ''}${
        total ? ` (${total})` : ''
      } at ${storeName} is confirmed. We'll update you as soon as it's on its way!`,
  },
  {
    id: 'offer',
    label: 'Offer / Discount',
    emoji: '🏷️',
    build: ({ customerName, storeName, offerText, catalogUrl }) =>
      `Hi ${customerName}! 🏷️ Great news from ${storeName}: ${
        offerText || 'we have fresh offers running right now.'
      } Check the catalog${catalogUrl ? ` here: ${catalogUrl}` : ''} and place your next order today!`,
  },
  {
    id: 'paymentReminder',
    label: 'Payment Reminder',
    emoji: '💳',
    build: ({ customerName, storeName, orderNumber, total }) =>
      `Hi ${customerName}! 💳 A friendly reminder about your pending payment${
        total ? ` of ${total}` : ''
      } for order ${orderNumber ?? 'your recent order'} at ${storeName}. Please complete it and we'll dispatch your order right away. Thank you!`,
  },
  {
    id: 'newArrivals',
    label: 'New Arrivals',
    emoji: '✨',
    build: ({ customerName, storeName, catalogUrl }) =>
      `Hi ${customerName}! ✨ New products just arrived at ${storeName}. Don't miss out — take a look${
        catalogUrl ? ` here: ${catalogUrl}` : ''
      } and grab your favourites before they sell out!`,
  },
  {
    id: 'custom',
    label: 'Custom',
    emoji: '✏️',
    build: ({ customerName }) => customerName ? `Hi ${customerName}, ` : '',
  },
];

export function buildWhatsAppMessage(id: string, ctx: MessageTemplateContext) {
  return MESSAGE_TEMPLATES.find((t) => t.id === id)?.build(ctx) ?? '';
}

export function whatsAppUrl(phone: string, text?: string) {
  const digits = phone.replace(/[^0-9]/g, '');
  if (!digits) return 'https://wa.me';
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
}

export function parseCsvRows(raw: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  const text = raw.replace(/^\uFEFF/, '');

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
      continue;
    }
    if (char === '"') {
      quoted = true;
    } else if (char === ',') {
      row.push(field.trim());
      field = '';
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[i + 1] === '\n') i++;
      row.push(field.trim());
      if (row.some((cell) => cell.length > 0)) rows.push(row);
      row = [];
      field = '';
    } else {
      field += char;
    }
  }

  row.push(field.trim());
  if (row.some((cell) => cell.length > 0)) rows.push(row);
  return rows;
}

export function normalizeProductImages(raw: unknown): string[] {
  let values: unknown[] = [];
  if (Array.isArray(raw)) {
    values = raw;
  } else if (typeof raw === 'string' && raw.trim()) {
    try {
      const parsed = JSON.parse(raw);
      values = Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      values = [raw];
    }
  }
  return values
    .filter((value): value is string => typeof value === 'string')
    .map((value) => value.trim())
    .filter(Boolean)
    .slice(0, 3);
}

export function isUploadThingUrl(value: string) {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:') return false;
    return ['utfs.io', 'uploadthing.com'].some(
      (host) => url.hostname === host || url.hostname.endsWith(`.${host}`)
    );
  } catch {
    return false;
  }
}

export function getUploadedFileUrl(file: unknown) {
  const uploaded = file as { ufsUrl?: unknown; url?: unknown } | null;
  const value = typeof uploaded?.ufsUrl === 'string' ? uploaded.ufsUrl : typeof uploaded?.url === 'string' ? uploaded.url : '';
  return isUploadThingUrl(value) ? value : '';
}

export function getUploadErrorMessage(error: unknown) {
  if (!error || typeof error !== 'object') return 'Upload failed. Please try again.';
  const uploadError = error as { message?: unknown; code?: unknown; data?: unknown };
  const data = uploadError.data as { message?: unknown; error?: unknown } | undefined;
  const detail = [data?.message, data?.error, uploadError.message, uploadError.code].find(
    (value): value is string => typeof value === 'string' && value.trim().length > 0
  );
  return detail ? detail.trim() : 'Upload failed. Please try again.';
}
