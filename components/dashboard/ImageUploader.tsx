'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Upload, Link2 } from 'lucide-react';
import { UploadButton } from '@/lib/uploadthing';

type UploadError = { code?: string; message?: string; data?: unknown } & Error;

export default function ImageUploader({
  value,
  onChange,
  label = 'Product Image',
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}) {
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [manual, setManual] = useState(value);
  const [error, setError] = useState('');

  const handleError = (e: UploadError) => {
    console.error('UploadThing error:', e);
    const apiError = (e as { data?: { message?: string; error?: string } }).data;
    const detail = apiError?.message ?? apiError?.error ?? '';
    const code = e.code || 'UPLOAD_FAILED';
    setError(detail || code);
    alert(`Upload failed: ${detail || code}`);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-slate-700">{label}</label>
        <div className="flex items-center gap-1 text-xs">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
              mode === 'upload' ? 'bg-emerald-100 text-emerald-700' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <Upload className="w-3 h-3 inline mr-1" aria-hidden />
            Upload
          </button>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
              mode === 'url' ? 'bg-emerald-100 text-emerald-700' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <Link2 className="w-3 h-3 inline mr-1" aria-hidden />
            URL
          </button>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="w-20 h-20 rounded-xl overflow-hidden relative flex-shrink-0 border border-slate-200 bg-slate-50">
          {value ? (
            <Image src={value} alt="Preview" fill sizes="80px" className="object-cover" unoptimized />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs">No image</div>
          )}
        </div>

        <div className="flex-1">
          {mode === 'upload' ? (
            <UploadButton
              endpoint="productImage"
              onClientUploadComplete={(res) => {
                const file = res?.[0] as { ufsUrl?: string; url?: string } | undefined;
                const url = file?.ufsUrl ?? file?.url ?? '';
                if (url) {
                  onChange(url);
                  setManual(url);
                }
              }}
              onUploadError={(error: UploadError) => handleError(error)}
              appearance={{
                button:
                  'w-full bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-xl px-4 py-3 ut-uploading:cursor-not-allowed',
                allowedContent: 'hidden',
              }}
              content={{ button: 'Choose image to upload' }}
            />
          ) : (
            <div className="flex gap-2">
              <input
                type="url"
                value={manual}
                onChange={(e) => setManual(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="flex-1 px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  setError('');
                  onChange(manual);
                }}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-xl"
              >
                Use
              </button>
            </div>
          )}
          <p className="text-xs text-slate-400 mt-1.5">JPG/PNG/WebP up to 4MB. Recommended square image.</p>
          {error && <p className="text-xs text-rose-500 mt-1.5">Upload failed: {error}</p>}
        </div>
      </div>
    </div>
  );
}
