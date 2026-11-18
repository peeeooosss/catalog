'use client';
import { Toaster } from 'sonner';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster
        position="top-center"
        richColors
        closeButton
        toastOptions={{
          style: {
            borderRadius: '14px',
            border: '1px solid rgba(226, 232, 240, 0.9)',
            boxShadow: '0 18px 48px rgba(15, 23, 42, 0.14)',
          },
        }}
      />
    </>
  );
}