'use client';

import { useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/dashboard/dashboard-components';
import { useLeads } from '@/hooks/useFirestoreData';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const stages = ['New Lead', 'Contacted', 'Follow-Up', 'Interested', 'Confirmed', 'Converted', 'Rejected'];

export default function Pipeline() {
  const { data: leads, loading, error } = useLeads();
  const [message, setMessage] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedStage, setSelectedStage] = useState('');

  const changeStage = async (leadId: string, newStage: string) => {
    try {
      setMessage('');
      const leadRef = doc(db, 'leads', leadId);
      await updateDoc(leadRef, {
        stage: newStage,
        updatedAt: new Date().toISOString()
      });
      setMessage(`Lead moved to ${newStage}`);
      setEditingId(null);
    } catch (e: any) {
      setMessage(e.message || 'Failed to move lead');
      console.error('Error:', e);
    }
  };

  return (
    <AppShell>
      <PageHeader title="CRM Pipeline" subtitle="Realtime Firestore Kanban pipeline." />

      {loading && <p className="mb-3 text-sm text-slate-500">Loading Firebase leads...</p>}
      {error && <p className="mb-3 rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>}
      {message && <p className="mb-3 rounded-xl bg-gold-50 p-3 text-sm font-semibold text-navy-900">{message}</p>}

      <div className="grid gap-4 overflow-x-auto pb-4 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
        {stages.map((s) => (
          <Card key={s} className="min-h-80 min-w-64">
            <div className="mb-3 flex items-center justify-between">
              <b>{s}</b>
              <span className="rounded-full bg-slate-100 px-2 py-1 text-xs dark:bg-white/10">{leads.filter((l) => l.stage === s).length}</span>
            </div>

            {leads
              .filter((l) => l.stage === s)
              .map((l) => (
                <div
                  key={l.id}
                  className="mb-3 cursor-pointer rounded-xl border border-slate-200 bg-white p-3 text-sm transition-all hover:shadow-md dark:border-white/10 dark:bg-navy-900"
                  onClick={() => {
                    setEditingId(l.id);
                    setSelectedStage(s);
                  }}
                >
                  {editingId === l.id ? (
                    <select
                      value={selectedStage}
                      onChange={(e) => setSelectedStage(e.target.value)}
                      onBlur={() => changeStage(l.id, selectedStage)}
                      className="w-full rounded border border-gold-300 px-2 py-1 text-sm"
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    >
                      {stages.map((stage) => (
                        <option key={stage} value={stage}>
                          {stage}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <>
                      <b>{l.businessName}</b>
                      <p className="text-xs text-slate-500">
                        {l.category} • {l.phone}
                      </p>
                      <div className="mt-2 flex gap-1">
                        {(l.tags || []).map((t) => (
                          <span key={t} className="rounded bg-gold-100 px-1.5 py-0.5 text-[10px] font-bold text-gold-600">
                            {t}
                          </span>
                        ))}
                      </div>
                      <p className="mt-2 text-xs text-slate-400">Click to change stage</p>
                    </>
                  )}
                </div>
              ))}
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
