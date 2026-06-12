'use client';

import { useMemo, useState } from 'react';
import { MessageCircle, Pencil, PhoneCall, Save, Trash2, X } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { PageHeader } from '@/components/dashboard/dashboard-components';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Textarea, Select } from '@/components/ui/input';
import { createCallLog, removeCallLog, updateCallLog, useLeads, useCallLogs } from '@/hooks/useFirestoreData';
import { useAuth } from '@/contexts/providers';

const callStatuses = ['Connected', 'No Answer', 'Busy', 'Interested', 'Follow-Up', 'Not Interested'];

const emptyCallForm = {
  leadId: '',
  status: 'Connected',
  notes: '',
  remarks: ''
};

export default function Calling() {
  const { profile } = useAuth();
  const { data: leads } = useLeads();
  const { data: callLogs } = useCallLogs();
  const [form, setForm] = useState(emptyCallForm);
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const todayLogs = useMemo(() => {
    const today = new Date().toDateString();
    return callLogs.filter((log) => {
      const date = log.createdAt?.toDate?.() || (log.createdAt ? new Date(log.createdAt) : null);
      return date ? new Date(date).toDateString() === today : false;
    });
  }, [callLogs]);

  const interestedCount = callLogs.filter((log) => log.status === 'Interested').length;
  const connectedCount = callLogs.filter((log) => log.status === 'Connected').length;

  const getLeadName = (leadId: string) => {
    return leads.find((lead) => lead.id === leadId)?.businessName || 'Unknown Lead';
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Not recorded';
    const date = timestamp.toDate?.() || new Date(timestamp);
    return new Date(date).toLocaleString('en-IN');
  };

  const resetForm = () => {
    setForm(emptyCallForm);
    setEditingLogId(null);
  };

  const save = async () => {
    if (!form.leadId) {
      setMessage('Please select a lead before saving the call log.');
      return;
    }

    try {
      setMessage('');
      if (editingLogId) {
        await updateCallLog(editingLogId, form);
        setMessage('Call log updated successfully.');
      } else {
        await createCallLog(form, profile?.uid);
        setMessage('Call log saved successfully.');
      }
      resetForm();
    } catch (error: any) {
      setMessage(error?.message || 'Failed to save call log.');
    }
  };

  const editLog = (log: any) => {
    setEditingLogId(log.id);
    setForm({
      leadId: log.leadId || '',
      status: log.status || 'Connected',
      notes: log.notes || '',
      remarks: log.remarks || ''
    });
    setMessage('');
  };

  const deleteLog = async (log: any) => {
    const confirmed = window.confirm(`Delete call log for ${getLeadName(log.leadId)}?`);
    if (!confirmed) return;

    try {
      setMessage('');
      await removeCallLog(log.id);
      if (editingLogId === log.id) resetForm();
      setMessage('Call log deleted successfully.');
    } catch (error: any) {
      setMessage(error?.message || 'Failed to delete call log.');
    }
  };

  const statusClass = (status: string) => {
    if (status === 'Connected') return 'bg-emerald-100 text-emerald-700';
    if (status === 'No Answer' || status === 'Not Interested') return 'bg-red-100 text-red-700';
    if (status === 'Interested') return 'bg-blue-100 text-blue-700';
    if (status === 'Follow-Up') return 'bg-amber-100 text-amber-700';
    return 'bg-slate-100 text-slate-700';
  };

  return (
    <AppShell>
      <PageHeader
        title="Calling Panel"
        subtitle="Manage lead calls, remarks, outcomes and follow-up history from one professional workspace."
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <p className="text-sm text-slate-500">Total Calls</p>
          <b className="text-3xl">{callLogs.length}</b>
          <p className="mt-2 text-sm text-slate-500">All logged calls</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Today</p>
          <b className="text-3xl">{todayLogs.length}</b>
          <p className="mt-2 text-sm text-slate-500">Calls logged today</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Connected</p>
          <b className="text-3xl">{connectedCount}</b>
          <p className="mt-2 text-sm text-slate-500">Successful contacts</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Interested</p>
          <b className="text-3xl">{interestedCount}</b>
          <p className="mt-2 text-sm text-slate-500">Potential conversions</p>
        </Card>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[420px_1fr]">
        <Card className="h-fit">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <PhoneCall className="text-gold-600" size={20} />
                <h3 className="font-bold text-lg">{editingLogId ? 'Edit Call Log' : 'Log New Call'}</h3>
              </div>
              <p className="mt-1 text-sm text-slate-500">Track call outcome, client response and internal remarks.</p>
            </div>
            {editingLogId && (
              <Button variant="outline" className="px-3 py-2 text-xs" onClick={resetForm}>
                <X size={14} /> Cancel
              </Button>
            )}
          </div>

          <div className="mt-5 space-y-4">
            <div>
              <p className="mb-1 text-sm font-semibold text-slate-600">Lead</p>
              <Select value={form.leadId} onChange={(e) => setForm({ ...form, leadId: e.target.value })}>
                <option value="">Select lead</option>
                {leads.map((lead) => (
                  <option key={lead.id} value={lead.id}>{lead.businessName}</option>
                ))}
              </Select>
            </div>

            <div>
              <p className="mb-1 text-sm font-semibold text-slate-600">Call Status</p>
              <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {callStatuses.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </Select>
            </div>

            <div>
              <p className="mb-1 text-sm font-semibold text-slate-600">Client Response / Notes</p>
              <Textarea
                className="min-h-[100px]"
                placeholder="What did the client say?"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>

            <div>
              <p className="mb-1 text-sm font-semibold text-slate-600">Remarks</p>
              <Input
                placeholder="Follow-up date, priority, payment interest, objections..."
                value={form.remarks}
                onChange={(e) => setForm({ ...form, remarks: e.target.value })}
              />
            </div>

            <Button className="w-full" onClick={save}>
              <Save size={16} /> {editingLogId ? 'Update Call Log' : 'Save Call Log'}
            </Button>
            <Button variant="outline" className="w-full">
              <MessageCircle size={16} /> Send WhatsApp Template
            </Button>
          </div>
        </Card>

        <Card>
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <div>
              <h3 className="font-bold text-lg">Call Logs History</h3>
              <p className="text-sm text-slate-500">Review, edit, remark or delete calling activity.</p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{callLogs.length} records</span>
          </div>

          {message && (
            <p className="mt-4 rounded-xl bg-gold-50 p-3 text-sm font-semibold text-navy-900">
              {message}
            </p>
          )}

          <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 text-slate-600">
                <tr>
                  <th className="p-3">Lead</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Notes</th>
                  <th className="p-3">Remarks</th>
                  <th className="p-3">Time</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {callLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-slate-500">
                      No call logs yet. Save your first call log from the panel.
                    </td>
                  </tr>
                ) : (
                  callLogs.map((log) => (
                    <tr key={log.id} className="border-t align-top hover:bg-slate-50">
                      <td className="p-3">
                        <b>{getLeadName(log.leadId)}</b>
                        <p className="text-xs text-slate-500">{log.userId || 'Unassigned caller'}</p>
                      </td>
                      <td className="p-3">
                        <span className={`rounded-full px-2 py-1 text-xs font-bold ${statusClass(log.status)}`}>
                          {log.status || 'Not set'}
                        </span>
                      </td>
                      <td className="p-3">
                        <p className="max-w-xs text-xs text-slate-600">{log.notes || 'No notes added'}</p>
                      </td>
                      <td className="p-3">
                        <p className="max-w-xs text-xs text-slate-600">{log.remarks || 'No remarks'}</p>
                      </td>
                      <td className="p-3 text-xs text-slate-500">{formatDate(log.createdAt)}</td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-2">
                          <Button className="px-3 py-2 text-xs" variant="outline" onClick={() => editLog(log)}>
                            <Pencil size={14} /> Edit
                          </Button>
                          <Button className="px-3 py-2 text-xs border-red-200 text-red-600 hover:bg-red-50" variant="outline" onClick={() => deleteLog(log)}>
                            <Trash2 size={14} /> Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
