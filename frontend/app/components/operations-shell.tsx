'use client';

import { useEffect, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/contexts/providers';
import { roleHome } from '@/lib/roles';
import { type Role } from '@/types';

interface OperationsShellProps {
  allowed: Role[];
  title: string;
  subtitle?: string;
  badge?: string;
  children: ReactNode;
}

export function OperationsShell({ allowed, title, subtitle, badge = 'Operations', children }: OperationsShellProps) {
  const router = useRouter();
  const { profile, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!profile) {
      router.replace('/login');
      return;
    }
    if (!allowed.includes(profile.role)) {
      router.replace(roleHome(profile.role));
    }
  }, [loading, profile, allowed, router]);

  if (loading || !profile || !allowed.includes(profile.role)) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#07111f] text-white">
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-slate-200">
          <ShieldCheck className="animate-pulse text-cyan-300" size={18} />
          Verifying access…
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07111f] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_12%,rgba(14,165,233,.28),transparent_28%),radial-gradient(circle_at_82%_14%,rgba(16,185,129,.24),transparent_24%),radial-gradient(circle_at_72%_88%,rgba(244,114,182,.18),transparent_26%),linear-gradient(135deg,#06111f_0%,#0c1d35_52%,#030712_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(180deg,transparent,rgba(255,255,255,.05))]" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 md:px-8 xl:px-10">
        <header className="flex flex-wrap items-center justify-between gap-4 pb-6">
          <div className="flex items-center gap-4">
            <div className="grid h-14 w-14 place-items-center overflow-hidden rounded-2xl border border-white/15 bg-white/8 p-2 shadow-2xl shadow-cyan-500/10">
              <img src="/axienta-logo-transparent.png" alt="Axienta logo" className="h-full w-full object-contain" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[.3em] text-cyan-200">{badge}</p>
              <h1 className="text-2xl font-black tracking-tight md:text-3xl">{title}</h1>
              {subtitle && <p className="mt-1 text-sm text-slate-200">{subtitle}</p>}
            </div>
          </div>
          <Link
            href="/clients"
            className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/10"
          >
            <ArrowLeft size={16} />
            Back to Clients
          </Link>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex-1"
        >
          {children}
        </motion.div>

        <footer className="mt-8 border-t border-white/10 pt-4 text-xs text-slate-300">
          <p>
            Logged in as <span className="font-bold text-white">{profile.name}</span> •{' '}
            <span className="font-bold text-cyan-200">{profile.role}</span>
          </p>
        </footer>
      </div>
    </main>
  );
}