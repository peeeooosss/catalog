import { generateReactHelpers, generateUploadButton, generateUploadDropzone } from '@uploadthing/react';
import type { OurFileRouter } from '@/app/api/uploadthing/core';
import { getUploadthingUrl } from '@/lib/uploadthing-config';

const url = getUploadthingUrl();

export const UploadButton = generateUploadButton<OurFileRouter>({ url });
export const UploadDropzone = generateUploadDropzone<OurFileRouter>({ url });
export const { useUploadThing, uploadFiles } = generateReactHelpers<OurFileRouter>({ url });
