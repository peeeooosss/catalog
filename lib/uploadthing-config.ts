export function getPublicAppUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL ?? '').replace(/\/+$/, '');
}

export function getUploadthingUrl() {
  const appUrl = getPublicAppUrl();
  return appUrl ? `${appUrl}/api/uploadthing` : '/api/uploadthing';
}
