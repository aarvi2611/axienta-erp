'use client';

import { AppShell } from '@/components/layout/app-shell';
import { PageHeader } from '@/components/dashboard/dashboard-components';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Select, Textarea } from '@/components/ui/input';
import { useEffect, useMemo, useState } from 'react';
import { useLeads, useEmployees, useOperations, createOperation, updateOperation, deleteOperation, addOperationNote } from '@/hooks/useFirestoreData';
import { useAuth } from '@/contexts/providers';
import { BriefcaseBusiness, Eye, IndianRupee, TrendingUp, X } from 'lucide-react';

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
    expenses: 0,
    details: ''
  });

  const operationStats = useMemo(() => {
    const totalBudget = operations.reduce((sum, op) => sum + Number(op.budget || 0), 0);
    const totalExpenses = operations.reduce((sum, op) => sum + Number(op.expenses ?? op.spent ?? 0), 0);
    const avgProgress = operations.length
      ? Math.round(operations.reduce((sum, op) => sum + Number(op.progress || 0), 0) / operations.length)
      : 0;

    return {
      active: operations.filter((op) => op.status !== 'Completed' && op.status !== 'Cancelled').length,
      taskLinked: operations.filter((op) => op.taskId).length,
      totalBudget,
      totalExpenses,
      avgProgress
    };
  }, [operations]);

  useEffect(() => {
    if (!selectedOp) return;
    const liveOperation = operations.find((op) => op.id === selectedOp.id);
    if (liveOperation) setSelectedOp(liveOperation);
  }, [operations, selectedOp?.id]);

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
        expenses: 0,
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
      const updates: Record<string, any> = { [field]: value };
      if (field === 'expenses') updates.spent = value;
      if (field === 'spent') updates.expenses = value;
      await updateOperation(opId, updates);
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
        subtitle="Track assigned work as operations, manage progress, budgets, expenses, deadlines and project notes."
        actions={<Button onClick={() => setOpen(!open)}>+ New Service</Button>}
      />

      {message && <p className="mb-4 rounded-xl bg-gold-50 p-3 text-sm font-semibold text-navy-900">{message}</p>}

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <Card>
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Active Projects</p>
            <BriefcaseBusiness className="text-gold-600" size={20} />
          </div>
          <b className="mt-2 block text-3xl">{operationStats.active}</b>
          <p className="mt-2 text-sm text-slate-500">{operationStats.taskLinked} linked with assigned tasks</p>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Avg. Progress</p>
            <TrendingUp className="text-blue-600" size={20} />
          </div>
          <b className="mt-2 block text-3xl">{operationStats.avgProgress}%</b>
          <p className="mt-2 text-sm text-slate-500">Across live operations</p>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Budget</p>
            <IndianRupee className="text-emerald-600" size={20} />
          </div>
          <b className="mt-2 block text-3xl">₹{operationStats.totalBudget.toLocaleString()}</b>
          <p className="mt-2 text-sm text-slate-500">Manual budget planning</p>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Expenses</p>
            <IndianRupee className="text-red-600" size={20} />
          </div>
          <b className="mt-2 block text-3xl">₹{operationStats.totalExpenses.toLocaleString()}</b>
          <p className="mt-2 text-sm text-slate-500">Manually updated spend</p>
        </Card>
      </div>

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
            <Input type="number" placeholder="Expenses (₹)" value={form.expenses} onChange={(e) => setForm({ ...form, expenses: Number(e.target.value), spent: Number(e.target.value) })} />
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
                  <span className={`mt-2 inline-flex rounded-full px-2 py-1 text-xs font-bold ${op.taskId ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-700'}`}>
                    {op.source || (op.taskId ? 'Task Assignment' : 'Manual')}
                  </span>
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
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    <Input
                      type="number"
                      value={op.budget || 0}
                      onChange={(e) => handleUpdateField(op.id, 'budget', Number(e.target.value))}
                      title="Manual budget"
                    />
                    <Input
                      type="number"
                      value={op.expenses ?? op.spent ?? 0}
                      onChange={(e) => handleUpdateField(op.id, 'expenses', Number(e.target.value))}
                      title="Manual expenses"
                    />
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Budget: ₹{(op.budget || 0).toLocaleString()} | Expenses: ₹{(op.expenses ?? op.spent ?? 0).toLocaleString()} | Remaining: ₹{((op.budget || 0) - (op.expenses ?? op.spent ?? 0)).toLocaleString()}
                  </p>
                </div>

                <div className="md:col-span-2">
                  <p className="text-xs text-slate-500 uppercase">Description</p>
                  <p className="text-sm">{op.description || op.details}</p>
                </div>
              </div>

              <div className="mt-4 flex gap-2 flex-wrap">
                <Button variant="outline" onClick={() => setSelectedOp(op)}>
                  <Eye size={16} /> View More
                </Button>
                
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

      {selectedOp && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-navy-900/70 p-3 backdrop-blur sm:p-6">
          <div className="mx-auto max-w-5xl rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white p-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gold-600">Operation Details</p>
                <h2 className="mt-1 text-2xl font-black text-navy-900">{selectedOp.clientName}</h2>
                <p className="text-sm text-slate-500">{selectedOp.source || (selectedOp.taskId ? 'Task Assignment' : 'Manual Project')}</p>
              </div>
              <Button variant="ghost" className="px-3" onClick={() => setSelectedOp(null)} title="Close">
                <X size={18} />
              </Button>
            </div>

            <div className="grid gap-5 p-5 lg:grid-cols-[1fr_320px]">
              <div className="space-y-4">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Project Brief</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-700">{selectedOp.description || selectedOp.details || 'No project details added.'}</p>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <div className="rounded-xl border border-slate-200 p-4">
                    <p className="text-xs uppercase tracking-widest text-slate-500">Assigned To</p>
                    <b className="mt-2 block">{selectedOp.assignedName || 'Unassigned'}</b>
                  </div>
                  <div className="rounded-xl border border-slate-200 p-4">
                    <p className="text-xs uppercase tracking-widest text-slate-500">Deadline</p>
                    <b className="mt-2 block">{selectedOp.deadline ? new Date(selectedOp.deadline).toLocaleDateString() : 'Not set'}</b>
                  </div>
                  <div className="rounded-xl border border-slate-200 p-4">
                    <p className="text-xs uppercase tracking-widest text-slate-500">Progress</p>
                    <b className="mt-2 block">{selectedOp.progress || 0}%</b>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Manual Financial Update</p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <Input
                      type="number"
                      value={selectedOp.budget || 0}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        setSelectedOp({ ...selectedOp, budget: value });
                        handleUpdateField(selectedOp.id, 'budget', value);
                      }}
                    />
                    <Input
                      type="number"
                      value={selectedOp.expenses ?? selectedOp.spent ?? 0}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        setSelectedOp({ ...selectedOp, expenses: value, spent: value });
                        handleUpdateField(selectedOp.id, 'expenses', value);
                      }}
                    />
                  </div>
                  <p className="mt-2 text-sm font-semibold text-slate-700">
                    Remaining: ₹{((selectedOp.budget || 0) - (selectedOp.expenses ?? selectedOp.spent ?? 0)).toLocaleString()}
                  </p>
                </div>
              </div>

              <aside className="space-y-4">
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Quick Controls</p>
                  <Select className="mt-3" value={selectedOp.status} onChange={(e) => {
                    setSelectedOp({ ...selectedOp, status: e.target.value });
                    handleUpdateField(selectedOp.id, 'status', e.target.value);
                  }}>
                    {statuses.map(s => <option key={s}>{s}</option>)}
                  </Select>
                  <Input
                    className="mt-3"
                    type="number"
                    min={0}
                    max={100}
                    value={selectedOp.progress || 0}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      setSelectedOp({ ...selectedOp, progress: value });
                      handleUpdateField(selectedOp.id, 'progress', value);
                    }}
                  />
                </div>

                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Notes & Updates</p>
                  <div className="mt-3 max-h-56 space-y-2 overflow-y-auto">
                    {(selectedOp.notesList || []).length === 0 && <p className="text-sm text-slate-500">No updates yet.</p>}
                    {(selectedOp.notesList || []).map((note: any) => (
                      <div key={note.id} className="rounded-xl bg-slate-50 p-3 text-sm">
                        <p className="text-xs font-semibold text-slate-500">{new Date(note.createdAt).toLocaleString()}</p>
                        <p className="mt-1">{note.text}</p>
                      </div>
                    ))}
                  </div>
                  <Textarea className="mt-3" placeholder="Add operation update..." value={newNote} onChange={(e) => setNewNote(e.target.value)} />
                  <Button className="mt-2 w-full" onClick={handleAddNote} disabled={saving || !newNote.trim()}>
                    {saving ? 'Adding...' : 'Add Update'}
                  </Button>
                </div>
              </aside>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
