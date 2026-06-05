'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import { PageHeader } from '@/components/dashboard/dashboard-components';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { useAttendance, useEmployees } from '@/hooks/useFirestoreData';
import { useAuth } from '@/contexts/providers';
import { auth } from '@/lib/firebase';
import { API_URL } from '@/lib/api';
import { authenticatedFetch } from '@/lib/auth-fetch';
import { UserProfile } from '@/types';
import { FileSignature } from 'lucide-react';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
}

export default function HR() {
  const { data: employees } = useEmployees();
  const { data: attendance } = useAttendance();
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [leaveLoading, setLeaveLoading] = useState(false);
  const [leaveError, setLeaveError] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<UserProfile | null>(null);
  const [detailForm, setDetailForm] = useState({
    salary: 35000,
    leaveBalance: 12,
    bankAccount: '',
    taxId: '',
    joiningDate: new Date().toISOString().split('T')[0],
    appraisalDate: new Date().toISOString().split('T')[0],
    performanceRating: 4.0
  });
  const [note, setNote] = useState('');
  const [notes, setNotes] = useState<Array<{ employeeId: string; text: string; createdAt: string }>>([]);
  const [leaveType, setLeaveType] = useState('Paid Leave');
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveFrom, setLeaveFrom] = useState(new Date().toISOString().split('T')[0]);
  const [leaveTo, setLeaveTo] = useState(new Date().toISOString().split('T')[0]);
  const { profile } = useAuth();

  const today = new Date().toISOString().slice(0, 10);
  const presentToday = attendance.filter((a: any) => a.date === today && a.status === 'Present').length;

  const fetchLeaveRequests = async () => {
    if (!auth.currentUser) return;
    setLeaveLoading(true);
    setLeaveError('');
    try {
      const response = await authenticatedFetch(`${API_URL}/attendance/leave-requests`);
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to load leave requests');
      }
      setLeaveRequests(await response.json());
    } catch (e: any) {
      setLeaveError(e.message);
    } finally {
      setLeaveLoading(false);
    }
  };

  useEffect(() => {
    if (auth.currentUser) fetchLeaveRequests();
  }, [profile?.uid]);

  const leaveRequestsForHR = useMemo(() => {
    return leaveRequests || [];
  }, [leaveRequests]);

  const selectEmployee = (employee: UserProfile) => {
    setSelectedEmployee(employee);
    setDetailForm({
      salary: employee.salary ?? 35000,
      leaveBalance: employee.leaveBalance ?? 12,
      bankAccount: employee.bankAccount ?? '',
      taxId: employee.taxId ?? '',
      joiningDate: employee.joiningDate ?? new Date().toISOString().split('T')[0],
      appraisalDate: employee.appraisalDate ?? new Date().toISOString().split('T')[0],
      performanceRating: employee.performanceRating ?? 4.0
    });
    setNotes([]);
  };

  const submitNote = () => {
    if (!selectedEmployee || !note.trim()) return;
    setNotes((current) => [
      { employeeId: selectedEmployee.uid, text: note.trim(), createdAt: new Date().toISOString() },
      ...current
    ]);
    setNote('');
  };

  const saveEmployeeDetails = async () => {
    if (!selectedEmployee) return;
    try {
      const response = await authenticatedFetch(`${API_URL}/employees/${selectedEmployee.uid}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(detailForm)
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to save HR details');
      }
      setSelectedEmployee({ ...selectedEmployee, ...detailForm });
    } catch (error) {
      console.error(error);
    }
  };

  const createLeaveRequest = async () => {
    if (!profile) return;
    try {
      const response = await authenticatedFetch(`${API_URL}/attendance/leave-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fromDate: leaveFrom,
          toDate: leaveTo,
          type: leaveType,
          reason: leaveReason
        })
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Leave request failed');
      }
      setLeaveReason('');
      await fetchLeaveRequests();
    } catch (error) {
      console.error(error);
    }
  };

  const updateLeaveStatus = async (id: string, status: 'Approved' | 'Rejected') => {
    if (!auth.currentUser) return;
    try {
      const response = await authenticatedFetch(`${API_URL}/attendance/leave-request/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Leave request update failed');
      }
      await fetchLeaveRequests();
    } catch (error) {
      console.error(error);
    }
  };

  const hrEmployees = useMemo(() => {
    return employees.map((employee) => ({
      ...employee,
      salary: employee.salary ?? 35000,
      leaveBalance: employee.leaveBalance ?? 12,
      joiningDate: employee.joiningDate ?? '2024-01-01',
      bankAccount: employee.bankAccount ?? 'Not assigned',
      taxId: employee.taxId ?? 'Not assigned',
      performanceRating: employee.performanceRating ?? 4.2,
      appraisalDate: employee.appraisalDate ?? '2025-03-01'
    }));
  }, [employees]);

  const totalPayroll = hrEmployees.reduce((sum, employee) => sum + (employee.salary || 0), 0);
  const avgSalary = employees.length ? totalPayroll / employees.length : 0;
  const lowLeaveCount = hrEmployees.filter((employee) => (employee.leaveBalance ?? 0) <= 5).length;
  const payrollCount = hrEmployees.filter((employee) => employee.salary && employee.salary > 0).length;

  return (
    <AppShell>
      <PageHeader
        title="HR Module"
        subtitle="Employee payroll, leave, performance and HR records in one place."
        actions={
          <div className="flex flex-wrap gap-2">
            <Link href="/letters" className="focus-ring inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold transition hover:bg-slate-50">
              <FileSignature size={16} /> Letters
            </Link>
            <Button onClick={() => setSelectedEmployee(null)}>Refresh</Button>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-4 mt-4">
        <Card>
          <p className="text-sm text-slate-500">Active Staff</p>
          <b className="text-3xl">{employees.length}</b>
          <p className="text-sm text-slate-500 mt-2">Total employees in HR records</p>
        </Card>

        <Card>
          <p className="text-sm text-slate-500">Present Today</p>
          <b className="text-3xl">{presentToday}</b>
          <p className="text-sm text-slate-500 mt-2">Live attendance for today</p>
        </Card>

        <Card>
          <p className="text-sm text-slate-500">Payroll Count</p>
          <b className="text-3xl">{payrollCount}</b>
          <p className="text-sm text-slate-500 mt-2">Employees with salary data</p>
        </Card>

        <Card>
          <p className="text-sm text-slate-500">Avg. Salary</p>
          <b className="text-3xl">{formatCurrency(avgSalary)}</b>
          <p className="text-sm text-slate-500 mt-2">Average monthly salary</p>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-3 mt-6">
        <Card className="xl:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg">Employee Payroll & HR Records</h3>
              <p className="text-sm text-slate-500">Salary, leave balance, tax, bank details and performance for every employee.</p>
            </div>
            <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">Low leave balance: {lowLeaveCount}</span>
          </div>

          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="p-3">Employee</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Salary</th>
                  <th className="p-3">Leave Balance</th>
                  <th className="p-3">Performance</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {hrEmployees.map((employee) => (
                  <tr key={employee.uid} className="border-t hover:bg-slate-50">
                    <td className="p-3 font-semibold">{employee.name}</td>
                    <td className="p-3">{employee.role}</td>
                    <td className="p-3">{formatCurrency(employee.salary || 0)}</td>
                    <td className="p-3">{employee.leaveBalance ?? 0}</td>
                    <td className="p-3">{employee.performanceRating?.toFixed(1) || 'N/A'}</td>
                    <td className="p-3">
                      <Button type="button" variant="outline" onClick={(e) => {
                        e.preventDefault();
                        selectEmployee(employee);
                      }}>
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <h3 className="font-bold text-lg">HR Summary</h3>
          <div className="mt-4 space-y-4 text-sm">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-slate-500">Total payroll commitment</p>
              <b className="text-2xl">{formatCurrency(totalPayroll)}</b>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-slate-500">Pending review</p>
              <b className="text-2xl">{employees.filter((employee) => employee.performanceRating && employee.performanceRating < 3.5).length}</b>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-slate-500">Top performer</p>
              <b className="text-2xl">{hrEmployees.sort((a, b) => (b.performanceRating || 0) - (a.performanceRating || 0))[0]?.name || 'N/A'}</b>
            </div>
          </div>
        </Card>
      </div>

      <Card className="mt-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg">Salary & HR Details</h3>
            <p className="text-sm text-slate-500">Select an employee to view salary breakdown and HR notes.</p>
          </div>
          {selectedEmployee && <Button variant="outline" onClick={() => setSelectedEmployee(null)}>Clear</Button>}
        </div>

        {selectedEmployee ? (
          <div className="grid gap-6 lg:grid-cols-2 mt-6">
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="text-xs uppercase tracking-[.3em] text-slate-500">Employee</p>
                <h3 className="font-semibold text-xl mt-2">{selectedEmployee.name}</h3>
                <p className="text-sm text-slate-600">{selectedEmployee.role} • {selectedEmployee.department}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Card className="p-4">
                  <p className="text-sm text-slate-500">Monthly Salary</p>
                  <b className="text-lg">{formatCurrency(detailForm.salary)}</b>
                </Card>
                <Card className="p-4">
                  <p className="text-sm text-slate-500">Leave Balance</p>
                  <b className="text-lg">{detailForm.leaveBalance}</b>
                </Card>
                <Card className="p-4">
                  <p className="text-sm text-slate-500">Joining Date</p>
                  <b className="text-lg">{new Date(detailForm.joiningDate).toLocaleDateString('en-IN')}</b>
                </Card>
                <Card className="p-4">
                  <p className="text-sm text-slate-500">Last Appraisal</p>
                  <b className="text-lg">{new Date(detailForm.appraisalDate).toLocaleDateString('en-IN')}</b>
                </Card>
              </div>
            </div>

            <div className="space-y-4">
              <Card className="p-4 space-y-4">
                <div>
                  <p className="text-sm text-slate-500">Salary</p>
                  <Input
                    type="number"
                    value={detailForm.salary}
                    onChange={(e) => setDetailForm({ ...detailForm, salary: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Leave Balance</p>
                  <Input
                    type="number"
                    value={detailForm.leaveBalance}
                    onChange={(e) => setDetailForm({ ...detailForm, leaveBalance: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Bank Account</p>
                  <Input
                    value={detailForm.bankAccount}
                    onChange={(e) => setDetailForm({ ...detailForm, bankAccount: e.target.value })}
                  />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Tax / PAN</p>
                  <Input
                    value={detailForm.taxId}
                    onChange={(e) => setDetailForm({ ...detailForm, taxId: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm text-slate-500">Joining Date</p>
                    <Input
                      type="date"
                      value={detailForm.joiningDate}
                      onChange={(e) => setDetailForm({ ...detailForm, joiningDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Appraisal Date</p>
                    <Input
                      type="date"
                      value={detailForm.appraisalDate}
                      onChange={(e) => setDetailForm({ ...detailForm, appraisalDate: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Performance Rating</p>
                  <Input
                    type="number"
                    min={1}
                    max={5}
                    step={0.1}
                    value={detailForm.performanceRating}
                    onChange={(e) => setDetailForm({ ...detailForm, performanceRating: Number(e.target.value) })}
                  />
                </div>
                <Button onClick={saveEmployeeDetails}>Save Payroll Details</Button>
              </Card>

              <Card className="p-4">
                <p className="text-sm text-slate-500">HR Notes</p>
                <div className="mt-3 space-y-2 max-h-32 overflow-y-auto">
                  {notes.filter((n) => n.employeeId === selectedEmployee.uid).map((noteItem) => (
                    <div key={noteItem.createdAt} className="rounded-xl bg-slate-50 p-3">
                      <p className="text-xs text-slate-500">{new Date(noteItem.createdAt).toLocaleString('en-IN')}</p>
                      <p className="text-sm">{noteItem.text}</p>
                    </div>
                  ))}
                  {notes.filter((n) => n.employeeId === selectedEmployee.uid).length === 0 && (
                    <p className="text-sm text-slate-500">No notes added yet.</p>
                  )}
                </div>
                <Textarea
                  className="mt-4"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add note for this employee"
                />
                <Button className="mt-3" onClick={submitNote}>
                  Add Note
                </Button>
              </Card>
            </div>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <Card className="p-4">
              <p className="text-sm text-slate-500">Payroll Review</p>
              <p className="mt-3 text-sm text-slate-700">Use this module to inspect salaries, leave balances, tax info and performance in one place.</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-slate-500">HR Notes</p>
              <p className="mt-3 text-sm text-slate-700">Select an employee row to add confidential HR notes and review salary details.</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-slate-500">Leave Management</p>
              <p className="mt-3 text-sm text-slate-700">Low leave balances are highlighted above for HR follow-up.</p>
            </Card>
          </div>
        )}

        <div className="mt-6">
          <h3 className="font-bold text-lg">Leave Requests</h3>
          {leaveError && <p className="mt-2 text-sm text-red-600">{leaveError}</p>}
          {leaveLoading && <p className="mt-2 text-sm text-slate-500">Loading leave requests...</p>}
          <div className="mt-4 space-y-4 rounded-2xl border border-slate-200 bg-white p-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <p className="text-sm text-slate-500">Leave Type</p>
                <Input value={leaveType} onChange={(e) => setLeaveType(e.target.value)} />
              </div>
              <div>
                <p className="text-sm text-slate-500">From</p>
                <Input type="date" value={leaveFrom} onChange={(e) => setLeaveFrom(e.target.value)} />
              </div>
              <div>
                <p className="text-sm text-slate-500">To</p>
                <Input type="date" value={leaveTo} onChange={(e) => setLeaveTo(e.target.value)} />
              </div>
              <div>
                <p className="text-sm text-slate-500">Reason</p>
                <Textarea value={leaveReason} onChange={(e) => setLeaveReason(e.target.value)} placeholder="Reason for leave request" />
              </div>
            </div>
            <Button onClick={createLeaveRequest} disabled={!leaveReason.trim() || !leaveFrom || !leaveTo}>
              Submit Leave Request
            </Button>
          </div>
          {leaveRequestsForHR.length > 0 ? (
            <div className="mt-4 space-y-3">
              {leaveRequestsForHR.map((request) => (
                <Card key={request.id || request.userId + request.fromDate} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-slate-500">{request.userName || 'Unknown'}</p>
                      <h4 className="font-semibold">{request.type} • {request.status || 'Pending'}</h4>
                      <p className="text-sm text-slate-500">{request.fromDate} to {request.toDate}</p>
                      <p className="mt-2 text-sm text-slate-700">{request.reason || 'No reason provided.'}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button className="px-3 py-2 text-sm" onClick={() => updateLeaveStatus(request.id, 'Approved')} disabled={request.status === 'Approved'}>
                        Approve
                      </Button>
                      <Button className="px-3 py-2 text-sm" variant="outline" onClick={() => updateLeaveStatus(request.id, 'Rejected')} disabled={request.status === 'Rejected'}>
                        Reject
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">No leave requests have been submitted.</p>
          )}
        </div>
      </Card>
    </AppShell>
  );
}
