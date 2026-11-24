'use client';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { AlertCircle, CheckCircle2, Link2, Loader2, RotateCcw, Trash2, UploadCloud } from 'lucide-react';
import { useUploadThing } from '@/lib/uploadthing';
import { getUploadErrorMessage, getUploadedFileUrl } from '@/lib/utils';

const MAX_FILE_SIZE = 4 * 1024 * 1024;

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ImageUploader({
  value,
  onChange,
  label = 'Image',
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}) {
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [manual, setManual] = useState(value);
  const [uploadingFile, setUploadingFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [retryFile, setRetryFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadErrorRef = useRef('');

  const { startUpload, isUploading } = useUploadThing('productImage', {
    onUploadProgress: setProgress,
    onUploadError: (uploadError) => {
      const message = getUploadErrorMessage(uploadError);
      uploadErrorRef.current = message;
      setError(message);
      setNotice('');
      console.error('UploadThing upload failed', uploadError);
    },
  });

  useEffect(() => {
    if (!uploadingFile) {
      setPreview('');
      return;
    }
    const url = URL.createObjectURL(uploadingFile);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [uploadingFile]);

  useEffect(() => {
    setManual(value);
  }, [value]);

  async function uploadSelected(file: File | undefined) {
    if (!file) return;

    uploadErrorRef.current = '';
    if (!file.type.startsWith('image/')) {
      setError('Choose a JPG, PNG, or WEBP image.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError('Image must be 4MB or smaller.');
      return;
    }

    setError('');
    setNotice('');
    setRetryFile(null);
    setProgress(0);
    setUploadingFile(file);

    try {
      const uploaded = await startUpload([file]);
      const url = (uploaded ?? []).map(getUploadedFileUrl).filter(Boolean)[0];
      if (!url) {
        setError(uploadErrorRef.current || 'UploadThing did not return a valid image URL.');
        setRetryFile(file);
        return;
      }
      onChange(url);
      setManual(url);
      setNotice('Logo uploaded and ready to save.');
      setProgress(100);
    } catch (uploadError) {
      const message = getUploadErrorMessage(uploadError);
      uploadErrorRef.current = message;
      setError(message);
      setRetryFile(file);
    } finally {
      setUploadingFile(null);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  function useManualUrl() {
    const url = manual.trim();
    if (!url) {
      setError('Paste an image URL first.');
      return;
    }
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== 'https:') throw new Error('invalid protocol');
      onChange(url);
      setError('');
      setNotice('Logo URL added and ready to save.');
    } catch {
      setError('Enter a valid https:// image URL.');
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <label className="block text-sm font-medium text-slate-700">{label}</label>
        <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-0.5 text-xs">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`rounded-md px-2 py-1 font-medium transition-colors ${
              mode === 'upload' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Upload
          </button>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`flex items-center gap-1 rounded-md px-2 py-1 font-medium transition-colors ${
              mode === 'url' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Link2 className="h-3 w-3" aria-hidden />
            URL
          </button>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
          {preview ? (
            <Image src={preview} alt="Uploading logo preview" width={80} height={80} sizes="80px" className="h-full w-full object-cover" unoptimized />
          ) : value ? (
            <Image src={value} alt="Store logo preview" width={80} height={80} sizes="80px" className="h-full w-full object-cover" unoptimized />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">No logo</div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          {mode === 'upload' ? (
            <div
              role="button"
              tabIndex={0}
              onClick={() => inputRef.current?.click()}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') inputRef.current?.click();
              }}
              onDragOver={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDragging(false);
                void uploadSelected(event.dataTransfer.files?.[0]);
              }}
              className={`flex min-h-20 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-3 py-3 text-center transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                dragging ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300 bg-slate-50 hover:border-emerald-400 hover:bg-emerald-50/50'
              } ${isUploading ? 'pointer-events-none opacity-60' : ''}`}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin text-emerald-600" aria-hidden />
                  <p className="mt-1.5 text-xs font-medium text-slate-700">Uploading… {progress}%</p>
                  {uploadingFile && <p className="mt-0.5 max-w-full truncate text-[10px] text-slate-400">{uploadingFile.name} • {formatSize(uploadingFile.size)}</p>}
                </>
              ) : (
                <>
                  <UploadCloud className="h-5 w-5 text-emerald-600" aria-hidden />
                  <p className="mt-1.5 text-xs font-medium text-slate-700">Drop logo here or click to browse</p>
                  <p className="mt-0.5 text-[10px] text-slate-400">JPG, PNG or WEBP • Max 4MB</p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="url"
                  value={manual}
                  onChange={(event) => setManual(event.target.value)}
                  placeholder="https://example.com/logo.png"
                  className="input-field flex-1 text-sm"
                />
                <button type="button" onClick={useManualUrl} className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800">
                  Use
                </button>
              </div>
              <p className="text-[11px] text-slate-400">Paste a direct image URL. Uploading is recommended.</p>
            </div>
          )}

          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(event) => void uploadSelected(event.target.files?.[0])}
          />

          {isUploading && (
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${progress}%` }} />
            </div>
          )}

          {value && !isUploading && (
            <button
              type="button"
              onClick={() => {
                onChange('');
                setManual('');
                setNotice('');
              }}
              className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-rose-600 hover:text-rose-700"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden />
              Remove logo
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs text-rose-700">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden />
          <div className="flex-1">
            <p className="font-medium">Logo upload failed</p>
            <p className="mt-0.5 break-words">{error}</p>
            {retryFile && !isUploading && (
              <button
                type="button"
                onClick={() => void uploadSelected(retryFile)}
                className="mt-2 inline-flex items-center gap-1 rounded-lg bg-rose-600 px-2.5 py-1.5 font-medium text-white hover:bg-rose-700"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden />
                Retry
              </button>
            )}
          </div>
        </div>
      )}

      {notice && !error && (
        <p className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
          <CheckCircle2 className="h-4 w-4" aria-hidden />
          {notice}
        </p>
      )}
    </div>
  );
}
