"use client";

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/providers';
import { canAccess, roleHome } from '@/lib/roles';

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { profile, loading } = useAuth();

  useEffect(() => {
    if (!loading && !profile) {
      router.replace('/login');
      return;
    }
    if (profile && !canAccess(profile.role, pathname)) {
      router.replace(roleHome(profile.role));
    }
  }, [loading, profile, pathname, router]);

  if (loading) {
    return <div className="min-h-screen bg-slate-50" />;
  }

  if (!profile) {
    return null;
  }

  return <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-navy-900 dark:text-slate-100">{children}</div>;
}
