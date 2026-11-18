'use client';
import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';
import { X, Copy, Check, Link2, MessageCircle, Instagram, Facebook, Twitter, Share2 } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeUrl: string;
  businessName: string;
}

export default function ShareModal({ isOpen, onClose, storeUrl, businessName }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    setCanShare(typeof navigator !== 'undefined' && typeof navigator.share === 'function');
  }, []);

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

  const handleNativeShare = async () => {
    try {
      await navigator.share({ title: businessName, text: shareText, url: storeUrl });
    } catch {
      toast.error('Sharing was cancelled.');
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', damping: 24, stiffness: 300 }}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Share this store"
            className="w-full max-w-sm overflow-hidden rounded-3xl border border-white/60 bg-white shadow-lift"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
                <Link2 className="h-5 w-5 text-emerald-500" aria-hidden />
                Share {businessName}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
                aria-label="Close share dialog"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>

            <div className="p-5">
              <div className="mb-5 flex flex-col items-center rounded-2xl bg-gradient-to-br from-emerald-50 to-sky-50 p-5">
                <div className="mb-3 rounded-2xl border border-white bg-white p-3 shadow-sm">
                  <QRCodeSVG value={storeUrl} size={140} level="M" aria-label={`QR code for ${storeUrl}`} />
                </div>
                <p className="text-xs font-medium text-slate-500">Scan to open this catalog on any phone</p>
              </div>

              <div className="mb-4 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2">
                <span className="flex-1 truncate font-mono text-sm text-slate-600">{storeUrl}</span>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-emerald-600"
                >
                  {copied ? <Check className="h-3.5 w-3.5" aria-hidden /> : <Copy className="h-3.5 w-3.5" aria-hidden />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>

              {canShare && (
                <button
                  type="button"
                  onClick={handleNativeShare}
                  className="btn-primary mb-4 w-full py-3"
                >
                  <Share2 className="h-4 w-4" aria-hidden />
                  Share with your apps
                </button>
              )}

              <div className="grid grid-cols-4 gap-2">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  if (social.action === 'instagram') {
                    return (
                      <motion.button
                        key={social.name}
                        type="button"
                        whileTap={{ scale: 0.92 }}
                        onClick={handleInstagram}
                        className={`${social.color} flex flex-col items-center gap-1.5 rounded-xl px-2 py-3 text-white transition-colors`}
                        aria-label={`Share on ${social.name}`}
                      >
                        <Icon className="h-5 w-5" aria-hidden />
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
                      className={`${social.color} flex flex-col items-center gap-1.5 rounded-xl px-2 py-3 text-white transition-colors`}
                      aria-label={`Share on ${social.name}`}
                    >
                      <Icon className="h-5 w-5" aria-hidden />
                      <span className="text-[10px] font-semibold">{social.name}</span>
                    </motion.a>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
