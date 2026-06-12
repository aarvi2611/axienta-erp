'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore';
import { AppShell } from '@/components/layout/app-shell';
import { PageHeader } from '@/components/dashboard/dashboard-components';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { useAttendance, useEmployees } from '@/hooks/useFirestoreData';
import { useAuth } from '@/contexts/providers';
import { auth, db } from '@/lib/firebase';
import { API_URL } from '@/lib/api';
import { authenticatedFetch } from '@/lib/auth-fetch';
import { SalarySlip, UserProfile } from '@/types';
import { Download, FileSignature, Send, Trash2, Wallet } from 'lucide-react';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
}

function currentSalaryMonth() {
  return new Date().toISOString().slice(0, 7);
}

type SalarySlipForm = {
  hra: number;
  conveyance: number;
  incentives: number;
  deductions: number;
  deductionReason: string;
  workingDays: number;
  paidDays: number;
  signatureName: string;
  headManagerSignatureName: string;
  headManagerSignatureType: 'Digital' | 'Manual';
  ceoSignatureName: string;
  ceoSignatureType: 'Digital' | 'Manual';
};

const defaultSalarySlipForm: SalarySlipForm = {
  hra: 0,
  conveyance: 0,
  incentives: 0,
  deductions: 0,
  deductionReason: '',
  workingDays: 30,
  paidDays: 30,
  signatureName: 'Authorized Signatory',
  headManagerSignatureName: 'Head Manager',
  headManagerSignatureType: 'Digital',
  ceoSignatureName: 'CEO',
  ceoSignatureType: 'Digital'
};

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
  const [salarySlips, setSalarySlips] = useState<SalarySlip[]>([]);
  const [salaryMonth, setSalaryMonth] = useState(currentSalaryMonth());
  const [salarySlipForms, setSalarySlipForms] = useState<Record<string, SalarySlipForm>>({});
  const [printSalarySlip, setPrintSalarySlip] = useState<SalarySlip | null>(null);
  const [salaryMessage, setSalaryMessage] = useState('');
  const [salaryError, setSalaryError] = useState('');
  const [salarySaving, setSalarySaving] = useState(false);
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

  useEffect(() => {
    const q = query(collection(db, 'salarySlips'), orderBy('createdAt', 'desc'));
    return onSnapshot(
      q,
      (snapshot) => setSalarySlips(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })) as SalarySlip[]),
      (error) => setSalaryError(error.message || 'Failed to load salary slips')
    );
  }, []);

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

  const getSalarySlipForm = (employeeId: string) => salarySlipForms[employeeId] || defaultSalarySlipForm;

  const updateSalarySlipForm = (employeeId: string, data: Partial<SalarySlipForm>) => {
    setSalarySlipForms((current) => ({
      ...current,
      [employeeId]: {
        ...defaultSalarySlipForm,
        ...(current[employeeId] || {}),
        ...data
      }
    }));
  };

  const buildSalarySlip = (employee: UserProfile): Omit<SalarySlip, 'id'> => {
    const slipForm = getSalarySlipForm(employee.uid);
    const basicSalary = Number(employee.salary || 0);
    const slipHra = Number(slipForm.hra || 0);
    const slipConveyance = Number(slipForm.conveyance || 0);
    const slipIncentives = Number(slipForm.incentives || 0);
    const slipDeductions = Number(slipForm.deductions || 0);
    const grossSalary = basicSalary + slipHra + slipConveyance + slipIncentives;

    return {
      employeeId: employee.uid,
      employeeName: employee.name,
      employeeRole: employee.role,
      department: employee.department || 'General',
      month: salaryMonth,
      slipNo: `AXS/${salaryMonth}/${employee.employeeId || employee.uid.slice(0, 6)}`,
      basicSalary,
      hra: slipHra,
      conveyance: slipConveyance,
      incentives: slipIncentives,
      deductions: slipDeductions,
      deductionReason: slipForm.deductionReason.trim(),
      grossSalary,
      netSalary: grossSalary - slipDeductions,
      bankAccount: employee.bankAccount || '',
      taxId: employee.taxId || '',
      workingDays: Number(slipForm.workingDays || 30),
      paidDays: Number(slipForm.paidDays || 30),
      status: 'Pending Approval',
      generatedBy: profile?.name || profile?.uid || 'HR',
      signatureName: slipForm.signatureName || 'Authorized Signatory',
      headManagerSignatureName: slipForm.headManagerSignatureName || slipForm.signatureName || 'Head Manager',
      headManagerSignatureType: slipForm.headManagerSignatureType || 'Digital',
      ceoSignatureName: slipForm.ceoSignatureName || 'CEO',
      ceoSignatureType: slipForm.ceoSignatureType || 'Digital',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
  };

  const createSalarySlipForEmployee = async (employee: UserProfile) => {
    setSalaryMessage('');
    setSalaryError('');
    setSalarySaving(true);
    try {
      const existingSlip = salarySlips.find((slip) => slip.employeeId === employee.uid && slip.month === salaryMonth);
      const payload = buildSalarySlip(employee);

      if (existingSlip) {
        await updateDoc(doc(db, 'salarySlips', existingSlip.id), {
          ...payload,
          createdAt: existingSlip.createdAt,
          updatedAt: serverTimestamp()
        });
        setSalaryMessage(`Salary slip for ${employee.name} updated and sent to Head Manager for approval.`);
      } else {
        await addDoc(collection(db, 'salarySlips'), payload);
        setSalaryMessage(`Salary slip for ${employee.name} sent to Head Manager for approval.`);
      }
    } catch (error: any) {
      setSalaryError(error?.message || 'Failed to generate salary slip.');
    } finally {
      setSalarySaving(false);
    }
  };

  const createMonthlySalarySlips = async () => {
    setSalaryMessage('');
    setSalaryError('');
    setSalarySaving(true);
    try {
      let createdCount = 0;
      let updatedCount = 0;

      for (const employee of hrEmployees) {
        const existingSlip = salarySlips.find((slip) => slip.employeeId === employee.uid && slip.month === salaryMonth);
        const payload = buildSalarySlip(employee);

        if (existingSlip) {
          await updateDoc(doc(db, 'salarySlips', existingSlip.id), {
            ...payload,
            createdAt: existingSlip.createdAt,
            updatedAt: serverTimestamp()
          });
          updatedCount += 1;
        } else {
          await addDoc(collection(db, 'salarySlips'), payload);
          createdCount += 1;
        }
      }

      setSalaryMessage(`Monthly salary slips generated for ${salaryMonth}. Created: ${createdCount}, Updated: ${updatedCount}.`);
    } catch (error: any) {
      setSalaryError(error?.message || 'Failed to generate monthly salary slips.');
    } finally {
      setSalarySaving(false);
    }
  };

  const downloadSalarySlipPdf = (slip: SalarySlip) => {
    setPrintSalarySlip(slip);
    window.setTimeout(() => window.print(), 50);
  };

  const updateSalarySlipStatus = async (slip: SalarySlip, status: 'Approved' | 'Rejected') => {
    setSalaryMessage('');
    setSalaryError('');
    try {
      await updateDoc(doc(db, 'salarySlips', slip.id), {
        status,
        approvedBy: profile?.name || profile?.uid || 'Head Manager',
        approvedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setSalaryMessage(`${slip.employeeName}'s salary slip ${status.toLowerCase()}.`);
    } catch (error: any) {
      setSalaryError(error?.message || 'Failed to update salary slip approval.');
    }
  };

  const deleteSalarySlip = async (slip: SalarySlip) => {
    const confirmed = window.confirm(`Delete salary slip for ${slip.employeeName} (${slip.month})?`);
    if (!confirmed) return;

    setSalaryMessage('');
    setSalaryError('');
    try {
      await deleteDoc(doc(db, 'salarySlips', slip.id));
      setSalaryMessage(`Salary slip for ${slip.employeeName} deleted.`);
    } catch (error: any) {
      setSalaryError(error?.message || 'Failed to delete salary slip.');
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
  const monthlySalarySlips = salarySlips.filter((slip) => slip.month === salaryMonth);
  const pendingSalarySlips = monthlySalarySlips.filter((slip) => slip.status === 'Pending Approval');
  const canApproveSalarySlips = profile?.role === 'Head Manager' || profile?.role === 'CEO';

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
        <div className="mb-6 rounded-2xl border border-gold-200 bg-gold-50/70 p-4">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
            <div>
              <div className="flex items-center gap-2">
                <Wallet className="text-gold-600" size={20} />
                <h3 className="font-bold text-lg">Monthly Salary Slip Generator</h3>
              </div>
              <p className="mt-1 text-sm text-slate-600">Generate employee salary slips month-wise, save them in Firebase, and send them to Head Manager for approval.</p>
            </div>
            <div className="flex flex-col gap-2 lg:w-60">
              <div>
                <p className="text-sm text-slate-500">Salary Month</p>
                <Input type="month" value={salaryMonth} onChange={(e) => setSalaryMonth(e.target.value)} />
              </div>
              <Button type="button" onClick={createMonthlySalarySlips} disabled={salarySaving || hrEmployees.length === 0}>
                <Send size={14} /> Generate Monthly Slips
              </Button>
            </div>
          </div>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-gold-200 bg-white">
            <table className="w-full text-left text-xs">
              <thead className="bg-gold-100 text-slate-700">
                <tr>
                  <th className="p-3">Employee</th>
                  <th className="p-3">HRA</th>
                  <th className="p-3">Conveyance</th>
                  <th className="p-3">Incentive</th>
                  <th className="p-3">Deduction</th>
                  <th className="p-3">Reason</th>
                  <th className="p-3">Days</th>
                  <th className="p-3">Head Manager Signature</th>
                  <th className="p-3">CEO Signature</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {hrEmployees.map((employee) => {
                  const slipForm = getSalarySlipForm(employee.uid);
                  return (
                    <tr key={employee.uid} className="border-t align-top">
                      <td className="p-3">
                        <b className="text-sm">{employee.name}</b>
                        <p className="text-slate-500">{employee.role}</p>
                        <p className="font-semibold">{formatCurrency(employee.salary || 0)}</p>
                      </td>
                      <td className="p-3"><Input className="w-24" type="number" value={slipForm.hra} onChange={(e) => updateSalarySlipForm(employee.uid, { hra: Number(e.target.value) })} /></td>
                      <td className="p-3"><Input className="w-24" type="number" value={slipForm.conveyance} onChange={(e) => updateSalarySlipForm(employee.uid, { conveyance: Number(e.target.value) })} /></td>
                      <td className="p-3"><Input className="w-24" type="number" value={slipForm.incentives} onChange={(e) => updateSalarySlipForm(employee.uid, { incentives: Number(e.target.value) })} /></td>
                      <td className="p-3"><Input className="w-24" type="number" value={slipForm.deductions} onChange={(e) => updateSalarySlipForm(employee.uid, { deductions: Number(e.target.value) })} /></td>
                      <td className="p-3">
                        <Textarea
                          className="min-h-[72px] w-52"
                          value={slipForm.deductionReason}
                          onChange={(e) => updateSalarySlipForm(employee.uid, { deductionReason: e.target.value })}
                          placeholder="Absent, not working, late, unpaid leave..."
                        />
                      </td>
                      <td className="p-3">
                        <div className="space-y-2">
                          <Input className="w-20" type="number" value={slipForm.workingDays} onChange={(e) => updateSalarySlipForm(employee.uid, { workingDays: Number(e.target.value) })} />
                          <Input className="w-20" type="number" value={slipForm.paidDays} onChange={(e) => updateSalarySlipForm(employee.uid, { paidDays: Number(e.target.value) })} />
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="space-y-2">
                          <Input className="w-40" value={slipForm.headManagerSignatureName} onChange={(e) => updateSalarySlipForm(employee.uid, { headManagerSignatureName: e.target.value, signatureName: e.target.value })} />
                          <select
                            className="w-40 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold"
                            value={slipForm.headManagerSignatureType}
                            onChange={(e) => updateSalarySlipForm(employee.uid, { headManagerSignatureType: e.target.value as 'Digital' | 'Manual' })}
                          >
                            <option value="Digital">Digital</option>
                            <option value="Manual">Manual</option>
                          </select>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="space-y-2">
                          <Input className="w-40" value={slipForm.ceoSignatureName} onChange={(e) => updateSalarySlipForm(employee.uid, { ceoSignatureName: e.target.value })} />
                          <select
                            className="w-40 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold"
                            value={slipForm.ceoSignatureType}
                            onChange={(e) => updateSalarySlipForm(employee.uid, { ceoSignatureType: e.target.value as 'Digital' | 'Manual' })}
                          >
                            <option value="Digital">Digital</option>
                            <option value="Manual">Manual</option>
                          </select>
                        </div>
                      </td>
                      <td className="p-3">
                        <Button type="button" className="px-3 py-2 text-xs" onClick={() => createSalarySlipForEmployee(employee)} disabled={salarySaving}>
                          <Send size={14} /> Generate
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {salaryMessage && <p className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">{salaryMessage}</p>}
          {salaryError && <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{salaryError}</p>}
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl bg-white p-4">
              <p className="text-sm text-slate-500">Generated This Month</p>
              <b className="text-2xl">{monthlySalarySlips.length}</b>
            </div>
            <div className="rounded-2xl bg-white p-4">
              <p className="text-sm text-slate-500">Pending Approval</p>
              <b className="text-2xl">{pendingSalarySlips.length}</b>
            </div>
            <div className="rounded-2xl bg-white p-4">
              <p className="text-sm text-slate-500">Approved</p>
              <b className="text-2xl">{monthlySalarySlips.filter((slip) => slip.status === 'Approved').length}</b>
            </div>
          </div>
        </div>

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
                {selectedEmployee && (
                  <Button
                    variant="outline"
                    onClick={() => createSalarySlipForEmployee({ ...selectedEmployee, ...detailForm })}
                    disabled={salarySaving}
                  >
                    <Send size={16} /> Generate Salary Slip
                  </Button>
                )}
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
          <h3 className="font-bold text-lg">Salary Slip Approval Queue</h3>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 text-slate-600">
                <tr>
                  <th className="p-3">Employee</th>
                  <th className="p-3">Month</th>
                  <th className="p-3">Net Salary</th>
                  <th className="p-3">Deduction</th>
                  <th className="p-3">Deduction Reason</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Generated By</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {monthlySalarySlips.length === 0 && (
                  <tr><td className="p-6 text-center text-slate-500" colSpan={8}>No salary slips generated for this month.</td></tr>
                )}
                {monthlySalarySlips.map((slip) => (
                  <tr key={slip.id} className="border-t">
                    <td className="p-3">
                      <b>{slip.employeeName}</b>
                      <p className="text-xs text-slate-500">{slip.employeeRole} | {slip.department}</p>
                    </td>
                    <td className="p-3">{slip.month}</td>
                    <td className="p-3">{formatCurrency(slip.netSalary || 0)}</td>
                    <td className="p-3">{formatCurrency(slip.deductions || 0)}</td>
                    <td className="p-3">
                      <p className="max-w-xs text-xs text-slate-600">{slip.deductionReason || (slip.deductions ? 'No reason mentioned' : 'No deduction')}</p>
                    </td>
                    <td className="p-3">
                      <span className={`rounded-full px-2 py-1 text-xs font-bold ${slip.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : slip.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                        {slip.status}
                      </span>
                    </td>
                    <td className="p-3">{slip.generatedBy || 'HR'}</td>
                    <td className="p-3">
                      {canApproveSalarySlips && slip.status === 'Pending Approval' ? (
                        <div className="flex flex-wrap gap-2">
                          <Button className="px-3 py-2 text-xs" onClick={() => updateSalarySlipStatus(slip, 'Approved')}>Approve</Button>
                          <Button className="px-3 py-2 text-xs" variant="outline" onClick={() => updateSalarySlipStatus(slip, 'Rejected')}>Reject</Button>
                          <Button className="px-3 py-2 text-xs" variant="outline" onClick={() => downloadSalarySlipPdf(slip)}><Download size={14} /> PDF</Button>
                          <Button className="px-3 py-2 text-xs border-red-200 text-red-600 hover:bg-red-50" variant="outline" onClick={() => deleteSalarySlip(slip)}><Trash2 size={14} /> Delete</Button>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          <span className="text-xs text-slate-500">{slip.approvedBy ? `By ${slip.approvedBy}` : 'Waiting'}</span>
                          <Button className="px-3 py-2 text-xs" variant="outline" onClick={() => downloadSalarySlipPdf(slip)}><Download size={14} /> PDF</Button>
                          <Button className="px-3 py-2 text-xs border-red-200 text-red-600 hover:bg-red-50" variant="outline" onClick={() => deleteSalarySlip(slip)}><Trash2 size={14} /> Delete</Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

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
      {printSalarySlip && (
        <div className="print-only">
          <SalarySlipPrint slip={printSalarySlip} />
        </div>
      )}
    </AppShell>
  );
}

function SalarySlipPrint({ slip }: { slip: SalarySlip }) {
  const grossSalary = slip.grossSalary ?? (slip.basicSalary + slip.hra + slip.conveyance + slip.incentives);
  const issuedOn = new Date().toLocaleDateString('en-IN');
  const headManagerSignatureName = slip.headManagerSignatureName || slip.signatureName || 'Head Manager';
  const headManagerSignatureType = slip.headManagerSignatureType || 'Digital';
  const ceoSignatureName = slip.ceoSignatureName || 'CEO';
  const ceoSignatureType = slip.ceoSignatureType || 'Digital';

  return (
    <article className="salary-slip-page">
      <div className="salary-slip-watermark">AXIENTA</div>
      <header className="salary-slip-header">
        <div className="flex items-center gap-4">
          <div className="salary-slip-logo">
            <img src="/axienta-logo.png" alt="Axienta Business Consulting logo" />
          </div>
          <div>
            <h1>Axienta Business Consulting</h1>
            <p>249, Bijli Office Road, Belisarai, Motihari, Bihar 845401</p>
            <p>Phone: 8873773398 | Email: info@axientabuisnessconsulting.com</p>
          </div>
        </div>
        <div className="salary-slip-title">
          <span>Salary Slip</span>
          <b>{slip.status}</b>
        </div>
      </header>

      <div className="salary-slip-section-title">Payroll Summary</div>
      <section className="salary-slip-meta">
        <div><span>Slip No.</span><b>{slip.slipNo || `AXS/${slip.month}/${slip.employeeId.slice(0, 6)}`}</b></div>
        <div><span>Salary Month</span><b>{slip.month}</b></div>
        <div><span>Issue Date</span><b>{issuedOn}</b></div>
        <div><span>Status</span><b>{slip.status}</b></div>
      </section>

      <div className="salary-slip-section-title">Employee & Attendance Details</div>
      <section className="salary-slip-employee">
        <div><span>Employee Name</span><b>{slip.employeeName}</b></div>
        <div><span>Designation</span><b>{slip.employeeRole}</b></div>
        <div><span>Department</span><b>{slip.department}</b></div>
        <div><span>Employee ID</span><b>{slip.employeeId}</b></div>
        <div><span>Working Days</span><b>{slip.workingDays || 30}</b></div>
        <div><span>Paid Days</span><b>{slip.paidDays || 30}</b></div>
        <div><span>Bank Account</span><b>{slip.bankAccount || 'Not assigned'}</b></div>
        <div><span>PAN / Tax ID</span><b>{slip.taxId || 'Not assigned'}</b></div>
      </section>

      <div className="salary-slip-section-title">Earnings & Deductions</div>
      <section className="salary-slip-grid">
        <table>
          <thead><tr><th>Earnings</th><th>Amount</th></tr></thead>
          <tbody>
            <tr><td>Basic Salary</td><td>{formatCurrency(slip.basicSalary)}</td></tr>
            <tr><td>HRA</td><td>{formatCurrency(slip.hra)}</td></tr>
            <tr><td>Conveyance</td><td>{formatCurrency(slip.conveyance)}</td></tr>
            <tr><td>Incentives / Bonus</td><td>{formatCurrency(slip.incentives)}</td></tr>
            <tr className="total"><td>Gross Salary</td><td>{formatCurrency(grossSalary)}</td></tr>
          </tbody>
        </table>

        <table>
          <thead><tr><th>Deductions</th><th>Amount</th></tr></thead>
          <tbody>
            <tr><td>Deductions</td><td>{formatCurrency(slip.deductions)}</td></tr>
            <tr><td>Reason</td><td>{slip.deductionReason || 'No deduction'}</td></tr>
            <tr className="total"><td>Total Deduction</td><td>{formatCurrency(slip.deductions)}</td></tr>
          </tbody>
        </table>
      </section>

      <section className="salary-slip-net">
        <div>
          <span>Net Payable Salary</span>
          <p>Amount payable after all earnings and deductions</p>
        </div>
        <b>{formatCurrency(slip.netSalary)}</b>
      </section>

      <section className="salary-slip-remarks">
        <b>Deduction Remarks:</b> {slip.deductionReason || 'No deductions applied for this salary period.'}
      </section>

      <footer className="salary-slip-footer">
        <div>
          <p className="font-semibold">Prepared By</p>
          <p>{slip.generatedBy || 'HR Department'}</p>
        </div>
        <div className="salary-slip-signature">
          <strong>{headManagerSignatureType === 'Digital' ? headManagerSignatureName : ' '}</strong>
          <div />
          <p>{headManagerSignatureName}</p>
          <span>Head Manager {headManagerSignatureType} Signature</span>
        </div>
        <div className="salary-slip-signature">
          <strong>{ceoSignatureType === 'Digital' ? ceoSignatureName : ' '}</strong>
          <div />
          <p>{ceoSignatureName}</p>
          <span>CEO {ceoSignatureType} Signature</span>
        </div>
      </footer>

      <p className="salary-slip-note">This salary slip is confidential and system generated for payroll records. Please contact HR for any correction request.</p>
    </article>
  );
}
