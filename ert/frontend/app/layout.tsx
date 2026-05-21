import type { Metadata } from 'next'; import './globals.css'; import { Providers } from '@/contexts/providers';
export const metadata: Metadata = { title: 'Axienta ERP CRM | Axienta Business Consulting', description: 'Secure ERP, CRM and Employee Management dashboard for Axienta Business Consulting', robots: { index: false, follow: false } };
export default function RootLayout({children}:{children:React.ReactNode}){ return <html lang="en"><body><Providers>{children}</Providers></body></html>; }
