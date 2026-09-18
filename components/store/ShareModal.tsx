'use client';
import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';
import { X, Copy, Check, Link2, MessageCircle, Instagram, Facebook, Twitter } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeUrl: string;
  businessName: string;
}

export default function ShareModal({ isOpen, onClose, storeUrl, businessName }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  const shareText = useMemo(
    () => `Check out ${businessName} — order directly via WhatsApp! ${storeUrl}`,
    [businessName, storeUrl]
  );

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(storeUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not copy the link automatically.');
    }
  };

  const socialLinks = [
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      href: `https://wa.me/?text=${encodeURIComponent(shareText)}`,
      color: 'bg-emerald-500 hover:bg-emerald-600',
    },
    {
      name: 'Facebook',
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(storeUrl)}`,
      color: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      name: 'Twitter',
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
      color: 'bg-slate-900 hover:bg-slate-800',
    },
    {
      name: 'Instagram',
      icon: Instagram,
      action: 'instagram' as const,
      color: 'bg-gradient-to-br from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700',
    },
  ];

  const handleInstagram = async () => {
    try {
      await navigator.clipboard.writeText(storeUrl);
      toast.success('Link copied — paste it in your bio or story!');
      window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer');
    } catch {
      toast.error('Could not copy the link automatically.');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 24, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Share this store"
            className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Link2 className="w-5 h-5 text-emerald-500" aria-hidden />
                Share {businessName}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                aria-label="Close share dialog"
              >
                <X className="w-5 h-5" aria-hidden />
              </button>
            </div>

            <div className="flex flex-col items-center mb-6">
              <div className="bg-white p-3 rounded-2xl border-2 border-slate-100 shadow-sm mb-3">
                <QRCodeSVG
                  value={storeUrl}
                  size={148}
                  level="M"
                  aria-label={`QR code for ${storeUrl}`}
                />
              </div>
              <p className="text-xs text-slate-500">Scan to open this catalog on any phone</p>
            </div>

            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-2 mb-4">
              <span className="flex-1 text-sm font-mono text-slate-600 truncate">{storeUrl}</span>
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" aria-hidden /> : <Copy className="w-3.5 h-3.5" aria-hidden />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                if (social.action === 'instagram') {
                  return (
                    <motion.button
                      key={social.name}
                      whileTap={{ scale: 0.92 }}
                      onClick={handleInstagram}
                      className={`${social.color} text-white rounded-xl px-2 py-3 flex flex-col items-center gap-1.5 transition-colors`}
                      aria-label={`Share on ${social.name}`}
                    >
                      <Icon className="w-5 h-5" aria-hidden />
                      <span className="text-[10px] font-semibold">{social.name}</span>
                    </motion.button>
                  );
                }
                return (
                  <motion.a
                    key={social.name}
                    whileTap={{ scale: 0.92 }}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${social.color} text-white rounded-xl px-2 py-3 flex flex-col items-center gap-1.5 transition-colors`}
                    aria-label={`Share on ${social.name}`}
                  >
                    <Icon className="w-5 h-5" aria-hidden />
                    <span className="text-[10px] font-semibold">{social.name}</span>
                  </motion.a>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}