'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { Check } from 'lucide-react';

export default function CopyStoreLink({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);
  const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const storeUrl = `${base.replace(/\/$/, '')}/store/${slug}`;

  const handleCopy = async () => {
    try {
      const shareData = { title: 'My store', text: 'Check out my store', url: storeUrl };
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share(shareData);
        return;
      }
      await navigator.clipboard.writeText(storeUrl);
      setCopied(true);
      toast.success('Store link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* user cancelled share */
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur rounded-xl p-3 mb-4">
      <p className="text-sm font-mono truncate text-white">{storeUrl.replace(/^https?:\/\//, '')}</p>
      <button
        onClick={handleCopy}
        className="mt-3 w-full py-2.5 bg-white text-emerald-600 font-bold rounded-xl hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2"
      >
        {copied ? <Check className="w-4 h-4" aria-hidden /> : null}
        {copied ? 'Copied!' : 'Share Link'}
      </button>
    </div>
  );
}