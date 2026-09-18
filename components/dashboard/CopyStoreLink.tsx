'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { Check } from 'lucide-react';

export default function CopyStoreLink() {
  const [copied, setCopied] = useState(false);
  const storeUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://localhost:3000'}/store/lumiere-boutique`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(storeUrl);
      setCopied(true);
      toast.success('Store link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not copy the link. Copy it manually below.');
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
        {copied ? 'Copied!' : 'Copy Link'}
      </button>
    </div>
  );
}