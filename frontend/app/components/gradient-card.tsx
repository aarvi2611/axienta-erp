'use client';

import { motion } from 'framer-motion';
import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type GradientTone = 'cyan' | 'rose' | 'emerald' | 'amber' | 'violet' | 'slate' | 'fuchsia';

const TONE_CLASSES: Record<GradientTone, string> = {
  cyan: 'bg-gradient-to-br from-cyan-500/25 via-cyan-700/10 to-cyan-900/5 border-cyan-300/25 text-white',
  rose: 'bg-gradient-to-br from-rose-500/25 via-rose-700/10 to-rose-900/5 border-rose-300/25 text-white',
  emerald:
    'bg-gradient-to-br from-emerald-500/25 via-emerald-700/10 to-emerald-900/5 border-emerald-300/25 text-white',
  amber:
    'bg-gradient-to-br from-amber-500/25 via-amber-700/10 to-amber-900/5 border-amber-300/25 text-white',
  violet:
    'bg-gradient-to-br from-violet-500/25 via-violet-700/10 to-violet-900/5 border-violet-300/25 text-white',
  fuchsia:
    'bg-gradient-to-br from-fuchsia-500/25 via-fuchsia-700/10 to-fuchsia-900/5 border-fuchsia-300/25 text-white',
  slate:
    'bg-gradient-to-br from-slate-700/40 via-slate-800/20 to-slate-900/10 border-slate-300/20 text-white'
};

const TONE_SHADOW: Record<GradientTone, string> = {
  cyan: 'hover:shadow-cyan-500/30',
  rose: 'hover:shadow-rose-500/30',
  emerald: 'hover:shadow-emerald-500/30',
  amber: 'hover:shadow-amber-500/30',
  violet: 'hover:shadow-violet-500/30',
  fuchsia: 'hover:shadow-fuchsia-500/30',
  slate: 'hover:shadow-slate-500/30'
};

interface GradientCardProps {
  tone?: GradientTone;
  className?: string;
  children: ReactNode;
  hoverable?: boolean;
  delay?: number;
  as?: 'div' | 'section' | 'article';
}

export function GradientCard({
  tone = 'cyan',
  className,
  children,
  hoverable = true,
  delay = 0,
  as: Tag = 'div'
}: GradientCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay }}
      whileHover={hoverable ? { y: -3, scale: 1.01 } : undefined}
      whileTap={hoverable ? { scale: 0.99 } : undefined}
      className={cn(
        'relative overflow-hidden rounded-2xl border p-5 shadow-2xl backdrop-blur-xl transition-shadow',
        TONE_CLASSES[tone],
        hoverable && `hover:shadow-2xl ${TONE_SHADOW[tone]}`,
        className
      )}
    >
      <Tag className="block">{children}</Tag>
    </motion.div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  tone?: GradientTone;
  icon?: ReactNode;
  hint?: string;
  delay?: number;
}

export function StatCard({ label, value, tone = 'cyan', icon, hint, delay = 0 }: StatCardProps) {
  return (
    <GradientCard tone={tone} delay={delay} className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[.24em] text-white/70">{label}</p>
          <p className="mt-2 text-3xl font-black leading-tight">{value}</p>
          {hint && <p className="mt-1 text-xs text-white/70">{hint}</p>}
        </div>
        {icon && <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/15">{icon}</div>}
      </div>
    </GradientCard>
  );
}