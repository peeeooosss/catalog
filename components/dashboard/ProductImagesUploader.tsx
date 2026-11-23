'use client';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { AlertCircle, CheckCircle2, ImagePlus, Loader2, RotateCcw, Trash2, UploadCloud } from 'lucide-react';
import { useUploadThing } from '@/lib/uploadthing';
import { getUploadErrorMessage, getUploadedFileUrl } from '@/lib/utils';

type Preview = { name: string; url: string; size: string };

const MAX_IMAGES = 3;
const MAX_FILE_SIZE = 4 * 1024 * 1024;

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ProductImagesUploader({
  value,
  onChange,
}: {
  value: string[];
  onChange: (urls: string[]) => void;
}) {
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<Preview[]>([]);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [retryFiles, setRetryFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { startUpload, isUploading } = useUploadThing('productImages', {
    onUploadProgress: setProgress,
    onUploadError: (uploadError) => {
      setError(getUploadErrorMessage(uploadError));
      setNotice('');
    },
  });

  useEffect(() => {
    const nextPreviews = uploadingFiles.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
      size: formatSize(file.size),
    }));
    setPreviews(nextPreviews);
    return () => nextPreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
  }, [uploadingFiles]);

  const slots = Math.max(0, MAX_IMAGES - value.length - uploadingFiles.length);

  async function uploadSelected(input: FileList | File[] | null | undefined) {
    const selected = Array.from(input ?? []);
    if (!selected.length) return;

    const imageFiles = selected.filter((file) => file.type.startsWith('image/'));
    const oversized = imageFiles.filter((file) => file.size > MAX_FILE_SIZE);
    const invalidCount = selected.length - imageFiles.length;
    const accepted = imageFiles
      .filter((file) => file.size <= MAX_FILE_SIZE)
      .slice(0, Math.max(0, MAX_IMAGES - value.length - uploadingFiles.length));

    const issues: string[] = [];
    if (invalidCount) issues.push(`${invalidCount} non-image file${invalidCount === 1 ? '' : 's'} skipped`);
    if (oversized.length) issues.push(`${oversized.length} file${oversized.length === 1 ? '' : 's'} over 4MB skipped`);
    if (selected.length - accepted.length > issues.length) issues.push(`Only ${MAX_IMAGES} images can be added`);

    setError(issues.join(' • '));
    setNotice('');
    setRetryFiles([]);
    if (!accepted.length) return;

    setProgress(0);
    setUploadingFiles((current) => [...current, ...accepted]);

    try {
      const uploaded = await startUpload(accepted);
      const urls = (uploaded ?? []).map(getUploadedFileUrl).filter(Boolean);
      if (!urls.length) {
        setError((current) => current || 'Upload failed. Check your connection and try again.');
        setRetryFiles(accepted);
        return;
      }
      onChange([...value, ...urls].slice(0, MAX_IMAGES));
      setNotice(`${urls.length} image${urls.length === 1 ? '' : 's'} added`);
      setProgress(100);
    } catch (uploadError) {
      setError(getUploadErrorMessage(uploadError));
      setRetryFiles(accepted);
    } finally {
      setUploadingFiles((current) => current.filter((file) => !accepted.includes(file)));
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  function removeImage(index: number) {
    onChange(value.filter((_, currentIndex) => currentIndex !== index));
    setNotice('');
  }

  function makeCover(index: number) {
    if (index === 0) return;
    const next = [...value];
    const [cover] = next.splice(index, 1);
    onChange([cover, ...next]);
  }

  function removeUploadingFile(file: File) {
    setUploadingFiles((current) => current.filter((item) => item !== file));
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-800">Product images</p>
          <p className="text-xs text-slate-500 mt-0.5">First image is the cover. Add up to 3 photos.</p>
        </div>
        <span className="text-xs font-medium text-slate-500">{value.length}/{MAX_IMAGES}</span>
      </div>

      {(value.length > 0 || previews.length > 0) && (
        <div className="grid grid-cols-3 gap-3">
          {value.map((url, index) => (
            <div
              key={`${url}-${index}`}
              className={`relative aspect-square rounded-2xl overflow-hidden border bg-slate-50 group ${
                index === 0 ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200'
              }`}
            >
              <Image src={url} alt={`Product image ${index + 1}`} fill sizes="160px" className="object-cover" unoptimized />
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-gradient-to-t from-slate-950/80 to-transparent p-2">
                {index === 0 ? (
                  <span className="rounded-md bg-emerald-500 px-2 py-1 text-[10px] font-semibold text-white">Cover</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => makeCover(index)}
                    disabled={isUploading}
                    className="rounded-md bg-white/90 px-2 py-1 text-[10px] font-semibold text-slate-800 hover:bg-white disabled:opacity-50"
                  >
                    Make cover
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  disabled={isUploading}
                  aria-label={`Remove image ${index + 1}`}
                  className="rounded-md bg-white/90 p-1.5 text-rose-600 hover:bg-white disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" aria-hidden />
                </button>
              </div>
            </div>
          ))}

          {previews.map((preview, index) => (
            <div key={`${preview.name}-${index}`} className="relative aspect-square rounded-2xl overflow-hidden border border-emerald-300 bg-slate-900">
              <Image src={preview.url} alt={preview.name} fill sizes="160px" className="object-cover opacity-80" unoptimized />
              <div className="absolute inset-0 flex flex-col justify-between bg-slate-950/45 p-2">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeUploadingFile(uploadingFiles[index])}
                    aria-label={`Cancel ${preview.name}`}
                    className="rounded-md bg-white/90 p-1.5 text-slate-700 hover:bg-white"
                  >
                    <Trash2 className="w-3.5 h-3.5" aria-hidden />
                  </button>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-[10px] font-medium text-white">
                    <Loader2 className="w-3 h-3 animate-spin" aria-hidden />
                    Uploading
                  </div>
                  <p className="mt-1 truncate text-[10px] text-white/80">{preview.name}</p>
                  <p className="text-[9px] text-white/60">{preview.size}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {slots > 0 && (
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
            void uploadSelected(event.dataTransfer.files);
          }}
          className={`flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-6 text-center transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
            dragging ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300 bg-slate-50 hover:border-emerald-400 hover:bg-emerald-50/50'
          } ${isUploading ? 'pointer-events-none opacity-60' : ''}`}
        >
          <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-emerald-600">
            <UploadCloud className="w-5 h-5" aria-hidden />
          </div>
          <p className="mt-3 text-sm font-medium text-slate-800">
            {isUploading ? 'Uploading your photos…' : 'Drop photos here or click to browse'}
          </p>
          <p className="mt-1 text-xs text-slate-500">JPG, PNG or WEBP • Max 4MB each • {slots} slot{slots === 1 ? '' : 's'} left</p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(event) => void uploadSelected(event.target.files)}
      />

      {isUploading && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span className="flex items-center gap-1.5"><Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden /> Uploading to secure storage</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden />
          <div className="flex-1">
            <p className="font-medium">Upload didn’t complete</p>
            <p className="mt-0.5 break-words">{error}</p>
            {retryFiles.length > 0 && !isUploading && (
              <button
                type="button"
                onClick={() => void uploadSelected(retryFiles)}
                className="mt-2 inline-flex items-center gap-1 rounded-lg bg-rose-600 px-2.5 py-1.5 font-medium text-white hover:bg-rose-700"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden />
                Retry upload
              </button>
            )}
          </div>
        </div>
      )}

      {notice && !error && (
        <p className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
          <CheckCircle2 className="w-4 h-4" aria-hidden />
          {notice}
        </p>
      )}

      {value.length === 0 && previews.length === 0 && !isUploading && (
        <p className="flex items-center gap-1.5 text-xs text-slate-400">
          <ImagePlus className="w-3.5 h-3.5" aria-hidden />
          Products without photos appear with a placeholder image.
        </p>
      )}
    </div>
  );
}
