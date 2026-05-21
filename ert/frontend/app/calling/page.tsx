'use client';

import { AppShell } from '@/components/layout/app-shell';
import { PageHeader } from '@/components/dashboard/dashboard-components';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea, Select } from '@/components/ui/input';
import { createCallLog, useLeads, useCallLogs } from '@/hooks/useFirestoreData';
import { useAuth } from '@/contexts/providers';
import { useState } from 'react';

export default function Calling() {
  const { profile } = useAuth();
  const { data: leads } = useLeads();
  const { data: callLogs } = useCallLogs();
  const [leadId, setLeadId] = useState('');
  const [status, setStatus] = useState('Connected');
  const [notes, setNotes] = useState('');

  const save = async () => {
    await createCallLog({ leadId, status, notes }, profile?.uid);
    setNotes('');
    setLeadId('');
  };

  const getLeadName = (leadId: string) => {
    return leads.find(l => l.id === leadId)?.businessName || 'Unknown Lead';
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate?.() || new Date(timestamp);
    return new Date(date).toLocaleString();
  };

  return (
    <AppShell>
      <PageHeader title="Calling Panel" subtitle="Calling queue from Firebase leads." />

      <div className="grid gap-4 xl:grid-cols-3">
        <Card>
          <h3 className="font-bold">Call Logger</h3>
          <div className="mt-4 space-y-3">
            <Select value={leadId} onChange={(e) => setLeadId(e.target.value)}>
              <option value="">Select lead</option>
              {leads.map((l) => <option key={l.id} value={l.id}>{l.businessName}</option>)}
            </Select>

            <Select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option>Connected</option>
              <option>No Answer</option>
              <option>Busy</option>
              <option>Interested</option>
            </Select>

            <Textarea placeholder="Client response / notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
            <Button className="w-full" onClick={save}>Save Call Log to Firebase</Button>
            <Button variant="outline" className="w-full">Send WhatsApp Template</Button>
          </div>
        </Card>

        <div className="xl:col-span-2">
          <Card>
            <h3 className="font-bold mb-4">Call Logs History</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Lead</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Notes</th>
                    <th className="text-left p-2">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {callLogs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-gray-500">
                        No call logs yet. Save your first call log above.
                      </td>
                    </tr>
                  ) : (
                    callLogs.map((log) => (
                      <tr key={log.id} className="border-b hover:bg-gray-50">
                        <td className="p-2">{getLeadName(log.leadId)}</td>
                        <td className="p-2">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            log.status === 'Connected' ? 'bg-green-100 text-green-800' :
                            log.status === 'No Answer' ? 'bg-red-100 text-red-800' :
                            log.status === 'Interested' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="p-2 truncate max-w-xs">{log.notes}</td>
                        <td className="p-2 text-gray-600">{formatDate(log.createdAt)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
