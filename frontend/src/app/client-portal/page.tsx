"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  Building,
  TrendingUp,
  FileText,
  Briefcase,
  LifeBuoy,
  Plus,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Send,
  Edit,
  Trash2,
  Search,
  CheckSquare,
  ArrowUpRight,
  ShieldCheck,
  Eye,
  RefreshCw
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/common/PageHeader";
import StatsCard from "@/components/common/StatsCard";
import { usePortalData } from "@/hooks/usePortalData";
import { portalStore } from "@/lib/portalService";
import {
  ClientPortalProfile,
  ClientInvoice,
  DailySeoActivity,
  TrackedKeyword,
  PortalSupportTicket,
  WorkRequestStatus
} from "@/types/portal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function AdminClientPortalManagerPage() {
  const {
    clients,
    allInvoices,
    allProjects,
    allWorkRequests,
    allTickets,
    seoData,
    setActiveClient,
    setAdminPreviewClient,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    recordPayment,
    updateProjectProgress,
    toggleMilestone,
    updateWorkRequestStatus,
    updateDailySeoStats,
    addDailySeoActivity,
    addTrackedKeyword,
    updateKeywordRank,
    addTicketReply,
    updateTicketStatus,
    addClient,
    deleteClient,
    clearAllDemoData,
  } = usePortalData();

  const [activeTab, setActiveTab] = useState<"clients" | "seo" | "invoices" | "projects" | "tickets">("clients");
  const [selectedClientId, setSelectedClientId] = useState<string>("");

  // New Client Modal State
  const [newClientModalOpen, setNewClientModalOpen] = useState(false);
  const [newBusinessName, setNewBusinessName] = useState("");
  const [newDomain, setNewDomain] = useState("");
  const [newClientId, setNewClientId] = useState("");
  const [newContactPerson, setNewContactPerson] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newPackageTier, setNewPackageTier] = useState<"Starter" | "Growth" | "Enterprise">("Enterprise");
  const [newMonthlyRetainer, setNewMonthlyRetainer] = useState<number>(50000);
  const [newSupportPin, setNewSupportPin] = useState("1234");
  const [newAccountManager, setNewAccountManager] = useState("Axenta Consulting Team");
  const [newNotes, setNewNotes] = useState("");
  const [clientSuccessNotice, setClientSuccessNotice] = useState(false);

  // Sync selectedClientId when clients list changes
  useEffect(() => {
    if (clients.length > 0) {
      if (!selectedClientId || !clients.some((c) => c.clientId === selectedClientId)) {
        setSelectedClientId(clients[0].clientId);
      }
    } else {
      setSelectedClientId("");
    }
  }, [clients, selectedClientId]);

  const handleOpenAddClientModal = () => {
    const nextNum = clients.length + 1;
    const suggestedId = `AXN-CLI-${String(nextNum).padStart(2, "0")}`;
    setNewClientId(suggestedId);
    setNewBusinessName("");
    setNewDomain("");
    setNewContactPerson("");
    setNewEmail("");
    setNewPhone("");
    setNewPackageTier("Enterprise");
    setNewMonthlyRetainer(50000);
    setNewSupportPin("1234");
    setNewAccountManager("Axenta Consulting Team");
    setNewNotes("");
    setNewClientModalOpen(true);
  };

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBusinessName.trim() || !newClientId.trim()) return;

    const newProfile: ClientPortalProfile = {
      id: `cli-${Date.now()}`,
      clientId: newClientId.trim().toUpperCase(),
      businessName: newBusinessName.trim(),
      domain: newDomain.trim().replace(/^https?:\/\//, "").replace(/\/$/, ""),
      contactPerson: newContactPerson.trim(),
      email: newEmail.trim(),
      phone: newPhone.trim(),
      supportPin: newSupportPin.trim() || "1234",
      clientStatus: "Active",
      accountManager: newAccountManager.trim(),
      monthlyRetainer: Number(newMonthlyRetainer) || 0,
      packageTier: newPackageTier,
      joinedDate: new Date().toISOString().slice(0, 10),
      notes: newNotes.trim() || "Client portal initialized.",
    };

    addClient(newProfile);
    setSelectedClientId(newProfile.clientId);
    setClientSuccessNotice(true);
    setTimeout(() => {
      setNewClientModalOpen(false);
      setClientSuccessNotice(false);
    }, 1000);
  };

  const handleDeleteClient = (cId: string, bName: string) => {
    if (confirm(`Are you sure you want to delete client "${bName}" (${cId}) and all associated records?`)) {
      deleteClient(cId);
    }
  };

  const handleClearAllData = () => {
    if (confirm("Are you sure you want to purge all client portal demo data? This will reset all clients and invoices.")) {
      clearAllDemoData();
    }
  };

  // Daily SEO Update Form State
  const [seoActTitle, setSeoActTitle] = useState("");
  const [seoActCategory, setSeoActCategory] = useState<DailySeoActivity["category"]>("Technical SEO");
  const [seoActDesc, setSeoActDesc] = useState("");
  const [seoActImpact, setSeoActImpact] = useState<DailySeoActivity["impact"]>("High");
  const [seoSuccessNotice, setSeoSuccessNotice] = useState(false);

  // SEO Metrics Form State (All 20 Metrics)
  const currentClientSeo = usePortalData(selectedClientId).seoData;
  const [seoGmbViews, setSeoGmbViews] = useState<number>(currentClientSeo?.gmbProfileViews || 0);
  const [seoGmbCalls, setSeoGmbCalls] = useState<number>(currentClientSeo?.gmbCalls || 0);
  const [seoGmbClicks, setSeoGmbClicks] = useState<number>(currentClientSeo?.gmbWebsiteClicks || 0);
  const [seoGmbDirections, setSeoGmbDirections] = useState<number>(currentClientSeo?.gmbDirectionRequests || 0);
  
  const [seoTraffic, setSeoTraffic] = useState<number>(currentClientSeo?.organicTraffic || 0);
  const [seoOrganicUsers, setSeoOrganicUsers] = useState<number>(currentClientSeo?.organicUsers || 0);
  const [seoOrganicSessions, setSeoOrganicSessions] = useState<number>(currentClientSeo?.organicSessions || 0);
  const [seoPhoneCalls, setSeoPhoneCalls] = useState<number>(currentClientSeo?.phoneCallsGenerated || 0);
  const [seoFormInquiries, setSeoFormInquiries] = useState<number>(currentClientSeo?.formInquiries || 0);
  const [seoLeads, setSeoLeads] = useState<number>(currentClientSeo?.totalLeadsGenerated || 0);
  const [seoConversions, setSeoConversions] = useState<number>(currentClientSeo?.totalConversions || 0);
  const [seoConversionRate, setSeoConversionRate] = useState<number>(currentClientSeo?.conversionRate || 0);

  const [seoTotalKeywords, setSeoTotalKeywords] = useState<number>(currentClientSeo?.totalKeywordsTracked || 0);
  const [seoTop3, setSeoTop3] = useState<number>(currentClientSeo?.keywordsInTop3 || 0);
  const [seoTop10, setSeoTop10] = useState<number>(currentClientSeo?.keywordsInTop10 || 0);
  const [seoTop20, setSeoTop20] = useState<number>(currentClientSeo?.keywordsInTop20 || 0);

  const [seoBacklinks, setSeoBacklinks] = useState<number>(currentClientSeo?.totalBacklinks || 0);
  const [seoReferringDomains, setSeoReferringDomains] = useState<number>(currentClientSeo?.referringDomains || 0);
  const [seoDA, setSeoDA] = useState<number>(currentClientSeo?.domainAuthority || 0);
  const [seoDR, setSeoDR] = useState<number>(currentClientSeo?.domainRating || 0);

  const [seoOnPageScore, setSeoOnPageScore] = useState<number>(currentClientSeo?.onPageScore || 85);
  const [seoHealth, setSeoHealth] = useState<number>(currentClientSeo?.healthScore || 90);
  const [seoPSeoPages, setSeoPSeoPages] = useState<number>(currentClientSeo?.programmaticPagesGenerated || 0);
  const [seoMetricsUpdated, setSeoMetricsUpdated] = useState(false);

  // Sync state when client selection changes
  useEffect(() => {
    if (currentClientSeo) {
      setSeoGmbViews(currentClientSeo.gmbProfileViews !== undefined ? currentClientSeo.gmbProfileViews : 0);
      setSeoGmbCalls(currentClientSeo.gmbCalls !== undefined ? currentClientSeo.gmbCalls : 0);
      setSeoGmbClicks(currentClientSeo.gmbWebsiteClicks !== undefined ? currentClientSeo.gmbWebsiteClicks : 0);
      setSeoGmbDirections(currentClientSeo.gmbDirectionRequests !== undefined ? currentClientSeo.gmbDirectionRequests : 0);

      setSeoTraffic(currentClientSeo.organicTraffic !== undefined ? currentClientSeo.organicTraffic : 0);
      setSeoOrganicUsers(currentClientSeo.organicUsers !== undefined ? currentClientSeo.organicUsers : 0);
      setSeoOrganicSessions(currentClientSeo.organicSessions !== undefined ? currentClientSeo.organicSessions : 0);
      setSeoPhoneCalls(currentClientSeo.phoneCallsGenerated !== undefined ? currentClientSeo.phoneCallsGenerated : 0);
      setSeoFormInquiries(currentClientSeo.formInquiries !== undefined ? currentClientSeo.formInquiries : 0);
      setSeoLeads(currentClientSeo.totalLeadsGenerated !== undefined ? currentClientSeo.totalLeadsGenerated : 0);
      setSeoConversions(currentClientSeo.totalConversions !== undefined ? currentClientSeo.totalConversions : 0);
      setSeoConversionRate(currentClientSeo.conversionRate !== undefined ? currentClientSeo.conversionRate : 0);

      setSeoTotalKeywords(currentClientSeo.totalKeywordsTracked !== undefined ? currentClientSeo.totalKeywordsTracked : 0);
      setSeoTop3(currentClientSeo.keywordsInTop3 !== undefined ? currentClientSeo.keywordsInTop3 : 0);
      setSeoTop10(currentClientSeo.keywordsInTop10 !== undefined ? currentClientSeo.keywordsInTop10 : 0);
      setSeoTop20(currentClientSeo.keywordsInTop20 !== undefined ? currentClientSeo.keywordsInTop20 : 0);

      setSeoBacklinks(currentClientSeo.totalBacklinks !== undefined ? currentClientSeo.totalBacklinks : 0);
      setSeoReferringDomains(currentClientSeo.referringDomains !== undefined ? currentClientSeo.referringDomains : 0);
      setSeoDA(currentClientSeo.domainAuthority !== undefined ? currentClientSeo.domainAuthority : 0);
      setSeoDR(currentClientSeo.domainRating !== undefined ? currentClientSeo.domainRating : 0);

      setSeoOnPageScore(currentClientSeo.onPageScore !== undefined ? currentClientSeo.onPageScore : 85);
      setSeoHealth(currentClientSeo.healthScore !== undefined ? currentClientSeo.healthScore : 90);
      setSeoPSeoPages(currentClientSeo.programmaticPagesGenerated !== undefined ? currentClientSeo.programmaticPagesGenerated : 0);
    }
  }, [currentClientSeo, selectedClientId]);

  // New Keyword Form
  const [newKwd, setNewKwd] = useState("");
  const [newKwdRank, setNewKwdRank] = useState(5);
  const [newKwdVol, setNewKwdVol] = useState("4,000");
  const [newKwdUrl, setNewKwdUrl] = useState("");

  // Create / Edit Invoice Modal State
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<ClientInvoice | null>(null);
  const [invNum, setInvNum] = useState(`INV-2025-0${Math.floor(150 + Math.random() * 50)}`);
  const [invAmount, setInvAmount] = useState(65000);
  const [invPaidAmount, setInvPaidAmount] = useState(0);
  const [invDueDate, setInvDueDate] = useState("2025-03-31");
  const [invStatus, setInvStatus] = useState<"pending" | "paid" | "overdue">("pending");
  const [invDesc, setInvDesc] = useState("Monthly SEO & Consulting Retainer");
  const [invNotes, setInvNotes] = useState("Generated by Axenta ERP Finance Module.");

  // Open modal for new invoice
  const handleOpenCreateInvoice = () => {
    setEditingInvoice(null);
    setInvNum(`INV-2025-0${Math.floor(150 + Math.random() * 50)}`);
    setInvAmount(65000);
    setInvPaidAmount(0);
    setInvDueDate(new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10));
    setInvStatus("pending");
    setInvDesc("Monthly SEO & Consulting Retainer");
    setInvNotes("Generated by Axenta ERP Finance Module.");
    setInvoiceModalOpen(true);
  };

  // Open modal to edit existing invoice
  const handleOpenEditInvoice = (inv: ClientInvoice) => {
    setEditingInvoice(inv);
    setInvNum(inv.invoiceNumber);
    setInvAmount(inv.totalAmount || inv.subtotal || 0);
    setInvPaidAmount(inv.paidAmount || 0);
    setInvDueDate(inv.dueDate);
    setInvStatus(inv.status);
    setInvDesc(inv.items[0]?.description || "Consulting Retainer");
    setInvNotes(inv.notes || "");
    setInvoiceModalOpen(true);
  };

  // Ticket Response State
  const [selectedTicket, setSelectedTicket] = useState<PortalSupportTicket | null>(null);
  const [adminReplyText, setAdminReplyText] = useState("");

  // Handler to post daily SEO work feed
  const handlePostDailySeo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!seoActTitle.trim() || !seoActDesc.trim()) return;

    addDailySeoActivity(selectedClientId, {
      title: seoActTitle.trim(),
      category: seoActCategory,
      description: seoActDesc.trim(),
      impact: seoActImpact,
      completedBy: "Axenta SEO Specialist",
    });

    setSeoSuccessNotice(true);
    setSeoActTitle("");
    setSeoActDesc("");
    setTimeout(() => setSeoSuccessNotice(false), 2500);
  };

  // Handler to create or update invoice (GST-free direct pricing)
  const handleSaveInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const total = Number(invAmount) || 0;
    const paid = Number(invPaidAmount) || 0;
    const due = Math.max(0, total - paid);
    const computedStatus = due === 0 ? "paid" : invStatus;

    if (editingInvoice) {
      updateInvoice(editingInvoice.id, {
        invoiceNumber: invNum,
        dueDate: invDueDate,
        subtotal: total,
        tax: 0,
        totalAmount: total,
        paidAmount: paid,
        dueAmount: due,
        status: computedStatus,
        items: [
          {
            id: editingInvoice.items[0]?.id || `i-${Date.now()}`,
            description: invDesc,
            qty: 1,
            rate: total,
            amount: total,
          },
        ],
        notes: invNotes,
      });
    } else {
      const targetClient = clients.find((c) => c.clientId === selectedClientId);
      if (!targetClient) return;

      createInvoice({
        invoiceNumber: invNum,
        clientId: targetClient.clientId,
        clientName: targetClient.businessName,
        issueDate: new Date().toISOString().slice(0, 10),
        dueDate: invDueDate,
        subtotal: total,
        tax: 0,
        totalAmount: total,
        paidAmount: paid,
        dueAmount: due,
        status: computedStatus,
        items: [
          { id: `i-${Date.now()}`, description: invDesc, qty: 1, rate: total, amount: total },
        ],
        notes: invNotes,
      });
    }

    setInvoiceModalOpen(false);
    setEditingInvoice(null);
  };

  const handleDeleteInvoice = (invId: string, invNumText: string) => {
    if (confirm(`Are you sure you want to delete invoice ${invNumText}?`)) {
      deleteInvoice(invId);
    }
  };

  // Handler to update SEO core KPI numbers (all 20 metrics)
  const handleSaveSeoMetrics = (e: React.FormEvent) => {
    e.preventDefault();
    updateDailySeoStats(selectedClientId, {
      gmbProfileViews: Number(seoGmbViews),
      gmbCalls: Number(seoGmbCalls),
      gmbWebsiteClicks: Number(seoGmbClicks),
      gmbDirectionRequests: Number(seoGmbDirections),

      organicTraffic: Number(seoTraffic),
      organicUsers: Number(seoOrganicUsers),
      organicSessions: Number(seoOrganicSessions),
      phoneCallsGenerated: Number(seoPhoneCalls),
      formInquiries: Number(seoFormInquiries),
      totalLeadsGenerated: Number(seoLeads),
      totalConversions: Number(seoConversions),
      conversionRate: Number(seoConversionRate),

      totalKeywordsTracked: Number(seoTotalKeywords),
      keywordsInTop3: Number(seoTop3),
      keywordsInTop10: Number(seoTop10),
      keywordsInTop20: Number(seoTop20),

      totalBacklinks: Number(seoBacklinks),
      referringDomains: Number(seoReferringDomains),
      domainAuthority: Number(seoDA),
      domainRating: Number(seoDR),

      onPageScore: Number(seoOnPageScore),
      healthScore: Number(seoHealth),
      programmaticPagesGenerated: Number(seoPSeoPages),
    });
    setSeoMetricsUpdated(true);
    setTimeout(() => setSeoMetricsUpdated(false), 2000);
  };

  // Handler to add tracked keyword
  const handleAddKeyword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKwd.trim()) return;
    addTrackedKeyword(selectedClientId, {
      keyword: newKwd.trim(),
      currentRank: Number(newKwdRank),
      previousRank: Number(newKwdRank) + 2,
      change: 2,
      searchVolume: newKwdVol,
      difficulty: "Medium",
      targetUrl: newKwdUrl.trim() || `https://${clients.find(c => c.clientId === selectedClientId)?.domain}`,
    });
    setNewKwd("");
    setNewKwdUrl("");
  };

  // Handler to create invoice
  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const targetClient = clients.find((c) => c.clientId === selectedClientId);
    if (!targetClient) return;

    const sub = Number(invAmount);
    const tax = Math.round(sub * 0.18);
    const total = sub + tax;

    createInvoice({
      invoiceNumber: invNum,
      clientId: targetClient.clientId,
      clientName: targetClient.businessName,
      issueDate: new Date().toISOString().slice(0, 10),
      dueDate: invDueDate,
      subtotal: sub,
      tax,
      totalAmount: total,
      paidAmount: 0,
      dueAmount: total,
      status: "pending",
      items: [
        { id: `i-${Date.now()}`, description: invDesc, qty: 1, rate: sub, amount: sub },
      ],
      notes: "Generated by Axenta ERP Finance Module.",
    });

    setInvoiceModalOpen(false);
  };

  // Handler to send ticket reply to client
  const handleSendTicketReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !adminReplyText.trim()) return;

    addTicketReply(
      selectedTicket.id,
      "admin",
      "Axenta Senior Consultant",
      adminReplyText.trim(),
      "Head of Consulting & SEO"
    );

    setAdminReplyText("");
    const refreshed = allTickets.find((t) => t.id === selectedTicket.id);
    if (refreshed) setSelectedTicket({ ...refreshed });
  };

  const selectedClient = clients.find((c) => c.clientId === selectedClientId) || clients[0];
  const clientProjects = allProjects.filter((p) => p.clientId === selectedClientId);
  const clientInvoices = allInvoices.filter((i) => i.clientId === selectedClientId);
  const openTickets = allTickets.filter((t) => t.status !== "Resolved" && t.status !== "Closed");

  return (
    <DashboardLayout>
      <PageHeader
        title="Client Portal Manager"
        description="Centralized administration desk to publish daily SEO updates, manage invoices, project milestones, and client support tickets."
        icon={Globe}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenAddClientModal}
              className="px-3.5 py-2 rounded-xl bg-[#0F2557] text-white font-bold text-xs shadow-md hover:bg-[#16367c] flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              + Add New Client
            </button>
            <Link
              href="/portal"
              onClick={() => setAdminPreviewClient(selectedClientId)}
              target="_blank"
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#D4A843] to-[#E8C976] text-slate-950 font-bold text-xs shadow-md hover:brightness-105 flex items-center gap-1.5 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Launch Client Portal Live View
            </Link>
          </div>
        }
      />

      {/* Top Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Active Portal Clients"
          value={clients.length}
          icon={Building}
          color="blue"
        />
        <StatsCard
          title="SEO Daily Feeds Active"
          value={clients.length}
          icon={TrendingUp}
          color="gold"
          delay={0.1}
        />
        <StatsCard
          title="Pending Invoices"
          value={allInvoices.filter((i) => i.status !== "paid").length}
          icon={FileText}
          color="purple"
          delay={0.2}
        />
        <StatsCard
          title="Open Support Tickets"
          value={openTickets.length}
          icon={LifeBuoy}
          color="red"
          delay={0.3}
        />
      </div>

      {/* Client Selector Bar */}
      <div className="corp-card p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/80 dark:bg-slate-800/60">
        <div className="flex items-center gap-3">
          <Building className="w-5 h-5 text-[#D4A843]" />
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Managing Portal For Client:</span>
            <div className="flex items-center gap-2 mt-0.5">
              {clients.length > 0 ? (
                <>
                  <select
                    value={selectedClientId}
                    onChange={(e) => {
                      setSelectedClientId(e.target.value);
                      const seo = portalStore.getSeoData(e.target.value);
                      if (seo) {
                        setSeoDA(seo.domainAuthority);
                        setSeoTraffic(seo.organicTraffic);
                        setSeoHealth(seo.healthScore);
                        setSeoTop10(seo.keywordsInTop10);
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                  >
                    {clients.map((c) => (
                      <option key={c.clientId} value={c.clientId}>
                        {c.businessName} ({c.clientId})
                      </option>
                    ))}
                  </select>
                  {selectedClient?.packageTier && (
                    <Badge variant="success" className="text-[10px]">
                      {selectedClient.packageTier} Plan
                    </Badge>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                    No clients enrolled yet
                  </span>
                  <button
                    onClick={handleOpenAddClientModal}
                    className="px-2.5 py-1 rounded-md bg-[#0F2557] text-white text-xs font-bold hover:bg-[#16367c] flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Add Client
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenAddClientModal}
            className="px-3 py-1.5 rounded-lg bg-[#0F2557] text-white text-xs font-bold hover:bg-[#16367c] flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Client</span>
          </button>

          {selectedClient && (
            <Link
              href={`/portal?client=${selectedClientId}`}
              target="_blank"
              className="text-xs font-bold text-[#0F2557] dark:text-[#D4A843] hover:underline flex items-center gap-1"
            >
              <span>View As &quot;{selectedClient?.businessName}&quot;</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          )}
        </div>
      </div>

      {/* Admin Module Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-6 border-b border-slate-200 dark:border-slate-800 pb-3">
        {[
          { key: "seo", label: "📈 Daily SEO Operations", badge: "Daily Hub" },
          { key: "invoices", label: "📑 Invoices & Dues Desk", count: clientInvoices.length },
          { key: "projects", label: "🚀 Work Milestones & Requests", count: allWorkRequests.length },
          { key: "tickets", label: "💬 Support Desk & Replies", count: openTickets.length },
          { key: "clients", label: "🏢 Client Portal Accounts", count: clients.length },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === tab.key
                ? "bg-[#0F2557] text-white shadow-md shadow-[#0F2557]/20"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
            }`}
          >
            <span>{tab.label}</span>
            {tab.badge && (
              <span className="text-[9px] bg-[#D4A843] text-slate-950 px-1.5 py-0.2 rounded font-black uppercase">
                {tab.badge}
              </span>
            )}
            {tab.count !== undefined && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeTab === tab.key
                    ? "bg-[#D4A843] text-slate-950 font-black"
                    : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: DAILY SEO DATA MANAGER (CORE USER REQUIREMENT) */}
      {/* ========================================================================= */}
      {activeTab === "seo" && (
        <div className="space-y-6">
          {/* Top Banner Notice */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-[#0F2557] to-[#1E3A8A] text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-[#D4A843]" />
              <div>
                <h3 className="font-bold text-sm">
                  Daily SEO Services Manager for {selectedClient?.businessName}
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Anything you publish or adjust here immediately shows in the client&apos;s <strong>Daily SEO Hub</strong>.
                </p>
              </div>
            </div>
            <Link
              href="/portal/seo"
              target="_blank"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-[#D4A843]" /> Preview Client&apos;s View
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form 1: Publish Today's Daily SEO Work Feed */}
            <div className="corp-card p-6 lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    Publish Today&apos;s SEO Work Feed
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Post the daily optimization tasks performed for this client.
                  </p>
                </div>
                {seoSuccessNotice && (
                  <span className="text-xs text-emerald-600 font-bold flex items-center gap-1 animate-fade-in">
                    <CheckCircle2 className="w-4 h-4" /> Live on Client Portal!
                  </span>
                )}
              </div>

              <form onSubmit={handlePostDailySeo} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Activity Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Core Web Vitals Fix & Schema Markup Deployed"
                    value={seoActTitle}
                    onChange={(e) => setSeoActTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      SEO Category
                    </label>
                    <select
                      value={seoActCategory}
                      onChange={(e) => setSeoActCategory(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      <option value="Technical SEO">Technical SEO</option>
                      <option value="On-Page SEO">On-Page SEO</option>
                      <option value="Backlinks & PR">Backlinks & PR</option>
                      <option value="Content Optimization">Content Optimization</option>
                      <option value="Speed & Core Web Vitals">Speed & Core Web Vitals</option>
                      <option value="Local SEO">Local SEO</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Expected Impact
                    </label>
                    <select
                      value={seoActImpact}
                      onChange={(e) => setSeoActImpact(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      <option value="High">High Impact</option>
                      <option value="Positive">Positive Growth</option>
                      <option value="Medium">Medium Maintenance</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Detailed Work Summary (Visible to Client)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe specific changes: URLs updated, schema tags injected, backlinks indexed, 301 redirects, etc."
                    value={seoActDesc}
                    onChange={(e) => setSeoActDesc(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button type="submit" className="bg-[#0F2557] hover:bg-[#1A3A7A] text-white font-bold flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5 text-[#D4A843]" />
                    Publish Daily Update to Client Portal
                  </Button>
                </div>
              </form>

              {/* Recent Activities for this client */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <h4 className="font-bold text-xs text-slate-700 dark:text-slate-300 mb-2.5">
                  Published Daily Updates ({currentClientSeo?.dailyActivities.length || 0})
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {currentClientSeo?.dailyActivities.slice(0, 4).map((act) => (
                    <div
                      key={act.id}
                      className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-xs flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white">{act.title}</span>
                        <p className="text-[11px] text-slate-500">{act.date} • {act.category}</p>
                      </div>
                      <Badge variant="success" className="text-[9px]">Live</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Form 2: Update Core SEO KPIs */}
            <div className="corp-card p-6 space-y-4">
              <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Update Core SEO Metrics (20 Metrics)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update GBP Views, Traffic, Keywords, Backlinks, DA/DR, and Scores.
                </p>
              </div>

              {seoMetricsUpdated && (
                <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> All 20 Metrics Saved & Client Hub Updated!
                </div>
              )}

              <form onSubmit={handleSaveSeoMetrics} className="space-y-4 text-xs max-h-[720px] overflow-y-auto pr-1">
                {/* 1. Google Business Profile / Local */}
                <div className="p-3 rounded-lg border border-amber-200 dark:border-amber-900/40 bg-amber-50/20 dark:bg-amber-950/10 space-y-2">
                  <span className="font-black text-amber-800 dark:text-amber-300 uppercase tracking-wider text-[10px] block">
                    📍 Google Business Profile (GBP / GMB)
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        GBP Views
                      </label>
                      <input
                        type="number"
                        value={seoGmbViews}
                        onChange={(e) => setSeoGmbViews(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white font-bold"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-amber-700 dark:text-amber-400 block mb-1">
                        GBP Calls
                      </label>
                      <input
                        type="number"
                        value={seoGmbCalls}
                        onChange={(e) => setSeoGmbCalls(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-amber-300 dark:border-amber-800 bg-amber-50/30 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 font-bold"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        GBP Website Clicks
                      </label>
                      <input
                        type="number"
                        value={seoGmbClicks}
                        onChange={(e) => setSeoGmbClicks(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white font-bold"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        GBP Direction Requests
                      </label>
                      <input
                        type="number"
                        value={seoGmbDirections}
                        onChange={(e) => setSeoGmbDirections(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white font-bold"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Organic Traffic & Leads */}
                <div className="p-3 rounded-lg border border-blue-200 dark:border-blue-900/40 bg-blue-50/20 dark:bg-blue-950/10 space-y-2">
                  <span className="font-black text-blue-800 dark:text-blue-300 uppercase tracking-wider text-[10px] block">
                    📈 Traffic, Leads & Conversions
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Organic Traffic
                      </label>
                      <input
                        type="number"
                        value={seoTraffic}
                        onChange={(e) => setSeoTraffic(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white font-bold"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Organic Users
                      </label>
                      <input
                        type="number"
                        value={seoOrganicUsers}
                        onChange={(e) => setSeoOrganicUsers(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white font-bold"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Organic Sessions
                      </label>
                      <input
                        type="number"
                        value={seoOrganicSessions}
                        onChange={(e) => setSeoOrganicSessions(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white font-bold"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-emerald-700 dark:text-emerald-400 block mb-1">
                        Leads Generated
                      </label>
                      <input
                        type="number"
                        value={seoLeads}
                        onChange={(e) => setSeoLeads(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 font-bold"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-emerald-700 dark:text-emerald-400 block mb-1">
                        Conversions
                      </label>
                      <input
                        type="number"
                        value={seoConversions}
                        onChange={(e) => setSeoConversions(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white font-bold"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Conversion Rate (%)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={seoConversionRate}
                        onChange={(e) => setSeoConversionRate(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white font-bold"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Keywords: Total, Top 3, Top 10, Top 20 */}
                <div className="p-3 rounded-lg border border-indigo-200 dark:border-indigo-900/40 bg-indigo-50/20 dark:bg-indigo-950/10 space-y-2">
                  <span className="font-black text-indigo-800 dark:text-indigo-300 uppercase tracking-wider text-[10px] block">
                    🎯 Keywords Tracked & Rankings
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Total Keywords
                      </label>
                      <input
                        type="number"
                        value={seoTotalKeywords}
                        onChange={(e) => setSeoTotalKeywords(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white font-bold"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-amber-700 dark:text-amber-400 block mb-1">
                        Top 3 Keywords
                      </label>
                      <input
                        type="number"
                        value={seoTop3}
                        onChange={(e) => setSeoTop3(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-amber-300 dark:border-amber-800 bg-amber-50/30 text-amber-700 font-bold"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-blue-700 dark:text-blue-400 block mb-1">
                        Top 10 Keywords
                      </label>
                      <input
                        type="number"
                        value={seoTop10}
                        onChange={(e) => setSeoTop10(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-blue-300 dark:border-blue-800 bg-blue-50/30 text-blue-700 font-bold"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-purple-700 dark:text-purple-400 block mb-1">
                        Top 20 Keywords
                      </label>
                      <input
                        type="number"
                        value={seoTop20}
                        onChange={(e) => setSeoTop20(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-purple-300 dark:border-purple-800 bg-purple-50/30 text-purple-700 font-bold"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Backlinks & Authority */}
                <div className="p-3 rounded-lg border border-purple-200 dark:border-purple-900/40 bg-purple-50/20 dark:bg-purple-950/10 space-y-2">
                  <span className="font-black text-purple-800 dark:text-purple-300 uppercase tracking-wider text-[10px] block">
                    🔗 Backlinks & Authority
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Total Backlinks
                      </label>
                      <input
                        type="number"
                        value={seoBacklinks}
                        onChange={(e) => setSeoBacklinks(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white font-bold"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Referring Domains
                      </label>
                      <input
                        type="number"
                        value={seoReferringDomains}
                        onChange={(e) => setSeoReferringDomains(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white font-bold"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-purple-700 dark:text-purple-400 block mb-1">
                        Domain Authority (DA)
                      </label>
                      <input
                        type="number"
                        max={100}
                        value={seoDA}
                        onChange={(e) => setSeoDA(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-purple-300 dark:border-purple-800 bg-purple-50/30 text-purple-700 font-bold"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-blue-700 dark:text-blue-400 block mb-1">
                        Domain Rating (DR)
                      </label>
                      <input
                        type="number"
                        max={100}
                        value={seoDR}
                        onChange={(e) => setSeoDR(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-blue-300 dark:border-blue-800 bg-blue-50/30 text-blue-700 font-bold"
                      />
                    </div>
                  </div>
                </div>

                {/* 5. SEO Scores */}
                <div className="p-3 rounded-lg border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/20 dark:bg-emerald-950/10 space-y-2">
                  <span className="font-black text-emerald-800 dark:text-emerald-300 uppercase tracking-wider text-[10px] block">
                    ⚡ SEO Scores & Performance
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-bold text-indigo-700 dark:text-indigo-400 block mb-1">
                        SEO Score (/100)
                      </label>
                      <input
                        type="number"
                        max={100}
                        value={seoOnPageScore}
                        onChange={(e) => setSeoOnPageScore(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-indigo-300 dark:border-indigo-800 bg-indigo-50/30 text-indigo-700 font-bold"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Technical Health (/100)
                      </label>
                      <input
                        type="number"
                        max={100}
                        value={seoHealth}
                        onChange={(e) => setSeoHealth(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white font-bold"
                      />
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full bg-[#D4A843] text-slate-950 font-bold hover:bg-[#E5BE5E] cursor-pointer shadow-md">
                  Save All 20 SEO Metrics & Push Live
                </Button>
              </form>
            </div>
          </div>

          {/* Keyword Tracker Management */}
          <div className="corp-card p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Tracked Keyword Positions & Rank Updater
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Add keywords or update rank positions to show live progress to the client.
                </p>
              </div>
            </div>

            {/* Add New Keyword Form */}
            <form onSubmit={handleAddKeyword} className="grid grid-cols-1 sm:grid-cols-5 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs">
              <input
                type="text"
                placeholder="Keyword (e.g. cloud erp solution)"
                value={newKwd}
                onChange={(e) => setNewKwd(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 sm:col-span-2"
                required
              />
              <input
                type="number"
                placeholder="Current Rank (#)"
                value={newKwdRank}
                onChange={(e) => setNewKwdRank(Number(e.target.value))}
                className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                min={1}
                required
              />
              <input
                type="text"
                placeholder="Target URL"
                value={newKwdUrl}
                onChange={(e) => setNewKwdUrl(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
              <Button type="submit" className="bg-[#0F2557] text-white font-bold hover:bg-[#1A3A7A]">
                + Add Keyword
              </Button>
            </form>

            {/* Keyword List with Live Rank Adjuster */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-bold uppercase border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-4 py-3">Tracked Keyword</th>
                    <th className="px-3 py-3 text-center">Current Position</th>
                    <th className="px-3 py-3 text-center">Movement</th>
                    <th className="px-3 py-3">Target URL</th>
                    <th className="px-4 py-3 text-right">Quick Rank Update</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {currentClientSeo?.trackedKeywords.map((k) => (
                    <tr key={k.id}>
                      <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                        {k.keyword}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="font-black text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          #{k.currentRank}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center font-bold">
                        {k.change > 0 ? (
                          <span className="text-emerald-600">+{k.change}</span>
                        ) : k.change < 0 ? (
                          <span className="text-red-500">{k.change}</span>
                        ) : (
                          <span className="text-slate-400">0</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-slate-500 truncate max-w-xs">{k.targetUrl}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => updateKeywordRank(selectedClientId, k.id, Math.max(1, k.currentRank - 1))}
                            className="px-2 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[10px]"
                            title="Promote Rank (+1)"
                          >
                            ▲ Up
                          </button>
                          <button
                            onClick={() => updateKeywordRank(selectedClientId, k.id, k.currentRank + 1)}
                            className="px-2 py-1 rounded bg-red-50 hover:bg-red-100 text-red-700 font-bold text-[10px]"
                            title="Demote Rank (-1)"
                          >
                            ▼ Down
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: INVOICES & DUES MANAGER */}
      {/* ========================================================================= */}
      {activeTab === "invoices" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Invoices & Client Dues Control
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Generate new invoices, set due dates, and record payments for client accounts.
              </p>
            </div>
            <Button
              onClick={handleOpenCreateInvoice}
              className="bg-[#0F2557] hover:bg-[#1A3A7A] text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Generate New Invoice
            </Button>
          </div>

          <div className="corp-card overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-bold uppercase border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-5 py-3.5">Invoice #</th>
                  <th className="px-4 py-3.5">Client</th>
                  <th className="px-4 py-3.5">Issue / Due Date</th>
                  <th className="px-4 py-3.5 text-right">Total</th>
                  <th className="px-4 py-3.5 text-right">Due Balance</th>
                  <th className="px-4 py-3.5 text-center">Status</th>
                  <th className="px-5 py-3.5 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {allInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="px-5 py-4 font-bold text-slate-900 dark:text-white">{inv.invoiceNumber}</td>
                    <td className="px-4 py-4 font-semibold text-slate-700 dark:text-slate-300">{inv.clientName}</td>
                    <td className="px-4 py-4 text-slate-500">{inv.issueDate} → {inv.dueDate}</td>
                    <td className="px-4 py-4 text-right font-bold text-slate-900 dark:text-white">₹{inv.totalAmount.toLocaleString()}</td>
                    <td className="px-4 py-4 text-right font-black">
                      {inv.dueAmount > 0 ? (
                        <span className="text-red-500">₹{inv.dueAmount.toLocaleString()}</span>
                      ) : (
                        <span className="text-emerald-600">₹0</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <Badge
                        variant={
                          inv.status === "paid"
                            ? "success"
                            : inv.status === "pending"
                            ? "warning"
                            : "destructive"
                        }
                        className="text-[10px] uppercase font-bold"
                      >
                        {inv.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditInvoice(inv)}
                          className="px-2.5 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300 font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-colors"
                          title="Edit Invoice Details"
                        >
                          <Edit className="w-3 h-3" />
                          Edit
                        </button>
                        {inv.dueAmount > 0 ? (
                          <button
                            onClick={() => recordPayment(inv.id, inv.dueAmount, "ADMIN-OFFLINE-CLEARED")}
                            className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 font-bold text-[10px] cursor-pointer transition-colors"
                          >
                            Mark Paid
                          </button>
                        ) : (
                          <span className="text-emerald-600 text-[10px] font-bold px-1.5 py-0.5">Settled</span>
                        )}
                        <button
                          onClick={() => handleDeleteInvoice(inv.id, inv.invoiceNumber)}
                          className="p-1 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer transition-colors"
                          title="Delete Invoice"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: WORK PROGRESS & CLIENT REQUESTS DESK */}
      {/* ========================================================================= */}
      {activeTab === "projects" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Active Project Progress Control */}
            <div className="corp-card p-6 space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Project Milestone & Progress Controls
              </h3>
              {clientProjects.map((prj) => (
                <div key={prj.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white">{prj.projectName}</h4>
                      <p className="text-[11px] text-slate-400">Lead: {prj.assignedManager} • Due: {prj.deadline}</p>
                    </div>
                    <span className="text-base font-black text-blue-600">{prj.progress}%</span>
                  </div>

                  {/* Progress Range Slider */}
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 block mb-1">Set Completion %</label>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={prj.progress}
                      onChange={(e) => updateProjectProgress(prj.id, Number(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  {/* Milestones Checkbox toggles */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-[11px] font-bold text-slate-500">Toggle Milestones Status:</p>
                    {prj.milestones.map((m) => (
                      <div key={m.id} className="flex items-center justify-between text-xs py-1">
                        <span className={m.status === "completed" ? "line-through text-slate-400" : "text-slate-700 dark:text-slate-300"}>
                          {m.title}
                        </span>
                        <button
                          onClick={() => toggleMilestone(prj.id, m.id)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            m.status === "completed"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {m.status === "completed" ? "Completed ✓" : "Mark Done"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Client-Submitted Work Requests Queue */}
            <div className="corp-card p-6 space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                New Work Requests from Clients ({allWorkRequests.length})
              </h3>
              <p className="text-xs text-slate-500">
                Client submissions from the portal requesting additional services or add-ons.
              </p>

              <div className="space-y-3">
                {allWorkRequests.map((wr) => (
                  <div key={wr.id} className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#D4A843]">{wr.clientName}</span>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white">{wr.title}</h4>
                      </div>
                      <Badge variant="secondary" className="text-[10px]">{wr.status}</Badge>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">{wr.description}</p>
                    <div className="text-[10px] text-slate-400 flex items-center gap-3">
                      <span>Timeline: {wr.targetTimeline}</span>
                      <span>Budget: {wr.estimatedBudget}</span>
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                      <button
                        onClick={() => updateWorkRequestStatus(wr.id, "Approved", "Approved by consulting director. Added to sprint.")}
                        className="px-2.5 py-1 rounded bg-emerald-600 text-white font-bold text-[10px] hover:bg-emerald-700"
                      >
                        Approve & Quote
                      </button>
                      <button
                        onClick={() => updateWorkRequestStatus(wr.id, "In Progress", "Currently in active production.")}
                        className="px-2.5 py-1 rounded bg-blue-600 text-white font-bold text-[10px] hover:bg-blue-700"
                      >
                        Mark In-Progress
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: SUPPORT TICKETS DESK */}
      {/* ========================================================================= */}
      {activeTab === "tickets" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tickets List */}
          <div className="corp-card p-5 space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              All Client Support Tickets ({allTickets.length})
            </h3>
            <div className="space-y-2">
              {allTickets.map((tkt) => (
                <div
                  key={tkt.id}
                  onClick={() => setSelectedTicket(tkt)}
                  className={`p-3 rounded-xl border cursor-pointer transition-colors ${
                    selectedTicket?.id === tkt.id
                      ? "bg-purple-50 dark:bg-purple-950/40 border-purple-400"
                      : "bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-bold mb-1">
                    <span className="text-purple-600">{tkt.ticketId} • {tkt.clientName}</span>
                    <Badge variant={tkt.status === "Resolved" ? "success" : "info"} className="text-[9px]">
                      {tkt.status}
                    </Badge>
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">{tkt.subject}</h4>
                  <p className="text-[11px] text-slate-400 mt-1">{tkt.updatedAt}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Ticket Response Conversation Thread */}
          <div className="corp-card p-6 lg:col-span-2 flex flex-col h-[600px]">
            {selectedTicket ? (
              <>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-xs font-bold text-purple-600">{selectedTicket.ticketId}</span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{selectedTicket.subject}</h3>
                    <p className="text-xs text-slate-400">Client: {selectedTicket.clientName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateTicketStatus(selectedTicket.id, "Resolved")}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700"
                    >
                      Mark Resolved ✓
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto py-4 space-y-3">
                  {selectedTicket.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.sender === "admin" ? "items-end" : "items-start"}`}
                    >
                      <div className="flex items-center gap-2 mb-1 text-[10px] text-slate-400">
                        <span className="font-bold">{msg.senderName}</span>
                        <span>• {msg.timestamp}</span>
                      </div>
                      <div
                        className={`max-w-[80%] rounded-xl p-3 text-xs ${
                          msg.sender === "admin"
                            ? "bg-[#0F2557] text-white"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"
                        }`}
                      >
                        {msg.message}
                      </div>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendTicketReply} className="pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                  <input
                    type="text"
                    placeholder="Write official response to client..."
                    value={adminReplyText}
                    onChange={(e) => setAdminReplyText(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800"
                    required
                  />
                  <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs">
                    Send Reply
                  </Button>
                </form>
              </>
            ) : (
              <div className="m-auto text-center text-slate-400 text-xs">
                Select a ticket from the left panel to review and reply.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: CLIENT ACCOUNTS LIST */}
      {/* ========================================================================= */}
      {activeTab === "clients" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Active Portal Client Accounts</h3>
              <p className="text-xs text-slate-400">Manage client portals, create new accounts, and configure client credentials.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleOpenAddClientModal}
                className="px-3.5 py-2 rounded-xl bg-[#0F2557] text-white font-bold text-xs shadow hover:bg-[#16367c] flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                + Onboard New Client
              </button>
            </div>
          </div>

          <div className="corp-card overflow-hidden">
            {clients.length === 0 ? (
              <div className="py-16 px-4 text-center">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-[#D4A843] flex items-center justify-center mx-auto mb-3">
                  <Building className="w-7 h-7" />
                </div>
                <h4 className="font-bold text-base text-slate-900 dark:text-white mb-1">
                  No Client Accounts Registered
                </h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mb-5">
                  Demo data has been cleared. Add your first client account to generate their portal login, SEO tracker, and invoice billing.
                </p>
                <button
                  onClick={handleOpenAddClientModal}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4A843] to-[#E8C976] text-slate-950 font-bold text-xs shadow-md hover:brightness-105 inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add First Client Account
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-bold uppercase border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="px-5 py-3.5">Client ID / Login</th>
                      <th className="px-4 py-3.5">Business & Domain</th>
                      <th className="px-4 py-3.5">Contact Person</th>
                      <th className="px-4 py-3.5">Retainer (₹)</th>
                      <th className="px-4 py-3.5 text-center">Plan Tier</th>
                      <th className="px-4 py-3.5 text-center">PIN</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {clients.map((c) => (
                      <tr key={c.clientId} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                        <td className="px-5 py-4">
                          <span className="font-mono font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                            {c.clientId}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <p className="font-bold text-slate-900 dark:text-white">{c.businessName}</p>
                          <p className="text-[11px] text-slate-400">{c.domain}</p>
                        </td>
                        <td className="px-4 py-4">
                          <p className="font-semibold text-slate-700 dark:text-slate-300">{c.contactPerson}</p>
                          <p className="text-[11px] text-slate-400">{c.email}</p>
                        </td>
                        <td className="px-4 py-4 font-black">₹{c.monthlyRetainer.toLocaleString()}/mo</td>
                        <td className="px-4 py-4 text-center">
                          <Badge variant="success" className="text-[10px]">{c.packageTier}</Badge>
                        </td>
                        <td className="px-4 py-4 text-center font-mono text-slate-500 font-semibold">
                          {c.supportPin || "—"}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href="/portal"
                              onClick={() => setAdminPreviewClient(c.clientId)}
                              target="_blank"
                              className="px-2.5 py-1.5 rounded-lg bg-[#D4A843] text-slate-950 font-bold hover:bg-[#E5BE5E] transition-colors text-[11px] inline-flex items-center gap-1 shadow-sm"
                            >
                              <ExternalLink className="w-3 h-3" />
                              View
                            </Link>
                            <button
                              onClick={() => handleDeleteClient(c.clientId, c.businessName)}
                              title="Delete Client Account"
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create / Edit Invoice Modal */}
      <AnimatePresence>
        {invoiceModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#D4A843]" />
                    {editingInvoice ? `Edit Invoice (${editingInvoice.invoiceNumber})` : `Generate Invoice for ${selectedClient?.businessName}`}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {editingInvoice ? "Update billing amount, paid amount, due balance, and status." : "Create and issue an official invoice voucher to the client."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => { setInvoiceModalOpen(false); setEditingInvoice(null); }}
                  className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveInvoice} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Invoice Number</label>
                    <input
                      type="text"
                      value={invNum}
                      onChange={(e) => setInvNum(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 font-mono font-bold bg-slate-50 dark:bg-slate-800"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Due Date</label>
                    <input
                      type="date"
                      value={invDueDate}
                      onChange={(e) => setInvDueDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Invoice Amount (₹)</label>
                    <input
                      type="number"
                      value={invAmount}
                      onChange={(e) => setInvAmount(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 font-bold bg-slate-50 dark:bg-slate-800"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-bold text-emerald-700 dark:text-emerald-400 block mb-1">Paid Amount (₹)</label>
                    <input
                      type="number"
                      value={invPaidAmount}
                      onChange={(e) => setInvPaidAmount(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border border-emerald-300 dark:border-emerald-800 font-bold text-emerald-600 bg-emerald-50/30 dark:bg-emerald-950/20"
                    />
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Remaining Due: <strong className="text-red-500">₹{Math.max(0, Number(invAmount) - Number(invPaidAmount)).toLocaleString()}</strong>
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Invoice Status</label>
                    <select
                      value={invStatus}
                      onChange={(e) => setInvStatus(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold"
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid (Fully Settled)</option>
                      <option value="overdue">Overdue</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Service / Description</label>
                    <input
                      type="text"
                      value={invDesc}
                      onChange={(e) => setInvDesc(e.target.value)}
                      placeholder="e.g. Monthly Retainer"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Notes / Terms (Visible on Voucher)</label>
                  <textarea
                    rows={2}
                    value={invNotes}
                    onChange={(e) => setInvNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => { setInvoiceModalOpen(false); setEditingInvoice(null); }}
                    className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <Button type="submit" className="bg-[#0F2557] hover:bg-[#16367c] text-white font-bold px-5 py-2 rounded-xl cursor-pointer shadow-md">
                    {editingInvoice ? "Save Changes" : "Generate & Issue Invoice"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Onboard New Client Modal */}
      <AnimatePresence>
        {newClientModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Onboard New Client Portal Account
                  </h3>
                  <p className="text-xs text-slate-400">
                    Instantly provisions a Client ID, dedicated portal dashboard, and SEO tracking feed.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setNewClientModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1"
                >
                  ✕
                </button>
              </div>

              {clientSuccessNotice ? (
                <div className="py-8 text-center">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2 animate-bounce" />
                  <h4 className="font-bold text-base text-slate-900 dark:text-white">Client Successfully Added!</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Client ID <span className="font-mono font-bold text-[#D4A843]">{newClientId}</span> is ready for portal access.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleCreateClient} className="space-y-3.5 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Business Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Acme Corporation"
                        value={newBusinessName}
                        onChange={(e) => setNewBusinessName(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                        required
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Client ID (Login Identifier) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. AXN-CLI-01"
                        value={newClientId}
                        onChange={(e) => setNewClientId(e.target.value.toUpperCase())}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold uppercase"
                        required
                      />
                      <p className="text-[10px] text-slate-400 mt-0.5">Used by client to login at /portal/login</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Website Domain
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. acmebrand.com"
                        value={newDomain}
                        onChange={(e) => setNewDomain(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Support PIN (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 1234"
                        value={newSupportPin}
                        onChange={(e) => setNewSupportPin(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Contact Person
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Rajesh Sharma"
                        value={newContactPerson}
                        onChange={(e) => setNewContactPerson(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Contact Email
                      </label>
                      <input
                        type="email"
                        placeholder="e.g. rajesh@acmebrand.com"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. +91 98765 43210"
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Monthly Retainer (₹)
                      </label>
                      <input
                        type="number"
                        placeholder="50000"
                        value={newMonthlyRetainer}
                        onChange={(e) => setNewMonthlyRetainer(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Service Package Tier
                      </label>
                      <select
                        value={newPackageTier}
                        onChange={(e) => setNewPackageTier(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                      >
                        <option value="Starter">Starter Plan</option>
                        <option value="Growth">Growth Plan</option>
                        <option value="Enterprise">Enterprise Plan</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Assigned Account Manager
                      </label>
                      <input
                        type="text"
                        value={newAccountManager}
                        onChange={(e) => setNewAccountManager(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Internal Onboarding Notes
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Brief notes on project scope or client requirements..."
                      value={newNotes}
                      onChange={(e) => setNewNotes(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setNewClientModalOpen(false)}
                      className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                    >
                      Cancel
                    </button>
                    <Button
                      type="submit"
                      className="bg-[#0F2557] hover:bg-[#16367c] text-white font-bold px-5 py-2 rounded-xl"
                    >
                      Create & Onboard Client
                    </Button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}

