'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  CalendarDays,
  CircleDollarSign,
  Mail,
  PhoneCall,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users
} from 'lucide-react';
import { where } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useCollection } from '@/hooks/useFirestoreData';
import { ClientDailyUpdate, ClientProfile } from '@/types';

const todayMonth = new Date().toISOString().slice(0, 7);
const today = new Date().toISOString().slice(0, 10);
const currency = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

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

  const client = matchedClients[0] || null;

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

  const openPortal = (event: FormEvent) => {
    event.preventDefault();
    setActiveClientId(lookupInput.trim().toUpperCase());
  };

  const hasPortal = Boolean(client);
  const contactEmail = client?.supportEmail || client?.contactEmail || '';
  const contactPhone = client?.supportPhone || client?.contactPhone || '';

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
              <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
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
                  <div className="rounded-2xl border border-white/10 bg-white/7 p-4 backdrop-blur">
                    <ShieldCheck className="text-emerald-300" size={22} />
                    <p className="mt-3 text-sm font-bold">Isolated data</p>
                    <p className="mt-1 text-sm text-slate-300">No cross-client mix-up.</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/7 p-4 backdrop-blur">
                    <TrendingUp className="text-cyan-300" size={22} />
                    <p className="mt-3 text-sm font-bold">Daily reporting</p>
                    <p className="mt-1 text-sm text-slate-300">Track performance every day.</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/7 p-4 backdrop-blur">
                    <AlertTriangle className="text-rose-300" size={22} />
                    <p className="mt-3 text-sm font-bold">Fast support</p>
                    <p className="mt-1 text-sm text-slate-300">Open issues get contact actions.</p>
                  </div>
                </div>
              </motion.section>

              <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.08 }} className="flex items-center">
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
                    <Button type="submit" className="h-12 w-full bg-gradient-to-r from-cyan-500 via-emerald-500 to-amber-500 text-base font-black text-slate-950">
                      Open Portal
                      <ArrowRight size={18} />
                    </Button>
                  </form>

                  <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                    <p className="text-xs font-bold uppercase tracking-[.24em] text-cyan-200">What you will see</p>
                    <div className="mt-3 grid gap-2 text-sm text-slate-200">
                      <p>• Business profiles and monthly reviews</p>
                      <p>• Calls received, payments made, and pending amount</p>
                      <p>• Issues, support contacts, and previous daily updates</p>
                    </div>
                  </div>
                </Card>
              </motion.section>
            </div>
          </div>
        ) : (
          <div className="flex-1 py-8">
            <div className="grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
              <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <Card className="border-white/10 bg-white/8 p-6 text-white shadow-2xl backdrop-blur-xl">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[.28em] text-cyan-200">Active Client</p>
                      <h2 className="mt-2 text-3xl font-black">{client?.businessName}</h2>
                      <p className="mt-1 text-sm text-slate-200">Client ID {client?.clientId}</p>
                    </div>
                    <div className="rounded-2xl bg-white/10 p-4">
                      <Building2 className="text-amber-300" size={28} />
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-4">
                    <div className="rounded-2xl bg-cyan-500/15 p-4">
                      <p className="text-xs font-bold uppercase text-cyan-100">Reviews</p>
                      <p className="mt-2 text-3xl font-black">{summary.reviews}</p>
                    </div>
                    <div className="rounded-2xl bg-rose-500/15 p-4">
                      <p className="text-xs font-bold uppercase text-rose-100">Dropped</p>
                      <p className="mt-2 text-3xl font-black">{summary.dropped}</p>
                    </div>
                    <div className="rounded-2xl bg-emerald-500/15 p-4">
                      <p className="text-xs font-bold uppercase text-emerald-100">Calls</p>
                      <p className="mt-2 text-3xl font-black">{summary.calls}</p>
                    </div>
                    <div className="rounded-2xl bg-amber-500/15 p-4">
                      <p className="text-xs font-bold uppercase text-amber-100">Pending</p>
                      <p className="mt-2 text-3xl font-black">{summary.pending}</p>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-2">
                    {client?.businessProfiles.map((profileName) => (
                      <span key={profileName} className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-bold text-white">
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
              </motion.section>

              <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="space-y-6">
                <Card className="border-white/10 bg-white/8 p-5 text-white shadow-2xl backdrop-blur-xl">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold uppercase tracking-[.24em] text-cyan-100">Monthly View</p>
                      <h3 className="mt-1 text-2xl font-black">{monthFilter}</h3>
                    </div>
                    <Input type="month" value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)} className="w-44 border-white/15 bg-white/5 text-white" />
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
                    {!updatesLoading && monthlyUpdates.length === 0 && <p className="rounded-2xl bg-white/8 p-4 text-sm text-slate-200">No updates found for this month.</p>}
                    {monthlyUpdates.map((entry) => (
                      <div key={entry.id} className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-[.24em] text-slate-300">{entry.updateDate}</p>
                            <h4 className="mt-1 text-lg font-black">{entry.businessProfile}</h4>
                          </div>
                          <span className={`rounded-full px-3 py-1 text-xs font-bold ${entry.issueStatus === 'None' ? 'bg-emerald-500/15 text-emerald-100' : 'bg-rose-500/15 text-rose-100'}`}>
                            {entry.issueStatus}
                          </span>
                        </div>
                        <div className="mt-4 grid gap-2 sm:grid-cols-2">
                          <p className="text-sm text-slate-200">Reviews: {entry.reviewsReceived}</p>
                          <p className="text-sm text-slate-200">Dropped: {entry.reviewsDropped}</p>
                          <p className="text-sm text-slate-200">Calls: {entry.callsReceived}</p>
                          <p className="text-sm text-slate-200">Payments: {entry.paymentsMade} made, {entry.paymentsPending} pending</p>
                        </div>
                        {entry.issueSummary && <p className="mt-3 rounded-xl border border-amber-300/20 bg-amber-300/10 p-3 text-sm text-amber-50">{entry.issueSummary}</p>}
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
                    {!clientLoading && allUpdates.length === 0 && <p className="rounded-2xl bg-white/8 p-4 text-sm text-slate-200">No historical data available for this client yet.</p>}
                    {allUpdates.map((entry) => (
                      <div key={entry.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-[.24em] text-slate-300">{entry.updateDate}</p>
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
              </motion.section>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
