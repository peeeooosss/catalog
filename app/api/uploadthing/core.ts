import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { UploadThingError } from 'uploadthing/server';
import { getSessionUser } from '@/lib/auth';

const f = createUploadthing();

async function requireUploadUser() {
  const user = await getSessionUser();
  if (!user) throw new UploadThingError('Unauthorized');
  return { userId: user.id };
}

async function handleUploadComplete({ metadata, file }: { metadata: { userId: string }; file: { ufsUrl: string } }) {
  return { uploadedBy: metadata.userId, url: file.ufsUrl };
}

export const ourFileRouter = {
  productImage: f({
    image: { maxFileSize: '4MB', maxFileCount: 1 },
  })
    .middleware(requireUploadUser)
    .onUploadComplete(handleUploadComplete),
  productImages: f({
    image: { maxFileSize: '4MB', maxFileCount: 3 },
  })
    .middleware(requireUploadUser)
    .onUploadComplete(handleUploadComplete),
  bulkProductImages: f({
    image: { maxFileSize: '4MB', maxFileCount: 100 },
  })
    .middleware(requireUploadUser)
    .onUploadComplete(handleUploadComplete),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
