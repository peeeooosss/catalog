'use client';
import Image from 'next/image';
import { ImagePlus, Trash2 } from 'lucide-react';
import { UploadButton } from '@/lib/uploadthing';
import { isUploadThingUrl } from '@/lib/utils';

type UploadError = { code?: string; message?: string; data?: unknown } & Error;

export default function ProductImagesUploader({
  value,
  onChange,
}: {
  value: string[];
  onChange: (urls: string[]) => void;
}) {
  const images = value.filter((url) => url.startsWith('http')).slice(0, 3);
  const full = images.length >= 3;

  const handleError = (error: UploadError) => {
    const data = error.data as { message?: string; error?: string } | undefined;
    console.error('UploadThing error:', error);
    window.alert(`Upload failed: ${data?.message ?? data?.error ?? error.code ?? 'Please try again.'}`);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-800">Product images</p>
          <p className="mt-0.5 text-xs text-slate-500">Upload up to 3 images. All images are stored on UploadThing.</p>
        </div>
        <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 shadow-sm">
          {images.length}/3
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, index) => {
          const url = images[index];
          return (
            <div
              key={index}
              className="relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-white"
            >
              {url ? (
                <>
                  <Image src={url} alt={`Product image ${index + 1}`} fill sizes="140px" className="object-cover" unoptimized />
                  <button
                    type="button"
                    onClick={() => onChange(images.filter((_, i) => i !== index))}
                    className="absolute right-1.5 top-1.5 rounded-lg bg-white/90 p-1.5 text-slate-600 shadow-sm transition-colors hover:bg-rose-50 hover:text-rose-600"
                    aria-label={`Remove image ${index + 1}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden />
                  </button>
                  {index === 0 && (
                    <span className="absolute bottom-1.5 left-1.5 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white">
                      Cover
                    </span>
                  )}
                </>
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-slate-300">
                  <ImagePlus className="h-5 w-5" aria-hidden />
                  <span className="text-[10px]">Empty</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4">
        {full ? (
          <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-sm font-medium text-emerald-700">
            All 3 image slots are full. Remove one to add another.
          </p>
        ) : (
          <UploadButton
            endpoint="productImages"
            disabled={full}
            onClientUploadComplete={(res) => {
              const urls = (res ?? [])
                .map((file) => {
                  const uploaded = file as { ufsUrl?: string; url?: string };
                  return uploaded.ufsUrl ?? uploaded.url ?? '';
                })
                .filter(isUploadThingUrl);
              if (urls.length) onChange([...images, ...urls].filter((url, i, all) => all.indexOf(url) === i).slice(0, 3));
            }}
            onUploadError={handleError}
            appearance={{
              button:
                'w-full bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl px-4 py-3 ut-uploading:cursor-not-allowed',
              allowedContent: 'hidden',
            }}
            content={{ button: images.length ? 'Add more images' : 'Upload product images' }}
          />
        )}
      </div>
    </div>
  );
}
