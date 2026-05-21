'use client';

import { AppShell } from '@/components/layout/app-shell';
import { PageHeader } from '@/components/dashboard/dashboard-components';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Select, Textarea } from '@/components/ui/input';
import { useState } from 'react';
import { useLeads, useEmployees, useOperations, createOperation, updateOperation, deleteOperation, addOperationNote } from '@/hooks/useFirestoreData';
import { useAuth } from '@/contexts/providers';

const serviceTypes = ['Consulting', 'Development', 'Design', 'Support', 'Training', 'Integration', 'General'];
const statuses = ['Pending', 'In Progress', 'On Hold', 'Completed', 'Cancelled'];
const priorities = ['Low', 'Medium', 'High', 'Urgent'];

export default function Operations() {
  const { profile } = useAuth();
  const { data: leads } = useLeads();
  const { data: employees } = useEmployees();
  const { data: operations, loading } = useOperations();

  const [open, setOpen] = useState(false);
  const [selectedOp, setSelectedOp] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [newNote, setNewNote] = useState('');

  const [form, setForm] = useState({
    clientName: '',
    leadId: '',
    serviceType: 'General',
    description: '',
    status: 'Pending',
    progress: 0,
    priority: 'Medium',
    assignedTo: '',
    deadline: '',
    startDate: new Date().toISOString().split('T')[0],
    budget: 0,
    spent: 0,
    details: ''
  });

  const handleCreate = async () => {
    setSaving(true);
    setMessage('');
    try {
      if (!form.clientName || !form.serviceType) throw new Error('Client name and service type required');
      
      const assignedName = employees.find(e => e.uid === form.assignedTo)?.name || '';
      console.log('Creating operation:', { ...form, assignedName }, 'By:', profile?.uid);
      
      await createOperation({ ...form, assignedName }, profile?.uid);
      
      setMessage('Operation created successfully');
      setForm({
        clientName: '',
        leadId: '',
        serviceType: 'General',
        description: '',
        status: 'Pending',
        progress: 0,
        priority: 'Medium',
        assignedTo: '',
        deadline: '',
        startDate: new Date().toISOString().split('T')[0],
        budget: 0,
        spent: 0,
        details: ''
      });
      setOpen(false);
    } catch (e: any) {
      console.error('Operation creation error:', e);
      setMessage(`Error: ${e.message || e.code || 'Failed to create operation'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateField = async (opId: string, field: string, value: any) => {
    try {
      await updateOperation(opId, { [field]: value });
    } catch (e: any) {
      setMessage(e.message);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || !selectedOp) return;
    setSaving(true);
    setMessage('');
    try {
      await addOperationNote(selectedOp.id, newNote, profile?.uid);
      setNewNote('');
      setMessage('Note added');
    } catch (e: any) {
      setMessage(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (opId: string) => {
    if (!confirm('Delete this operation?')) return;
    setSaving(true);
    try {
      await deleteOperation(opId);
      setSelectedOp(null);
      setMessage('Operation deleted');
    } catch (e: any) {
      setMessage(e.message);
    } finally {
      setSaving(false);
    }
  };

  const progressColor = (progress: number) => {
    if (progress >= 75) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 25) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const statusColor = (status: string) => {
    switch(status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'On Hold': return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const priorityColor = (priority: string) => {
    switch(priority) {
      case 'Urgent': return 'text-red-600';
      case 'High': return 'text-orange-600';
      case 'Medium': return 'text-blue-600';
      default: return 'text-green-600';
    }
  };

  return (
    <AppShell>
      <PageHeader
        title="Operations Panel"
        subtitle="Manage client services, track progress, deadlines, and budgets"
        actions={<Button onClick={() => setOpen(!open)}>+ New Service</Button>}
      />

      {message && <p className="mb-4 rounded-xl bg-gold-50 p-3 text-sm font-semibold text-navy-900">{message}</p>}

      {open && (
        <Card className="mb-6">
          <h3 className="text-lg font-bold mb-4">Create Service Ticket</h3>
          <div className="grid gap-3 md:grid-cols-3">
            <Input placeholder="Client Name" value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} />
            <Select value={form.leadId} onChange={(e) => setForm({ ...form, leadId: e.target.value })}>
              <option value="">Select Lead (optional)</option>
              {leads.map(l => <option key={l.id} value={l.id}>{l.businessName}</option>)}
            </Select>
            <Select value={form.serviceType} onChange={(e) => setForm({ ...form, serviceType: e.target.value })}>
              {serviceTypes.map(t => <option key={t}>{t}</option>)}
            </Select>
            <Select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              {priorities.map(p => <option key={p}>{p}</option>)}
            </Select>
            <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            <Input type="date" placeholder="Deadline" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
            <Select value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}>
              <option value="">Assign to (optional)</option>
              {employees.map(emp => <option key={emp.uid} value={emp.uid}>{emp.name}</option>)}
            </Select>
            <Input type="number" placeholder="Budget (₹)" value={form.budget} onChange={(e) => setForm({ ...form, budget: Number(e.target.value) })} />
            <Input type="number" placeholder="Spent (₹)" value={form.spent} onChange={(e) => setForm({ ...form, spent: Number(e.target.value) })} />
            <Textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <Textarea placeholder="Detailed Requirements/Specifications" value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} />
            <Button disabled={saving || !form.clientName} onClick={handleCreate} className="md:col-span-3">
              {saving ? 'Creating...' : 'Create Service Ticket'}
            </Button>
          </div>
        </Card>
      )}

      {loading && <p className="text-sm text-slate-500">Loading operations...</p>}

      <div className="grid gap-4">
        {operations.length === 0 ? (
          <Card>No service tickets yet. Create your first one above.</Card>
        ) : (
          operations.map((op) => (
            <Card key={op.id} className="p-4">
              <div className="grid gap-4 md:grid-cols-4">
                <div>
                  <p className="text-xs text-slate-500 uppercase">Client</p>
                  <b className="text-lg">{op.clientName}</b>
                  <p className="text-sm text-slate-600">{op.serviceType}</p>
                </div>
                
                <div>
                  <p className="text-xs text-slate-500 uppercase">Status</p>
                  <div className="flex gap-2 items-center mt-1">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor(op.status)}`}>
                      {op.status}
                    </span>
                    <span className={`font-semibold ${priorityColor(op.priority)}`}>{op.priority}</span>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-slate-500 uppercase">Progress</p>
                  <div className="mt-1">
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={op.progress} 
                      onChange={(e) => handleUpdateField(op.id, 'progress', Number(e.target.value))}
                      className="w-full"
                    />
                    <p className="text-sm font-bold mt-1">{op.progress}%</p>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div className={`h-full ${progressColor(op.progress)} transition-all`} style={{width: `${op.progress}%`}} />
                  </div>
                </div>

                <div>
                  <p className="text-xs text-slate-500 uppercase">Dates</p>
                  <p className="text-sm"><b>Start:</b> {new Date(op.startDate).toLocaleDateString()}</p>
                  {op.deadline && <p className="text-sm"><b>Deadline:</b> {new Date(op.deadline).toLocaleDateString()}</p>}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-4 mt-4 pt-4 border-t">
                <div>
                  <p className="text-xs text-slate-500 uppercase">Assigned</p>
                  <p className="text-sm font-semibold">{op.assignedName || 'Unassigned'}</p>
                </div>

                <div>
                  <p className="text-xs text-slate-500 uppercase">Budget</p>
                  <p className="text-sm">
                    <b className="text-gold-600">₹{(op.budget || 0).toLocaleString()}</b>
                    <span className="text-slate-500 ml-2">Spent: ₹{(op.spent || 0).toLocaleString()}</span>
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    Remaining: ₹{((op.budget || 0) - (op.spent || 0)).toLocaleString()}
                  </p>
                </div>

                <div className="md:col-span-2">
                  <p className="text-xs text-slate-500 uppercase">Description</p>
                  <p className="text-sm">{op.description || op.details}</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-slate-500 uppercase mb-2">Notes & Updates</p>
                {selectedOp?.id === op.id ? (
                  <div className="space-y-2 mb-4">
                    {(op.notesList || []).map((note: any) => (
                      <div key={note.id} className="bg-slate-50 p-2 rounded text-sm">
                        <p className="font-semibold text-xs text-slate-600">{note.createdAt}</p>
                        <p>{note.text}</p>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="mt-4 flex gap-2 flex-wrap">
                {selectedOp?.id === op.id ? (
                  <>
                    <div className="w-full flex gap-2">
                      <input
                        type="text"
                        placeholder="Add note..."
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        className="flex-1 px-3 py-2 rounded border border-gray-300"
                      />
                      <Button onClick={handleAddNote} disabled={saving || !newNote.trim()}>
                        {saving ? 'Adding...' : 'Add Note'}
                      </Button>
                    </div>
                    <Button variant="outline" onClick={() => setSelectedOp(null)}>Collapse</Button>
                  </>
                ) : (
                  <Button variant="outline" onClick={() => setSelectedOp(op)}>Expand & Add Note</Button>
                )}
                
                <Select 
                  value={op.status} 
                  onChange={(e) => handleUpdateField(op.id, 'status', e.target.value)}
                  className="flex-1"
                >
                  {statuses.map(s => <option key={s}>{s}</option>)}
                </Select>

                <Button variant="outline" onClick={() => handleDelete(op.id)} className="text-red-600 hover:bg-red-50">
                  Delete
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </AppShell>
  );
}
