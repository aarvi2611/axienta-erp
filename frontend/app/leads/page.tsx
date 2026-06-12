'use client';

import { useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { LeadTable, PageHeader } from '@/components/dashboard/dashboard-components';
import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/input';
import { createLead, removeLead, updateLead, useLeads } from '@/hooks/useFirestoreData';
import { useAuth } from '@/contexts/providers';
import { Lead, LeadStage } from '@/types';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const emptyLeadForm = {
  businessName: '',
  phone: '',
  email: '',
  category: '',
  address: '',
  stage: 'New Lead' as LeadStage
};

export default function Leads() {
  const { profile } = useAuth();
  const { data: leads, loading, error } = useLeads();

  const [q, setQ] = useState('');
  const [stage, setStage] = useState('All');
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [editingLeadId, setEditingLeadId] = useState<string | null>(null);

  const [form, setForm] = useState(emptyLeadForm);

  const filtered = leads.filter(
    (l) =>
      (stage === 'All' || l.stage === stage) &&
      l.businessName?.toLowerCase().includes(q.toLowerCase())
  );

  const save = async () => {
    try {
      setMessage('');
      if (editingLeadId) {
        await updateLead(editingLeadId, form);
        setMessage('Lead updated successfully.');
      } else {
        await createLead(form, profile?.uid);
        setMessage('Lead saved to Firebase.');
      }
      setOpen(false);
      setEditingLeadId(null);
      setForm(emptyLeadForm);
    } catch (e: any) {
      setMessage(e.message || 'Failed to save lead.');
    }
  };

  const startEditLead = (lead: Lead) => {
    setEditingLeadId(lead.id);
    setForm({
      businessName: lead.businessName || '',
      phone: lead.phone || '',
      email: lead.email || '',
      category: lead.category || '',
      address: lead.address || '',
      stage: lead.stage || 'New Lead'
    });
    setOpen(true);
    setMessage('');
  };

  const cancelLeadForm = () => {
    setOpen(false);
    setEditingLeadId(null);
    setForm(emptyLeadForm);
  };

  const deleteLead = async (lead: Lead) => {
    const confirmed = window.confirm(`Delete lead "${lead.businessName}"?`);
    if (!confirmed) return;

    try {
      setMessage('');
      await removeLead(lead.id);
      if (editingLeadId === lead.id) {
        cancelLeadForm();
      }
      setMessage('Lead deleted successfully.');
    } catch (e: any) {
      setMessage(e.message || 'Failed to delete lead.');
    }
  };

  const changeLeadStage = async (leadId: string, newStage: string) => {
    try {
      setMessage('');
      const leadRef = doc(db, 'leads', leadId);
      await updateDoc(leadRef, {
        stage: newStage,
        updatedAt: new Date().toISOString()
      });
      setMessage(`Lead stage changed to ${newStage}`);
    } catch (e: any) {
      setMessage(e.message || 'Failed to update lead stage');
      console.error('Error updating lead:', e);
    }
  };

  return (
    <AppShell>
      <PageHeader
        title="Leads"
        subtitle="Realtime Firestore leads. Add, edit, assign, filter and transfer leads between CRM departments."
        actions={
          <Button
            onClick={() => {
              if (open && !editingLeadId) {
                setOpen(false);
                return;
              }
              setEditingLeadId(null);
              setForm(emptyLeadForm);
              setOpen(true);
            }}
          >
            + Add Lead
          </Button>
        }
      />

      {open && (
        <div className="glass mb-4 grid gap-3 rounded-2xl p-4 md:grid-cols-3">
          <div className="md:col-span-3">
            <h3 className="font-bold text-navy-900 dark:text-white">{editingLeadId ? 'Edit Lead' : 'Add Lead'}</h3>
            <p className="text-sm text-slate-500">{editingLeadId ? 'Update lead details and save changes.' : 'Create a new lead in Firebase.'}</p>
          </div>
          <Input
            placeholder="Business Name"
            value={form.businessName}
            onChange={(e) => setForm({ ...form, businessName: e.target.value })}
          />

          <Input
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />

          <Input
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <Input
            placeholder="Category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />

          <Input
            placeholder="Address"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />

          <Select
            value={form.stage}
            onChange={(e) =>
              setForm({ ...form, stage: e.target.value as LeadStage })
            }
          >
            {[
              'New Lead',
              'Contacted',
              'Follow-Up',
              'Interested',
              'Confirmed',
              'Converted',
              'Rejected'
            ].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </Select>

          <div className="flex flex-wrap gap-2">
            <Button onClick={save}>{editingLeadId ? 'Update Lead' : 'Save to Firebase'}</Button>
            <Button variant="outline" onClick={cancelLeadForm}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="mb-4 grid gap-3 md:grid-cols-4">
        <Input
          placeholder="Search leads..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />

        <Select value={stage} onChange={(e) => setStage(e.target.value)}>
          <option>All</option>
          {[
            'New Lead',
            'Contacted',
            'Follow-Up',
            'Interested',
            'Confirmed',
            'Converted',
            'Rejected'
          ].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </Select>

        <Button variant="outline">Import CSV/Excel</Button>
        <Button variant="outline">Export Excel</Button>
      </div>

      {loading && (
        <p className="mb-3 text-sm text-slate-500">
          Loading Firebase leads...
        </p>
      )}

      {error && (
        <p className="mb-3 rounded-xl bg-red-50 p-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {message && (
        <p className="mb-3 rounded-xl bg-gold-50 p-3 text-sm font-semibold text-navy-900">
          {message}
        </p>
      )}

      <LeadTable items={filtered} onChangeStage={changeLeadStage} onEdit={startEditLead} onDelete={deleteLead} />
    </AppShell>
  );
}
