'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Card, CardTitle } from '@/components/ui/card';
import { Lead, Task } from '@/types';

const emptyKpis = [
  { label: 'Employees', value: '0', trend: 'live' },
  { label: 'Leads', value: '0', trend: 'live' },
  { label: 'Conversion', value: '0%', trend: 'live' },
  { label: 'Tasks', value: '0', trend: 'live' }
];

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        <p className="text-sm font-semibold uppercase tracking-widest text-gold-600">Axienta Business Consulting</p>
        <h1 className="text-2xl font-black text-navy-900 dark:text-white md:text-4xl">{title}</h1>
        {subtitle && <p className="mt-2 max-w-3xl text-slate-600 dark:text-slate-300">{subtitle}</p>}
      </div>
      {actions}
    </div>
  );
}

export function KpiGrid({ kpis = emptyKpis }: { kpis?: { label: string; value: string; trend: string }[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {kpis.map((k, i) => (
        <motion.div key={k.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
          <Card>
            <p className="text-sm text-slate-500 dark:text-slate-400">{k.label}</p>
            <div className="mt-3 flex items-end justify-between">
              <p className="text-3xl font-black text-navy-900 dark:text-white">{k.value}</p>
              <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-700">{k.trend}</span>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

export function AnalyticsCharts({ leads = [] }: { leads?: Lead[] }) {
  const converted = leads.filter((l) => ['Confirmed', 'Converted'].includes(l.stage)).length;
  const follow = leads.filter((l) => l.stage === 'Follow-Up').length;
  const rejected = leads.filter((l) => l.stage === 'Rejected').length;
  const fresh = leads.filter((l) => l.stage === 'New Lead').length;

  const pie = leads.length
    ? [
        { name: 'Converted', value: converted },
        { name: 'Follow-up', value: follow },
        { name: 'Rejected', value: rejected },
        { name: 'New', value: fresh }
      ].filter((x) => x.value > 0)
    : [{ name: 'No Data', value: 1 }];

  const chart = [{ name: 'Firebase', leads: leads.length, converted }];

  return (
    <div className="mt-6 grid gap-4 xl:grid-cols-3">
      <Card className="xl:col-span-2">
        <CardTitle>Lead Analytics</CardTitle>
        <div className="h-72">
          <ResponsiveContainer>
            <AreaChart data={chart}>
              <XAxis dataKey="name" />
              <Tooltip />
              <Area dataKey="converted" stroke="#c79a1b" fill="#c79a1b33" strokeWidth={3} />
              <Area dataKey="leads" stroke="#102a5c" fill="transparent" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <CardTitle>Lead Conversion</CardTitle>
        <div className="h-72">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={pie} dataKey="value" innerRadius={60} outerRadius={90}>
                {pie.map((_, i) => (
                  <Cell key={i} fill={['#102a5c', '#c79a1b', '#ef4444', '#60a5fa'][i % 4]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

export function LeadTable({ items = [], onChangeStage }: { items?: Lead[]; onChangeStage?: (id: string, newStage: string) => Promise<void> }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedStage, setSelectedStage] = useState('');
  const stages = ['New Lead', 'Contacted', 'Follow-Up', 'Interested', 'Confirmed', 'Converted', 'Rejected'];

  const handleStageChange = async (id: string, newStage: string) => {
    if (onChangeStage) {
      await onChangeStage(id, newStage);
      setEditingId(null);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardTitle>Lead Database</CardTitle>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-300">
            <tr>
              <th className="p-3">Business</th>
              <th>Stage</th>
              <th>Phone</th>
              <th>Category</th>
              <th>Rating</th>
              <th>Owner</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td className="p-6 text-center text-slate-500" colSpan={6}>
                  No records found. Add data in Firestore or through the form.
                </td>
              </tr>
            )}
            {items.map((l) => (
              <tr key={l.id} className="border-b border-slate-100 dark:border-white/10">
                <td className="p-3 font-bold">
                  {l.businessName}
                  <p className="text-xs font-normal text-slate-500">{l.address}</p>
                </td>
                <td>
                  {editingId === l.id ? (
                    <select
                      value={selectedStage}
                      onChange={(e) => setSelectedStage(e.target.value)}
                      onBlur={() => handleStageChange(l.id, selectedStage)}
                      className="rounded-full bg-gold-100 px-2 py-1 text-xs font-bold text-gold-600"
                      autoFocus
                    >
                      {stages.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  ) : (
                    <span
                      className="cursor-pointer rounded-full bg-gold-100 px-2 py-1 text-xs font-bold text-gold-600 hover:bg-gold-200"
                      onClick={() => {
                        setEditingId(l.id);
                        setSelectedStage(l.stage);
                      }}
                    >
                      {l.stage}
                    </span>
                  )}
                </td>
                <td>{l.phone || '—'}</td>
                <td>{l.category || '—'}</td>
                <td>{l.rating ? `⭐ ${l.rating}` : '—'}</td>
                <td>{l.ownerId || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export function TaskList({ items = [] }: { items?: Task[] }) {
  return (
    <Card>
      <CardTitle>Pending Work & Approvals</CardTitle>
      <div className="mt-4 space-y-3">
        {items.length === 0 && <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500 dark:bg-white/5">No tasks found.</p>}
        {items.map((t) => (
          <div key={t.id} className="rounded-xl border border-slate-200 p-3 dark:border-white/10">
            <div className="flex flex-wrap justify-between gap-2">
              <b>{t.title}</b>
              <span className="text-xs font-bold text-gold-600">{t.priority}</span>
            </div>
            <p className="text-sm text-slate-500">{t.description}</p>
            <p className="mt-2 text-xs">{t.assignedName || t.assignedTo} • {t.status} • Deadline {t.deadline || '—'}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function MiniBars({ leads = [], tasks = [] }: { leads?: Lead[]; tasks?: Task[] }) {
  const data = [{ name: 'Firebase', leads: leads.length, tasks: tasks.length }];

  return (
    <Card>
      <CardTitle>Team Productivity</CardTitle>
      <div className="h-64">
        <ResponsiveContainer>
          <BarChart data={data}>
            <XAxis dataKey="name" />
            <Tooltip />
            <Bar dataKey="leads" fill="#102a5c" radius={[8, 8, 0, 0]} />
            <Bar dataKey="tasks" fill="#c79a1b" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
