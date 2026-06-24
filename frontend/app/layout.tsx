import type { Metadata } from 'next';
import '@/app/globals.css';
import { Providers } from '@/contexts/providers';

export const metadata: Metadata = {
  title: 'Axenta ERP CRM | Axenta Business Consulting',
  description: 'Secure ERP, CRM and Client Management dashboard for Axenta Business Consulting',
  robots: { index: false, follow: false }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
