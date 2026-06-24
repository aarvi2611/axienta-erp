"use client";

import React from 'react';

export function PageHeader({
  title,
  subtitle,
  actions
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-premium backdrop-blur-xl dark:border-white/10 dark:bg-navy-800/80 md:p-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-black uppercase tracking-[.28em] text-gold-600">Axienta Business Consulting</p>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-navy-900 dark:text-white md:text-4xl">{title}</h1>
          {subtitle && <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300 md:text-base">{subtitle}</p>}
        </div>
        {actions}
      </div>
    </div>
  );
}
