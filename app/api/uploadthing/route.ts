import { createRouteHandler } from 'uploadthing/next';
import { getPublicAppUrl } from '@/lib/uploadthing-config';
import { ourFileRouter } from './core';

export const dynamic = 'force-dynamic';

const appUrl = getPublicAppUrl();
const callbackUrl = appUrl ? `${appUrl}/api/uploadthing` : undefined;

export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
  config: callbackUrl ? { callbackUrl } : {},
});
