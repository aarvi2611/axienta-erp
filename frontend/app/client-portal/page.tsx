'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  CalendarDays,
  Camera,
  CircleDollarSign,
  Download,
  FileSpreadsheet,
  FileWarning,
  FileWarning as InvoiceIcon,
  LineChart as LineChartIcon,
  Mail,
  PhoneCall,
  Send,
  ShieldCheck,
  Sparkles,
  Ticket,
  TrendingUp,
  Users
} from 'lucide-react';
import { where } from 'firebase/firestore';
import * as XLSX from 'xlsx';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  createClientTicket,
  useClientAsset,
  useClientTickets,
  useCollection,
  usePaymentReminders
} from '@/hooks/useFirestoreData';
import { type ClientDailyUpdate, type ClientProfile, type TicketCategory, type TicketPriority } from '@/types';

const todayMonth = new Date().toISOString().slice(0, 7);
const today = new Date().toISOString().slice(0, 10);
const currency = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

const TICKET_CATEGORIES: TicketCategory[] = ['Billing', 'Service', 'Review', 'Call', 'Other'];
const TICKET_PRIORITIES: TicketPriority[] = ['Low', 'Medium', 'High', 'Urgent'];

export default function ClientPortalPage() {
  const [lookupInput, setLookupInput] = useState('');
  const [activeClientId, setActiveClientId] = useState('');
  const [monthFilter, setMonthFilter] = useState(todayMonth);

  const normalizedClientId = activeClientId.trim().toUpperCase();
  const { data: matchedClients, loading: clientLoading } = useCollection<ClientProfile>(
    'clients',
    normalizedClientId ? [where('clientId', '==', normalizedClientId)] : [],
    [normalizedClientId]
  );
  const { data: updates, loading: updatesLoading } = useCollection<ClientDailyUpdate>(
    'client_daily_updates',
    normalizedClientId ? [where('clientId', '==', normalizedClientId)] : [],
    [normalizedClientId]
  );
  const { data: tickets } = useClientTickets(normalizedClientId);
  const { data: payments } = usePaymentReminders(normalizedClientId);
  const { data: assets } = useClientAsset(normalizedClientId);

  const client = matchedClients[0] || null;
  const asset = assets[0] || null;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const clientId = params.get('clientId') || params.get('id');
    if (clientId) {
      setLookupInput(clientId.toUpperCase());
      setActiveClientId(clientId.toUpperCase());
    }
  }, []);

  useEffect(() => {
    if (client) {
      setMonthFilter(today.slice(0, 7));
    }
  }, [client]);

  const monthlyUpdates = useMemo(() => {
    return [...updates]
      .filter((entry) => entry.updateDate.startsWith(monthFilter))
      .sort((a, b) => b.updateDate.localeCompare(a.updateDate));
  }, [monthFilter, updates]);

  const allUpdates = useMemo(
    () => [...updates].sort((a, b) => b.updateDate.localeCompare(a.updateDate)),
    [updates]
  );

  const summary = useMemo(() => {
    const source = client ? monthlyUpdates : [];
    const groupedProfiles = source.reduce<Record<string, { reviews: number; dropped: number; calls: number; paid: number; pending: number }>>(
      (acc, item) => {
        const key = item.businessProfile || 'Unassigned';
        if (!acc[key]) {
          acc[key] = { reviews: 0, dropped: 0, calls: 0, paid: 0, pending: 0 };
        }
        acc[key].reviews += Number(item.reviewsReceived || 0);
        acc[key].dropped += Number(item.reviewsDropped || 0);
        acc[key].calls += Number(item.callsReceived || 0);
        acc[key].paid += Number(item.paymentsMade || 0);
        acc[key].pending += Number(item.paymentsPending || 0);
        return acc;
      },
      {}
    );

    return {
      reviews: source.reduce((sum, item) => sum + Number(item.reviewsReceived || 0), 0),
      dropped: source.reduce((sum, item) => sum + Number(item.reviewsDropped || 0), 0),
      calls: source.reduce((sum, item) => sum + Number(item.callsReceived || 0), 0),
      paid: source.reduce((sum, item) => sum + Number(item.paymentsMade || 0), 0),
      pending: source.reduce((sum, item) => sum + Number(item.paymentsPending || 0), 0),
      openIssues: source.filter((item) => item.issueStatus !== 'None').length,
      profiles: Object.entries(groupedProfiles)
        .map(([name, value]) => ({ name, ...value }))
        .sort((a, b) => b.reviews + b.calls - (a.reviews + a.calls))
    };
  }, [client, monthlyUpdates]);

  const monthlyTrend = useMemo(() => {
    const now = new Date();
    const months: { label: string; tag: string }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const tag = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = `${d.toLocaleString('en-US', { month: 'short' })} ${String(d.getFullYear()).slice(2)}`;
      months.push({ label, tag });
    }
    return months.map(({ label, tag }) => {
      const slice = updates.filter((u) => u.updateDate.startsWith(tag));
      return {
        month: label,
        reviews: slice.reduce((s, u) => s + Number(u.reviewsReceived || 0), 0),
        calls: slice.reduce((s, u) => s + Number(u.callsReceived || 0), 0),
        payments: slice.reduce((s, u) => s + Number(u.paymentsMade || 0), 0)
      };
    });
  }, [updates]);

  const upcomingPayments = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return payments
      .map((p) => ({ ...p, _d: new Date(p.dueDate) }))
      .filter((p) => p._d >= now || p.status === 'Overdue')
      .sort((a, b) => a._d.getTime() - b._d.getTime())
      .slice(0, 5);
  }, [payments]);

  const openPortal = (event: FormEvent) => {
    event.preventDefault();
    setActiveClientId(lookupInput.trim().toUpperCase());
  };

  const hasPortal = Boolean(client);
  const contactEmail = client?.supportEmail || client?.contactEmail || '';
  const contactPhone = client?.supportPhone || client?.contactPhone || '';

  const downloadCSV = () => {
    if (!client) return;
    const header = [
      'Date',
      'Business Profile',
      'Reviews Received',
      'Reviews Dropped',
      'Calls Received',
      'Payments Made',
      'Payments Pending',
      'Issue Status',
      'Issue Summary',
      'Contact Status',
      'Note'
    ];
    const escape = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const body = monthlyUpdates.map((r) =>
      [
        r.updateDate,
        r.businessProfile,
        r.reviewsReceived,
        r.reviewsDropped,
        r.callsReceived,
        r.paymentsMade,
        r.paymentsPending,
        r.issueStatus,
        r.issueSummary,
        r.contactStatus,
        r.note
      ]
        .map(escape)
        .join(',')
    );
    const csv = [header.map(escape).join(','), ...body].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${client.clientId}-${monthFilter}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadXLSX = () => {
    if (!client) return;
    const rows = monthlyUpdates.map((r) => ({
      Date: r.updateDate,
      'Business Profile': r.businessProfile,
      'Reviews Received': r.reviewsReceived,
      'Reviews Dropped': r.reviewsDropped,
      'Calls Received': r.callsReceived,
      'Payments Made': r.paymentsMade,
      'Payments Pending': r.paymentsPending,
      'Issue Status': r.issueStatus,
      'Issue Summary': r.issueSummary,
      'Contact Status': r.contactStatus,
      Note: r.note
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, monthFilter);
    XLSX.writeFile(wb, `${client.clientId}-${monthFilter}.xlsx`);
  };

  const handleTicketSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!client) return;
    const form = event.currentTarget;
    const fd = new FormData(form);
    try {
      await createClientTicket({
        clientId: client.clientId,
        businessName: client.businessName,
        title: String(fd.get('title') || ''),
        description: String(fd.get('description') || ''),
        category: (fd.get('category') as TicketCategory) || 'Other',
        priority: (fd.get('priority') as TicketPriority) || 'Medium',
        raisedBy: client.contactName || client.contactEmail || ''
      });
      form.reset();
      alert('Ticket submitted. Operations team will reach out shortly.');
    } catch (err) {
      alert(`Failed to submit ticket: ${(err as Error).message}`);
    }
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#07111f] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_12%,rgba(14,165,233,.28),transparent_28%),radial-gradient(circle_at_82%_14%,rgba(16,185,129,.24),transparent_24%),radial-gradient(circle_at_72%_88%,rgba(244,114,182,.18),transparent_26%),linear-gradient(135deg,#06111f_0%,#0c1d35_52%,#030712_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(180deg,transparent,rgba(255,255,255,.05))]" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 md:px-8 xl:px-10">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="grid h-14 w-14 place-items-center overflow-hidden rounded-2xl border border-white/15 bg-white/8 p-2 shadow-2xl shadow-cyan-500/10">
              <img src="/axienta-logo-transparent.png" alt="Axienta logo" className="h-full w-full object-contain" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[.3em] text-cyan-200">Client Portal</p>
              <h1 className="text-2xl font-black tracking-tight md:text-3xl">Axienta Business Consulting</h1>
            </div>
          </div>

          {hasPortal && (
            <Button
              variant="outline"
              className="border-white/15 bg-white/5 text-white hover:bg-white/10"
              onClick={() => {
                setActiveClientId('');
                setLookupInput('');
              }}
            >
              Switch Client
            </Button>
          )}
        </header>

        {!hasPortal ? (
          <div className="flex flex-1 items-center justify-center py-10">
            <div className="grid w-full gap-6 lg:grid-cols-[1.05fr_.95fr]">
              <motion.section
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
              >
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-xs font-bold uppercase tracking-[.24em] text-cyan-100">
                    <Sparkles size={15} />
                    Secure client access
                  </div>
                  <h2 className="mt-5 text-4xl font-black leading-tight md:text-6xl">
                    Enter your client ID and open a live business view.
                  </h2>
                  <p className="mt-5 max-w-xl text-base leading-7 text-slate-200 md:text-lg">
                    Every client sees only its own business data. Reviews, calls, payments, issues, and daily progress are stored separately by client ID.
                  </p>
                </div>
                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  <FeatureTile
                    icon={<ShieldCheck className="text-emerald-300" size={22} />}
                    title="Isolated data"
                    body="No cross-client mix-up."
                  />
                  <FeatureTile
                    icon={<TrendingUp className="text-cyan-300" size={22} />}
                    title="Daily reporting"
                    body="Track performance every day."
                  />
                  <FeatureTile
                    icon={<AlertTriangle className="text-rose-300" size={22} />}
                    title="Fast support"
                    body="Open issues get contact actions."
                  />
                </div>
              </motion.section>

              <motion.section
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.08 }}
                className="flex items-center"
              >
                <Card className="w-full border-white/15 bg-white/8 p-6 text-white shadow-2xl backdrop-blur-xl md:p-8">
                  <h2 className="text-2xl font-black">Client ID Login</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-200">
                    Use the ID shared by the Axienta team. The portal will load only your business data.
                  </p>

                  <form className="mt-6 space-y-4" onSubmit={openPortal}>
                    <Input
                      value={lookupInput}
                      onChange={(e) => setLookupInput(e.target.value.toUpperCase())}
                      placeholder="CLIENT-001"
                      className="h-12 border-white/15 bg-white/5 text-base text-white placeholder:text-slate-400"
                    />
                    <Button
                      type="submit"
                      className="h-12 w-full bg-gradient-to-r from-cyan-500 via-emerald-500 to-amber-500 text-base font-black text-slate-950"
                    >
                      Open Portal
                      <ArrowRight size={18} />
                    </Button>
                  </form>

                  <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                    <p className="text-xs font-bold uppercase tracking-[.24em] text-cyan-200">What you will see</p>
                    <div className="mt-3 grid gap-2 text-sm text-slate-200">
                      <p>• Business profiles and monthly reviews</p>
                      <p>• Calls received, payments made, and pending amount</p>
                      <p>• 6-month trend chart and downloadable monthly reports</p>
                      <p>• Issue raise form and payment reminders</p>
                    </div>
                  </div>
                </Card>
              </motion.section>
            </div>
          </div>
        ) : (
          <div className="flex-1 py-8">
            {/* Cover image if set */}
            {asset?.coverUrl && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="mb-4 h-40 w-full overflow-hidden rounded-2xl border border-white/10"
              >
                <img src={asset.coverUrl} alt="cover" className="h-full w-full object-cover" />
              </motion.div>
            )}

            <div className="grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
              <motion.section
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.005, y: -2 }}
                transition={{ duration: 0.35 }}
                className="space-y-6"
              >
                <Card className="border-white/10 bg-white/8 p-6 text-white shadow-2xl backdrop-blur-xl">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {asset?.logoUrl ? (
                        <img
                          src={asset.logoUrl}
                          alt="logo"
                          className="h-16 w-16 rounded-2xl border border-white/15 object-cover"
                        />
                      ) : (
                        <div className="grid h-16 w-16 place-items-center rounded-2xl border border-white/10 bg-white/10">
                          <Building2 className="text-amber-300" size={28} />
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-black uppercase tracking-[.28em] text-cyan-200">Active Client</p>
                        <h2 className="mt-1 text-3xl font-black">{client?.businessName}</h2>
                        <p className="mt-1 text-sm text-slate-200">
                          Client ID {client?.clientId}
                          {asset?.logoUrl ? ' • Branded profile' : ''}
                        </p>
                      </div>
                    </div>
                    <Camera className="text-amber-300" size={22} />
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-4">
                    <SummaryStat label="Reviews" value={summary.reviews} tone="cyan" />
                    <SummaryStat label="Dropped" value={summary.dropped} tone="rose" />
                    <SummaryStat label="Calls" value={summary.calls} tone="emerald" />
                    <SummaryStat label="Pending" value={summary.pending} tone="amber" />
                  </div>

                  <div className="mt-6 flex flex-wrap gap-2">
                    {client?.businessProfiles.map((profileName) => (
                      <span
                        key={profileName}
                        className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-bold text-white"
                      >
                        {profileName}
                      </span>
                    ))}
                  </div>
                </Card>

                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="border-white/10 bg-white/8 p-5 text-white shadow-2xl backdrop-blur-xl">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold uppercase tracking-[.24em] text-cyan-100">Contact</p>
                      <Mail className="text-cyan-200" size={18} />
                    </div>
                    <p className="mt-3 text-lg font-black">{client?.contactName || 'Not set'}</p>
                    <p className="text-sm text-slate-200">{client?.contactEmail || 'No email stored'}</p>
                    <p className="text-sm text-slate-200">{client?.contactPhone || 'No phone stored'}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        className="border-white/10 bg-white/5 text-white hover:bg-white/10"
                        disabled={!contactEmail}
                        onClick={() => contactEmail && (window.location.href = `mailto:${contactEmail}`)}
                      >
                        Email Support
                      </Button>
                      <Button
                        variant="outline"
                        className="border-white/10 bg-white/5 text-white hover:bg-white/10"
                        disabled={!contactPhone}
                        onClick={() => contactPhone && (window.location.href = `tel:${contactPhone}`)}
                      >
                        Call Now
                      </Button>
                    </div>
                  </Card>

                  <Card className="border-white/10 bg-white/8 p-5 text-white shadow-2xl backdrop-blur-xl">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold uppercase tracking-[.24em] text-emerald-100">Financials</p>
                      <CircleDollarSign className="text-emerald-200" size={18} />
                    </div>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl bg-emerald-500/15 p-4">
                        <p className="text-xs font-bold uppercase text-emerald-100">Payments Made</p>
                        <p className="mt-2 text-2xl font-black">{summary.paid}</p>
                      </div>
                      <div className="rounded-2xl bg-amber-500/15 p-4">
                        <p className="text-xs font-bold uppercase text-amber-100">Pending Amount</p>
                        <p className="mt-2 text-2xl font-black">₹{currency.format(summary.pending)}</p>
                      </div>
                    </div>
                    <p className="mt-4 text-sm text-slate-200">
                      Retainer: ₹{currency.format(Number(client?.monthlyRetainer || 0))} per month
                    </p>
                  </Card>
                </div>

                {/* Trend chart */}
                <Card className="border-white/10 bg-white/8 p-5 text-white shadow-2xl backdrop-blur-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold uppercase tracking-[.24em] text-violet-200">6-Month Trend</p>
                      <h3 className="mt-1 text-2xl font-black">Reviews, Calls & Payments</h3>
                    </div>
                    <LineChartIcon className="text-violet-200" size={20} />
                  </div>
                  <div className="mt-4 h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthlyTrend} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.08)" />
                        <XAxis dataKey="month" stroke="#cbd5e1" fontSize={12} />
                        <YAxis stroke="#cbd5e1" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            background: '#0c1d35',
                            border: '1px solid rgba(255,255,255,.15)',
                            borderRadius: 12,
                            color: '#fff'
                          }}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="reviews"
                          name="Reviews"
                          stroke="#22d3ee"
                          strokeWidth={2.5}
                          dot={{ r: 3 }}
                          activeDot={{ r: 5 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="calls"
                          name="Calls"
                          stroke="#34d399"
                          strokeWidth={2.5}
                          dot={{ r: 3 }}
                          activeDot={{ r: 5 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="payments"
                          name="Payments"
                          stroke="#fbbf24"
                          strokeWidth={2.5}
                          dot={{ r: 3 }}
                          activeDot={{ r: 5 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* Payment reminders */}
                <Card className="border-white/10 bg-gradient-to-br from-amber-500/15 to-rose-500/10 p-5 text-white shadow-2xl backdrop-blur-xl">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold uppercase tracking-[.24em] text-amber-100">Upcoming Payments</p>
                    <InvoiceIcon className="text-amber-200" size={18} />
                  </div>
                  <div className="mt-3 space-y-2">
                    {upcomingPayments.length === 0 && (
                      <p className="rounded-2xl bg-white/8 p-4 text-sm text-slate-200">No upcoming payments.</p>
                    )}
                    {upcomingPayments.map((p) => (
                      <div key={p.id} className="flex items-center justify-between rounded-2xl bg-white/8 p-3">
                        <div>
                          <p className="font-black">{p.title}</p>
                          <p className="text-xs text-slate-300">
                            Due {p.dueDate} • {p.invoiceNo || 'No invoice #'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-black">₹{currency.format(Number(p.amount || 0))}</p>
                          <p className="text-xs text-amber-200">{p.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.section>

              <motion.section
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.005, y: -2 }}
                transition={{ duration: 0.35, delay: 0.08 }}
                className="space-y-6"
              >
                <Card className="border-white/10 bg-white/8 p-5 text-white shadow-2xl backdrop-blur-xl">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold uppercase tracking-[.24em] text-cyan-100">Monthly View</p>
                      <h3 className="mt-1 text-2xl font-black">{monthFilter}</h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Input
                        type="month"
                        value={monthFilter}
                        onChange={(e) => setMonthFilter(e.target.value)}
                        className="w-44 border-white/15 bg-white/5 text-white"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-white/15 bg-white/5 text-white hover:bg-white/10"
                        onClick={downloadCSV}
                        disabled={monthlyUpdates.length === 0}
                      >
                        <Download size={14} /> CSV
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-white/15 bg-white/5 text-white hover:bg-white/10"
                        onClick={downloadXLSX}
                        disabled={monthlyUpdates.length === 0}
                      >
                        <FileSpreadsheet size={14} /> XLSX
                      </Button>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-white/8 p-4">
                      <p className="text-xs font-bold uppercase text-cyan-100">Reviews Received</p>
                      <p className="mt-2 text-2xl font-black">{summary.reviews}</p>
                    </div>
                    <div className="rounded-2xl bg-white/8 p-4">
                      <p className="text-xs font-bold uppercase text-rose-100">Issues Open</p>
                      <p className="mt-2 text-2xl font-black">{summary.openIssues}</p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    {updatesLoading && <p className="text-sm text-slate-200">Loading updates...</p>}
                    {!updatesLoading && monthlyUpdates.length === 0 && (
                      <p className="rounded-2xl bg-white/8 p-4 text-sm text-slate-200">
                        No updates found for this month.
                      </p>
                    )}
                    {monthlyUpdates.map((entry) => (
                      <div
                        key={entry.id}
                        className="rounded-2xl border border-white/10 bg-slate-950/35 p-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-[.24em] text-slate-300">
                              {entry.updateDate}
                            </p>
                            <h4 className="mt-1 text-lg font-black">{entry.businessProfile}</h4>
                          </div>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${
                              entry.issueStatus === 'None'
                                ? 'bg-emerald-500/15 text-emerald-100'
                                : 'bg-rose-500/15 text-rose-100'
                            }`}
                          >
                            {entry.issueStatus}
                          </span>
                        </div>
                        <div className="mt-4 grid gap-2 sm:grid-cols-2">
                          <p className="text-sm text-slate-200">Reviews: {entry.reviewsReceived}</p>
                          <p className="text-sm text-slate-200">Dropped: {entry.reviewsDropped}</p>
                          <p className="text-sm text-slate-200">Calls: {entry.callsReceived}</p>
                          <p className="text-sm text-slate-200">
                            Payments: {entry.paymentsMade} made, {entry.paymentsPending} pending
                          </p>
                        </div>
                        {entry.issueSummary && (
                          <p className="mt-3 rounded-xl border border-amber-300/20 bg-amber-300/10 p-3 text-sm text-amber-50">
                            {entry.issueSummary}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 p-5 text-white shadow-2xl backdrop-blur-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold uppercase tracking-[.24em] text-cyan-100">All History</p>
                      <h3 className="mt-1 text-2xl font-black">Previous updates</h3>
                    </div>
                    <CalendarDays className="text-cyan-200" size={20} />
                  </div>

                  <div className="mt-5 max-h-[26rem] space-y-3 overflow-y-auto pr-1">
                    {clientLoading && <p className="text-sm text-slate-200">Loading client...</p>}
                    {!clientLoading && allUpdates.length === 0 && (
                      <p className="rounded-2xl bg-white/8 p-4 text-sm text-slate-200">
                        No historical data available for this client yet.
                      </p>
                    )}
                    {allUpdates.map((entry) => (
                      <div key={entry.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-[.24em] text-slate-300">
                              {entry.updateDate}
                            </p>
                            <p className="mt-1 font-black">{entry.businessProfile}</p>
                          </div>
                          <span className="rounded-full bg-white/10 px-2 py-1 text-xs font-bold text-slate-100">
                            {entry.contactStatus || 'Open'}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-slate-200">
                          {entry.note || entry.issueSummary || 'No additional note added.'}
                        </p>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Ticket raise form + history */}
                <Card className="border-white/10 bg-gradient-to-br from-rose-500/15 to-violet-500/10 p-5 text-white shadow-2xl backdrop-blur-xl">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold uppercase tracking-[.24em] text-rose-100">Raise a Ticket</p>
                    <Ticket className="text-rose-200" size={18} />
                  </div>
                  <form className="mt-3 grid gap-2" onSubmit={handleTicketSubmit}>
                    <Input
                      name="title"
                      required
                      maxLength={120}
                      placeholder="Issue title (e.g. October reviews not updating)"
                      className="border-white/15 bg-white/5 text-white placeholder:text-slate-400"
                    />
                    <textarea
                      name="description"
                      required
                      maxLength={2000}
                      placeholder="Describe the issue in detail…"
                      className="min-h-24 rounded-2xl border border-white/15 bg-white/5 p-3 text-sm text-white placeholder:text-slate-400"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        name="category"
                        defaultValue="Service"
                        className="rounded-2xl border border-white/15 bg-white/5 p-2 text-sm text-white"
                      >
                        {TICKET_CATEGORIES.map((c) => (
                          <option key={c} value={c} className="text-black">
                            {c}
                          </option>
                        ))}
                      </select>
                      <select
                        name="priority"
                        defaultValue="Medium"
                        className="rounded-2xl border border-white/15 bg-white/5 p-2 text-sm text-white"
                      >
                        {TICKET_PRIORITIES.map((p) => (
                          <option key={p} value={p} className="text-black">
                            {p}
                          </option>
                        ))}
                      </select>
                    </div>
                    <Button
                      type="submit"
                      className="bg-gradient-to-r from-rose-500 via-violet-500 to-cyan-500 text-base font-black text-slate-950"
                    >
                      <Send size={16} /> Submit Ticket
                    </Button>
                  </form>

                  {tickets.length > 0 && (
                    <div className="mt-4 max-h-56 space-y-2 overflow-y-auto pr-1">
                      <p className="text-[10px] font-black uppercase tracking-[.24em] text-rose-100">
                        Your recent tickets
                      </p>
                      {tickets.slice(0, 5).map((t) => (
                        <div
                          key={t.id}
                          className="rounded-2xl border border-white/10 bg-white/8 p-3 text-sm"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-black">{t.title}</p>
                            <span
                              className={`rounded-full px-2 py-1 text-xs font-bold ${
                                t.status === 'Resolved' || t.status === 'Closed'
                                  ? 'bg-emerald-500/15 text-emerald-100'
                                  : 'bg-rose-500/15 text-rose-100'
                              }`}
                            >
                              {t.status}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-slate-300">
                            {t.category} • {t.priority}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </motion.section>
            </div>

            {/* Profile summary tiles */}
            <div className="mt-6 grid gap-3 md:grid-cols-3">
              <FeatureTile
                icon={<Users className="text-cyan-300" size={22} />}
                title="Account Manager"
                body={client?.accountManager || 'Not assigned'}
              />
              <FeatureTile
                icon={<FileWarning className="text-amber-300" size={22} />}
                title="Status"
                body={client?.clientStatus || 'Active'}
              />
              <FeatureTile
                icon={<ShieldCheck className="text-emerald-300" size={22} />}
                title="Data Isolation"
                body="Only your client ID is visible."
              />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function FeatureTile({
  icon,
  title,
  body
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/7 p-4 backdrop-blur">
      {icon}
      <p className="mt-3 text-sm font-bold">{title}</p>
      <p className="mt-1 text-sm text-slate-300">{body}</p>
    </div>
  );
}

function SummaryStat({ label, value, tone }: { label: string; value: number; tone: 'cyan' | 'rose' | 'emerald' | 'amber' }) {
  const toneMap: Record<string, string> = {
    cyan: 'bg-cyan-500/15',
    rose: 'bg-rose-500/15',
    emerald: 'bg-emerald-500/15',
    amber: 'bg-amber-500/15'
  };
  const textMap: Record<string, string> = {
    cyan: 'text-cyan-100',
    rose: 'text-rose-100',
    emerald: 'text-emerald-100',
    amber: 'text-amber-100'
  };
  return (
    <div className={`rounded-2xl p-4 ${toneMap[tone]}`}>
      <p className={`text-xs font-bold uppercase ${textMap[tone]}`}>{label}</p>
      <p className="mt-2 text-3xl font-black">{value}</p>
    </div>
  );
}