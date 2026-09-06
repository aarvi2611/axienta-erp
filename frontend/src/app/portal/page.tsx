"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FileText,
  Briefcase,
  TrendingUp,
  LifeBuoy,
  CreditCard,
  AlertCircle,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Clock,
  Sparkles,
  Download,
  PlusCircle,
  Globe,
  Award,
  Zap,
} from "lucide-react";
import { usePortalData } from "@/hooks/usePortalData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export default function ClientPortalOverview() {
  const { client, invoices, dues, projects, seoData, tickets } = usePortalData();

  const activeProject = projects[0];
  const pendingInvoices = invoices.filter((inv) => inv.status !== "paid");
  const latestDeliverable = activeProject?.deliverables?.[0];
  const todaySeoActivity = seoData?.dailyActivities?.[0];

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Client Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0A192F] via-[#0F2557] to-[#1E3A8A] text-white p-6 sm:p-8 shadow-xl border border-white/10">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-64 h-64 rounded-full bg-[#D4A843]/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-48 h-48 rounded-full bg-blue-400/5 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-xs uppercase tracking-widest text-[#D4A843] font-bold">
                Client Service Portal
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-xs text-slate-300 font-medium">
                Client ID: <span className="text-white font-semibold">{client?.clientId}</span>
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-xs bg-[#D4A843]/20 border border-[#D4A843]/40 text-[#E8C976] px-2 py-0.5 rounded font-semibold">
                {client?.packageTier} Plan
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome, {client?.businessName}
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-xl leading-relaxed">
              Your real-time operations dashboard for invoices, deliverables, support tickets, and your{" "}
              <strong className="text-[#D4A843]">daily SEO performance feed</strong>.
            </p>

            <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-slate-300">
              <div className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#D4A843]" />
                <span>{client?.domain}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-[#D4A843]" />
                <span>Account Manager: {client?.accountManager}</span>
              </div>
            </div>
          </div>

          {/* Quick Primary Actions */}
          <div className="flex flex-wrap items-center gap-2.5 sm:self-center">
            <Link
              href="/portal/invoices"
              className="px-4 py-2.5 rounded-xl bg-white text-[#0F2557] hover:bg-slate-100 font-bold text-xs shadow-md transition-all flex items-center gap-2"
            >
              <CreditCard className="w-4 h-4 text-[#D4A843]" />
              Manage Invoices
            </Link>
            <Link
              href="/portal/seo"
              className="px-4 py-2.5 rounded-xl bg-[#D4A843] text-slate-950 hover:bg-[#E5BE5E] font-bold text-xs shadow-lg shadow-[#D4A843]/20 transition-all flex items-center gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              Daily SEO Hub
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Primary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Dues & Payments */}
        <div className="corp-card p-5 relative overflow-hidden group hover:border-[#D4A843]/50 transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Pending Dues
              </p>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                ₹{dues.totalDue.toLocaleString()}
              </p>
              <div className="flex items-center gap-1 mt-2 text-xs">
                {dues.overdueCount > 0 ? (
                  <span className="text-red-500 font-bold flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {dues.overdueCount} Overdue Invoice(s)
                  </span>
                ) : dues.totalDue > 0 ? (
                  <span className="text-amber-500 font-semibold flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Due for Payment
                  </span>
                ) : (
                  <span className="text-emerald-500 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> All Dues Cleared
                  </span>
                )}
              </div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-[#D4A843]">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <Link
            href="/portal/invoices"
            className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-[#0F2557] dark:text-[#D4A843] flex items-center justify-between group-hover:translate-x-0.5 transition-transform"
          >
            <span>View Invoices & Receipts</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Card 2: Work Progress */}
        <div className="corp-card p-5 relative overflow-hidden group hover:border-blue-400/50 transition-all">
          <div className="flex items-start justify-between">
            <div className="flex-1 mr-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Work Progress
              </p>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {activeProject ? `${activeProject.progress}%` : "100%"}
              </p>
              <div className="mt-2.5">
                <Progress value={activeProject?.progress || 0} className="h-1.5 bg-slate-100 dark:bg-slate-700" />
              </div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <Link
            href="/portal/projects"
            className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center justify-between group-hover:translate-x-0.5 transition-transform"
          >
            <span>Track Milestones & Requests</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Card 3: Daily SEO Growth */}
        <div className="corp-card p-5 relative overflow-hidden group hover:border-emerald-400/50 transition-all">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Organic Traffic
                </p>
                <span className="text-[9px] bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.2 rounded">
                  Daily Updated
                </span>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {(seoData?.organicTraffic ?? 0).toLocaleString()}
              </p>
              <div className="flex items-center gap-1 mt-2 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+{seoData?.trafficGrowthPercentage || 0}% Monthly Surge</span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <Link
            href="/portal/seo"
            className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center justify-between group-hover:translate-x-0.5 transition-transform"
          >
            <span>Explore Daily SEO Hub</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Card 4: Support & Tickets */}
        <div className="corp-card p-5 relative overflow-hidden group hover:border-purple-400/50 transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Support Desk
              </p>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {tickets.length} <span className="text-sm font-normal text-slate-400">Ticket(s)</span>
              </p>
              <div className="flex items-center gap-1 mt-2 text-xs text-purple-600 dark:text-purple-400 font-medium">
                <Clock className="w-3.5 h-3.5" />
                <span>Dedicated SLA: &lt; 2 Hours</span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <LifeBuoy className="w-5 h-5" />
            </div>
          </div>
          <Link
            href="/portal/support"
            className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-purple-600 dark:text-purple-400 flex items-center justify-between group-hover:translate-x-0.5 transition-transform"
          >
            <span>Raise or View Tickets</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Featured Section: Daily SEO Services Preview */}
      <div className="corp-card p-6 border-l-4 border-l-[#D4A843]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#D4A843]" />
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Daily SEO Services Activity Feed
              </h2>
              <Badge variant="gold" className="text-[10px]">
                Updated by ERP Team
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live updates directly posted from the Axenta SEO Operations team.
            </p>
          </div>
          <Link
            href="/portal/seo"
            className="text-xs font-bold text-[#0F2557] dark:text-[#D4A843] hover:underline flex items-center gap-1"
          >
            Open Complete SEO Analytics <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-5">
          {/* SEO Snapshot Metrics */}
          <div className="space-y-3 md:border-r border-slate-100 dark:border-slate-800 md:pr-6">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <span className="text-xs text-slate-500 font-medium">Domain Authority (DA)</span>
              <span className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1">
                {seoData?.domainAuthority || 48}{" "}
                <span className="text-xs text-emerald-500 font-bold">+{seoData?.domainAuthorityChange || 3}</span>
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <span className="text-xs text-slate-500 font-medium">Keywords in Top 10</span>
              <span className="text-sm font-black text-slate-900 dark:text-white">
                {seoData?.keywordsInTop10 || 38} Keywords
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <span className="text-xs text-slate-500 font-medium">Technical Health Score</span>
              <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                {seoData?.healthScore || 96}/100
              </span>
            </div>
          </div>

          {/* Latest Daily Activity from SEO Team */}
          <div className="md:col-span-2 flex flex-col justify-between">
            {todaySeoActivity ? (
              <div className="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/80 dark:to-slate-900 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    {todaySeoActivity.title}
                  </span>
                  <span className="text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-full font-medium">
                    {todaySeoActivity.date}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {todaySeoActivity.description}
                </p>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px] text-slate-400">
                  <span>Category: <strong className="text-slate-600 dark:text-slate-300">{todaySeoActivity.category}</strong></span>
                  <span>Logged by: <strong className="text-slate-600 dark:text-slate-300">{todaySeoActivity.completedBy}</strong></span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">No daily SEO updates logged yet.</p>
            )}

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-slate-500">
                Tracking domain: <strong className="text-[#0F2557] dark:text-[#D4A843]">{client?.domain}</strong>
              </span>
              <Link
                href="/portal/seo"
                className="px-3 py-1.5 rounded-lg bg-[#0F2557] text-white hover:bg-[#1A3A7A] text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                View Live Keyword Ranks <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Section: Project Progress & Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Project Milestones */}
        <div className="corp-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-600" />
                Active Deliverables & Milestones
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {activeProject?.projectName || "Consulting Campaign"}
              </p>
            </div>
            <Link
              href="/portal/projects"
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
            >
              View Roadmap
            </Link>
          </div>

          <div className="space-y-3 mt-4">
            {(activeProject?.milestones || []).length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                No active project deliverables scheduled yet.
              </p>
            ) : (
              (activeProject?.milestones || []).slice(0, 4).map((m) => (
                <div
                  key={m.id}
                  className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    {m.status === "completed" ? (
                      <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                    ) : m.status === "in_progress" ? (
                      <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0 animate-spin">
                        <Zap className="w-3.5 h-3.5" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center flex-shrink-0">
                        <Clock className="w-3.5 h-3.5" />
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{m.title}</p>
                      <p className="text-[10px] text-slate-400">Target Due: {m.dueDate}</p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      m.status === "completed"
                        ? "success"
                        : m.status === "in_progress"
                        ? "warning"
                        : "secondary"
                    }
                    className="text-[10px] uppercase font-bold"
                  >
                    {m.status === "in_progress" ? "In Progress" : m.status}
                  </Badge>
                </div>
              ))
            )}
          </div>

          {/* New Work Callout */}
          <div className="mt-5 p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-800/50 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-blue-900 dark:text-blue-300 font-medium">
              <PlusCircle className="w-4 h-4 text-blue-600" />
              <span>Need additional deliverables or custom tasks?</span>
            </div>
            <Link
              href="/portal/projects"
              className="text-xs font-bold bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Request Work
            </Link>
          </div>
        </div>

        {/* Invoices & Dues Snapshot */}
        <div className="corp-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#D4A843]" />
                Recent Invoices & Payment Ledger
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Review your billing history and outstanding dues.
              </p>
            </div>
            <Link
              href="/portal/invoices"
              className="text-xs text-[#0F2557] dark:text-[#D4A843] font-semibold hover:underline"
            >
              All Invoices
            </Link>
          </div>

          <div className="space-y-3 mt-4">
            {invoices.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                No invoices issued yet. They will appear here once published by Axenta.
              </p>
            ) : (
              invoices.slice(0, 3).map((inv) => (
                <div
                  key={inv.id}
                  className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{inv.invoiceNumber}</span>
                      <Badge
                        variant={
                          inv.status === "paid"
                            ? "success"
                            : inv.status === "pending"
                            ? "warning"
                            : "destructive"
                        }
                        className="text-[9px] uppercase font-bold"
                      >
                        {inv.status}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Due: {inv.dueDate} • {inv.items[0]?.description.slice(0, 32)}...
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-slate-900 dark:text-white">
                      ₹{inv.totalAmount.toLocaleString()}
                    </p>
                    {inv.dueAmount > 0 ? (
                      <span className="text-[10px] text-red-500 font-bold">
                        Due: ₹{inv.dueAmount.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-[10px] text-emerald-600 font-semibold">Fully Paid</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Quick Pay / Billing Support Banner */}
          <div className="mt-5 p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-800/50 flex items-center justify-between">
            <div className="text-xs text-amber-900 dark:text-amber-300">
              <span className="font-semibold">Total Outstanding:</span>{" "}
              <strong className="font-black text-sm">₹{dues.totalDue.toLocaleString()}</strong>
            </div>
            <Link
              href="/portal/invoices"
              className="text-xs font-bold bg-[#D4A843] text-slate-950 px-3.5 py-1.5 rounded-lg hover:bg-[#E5BE5E] transition-colors shadow-sm"
            >
              Pay / Submit Reference
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

