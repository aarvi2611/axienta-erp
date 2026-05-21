'use client';

import { useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { PageHeader } from '@/components/dashboard/dashboard-components';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/input';
import { initials } from '@/lib/utils';
import { useEmployees } from '@/hooks/useFirestoreData';
import { roles } from '@/lib/roles';
import { API_URL } from '@/lib/api';
import { authenticatedFetch } from '@/lib/auth-fetch';
import { Role } from '@/types';

function generatePassword() {
  const suffix = Math.random().toString(36).slice(2, 8);
  return `Axienta@${suffix}`;
}

export default function Employees() {
  const { data: employees, loading, error } = useEmployees();
  const [open, setOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    role: 'Sales Executive' as Role,
    employeeId: '',
    salary: 35000,
    leaveBalance: 12,
    password: generatePassword()
  });
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    role: 'Sales Executive' as Role,
    employeeId: '',
    salary: 35000,
    leaveBalance: 12
  });

  const createEmployee = async () => {
    setSaving(true);
    setMessage('');
    try {
      const res = await authenticatedFetch(`${API_URL}/employees`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create employee');

      setMessage(`Employee created. Login email: ${form.email} | Temporary password: ${data.temporaryPassword || form.password}`);
      setForm({
        name: '',
        email: '',
        phone: '',
        department: '',
        role: 'Sales Executive',
        employeeId: '',
        salary: 35000,
        leaveBalance: 12,
        password: generatePassword()
      });
      setOpen(false);
    } catch (e: any) {
      setMessage(e.message || 'Failed to create employee');
    } finally {
      setSaving(false);
    }
  };

  const resetPassword = async (uid: string) => {
    const password = generatePassword();
    setMessage('');
    try {
      const res = await authenticatedFetch(`${API_URL}/employees/${uid}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Password reset failed');
      setMessage(`Password reset successful. New temporary password: ${data.temporaryPassword || password}`);
    } catch (e: any) {
      setMessage(e.message || 'Password reset failed');
    }
  };

  const startEdit = (employee: any) => {
    setEditForm({
      name: employee.name,
      email: employee.email,
      phone: employee.phone || '',
      department: employee.department,
      role: employee.role,
      employeeId: employee.employeeId,
      salary: employee.salary ?? 35000,
      leaveBalance: employee.leaveBalance ?? 12
    });
    setEditingEmployee(employee.uid);
  };

  const updateEmployee = async () => {
    setSaving(true);
    setMessage('');
    try {
      const res = await authenticatedFetch(`${API_URL}/employees/${editingEmployee}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update employee');

      setMessage('Employee updated successfully');
      setEditingEmployee(null);
    } catch (e: any) {
      setMessage(e.message || 'Failed to update employee');
    } finally {
      setSaving(false);
    }
  };

  const deleteEmployee = async (uid: string, name: string) => {
    const confirmed = confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`);
    if (!confirmed) return;

    setSaving(true);
    setMessage('');
    try {
      const res = await authenticatedFetch(`${API_URL}/employees/${uid}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete employee');
      }

      setMessage(`Employee ${name} deleted successfully`);
    } catch (e: any) {
      setMessage(e.message || 'Failed to delete employee');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <PageHeader
        title="Employees"
        subtitle="Create Firebase Auth employee accounts and Firestore employee profiles. Only CEO/Admin/Head Manager can create accounts."
        actions={<Button onClick={() => setOpen(!open)}>+ Create Employee</Button>}
      />

      {message && <p className="mb-4 rounded-xl bg-gold-50 p-3 text-sm font-semibold text-navy-900">{message}</p>}

      {open && (
        <Card className="mb-4">
          <h3 className="text-lg font-bold">Create Employee Account</h3>
          <p className="mt-1 text-sm text-slate-500">This creates both Firebase Authentication login and Firestore employee/user documents through the backend.</p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <Input placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <Input placeholder="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
            <Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })}>
              {roles.map((r) => <option key={r}>{r}</option>)}
            </Select>
            <Input placeholder="Employee ID optional e.g. AX-SAL-001" value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} />
            <Input type="number" placeholder="Salary (INR)" value={form.salary} onChange={(e) => setForm({ ...form, salary: Number(e.target.value) })} />
            <Input type="number" placeholder="Leave balance" value={form.leaveBalance} onChange={(e) => setForm({ ...form, leaveBalance: Number(e.target.value) })} />
            <Input placeholder="Temporary Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <Button type="button" variant="outline" onClick={() => setForm({ ...form, password: generatePassword() })}>Generate Password</Button>
            <Button disabled={saving || !form.name || !form.email || !form.password || !form.department} onClick={createEmployee}>{saving ? 'Creating...' : 'Save Employee'}</Button>
          </div>
        </Card>
      )}

      {editingEmployee && (
        <Card className="mb-4">
          <h3 className="text-lg font-bold">Edit Employee</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <Input placeholder="Full Name" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
            <Input type="email" placeholder="Email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
            <Input placeholder="Phone" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
            <Input placeholder="Department" value={editForm.department} onChange={(e) => setEditForm({ ...editForm, department: e.target.value })} />
            <Select value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value as Role })}>
              {roles.map((r) => <option key={r}>{r}</option>)}
            </Select>
            <Input placeholder="Employee ID" value={editForm.employeeId} onChange={(e) => setEditForm({ ...editForm, employeeId: e.target.value })} />
            <Input type="number" placeholder="Salary (INR)" value={editForm.salary} onChange={(e) => setEditForm({ ...editForm, salary: Number(e.target.value) })} />
            <Input type="number" placeholder="Leave balance" value={editForm.leaveBalance} onChange={(e) => setEditForm({ ...editForm, leaveBalance: Number(e.target.value) })} />
            <Button disabled={saving} onClick={updateEmployee}>{saving ? 'Updating...' : 'Update Employee'}</Button>
            <Button variant="outline" onClick={() => setEditingEmployee(null)}>Cancel</Button>
          </div>
        </Card>
      )}

      {loading && <p className="mb-3 text-sm text-slate-500">Loading Firebase employees...</p>}
      {error && <p className="mb-3 rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {employees.map((e) => (
          <Card key={e.uid}>
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-navy-800 font-bold text-white">{initials(e.name)}</div>
              <div>
                <b>{e.name}</b>
                <p className="text-sm text-slate-500">{e.employeeId}</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <span>Email</span><b className="truncate">{e.email}</b>
              <span>Role</span><b>{e.role}</b>
              <span>Department</span><b>{e.department}</b>
              <span>Status</span><b className="text-emerald-600">{e.status}</b>
              <span>Salary</span><b>{e.salary ? `₹${e.salary.toLocaleString()}` : '—'}</b>
              <span>Leave</span><b>{e.leaveBalance ?? 0}</b>
            </div>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" onClick={() => startEdit(e)}>Edit</Button>
              <Button variant="outline" onClick={() => resetPassword(e.uid)}>Reset Password</Button>
              <Button variant="outline" className="text-red-600 hover:bg-red-50" onClick={() => deleteEmployee(e.uid, e.name)}>Delete</Button>
            </div>
          </Card>
        ))}
        {employees.length === 0 && !loading && <Card>No employees found in Firebase. Create your first employee using the form above.</Card>}
      </div>
    </AppShell>
  );
}
