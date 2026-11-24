'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useFormState } from 'react-dom';
import { toast } from 'sonner';
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Loader2,
  RotateCcw,
  Trash2,
  Upload,
  UploadCloud,
} from 'lucide-react';
import Modal from '@/components/ui/Modal';
import SubmitButton from '@/components/auth/SubmitButton';
import { useUploadThing } from '@/lib/uploadthing';
import { getUploadErrorMessage, getUploadedFileUrl, parseCsvRows } from '@/lib/utils';
import { importProductsAction } from '@/lib/actions/products';
import type { ActionState } from '@/lib/actions/auth';

type UploadedImage = { name: string; url: string };
type Preview = { name: string; url: string; size: string };

const TEMPLATE = [
  'name,price,mrp,category,stock,unit,description,image1,image2,image3',
  'Basmati Rice 5kg,24.99,30,Staples,20,5kg pack,Fragrant long grain rice,rice-1.jpg,rice-2.jpg,',
  'Cotton T-Shirt,12.50,18,Apparel,35,piece,Soft breathable cotton,shirt-1.jpg,shirt-2.jpg,shirt-3.jpg',
].join('\n');

const MAX_BULK_IMAGES = 100;
const MAX_FILE_SIZE = 4 * 1024 * 1024;

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function quoteCsv(value: string) {
  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

function replaceImageTokens(csv: string, imageUrls: Record<string, string>, autoUrls: string[] = []) {
  const rows = parseCsvRows(csv);
  let autoIndex = 0;

  const mapped = rows.map((row) => {
    const next = [...row];
    const imageIndexes = [next.length - 3, next.length - 2, next.length - 1].filter((i) => i >= 0);

    for (const index of imageIndexes) {
      const cell = next[index] ?? '';
      const mappedCell = imageUrls[cell.trim().toLowerCase()];
      if (mappedCell) {
        next[index] = mappedCell;
      } else if (!cell.trim() && autoIndex < autoUrls.length) {
        next[index] = autoUrls[autoIndex++];
      }
    }

    return next.map(quoteCsv).join(',');
  });

  return mapped.join('\n');
}

export default function BulkImportModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [mode, setMode] = useState<'upload' | 'paste'>('upload');
  const [csv, setCsv] = useState('');
  const [fileName, setFileName] = useState('');
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<Preview[]>([]);
  const [progress, setProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const [retryFiles, setRetryFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadErrorRef = useRef('');
  const [state, formAction] = useFormState<ActionState, FormData>(importProductsAction, {});

  const rows = useMemo(() => parseCsvRows(csv), [csv]);
  const uploadedUrls = useMemo(() => uploadedImages.map((image) => image.url), [uploadedImages]);
  const processedCsv = useMemo(() => replaceImageTokens(csv, imageUrls, uploadedUrls), [
    csv,
    imageUrls,
    uploadedUrls,
  ]);

  const imageCells = useMemo(
    () => rows.slice(1).flatMap((row) => row.slice(-3).map((cell) => (cell ?? '').trim())),
    [rows]
  );
  const matchedImageCount = imageCells.filter((cell) => cell && imageUrls[cell.toLowerCase()]).length;
  const blankImageCells = imageCells.filter((cell) => !cell).length;
  const remainingSlots = Math.max(0, MAX_BULK_IMAGES - uploadedImages.length - uploadingFiles.length);

  const { startUpload, isUploading } = useUploadThing('bulkProductImages', {
    onUploadProgress: setProgress,
    onUploadError: (error) => {
      const message = getUploadErrorMessage(error);
      uploadErrorRef.current = message;
      setUploadError(message);
      toast.error(`Image upload failed: ${message}`);
      console.error('UploadThing upload failed', error);
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

  useEffect(() => {
    if (state.success) toast.success(state.success);
    if (state.error) toast.error(state.error);
  }, [state]);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Product details file must be 2MB or smaller.');
      return;
    }
    setCsv(await file.text());
    setFileName(file.name);
  };

  const downloadTemplate = () => {
    const url = URL.createObjectURL(new Blob([TEMPLATE], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'catalogpro-products-template.csv';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  async function uploadSelected(input: FileList | File[] | null | undefined) {
    const selected = Array.from(input ?? []);
    if (!selected.length) return;

    uploadErrorRef.current = '';
    const imageFiles = selected.filter((file) => file.type.startsWith('image/'));
    const oversized = imageFiles.filter((file) => file.size > MAX_FILE_SIZE);
    const invalidCount = selected.length - imageFiles.length;
    const accepted = imageFiles
      .filter((file) => file.size <= MAX_FILE_SIZE)
      .slice(0, Math.max(0, MAX_BULK_IMAGES - uploadedImages.length - uploadingFiles.length));

    const issues: string[] = [];
    if (invalidCount) issues.push(`${invalidCount} non-image file${invalidCount === 1 ? '' : 's'} skipped`);
    if (oversized.length) issues.push(`${oversized.length} file${oversized.length === 1 ? '' : 's'} over 4MB skipped`);
    if (selected.length - accepted.length > issues.length) issues.push(`Only ${MAX_BULK_IMAGES} images can be added`);

    setUploadError(issues.join(' • '));
    setRetryFiles([]);
    if (!accepted.length) return;

    setProgress(0);
    setUploadingFiles((current) => [...current, ...accepted]);

    try {
      const uploaded = await startUpload(accepted);
      const entries = (uploaded ?? [])
        .map((file) => ({
          name: String((file as { name?: unknown }).name ?? '').trim(),
          url: getUploadedFileUrl(file),
        }))
        .filter((entry) => entry.name && entry.url);

      if (!entries.length) {
        setUploadError(uploadErrorRef.current || 'UploadThing did not return valid image URLs.');
        setRetryFiles(accepted);
        return;
      }

      setUploadedImages((prev) => {
        const merged = [...prev, ...entries];
        return merged.filter((entry, index) => merged.findIndex((item) => item.url === entry.url) === index);
      });
      setImageUrls((prev) => {
        const next = { ...prev };
        entries.forEach((entry) => {
          next[entry.name.toLowerCase()] = entry.url;
        });
        return next;
      });
      setProgress(100);
      toast.success(`${entries.length} image${entries.length === 1 ? '' : 's'} uploaded.`);
    } catch (error) {
      const message = getUploadErrorMessage(error);
      uploadErrorRef.current = message;
      setUploadError(message);
      toast.error(`Image upload failed: ${message}`);
      setRetryFiles(accepted);
    } finally {
      setUploadingFiles((current) => current.filter((file) => !accepted.includes(file)));
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  function removeUploadedImage(image: UploadedImage) {
    setUploadedImages((prev) => prev.filter((item) => item.url !== image.url));
    setImageUrls((prev) => {
      const next = { ...prev };
      const key = image.name.toLowerCase();
      if (next[key] === image.url) delete next[key];
      return next;
    });
  }

  function clearImages() {
    setUploadedImages([]);
    setImageUrls({});
    setUploadError('');
    setRetryFiles([]);
  }

  function removeUploadingFile(file: File) {
    setUploadingFiles((current) => current.filter((item) => item !== file));
  }

  return (
    <Modal open={open} onClose={onClose} title="Bulk import products" maxWidth="max-w-3xl">
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
              mode === 'upload' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileSpreadsheet className="h-4 w-4" aria-hidden />
            Upload file
          </button>
          <button
            type="button"
            onClick={() => setMode('paste')}
            className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
              mode === 'paste' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload className="h-4 w-4" aria-hidden />
            Paste CSV
          </button>
        </div>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="csv" value={processedCsv} />

          {mode === 'upload' ? (
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-6 py-8 text-center transition-colors hover:border-emerald-300 hover:bg-emerald-50/50">
              <FileSpreadsheet className="h-8 w-8 text-emerald-500" aria-hidden />
              <span className="text-sm font-semibold text-slate-800">
                {fileName || 'Choose product details CSV'}
              </span>
              <span className="text-xs text-slate-500">CSV up to 2MB. Quoted names with commas are supported.</span>
              <input
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(event) => handleFile(event.target.files?.[0])}
              />
            </label>
          ) : (
            <textarea
              value={csv}
              onChange={(event) => setCsv(event.target.value)}
              rows={8}
              placeholder={'name,price,mrp,category,stock,unit,image1,image2,image3\nBasmati Rice 5kg,24.99,30,Staples,20,5kg pack,rice-1.jpg,rice-2.jpg,'}
              className="input-field font-mono text-xs"
            />
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
            <p className="text-xs text-slate-500">
              Columns: <span className="font-mono">name, price, mrp, category, stock, unit, description, image1, image2, image3</span>
            </p>
            <button type="button" onClick={downloadTemplate} className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700">
              <Download className="h-3.5 w-3.5" aria-hidden />
              Download template
            </button>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-800">Product images</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  Match by filename in image1–image3, or leave cells blank to auto-fill uploaded images in order.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 shadow-sm">
                  {uploadedImages.length} uploaded
                </span>
                {uploadedImages.length > 0 && !isUploading && (
                  <button type="button" onClick={clearImages} className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-rose-600" aria-label="Clear uploaded images">
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </button>
                )}
              </div>
            </div>

            {csv.trim() ? (
              <div className="mb-3 flex flex-wrap gap-2 text-[11px]">
                <span className="rounded-full bg-white px-2.5 py-1 font-medium text-slate-600 shadow-sm">
                  {matchedImageCount} filename match{matchedImageCount === 1 ? '' : 'es'}
                </span>
                <span className="rounded-full bg-white px-2.5 py-1 font-medium text-slate-600 shadow-sm">
                  {Math.min(blankImageCells, uploadedUrls.length)} of {blankImageCells} blank cells auto-filled
                </span>
              </div>
            ) : (
              <p className="mb-3 text-[11px] text-slate-400">Add a CSV file or paste rows to see image mapping status.</p>
            )}

            {(uploadedImages.length > 0 || previews.length > 0) && (
              <div className="mb-3 grid max-h-40 grid-cols-5 gap-2 overflow-y-auto pr-1 sm:grid-cols-8">
                {uploadedImages.map((image) => (
                  <div key={image.url} className="group relative aspect-square overflow-hidden rounded-lg border border-emerald-200 bg-white">
                    <Image src={image.url} alt={image.name} fill sizes="80px" className="object-cover" unoptimized />
                    <button
                      type="button"
                      onClick={() => removeUploadedImage(image)}
                      disabled={isUploading}
                      aria-label={`Remove ${image.name}`}
                      className="absolute right-1 top-1 rounded-md bg-white/90 p-1 text-rose-600 opacity-0 shadow-sm transition-opacity hover:bg-white group-hover:opacity-100 focus:opacity-100 disabled:opacity-50"
                    >
                      <Trash2 className="h-3 w-3" aria-hidden />
                    </button>
                  </div>
                ))}
                {previews.map((preview, index) => (
                  <div key={`${preview.name}-${index}`} className="relative aspect-square overflow-hidden rounded-lg border border-slate-300 bg-slate-900">
                    <Image src={preview.url} alt={preview.name} fill sizes="80px" className="object-cover opacity-70" unoptimized />
                    <div className="absolute inset-x-0 bottom-0 bg-slate-950/60 px-1 py-0.5 text-[9px] text-white">
                      <Loader2 className="mr-1 inline h-2.5 w-2.5 animate-spin" aria-hidden />
                      {progress}%
                    </div>
                  </div>
                ))}
              </div>
            )}

            {remainingSlots > 0 && (
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
                className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-5 text-center transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  dragging ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300 bg-white hover:border-emerald-400 hover:bg-emerald-50/50'
                } ${isUploading ? 'pointer-events-none opacity-60' : ''}`}
              >
                <UploadCloud className="h-6 w-6 text-emerald-500" aria-hidden />
                <p className="mt-2 text-sm font-medium text-slate-800">
                  {isUploading ? 'Uploading images…' : 'Drop product images here or click to browse'}
                </p>
                <p className="mt-1 text-xs text-slate-500">JPG, PNG or WEBP • Max 4MB each • {remainingSlots} slots left</p>
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
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${progress}%` }} />
              </div>
            )}

            {uploadError && (
              <div className="mt-3 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs text-rose-700">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden />
                <div className="flex-1">
                  <p className="font-medium">Image upload didn’t complete</p>
                  <p className="mt-0.5 break-words">{uploadError}</p>
                  {retryFiles.length > 0 && !isUploading && (
                    <button
                      type="button"
                      onClick={() => void uploadSelected(retryFiles)}
                      className="mt-2 inline-flex items-center gap-1 rounded-lg bg-rose-600 px-2.5 py-1.5 font-medium text-white hover:bg-rose-700"
                    >
                      <RotateCcw className="h-3.5 w-3.5" aria-hidden />
                      Retry upload
                    </button>
                  )}
                </div>
              </div>
            )}

            {uploadedImages.length > 0 && !uploadError && (
              <p className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-600">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                Images are linked to matching filenames and blank cells automatically.
              </p>
            )}
          </div>

          <SubmitButton
            className="btn-primary w-full py-3.5"
            pendingText="Importing products…"
            disabled={isUploading || uploadingFiles.length > 0 || !csv.trim()}
          >
            {isUploading ? 'Uploading images…' : 'Import Products'}
          </SubmitButton>
        </form>

        <p className="text-center text-xs text-slate-400">
          Need to edit images later? Use <Link href="/dashboard/products" className="font-semibold text-emerald-600">Products → Edit</Link> after importing.
        </p>
      </div>
    </Modal>
  );
}
