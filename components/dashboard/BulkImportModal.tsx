'use client';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useFormState } from 'react-dom';
import { toast } from 'sonner';
import { CheckCircle2, Download, FileSpreadsheet, Upload } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import SubmitButton from '@/components/auth/SubmitButton';
import { UploadButton } from '@/lib/uploadthing';
import { parseCsvRows } from '@/lib/utils';
import { importProductsAction } from '@/lib/actions/products';
import type { ActionState } from '@/lib/actions/auth';

type UploadedImage = { name: string; url: string };

const TEMPLATE = [
  'name,price,mrp,category,stock,unit,description,image1,image2,image3',
  'Basmati Rice 5kg,24.99,30,Staples,20,5kg pack,Fragrant long grain rice,rice-1.jpg,rice-2.jpg,',
  'Cotton T-Shirt,12.50,18,Apparel,35,piece,Soft breathable cotton,shirt-1.jpg,shirt-2.jpg,shirt-3.jpg',
].join('\n');

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
      } else if (!cell && autoIndex < autoUrls.length) {
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
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [state, formAction] = useFormState<ActionState, FormData>(importProductsAction, {});

  const uploadedUrls = useMemo(() => uploadedImages.map((image) => image.url), [uploadedImages]);
  const processedCsv = useMemo(() => replaceImageTokens(csv, imageUrls, uploadedUrls), [
    csv,
    imageUrls,
    uploadedUrls,
  ]);

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

  const handleUploadComplete = (res: unknown) => {
    const files = (res ?? []) as Array<{ name?: string; ufsUrl?: string; url?: string }>;
    const entries = files
      .map((file) => ({
        name: String(file.name ?? '').trim(),
        url: String(file.ufsUrl ?? file.url ?? '').trim(),
      }))
      .filter((entry) => entry.name && entry.url.startsWith('https://'));

    setUploadedImages((prev) => {
      const merged = [...prev, ...entries];
      return merged.filter((entry, index) => merged.findIndex((item) => item.name === entry.name) === index);
    });
    setImageUrls((prev) => ({
      ...prev,
      ...Object.fromEntries(entries.map((entry) => [entry.name.toLowerCase(), entry.url])),
    }));
    setUploading(false);
    if (entries.length) toast.success(`${entries.length} image${entries.length === 1 ? '' : 's'} uploaded.`);
  };

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
                  Optional. Match by filename in image1–image3, or leave cells blank to auto-fill uploaded images in order. Max 3 images per product.
                </p>
              </div>
              <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 shadow-sm">
                {uploadedImages.length} uploaded
              </span>
            </div>

            <UploadButton
              endpoint="bulkProductImages"
              onUploadBegin={() => setUploading(true)}
              onClientUploadComplete={handleUploadComplete}
              onUploadError={(error) => {
                setUploading(false);
                toast.error(`Image upload failed: ${error.message || 'Please try again.'}`);
              }}
              appearance={{
                button:
                  'w-full bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl px-4 py-3 ut-uploading:cursor-not-allowed',
                allowedContent: 'text-xs text-slate-500',
              }}
              content={{ button: 'Upload product images' }}
            />

            {uploadedImages.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {uploadedImages.map((image) => (
                  <span key={image.name} className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
                    <CheckCircle2 className="h-3 w-3" aria-hidden />
                    {image.name}
                  </span>
                ))}
              </div>
            )}
            <p className="mt-2 text-[11px] text-slate-400">Images are saved to UploadThing.com and linked to your products automatically.</p>
          </div>

          <SubmitButton
            className="btn-primary w-full py-3.5"
            pendingText="Importing products…"
            disabled={uploading || !csv.trim()}
          >
            {uploading ? 'Uploading images…' : 'Import Products'}
          </SubmitButton>
        </form>

        <p className="text-center text-xs text-slate-400">
          Need to edit images later? Use <Link href="/dashboard/products" className="font-semibold text-emerald-600">Products → Edit</Link> after importing.
        </p>
      </div>
    </Modal>
  );
}
