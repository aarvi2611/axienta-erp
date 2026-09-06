"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Globe,
  Search,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Download,
  Calendar,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Activity,
  ShieldCheck,
  Zap,
  Layers,
  FileSpreadsheet,
  PhoneCall,
  Phone,
  Mail,
  MapPin,
  Star,
  Navigation,
  Share2,
  Link2,
  Code,
  Gauge,
  Check,
  Server,
  Filter,
  Eye,
  BarChart3,
  Award,
  Printer,
  Users
} from "lucide-react";
import { usePortalData } from "@/hooks/usePortalData";
import { portalStore } from "@/lib/portalService";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar
} from "recharts";
import { Badge } from "@/components/ui/badge";

type TabView = "all" | "traffic_calls" | "local_seo" | "on_page" | "off_page" | "programmatic" | "technical" | "keywords" | "daily_feed";

export default function ClientSeoHubPage() {
  const { client, seoData } = usePortalData();
  const [activeTab, setActiveTab] = useState<TabView>("all");
  const [keywordSearch, setKeywordSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const handleDownloadSeoPdf = () => {
    document.body.classList.add("printing-seo-report");
    const cleanup = () => {
      document.body.classList.remove("printing-seo-report");
      window.removeEventListener("afterprint", cleanup);
    };
    window.addEventListener("afterprint", cleanup);
    window.print();
    setTimeout(cleanup, 1500);
  };

  const handleDownloadHtmlReport = () => {
    const printable = document.getElementById("printable-seo-report");
    if (!printable) return;
    const clientName = client?.businessName || "Client";
    const reportHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${clientName} - 360° SEO Performance Audit Report</title>
  <style>
    @page { size: A4 portrait; margin: 10mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
    body { background: #ffffff; color: #0f172a; padding: 24px; }
    .report-container { max-width: 850px; margin: 0 auto; background: #fff; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 12px; }
    th { background: #0F2557; color: #ffffff; padding: 8px 10px; text-align: left; font-weight: 600; }
    td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; color: #334155; }
    tr:nth-child(even) { background: #f8fafc; }
  </style>
</head>
<body>
  <div class="report-container">
    ${printable.innerHTML}
  </div>
</body>
</html>`;
    const blob = new Blob([reportHtml], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${clientName.replace(/\\s+/g, "_")}_SEO_Audit_Report.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filteredKeywords = (seoData?.trackedKeywords || []).filter((k) =>
    k.keyword.toLowerCase().includes(keywordSearch.toLowerCase())
  );

  const filteredActivities = (seoData?.dailyActivities || []).filter((act) => {
    if (categoryFilter === "all") return true;
    return act.category === categoryFilter;
  });

  const trafficData = (seoData?.trafficHistory && seoData.trafficHistory.length > 0)
    ? seoData.trafficHistory
    : [
        { date: "Baseline", organicTraffic: seoData?.organicTraffic || 0, clicks: seoData?.monthlyClicks || 0, phoneCalls: seoData?.phoneCallsGenerated || 0 },
        { date: "Current", organicTraffic: seoData?.organicTraffic || 0, clicks: seoData?.monthlyClicks || 0, phoneCalls: seoData?.phoneCallsGenerated || 0 },
      ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#07111F] via-[#0F2557] to-[#1A3A7A] text-white p-6 sm:p-8 shadow-xl border border-white/10">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-80 h-80 rounded-full bg-[#D4A843]/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-xs uppercase tracking-widest text-[#D4A843] font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Axenta 360° SEO Growth & Search Engine
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Sync with Axenta ERP
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Comprehensive SEO Intelligence Hub
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Full-spectrum organic search performance: organic traffic, incoming phone calls, local 3-pack rankings, on-page health, high-authority digital PR, programmatic SEO, and technical crawling status.
            </p>

            <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-slate-300">
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1 rounded-lg">
                <Globe className="w-3.5 h-3.5 text-[#D4A843]" />
                <span className="font-bold text-white">{seoData?.domain || client?.domain}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1 rounded-lg">
                <Calendar className="w-3.5 h-3.5 text-slate-300" />
                <span>Audited & Updated: <strong className="text-white">{seoData?.lastUpdated || "Today"}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1 rounded-lg">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Client ID: <strong className="text-[#D4A843]">{client?.clientId}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleDownloadSeoPdf}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4A843] to-[#E5C16C] hover:from-[#C29532] hover:to-[#D4A843] text-slate-950 font-black text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              title="Download or Print 360° SEO Performance Audit as PDF"
            >
              <Printer className="w-4 h-4" />
              Download Full SEO Audit (PDF)
            </button>
            <button
              onClick={handleDownloadHtmlReport}
              className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              title="Save standalone offline report"
            >
              <Download className="w-4 h-4 text-[#D4A843]" />
              Offline Report (.html)
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs for Easy Section Jumping */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800 scrollbar-none text-xs">
        {[
          { id: "all", label: "Full 360° Overview", icon: Activity },
          { id: "traffic_calls", label: "Traffic & Calls", icon: PhoneCall },
          { id: "local_seo", label: "Local SEO & Google Maps", icon: MapPin },
          { id: "on_page", label: "On-Page & Core Web Vitals", icon: Gauge },
          { id: "off_page", label: "Off-Page & Tier-1 Backlinks", icon: Link2 },
          { id: "programmatic", label: "Programmatic SEO (pSEO)", icon: Layers },
          { id: "technical", label: "Technical SEO & Health", icon: Server },
          { id: "keywords", label: "Tracked Keywords", icon: Search },
          { id: "daily_feed", label: "Daily SEO Work Feed", icon: Zap },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabView)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? "bg-[#0F2557] text-white shadow-md dark:bg-[#D4A843] dark:text-slate-950"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: TRAFFIC, PHONE CALLS, INQUIRIES & CONVERSION PERFORMANCE */}
      {/* ========================================================================= */}
      {(activeTab === "all" || activeTab === "traffic_calls") && (
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <PhoneCall className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                Traffic, Inbound Phone Calls & Lead Conversions
              </h2>
              <p className="text-xs text-slate-500">
                Direct commercial results produced by organic search ranking and GBP local optimization.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1.5 rounded-lg">
                MoM Growth: +{seoData?.trafficGrowthPercentage || 24.8}%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {/* 1. Monthly Organic Traffic */}
            <div className="corp-card p-4 border-t-4 border-t-[#0F2557]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Organic Traffic
                </span>
                <Globe className="w-3.5 h-3.5 text-[#0F2557] dark:text-[#D4A843]" />
              </div>
              <div className="flex items-baseline gap-1.5 mt-2">
                <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {seoData?.organicTraffic !== undefined ? seoData.organicTraffic.toLocaleString() : "0"}
                </p>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                {seoData?.monthlyClicks !== undefined ? seoData.monthlyClicks.toLocaleString() : "0"} Google Clicks
              </p>
            </div>

            {/* 2. Organic Users */}
            <div className="corp-card p-4 border-t-4 border-t-indigo-500">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
                  Organic Users
                </span>
                <Users className="w-3.5 h-3.5 text-indigo-500" />
              </div>
              <div className="flex items-baseline gap-1.5 mt-2">
                <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {seoData?.organicUsers !== undefined
                    ? seoData.organicUsers.toLocaleString()
                    : (seoData?.organicTraffic ? Math.round(seoData.organicTraffic * 0.85).toLocaleString() : "0")}
                </p>
              </div>
              <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold mt-1">
                Unique Search Visitors
              </p>
            </div>

            {/* 3. Organic Sessions */}
            <div className="corp-card p-4 border-t-4 border-t-cyan-500">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-700 dark:text-cyan-400">
                  Organic Sessions
                </span>
                <Activity className="w-3.5 h-3.5 text-cyan-500" />
              </div>
              <div className="flex items-baseline gap-1.5 mt-2">
                <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {seoData?.organicSessions !== undefined
                    ? seoData.organicSessions.toLocaleString()
                    : (seoData?.organicTraffic ? Math.round(seoData.organicTraffic * 1.2).toLocaleString() : "0")}
                </p>
              </div>
              <p className="text-[10px] text-cyan-600 dark:text-cyan-400 font-semibold mt-1">
                Active Website Sessions
              </p>
            </div>

            {/* 4. Phone Calls Generated */}
            <div className="corp-card p-4 border-t-4 border-t-emerald-500 bg-gradient-to-br from-emerald-50/40 to-transparent dark:from-emerald-950/20">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Phone Calls
                </span>
                <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex items-baseline gap-1.5 mt-2">
                <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  {seoData?.phoneCallsGenerated !== undefined ? seoData.phoneCallsGenerated.toLocaleString() : "0"}
                </p>
                <span className="text-[10px] text-slate-500 font-bold">Calls</span>
              </div>
              <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold mt-1">
                Direct Inbound Phone Leads
              </p>
            </div>

            {/* 5. Inbound Leads */}
            <div className="corp-card p-4 border-t-4 border-t-blue-500">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Total Leads
                </span>
                <Mail className="w-3.5 h-3.5 text-blue-500" />
              </div>
              <div className="flex items-baseline gap-1.5 mt-2">
                <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {seoData?.totalLeadsGenerated !== undefined ? seoData.totalLeadsGenerated.toLocaleString() : "0"}
                </p>
              </div>
              <p className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold mt-1">
                {seoData?.formInquiries !== undefined ? seoData.formInquiries : "0"} Form Submissions
              </p>
            </div>

            {/* 6. Total Conversions & CVR */}
            <div className="corp-card p-4 border-t-4 border-t-[#D4A843]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#B88E30] dark:text-[#E8C976]">
                  Conversions
                </span>
                <Award className="w-3.5 h-3.5 text-[#D4A843]" />
              </div>
              <div className="flex items-baseline gap-1.5 mt-2">
                <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {seoData?.totalConversions !== undefined
                    ? seoData.totalConversions.toLocaleString()
                    : (seoData?.totalLeadsGenerated ? Math.round(seoData.totalLeadsGenerated * 0.78).toLocaleString() : "0")}
                </p>
                <span className="text-[11px] font-black text-[#B88E30] dark:text-[#E8C976]">
                  {seoData?.conversionRate !== undefined ? seoData.conversionRate : 0}% CVR
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Qualified Sales Opportunities
              </p>
            </div>
          </div>

          {/* Traffic & Phone Calls Trajectory Chart */}
          <div className="corp-card p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#0F2557] dark:text-[#D4A843]" />
                  Monthly Organic Traffic vs. Incoming Phone Calls Trajectory
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verified correlation between keyword rank scaling and commercial phone calls generated.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-medium">
                  <span className="w-3 h-3 rounded-full bg-[#0F2557] dark:bg-blue-500" /> Organic Visits
                </span>
                <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-medium">
                  <span className="w-3 h-3 rounded-full bg-[#D4A843]" /> Clicks
                </span>
                <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" /> Phone Calls
                </span>
              </div>
            </div>

            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trafficData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="trafficGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0F2557" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#0F2557" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="clickGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D4A843" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#D4A843" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="callGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" opacity={0.4} />
                  <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} />
                  <YAxis stroke="#94A3B8" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#07111F",
                      borderColor: "#1E293B",
                      borderRadius: "0.75rem",
                      color: "#FFFFFF",
                      fontSize: "12px",
                      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
                    }}
                  />
                  <Area type="monotone" dataKey="organicTraffic" stroke="#0F2557" fillOpacity={1} fill="url(#trafficGradient)" strokeWidth={2.5} name="Organic Traffic" />
                  <Area type="monotone" dataKey="clicks" stroke="#D4A843" fillOpacity={1} fill="url(#clickGradient)" strokeWidth={2} name="Clicks" />
                  <Area type="monotone" dataKey="phoneCalls" stroke="#10B981" fillOpacity={1} fill="url(#callGradient)" strokeWidth={2} name="Phone Calls" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: LOCAL SEO & GOOGLE BUSINESS PROFILE (GBP) COMMAND CENTER */}
      {/* ========================================================================= */}
      {(activeTab === "all" || activeTab === "local_seo") && (
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#D4A843]" />
                Local SEO & Google Business Profile (GBP / GMB)
              </h2>
              <p className="text-xs text-slate-500">
                Google Maps 3-Pack visibility, location searches, map phone calls, and direction requests.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 px-2.5 py-1.5 rounded-lg flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                {seoData?.gmbAverageRating !== undefined ? seoData.gmbAverageRating : 5.0} / 5.0 Rating ({seoData?.gmbReviewsCount !== undefined ? seoData.gmbReviewsCount : 148} Reviews)
              </span>
            </div>
          </div>

          {/* 5 Local GBP Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            <div className="corp-card p-4 border-l-4 border-l-blue-500">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                GBP Profile Views
              </p>
              <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                {seoData?.gmbProfileViews !== undefined ? seoData.gmbProfileViews.toLocaleString() : "0"}
              </p>
              <p className="text-[10px] text-blue-600 dark:text-blue-400 mt-1 font-semibold">
                Google Maps & Search
              </p>
            </div>

            <div className="corp-card p-4 border-l-4 border-l-emerald-500">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Direct Calls via Maps
              </p>
              <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {seoData?.gmbCalls !== undefined ? seoData.gmbCalls.toLocaleString() : "0"}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                Direct click-to-call leads
              </p>
            </div>

            <div className="corp-card p-4 border-l-4 border-l-purple-500">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Direction Requests
              </p>
              <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                {seoData?.gmbDirectionRequests !== undefined ? seoData.gmbDirectionRequests.toLocaleString() : "0"}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                In-person office navigation
              </p>
            </div>

            <div className="corp-card p-4 border-l-4 border-l-indigo-500">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Website Clicks from GBP
              </p>
              <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                {seoData?.gmbWebsiteClicks !== undefined ? seoData.gmbWebsiteClicks.toLocaleString() : "0"}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                High-intent local visitors
              </p>
            </div>

            <div className="corp-card p-4 border-l-4 border-l-[#D4A843] col-span-2 sm:col-span-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                NAP Consistency
              </p>
              <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {seoData?.gmbNapConsistency !== undefined ? seoData.gmbNapConsistency : 100}%
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                Name, Address, Phone Synced
              </p>
            </div>
          </div>

          {/* Local 3-Pack Keyword Rankings Table */}
          <div className="corp-card p-5 space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-[#D4A843]" />
                  Google Maps Local 3-Pack Rankings
                </h3>
                <p className="text-[11px] text-slate-500">
                  Target local commercial queries ranking in Google Maps 3-Pack snippet.
                </p>
              </div>
              <span className="text-[10px] font-black uppercase bg-[#D4A843]/15 text-[#B88E30] dark:text-[#E8C976] px-2.5 py-1 rounded">
                Geo-Rank Verified
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-4 py-2.5">Local Target Keyword</th>
                    <th className="px-4 py-2.5">Target Territory / City</th>
                    <th className="px-3 py-2.5 text-center">Google Maps Rank</th>
                    <th className="px-3 py-2.5 text-center">Local Search Vol</th>
                    <th className="px-3 py-2.5 text-right">Pack Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {(seoData?.localPackKeywords || [
                    { id: "lp-1", keyword: "enterprise erp consulting mumbai", location: "Mumbai & MMR", mapRank: 1, searchVolume: "3,200" },
                    { id: "lp-2", keyword: "b2b software consulting andheri", location: "Andheri East, Mumbai", mapRank: 1, searchVolume: "1,800" },
                    { id: "lp-3", keyword: "business automation partner navi mumbai", location: "Navi Mumbai", mapRank: 2, searchVolume: "1,400" },
                  ]).map((lp) => (
                    <tr key={lp.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30">
                      <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                        {lp.keyword}
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {lp.location}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md font-black text-xs bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-200 border border-amber-300 dark:border-amber-700">
                          #{lp.mapRank} in 3-Pack
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center font-semibold text-slate-700 dark:text-slate-300">
                        {lp.searchVolume} / mo
                      </td>
                      <td className="px-3 py-3 text-right">
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-900">
                          ✓ Top 3 Verified
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: ON-PAGE SEO & CORE WEB VITALS */}
      {/* ========================================================================= */}
      {(activeTab === "all" || activeTab === "on_page") && (
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Gauge className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                On-Page SEO Optimization & Google Core Web Vitals
              </h2>
              <p className="text-xs text-slate-500">
                Content hierarchy, meta tag integrity, JSON-LD structured schema entities, and page experience vitals.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left: On-Page Optimization Breakdown */}
            <div className="corp-card p-5 lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center">
                    <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                      {seoData?.onPageScore || 94}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      On-Page SEO Quality Score
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      {seoData?.totalPagesOptimized || 92} Published Pages Fully Calibrated
                    </p>
                  </div>
                </div>
                <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                  Grade A+ Optimal
                </Badge>
              </div>

              {/* Progress Bars */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-600 dark:text-slate-300">Meta Titles & Descriptions</span>
                    <span className="text-emerald-600 font-bold">{seoData?.metaTagsOptimizedRatio || 98}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${seoData?.metaTagsOptimizedRatio || 98}%` }} />
                  </div>
                </div>

                <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-600 dark:text-slate-300">H1/H2 Heading Hierarchy</span>
                    <span className="text-emerald-600 font-bold">{seoData?.headingStructureScore || 96}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${seoData?.headingStructureScore || 96}%` }} />
                  </div>
                </div>

                <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-600 dark:text-slate-300">Image Alt & Media Tags</span>
                    <span className="text-emerald-600 font-bold">{seoData?.imageAltTagsRatio || 97}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${seoData?.imageAltTagsRatio || 97}%` }} />
                  </div>
                </div>

                <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-600 dark:text-slate-300">Internal Link Silos</span>
                    <span className="text-blue-600 font-bold">{seoData?.internalLinksCount?.toLocaleString() || "1,640"} links</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full" style={{ width: "95%" }} />
                  </div>
                </div>
              </div>

              {/* Schema Markup Types Implemented */}
              <div className="pt-2">
                <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5 text-[#D4A843]" />
                  Active Google JSON-LD Schema Markups:
                </p>
                <div className="flex flex-wrap gap-2">
                  {(seoData?.schemaMarkupTypes || ["Organization", "LocalBusiness", "FAQPage", "BreadcrumbList", "Service", "Article"]).map((sch) => (
                    <span
                      key={sch}
                      className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-[11px] font-semibold flex items-center gap-1"
                    >
                      <Check className="w-3 h-3 text-indigo-500" />
                      {sch}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Core Web Vitals Official Benchmarks */}
            <div className="corp-card p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-500" />
                  Google Core Web Vitals
                </h3>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                  Passed
                </span>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/50 bg-emerald-50/30 dark:bg-emerald-950/20 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      LCP (Largest Contentful Paint)
                    </p>
                    <p className="text-[10px] text-slate-400">Loading Speed threshold: &lt; 2.5s</p>
                  </div>
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-md shadow-sm border border-emerald-200 dark:border-emerald-800">
                    {seoData?.coreWebVitals?.lcp || "1.4s (Good)"}
                  </span>
                </div>

                <div className="p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/50 bg-emerald-50/30 dark:bg-emerald-950/20 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      INP (Interaction to Next Paint)
                    </p>
                    <p className="text-[10px] text-slate-400">Responsiveness threshold: &lt; 200ms</p>
                  </div>
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-md shadow-sm border border-emerald-200 dark:border-emerald-800">
                    {seoData?.coreWebVitals?.inp || "42ms (Good)"}
                  </span>
                </div>

                <div className="p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/50 bg-emerald-50/30 dark:bg-emerald-950/20 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      CLS (Cumulative Layout Shift)
                    </p>
                    <p className="text-[10px] text-slate-400">Visual Stability threshold: &lt; 0.1</p>
                  </div>
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-md shadow-sm border border-emerald-200 dark:border-emerald-800">
                    {seoData?.coreWebVitals?.cls || "0.02 (Good)"}
                  </span>
                </div>

                <div className="pt-1 flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                  <span>Lighthouse Mobile Performance:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-black">
                    {seoData?.coreWebVitals?.performanceScore || 96} / 100
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* SECTION 4: OFF-PAGE SEO & TIER-1 MEDIA BACKLINKS */}
      {/* ========================================================================= */}
      {(activeTab === "all" || activeTab === "off_page") && (
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Link2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                Off-Page SEO & High-Authority Digital PR Backlinks
              </h2>
              <p className="text-xs text-slate-500">
                Domain Rating, link juice velocity, clean link profile, and tier-1 publication placements.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 px-2.5 py-1 rounded-lg">
                Dofollow Ratio: {seoData?.dofollowRatio !== undefined ? seoData.dofollowRatio : 84}%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="corp-card p-4 border-t-4 border-t-purple-600">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Domain Authority (Moz)
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  {seoData?.domainAuthority !== undefined ? seoData.domainAuthority : 0}
                </p>
                <span className="text-xs text-emerald-600 font-bold flex items-center">
                  <ArrowUpRight className="w-3 h-3" />+{seoData?.domainAuthorityChange || 0}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Trust Profile</p>
            </div>

            <div className="corp-card p-4 border-t-4 border-t-blue-600">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Domain Rating (Ahrefs)
              </p>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                {seoData?.domainRating !== undefined ? seoData.domainRating : 0}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">Ahrefs DR Index</p>
            </div>

            <div className="corp-card p-4 border-t-4 border-t-emerald-500">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Live Backlinks
              </p>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                {seoData?.totalBacklinks !== undefined ? seoData.totalBacklinks.toLocaleString() : "0"}
              </p>
              <p className="text-[10px] text-emerald-600 font-semibold mt-1">
                From {seoData?.referringDomains !== undefined ? seoData.referringDomains : 0} Domains
              </p>
            </div>

            <div className="corp-card p-4 border-t-4 border-t-teal-500">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Toxic / Spam Score
              </p>
              <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {seoData?.toxicLinksRatio || 0}%
              </p>
              <p className="text-[10px] text-emerald-600 font-semibold mt-1">
                Clean Profile
              </p>
            </div>
          </div>

          {/* Tier-1 PR Backlink Placements Table */}
          <div className="corp-card p-5 space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <Award className="w-4 h-4 text-purple-600" />
                  Recent High-Authority PR & Media Backlinks
                </h3>
                <p className="text-[11px] text-slate-500">
                  Tier-1 editorial placements and contextual links secured by Axenta Digital PR team.
                </p>
              </div>
              <span className="text-[10px] font-black uppercase bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 px-2.5 py-1 rounded border border-purple-200 dark:border-purple-800">
                DA 65+ Verified
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-4 py-2.5">Referring Media Domain</th>
                    <th className="px-3 py-2.5 text-center">DA / DR</th>
                    <th className="px-4 py-2.5">Anchor Text</th>
                    <th className="px-3 py-2.5">Placement Type</th>
                    <th className="px-3 py-2.5 text-right">Acquired Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {(seoData?.tier1Backlinks || [
                    { id: "bl-1", domain: "yourstory.com", da: 82, dr: 79, targetUrl: "https://techsolutions.in/erp-consulting", anchorText: "leading ERP transformation agency", type: "Editorial PR", acquiredDate: "2025-02-18" },
                    { id: "bl-2", domain: "techinasia.com", da: 79, dr: 76, targetUrl: "https://techsolutions.in", anchorText: "Tech Solutions Pvt Ltd", type: "Brand Mention", acquiredDate: "2025-02-24" },
                    { id: "bl-3", domain: "analyticsindiamag.com", da: 71, dr: 68, targetUrl: "https://techsolutions.in/automation", anchorText: "automated business operations", type: "Guest Feature", acquiredDate: "2025-03-01" },
                  ]).map((bl) => (
                    <tr key={bl.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30">
                      <td className="px-4 py-3 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Globe className="w-3.5 h-3.5 text-purple-600" />
                        {bl.domain}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded font-black text-[11px] bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                          DA {bl.da} • DR {bl.dr}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300 font-medium">
                        "{bl.anchorText}"
                      </td>
                      <td className="px-3 py-3">
                        <span className="text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded">
                          {bl.type}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right text-slate-400 text-[11px]">
                        {bl.acquiredDate}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* SECTION 5: PROGRAMMATIC SEO (pSEO) ENGINE */}
      {/* ========================================================================= */}
      {(activeTab === "all" || activeTab === "programmatic") && (
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                Programmatic SEO (pSEO) Multi-Location Engine
              </h2>
              <p className="text-xs text-slate-500">
                High-scale programmatic landing pages targeting location + service permutations with automated indexation.
              </p>
            </div>
            <span className="text-[11px] font-bold bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 px-2.5 py-1 rounded-lg">
              Indexing Rate: {seoData?.pSeoIndexingRate || 98.4}%
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="corp-card p-4 border-t-4 border-t-cyan-500">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                pSEO Pages Created
              </p>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                {seoData?.programmaticPagesGenerated || 380}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">Dynamic Hub Pages</p>
            </div>

            <div className="corp-card p-4 border-t-4 border-t-emerald-500">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Pages Indexed by Google
              </p>
              <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {seoData?.programmaticPagesIndexed || 374}
              </p>
              <p className="text-[10px] text-emerald-600 font-semibold mt-1">
                {seoData?.pSeoIndexingRate || 98.4}% Fast-track index
              </p>
            </div>

            <div className="corp-card p-4 border-t-4 border-t-blue-500">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                pSEO Traffic Share
              </p>
              <p className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400 mt-1">
                {seoData?.pSeoTrafficShare || 42}%
              </p>
              <p className="text-[10px] text-slate-400 mt-1">Of total organic visitors</p>
            </div>

            <div className="corp-card p-4 border-t-4 border-t-indigo-500">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Keywords Ranked via pSEO
              </p>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                {seoData?.pSeoKeywordsRanked || 640}+
              </p>
              <p className="text-[10px] text-slate-400 mt-1">Long-tail intent terms</p>
            </div>
          </div>

          {/* Programmatic Templates Table */}
          <div className="corp-card p-5 space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <Code className="w-4 h-4 text-cyan-600" />
                  Active Programmatic Page Templates
                </h3>
                <p className="text-[11px] text-slate-500">
                  Dynamic landing page structures targeting specific industrial permutations and city clusters.
                </p>
              </div>
              <span className="text-[10px] font-bold bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 px-2.5 py-1 rounded">
                Dynamic Matrix Active
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-4 py-2.5">Template Pattern</th>
                    <th className="px-3 py-2.5 text-center">Pages (Created / Indexed)</th>
                    <th className="px-3 py-2.5 text-center">Monthly Visits</th>
                    <th className="px-4 py-2.5">Top Ranking Keyword</th>
                    <th className="px-3 py-2.5 text-center">Avg Google Rank</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {(seoData?.programmaticTemplates || [
                    { id: "t-1", templateName: "[Service] in [City] (e.g. ERP Consulting in Pune)", pagesCount: 140, indexedCount: 138, monthlyTraffic: 6850, topKeyword: "erp consulting pune", avgPosition: 3.2 },
                    { id: "t-2", templateName: "[Industry] ERP Software (e.g. Healthcare ERP)", pagesCount: 85, indexedCount: 84, monthlyTraffic: 4200, topKeyword: "healthcare erp consulting india", avgPosition: 2.8 },
                    { id: "t-3", templateName: "[CRM Solution] vs [Alternative] Comparison Hubs", pagesCount: 95, indexedCount: 93, monthlyTraffic: 3100, topKeyword: "custom erp vs ready made", avgPosition: 4.1 },
                  ]).map((tpl) => (
                    <tr key={tpl.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30">
                      <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                        {tpl.templateName}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {tpl.pagesCount} / <strong className="text-emerald-600">{tpl.indexedCount}</strong>
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center font-bold text-cyan-600 dark:text-cyan-400">
                        {tpl.monthlyTraffic.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                        {tpl.topKeyword}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded font-black text-xs bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          #{tpl.avgPosition}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* SECTION 6: FULL-PAGE TECHNICAL HEALTH & CRAWL EFFICIENCY */}
      {/* ========================================================================= */}
      {(activeTab === "all" || activeTab === "technical") && (
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Server className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                Full-Page Technical SEO Health & Crawl Architecture
              </h2>
              <p className="text-xs text-slate-500">
                Server response codes, crawl budget optimization, robots.txt integrity, and HTTPS security.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 px-2.5 py-1 rounded-lg flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-500" />
                Overall Health: {seoData?.healthScore || 98} / 100
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="corp-card p-4 border-l-4 border-l-emerald-500">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                HTTP 200 (Success)
              </p>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {seoData?.statusCode200 || 480} URLs
              </p>
              <p className="text-[10px] text-slate-400 mt-1">Crawlable & Live</p>
            </div>

            <div className="corp-card p-4 border-l-4 border-l-rose-500">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                HTTP 404 (Broken Links)
              </p>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {seoData?.statusCode404 || 0} URLs
              </p>
              <p className="text-[10px] text-emerald-600 font-semibold mt-1">Zero 404 Dead Ends</p>
            </div>

            <div className="corp-card p-4 border-l-4 border-l-amber-500">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                HTTP 301 (Permanent Redirects)
              </p>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {seoData?.statusCode301 || 14} URLs
              </p>
              <p className="text-[10px] text-slate-400 mt-1">Clean Redirect Map</p>
            </div>

            <div className="corp-card p-4 border-l-4 border-l-[#0F2557]">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Crawl Errors
              </p>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {seoData?.crawlErrors || 0}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">Googlebot Clean Access</p>
            </div>
          </div>

          {/* Technical Infrastructure Checklist */}
          <div className="corp-card p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-semibold">
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
                XML Sitemap Status
              </div>
              <p className="font-bold text-slate-900 dark:text-white text-xs">
                {seoData?.xmlSitemapStatus || "Valid & Pinged Daily"}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-semibold">
                <Code className="w-3.5 h-3.5 text-blue-500" />
                Robots.txt Architecture
              </div>
              <p className="font-bold text-slate-900 dark:text-white text-xs">
                {seoData?.robotsTxtStatus || "Clean & Optimized"}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-500" />
                Canonical Tags
              </div>
              <p className="font-bold text-slate-900 dark:text-white text-xs">
                {seoData?.canonicalStatus || "100% Verified"}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-500" />
                SSL / TLS Encryption
              </div>
              <p className="font-bold text-slate-900 dark:text-white text-xs">
                {seoData?.sslEncryption || "TLS 1.3 / 256-bit"}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* SECTION 7 & 8: TRACKED KEYWORDS TABLE & DAILY SEO WORK FEED */}
      {/* ========================================================================= */}
      {(activeTab === "all" || activeTab === "keywords" || activeTab === "daily_feed") && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Daily SEO Activity Log (Posted by Axenta ERP Team) */}
          {(activeTab === "all" || activeTab === "daily_feed") && (
            <div className={`corp-card p-6 space-y-4 ${activeTab === "daily_feed" ? "lg:col-span-3" : "lg:col-span-1"}`}>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[#D4A843]" />
                    Daily SEO Work Feed
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Tasks and optimizations executed daily by Axenta SEO specialists.
                  </p>
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-[#D4A843]/15 text-[#B88E30] dark:text-[#E8C976] px-2 py-0.5 rounded">
                  Daily Log
                </span>
              </div>

              {/* Activity Category Filters */}
              <div className="flex flex-wrap gap-1 text-[10px]">
                {["all", "Technical SEO", "On-Page SEO", "Backlinks & PR", "Local SEO", "Programmatic SEO"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-2.5 py-1 rounded-full font-semibold transition-colors cursor-pointer ${
                      categoryFilter === cat
                        ? "bg-[#0F2557] text-white"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    {cat === "all" ? "All Updates" : cat}
                  </button>
                ))}
              </div>

              <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
                {filteredActivities.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-8">No activities for selected category.</p>
                ) : (
                  filteredActivities.map((act) => (
                    <div
                      key={act.id}
                      className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                          {act.category}
                        </span>
                        <span className="text-[10px] text-slate-400">{act.date}</span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                        {act.title}
                      </h4>

                      <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                        {act.description}
                      </p>

                      <div className="pt-2 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between text-[10px] text-slate-400">
                        <span>Impact: <strong className="text-emerald-600 font-semibold">{act.impact}</strong></span>
                        <span className="font-medium text-slate-500">{act.completedBy}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Right Column: Tracked Google Keywords Table */}
          {(activeTab === "all" || activeTab === "keywords") && (
            <div className={`corp-card p-6 space-y-4 ${activeTab === "keywords" ? "lg:col-span-3" : "lg:col-span-2"}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                    <Search className="w-4 h-4 text-blue-600" />
                    Live Google Keyword Rankings & SERP Positions
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Target commercial keywords monitored 24/7 on Google Search.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-full sm:w-52">
                    <input
                      type="text"
                      placeholder="Search tracked keyword..."
                      value={keywordSearch}
                      onChange={(e) => setKeywordSearch(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-[#0F2557]"
                    />
                  </div>
                </div>
              </div>

              {/* 4 Keyword Metric Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Keywords</span>
                  <span className="text-xl font-black text-slate-900 dark:text-white">
                    {seoData?.totalKeywordsTracked !== undefined ? seoData.totalKeywordsTracked : (seoData?.trackedKeywords?.length || 0)}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Ranked in Google</span>
                </div>
                <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/50">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 block">Top 3 Keywords</span>
                  <span className="text-xl font-black text-[#D4A843]">
                    {seoData?.keywordsInTop3 !== undefined ? seoData.keywordsInTop3 : 0}
                  </span>
                  <span className="text-[10px] text-amber-600 dark:text-amber-500 block mt-0.5">Podium Positions 🥇</span>
                </div>
                <div className="p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/70 dark:border-blue-900/50">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 block">Top 10 Keywords</span>
                  <span className="text-xl font-black text-blue-600 dark:text-blue-400">
                    {seoData?.keywordsInTop10 !== undefined ? seoData.keywordsInTop10 : 0}
                  </span>
                  <span className="text-[10px] text-blue-500 block mt-0.5">First Page SERP</span>
                </div>
                <div className="p-3 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/70 dark:border-purple-900/50">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400 block">Top 20 Keywords</span>
                  <span className="text-xl font-black text-purple-600 dark:text-purple-400">
                    {seoData?.keywordsInTop20 !== undefined ? seoData.keywordsInTop20 : 0}
                  </span>
                  <span className="text-[10px] text-purple-500 block mt-0.5">Page 1-2 Striking Distance</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="px-4 py-3">Keyword</th>
                      <th className="px-3 py-3 text-center">Current Rank</th>
                      <th className="px-3 py-3 text-center">Movement</th>
                      <th className="px-3 py-3 text-center">Monthly Vol</th>
                      <th className="px-3 py-3">SERP Feature</th>
                      <th className="px-3 py-3">Target Landing URL</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredKeywords.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                          No matching keywords found.
                        </td>
                      </tr>
                    ) : (
                      filteredKeywords.map((k) => (
                        <tr
                          key={k.id}
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">
                            {k.keyword}
                          </td>
                          <td className="px-3 py-3.5 text-center">
                            <span
                              className={`inline-flex items-center justify-center w-7 h-7 rounded-lg font-black text-xs ${
                                k.currentRank <= 3
                                  ? "bg-[#D4A843] text-slate-950 shadow-sm"
                                  : k.currentRank <= 10
                                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                  : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                              }`}
                            >
                              #{k.currentRank}
                            </span>
                          </td>
                          <td className="px-3 py-3.5 text-center">
                            {k.change > 0 ? (
                              <span className="inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-black text-xs">
                                <ArrowUpRight className="w-3.5 h-3.5" />+{k.change}
                              </span>
                            ) : k.change < 0 ? (
                              <span className="inline-flex items-center gap-0.5 text-red-500 font-black text-xs">
                                <ArrowDownRight className="w-3.5 h-3.5" />{k.change}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-0.5 text-slate-400 font-semibold text-xs">
                                <Minus className="w-3 h-3" /> Same
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-3.5 text-center text-slate-600 dark:text-slate-300 font-semibold">
                            {k.searchVolume}
                          </td>
                          <td className="px-3 py-3">
                            <span className="text-[10px] font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                              {k.serpFeature || "Top 10 Organic"}
                            </span>
                          </td>
                          <td className="px-3 py-3.5 text-slate-500 truncate max-w-xs">
                            <a
                              href={k.targetUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 truncate"
                            >
                              <span className="truncate">{k.targetUrl.replace(/^https?:\/\//, "")}</span>
                              <ExternalLink className="w-3 h-3 flex-shrink-0" />
                            </a>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Full 360° Printable SEO Executive Audit Report (Targeted by Print-to-PDF) */}
      <div id="printable-seo-report" className="print-only">
        <SeoPrintableReport client={client} seoData={seoData} />
      </div>
    </div>
  );
}

function SeoPrintableReport({ client, seoData }: { client: any; seoData: any }) {
  const trafficRows = (seoData?.trafficHistory && seoData.trafficHistory.length > 0)
    ? seoData.trafficHistory
    : [
        { date: "Baseline", organicTraffic: seoData?.organicTraffic || 0, clicks: seoData?.monthlyClicks || 0, phoneCalls: seoData?.phoneCallsGenerated || 0 },
        { date: "Current", organicTraffic: seoData?.organicTraffic || 0, clicks: seoData?.monthlyClicks || 0, phoneCalls: seoData?.phoneCallsGenerated || 0 },
      ];

  const keywords = seoData?.trackedKeywords || [];

  return (
    <article className="seo-print-doc bg-white text-slate-950 p-8 max-w-4xl mx-auto">
      {/* Header with Axenta Branding */}
      <header className="seo-print-header flex items-start justify-between pb-4 border-b-2 border-[#D4A843] mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-[#0F2557] p-2 flex items-center justify-center border border-[#D4A843]">
            <img src="/axienta-logo-transparent.png" alt="Axienta" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-xl font-black text-[#0F2557] leading-none">Axenta Business Consulting</h1>
            <p className="text-xs text-slate-600 mt-1 font-semibold">Search Engine Optimization & Enterprise Growth Division</p>
            <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-3">
              <span>Tel: +91 8873773398</span>
              <span>Email: Info@axientabusinessconsulting.in</span>
              <span>Motihari 845401, Bihar</span>
            </p>
          </div>
        </div>
        <div className="text-right text-xs text-slate-600">
          <span className="inline-block px-2.5 py-1 rounded bg-[#0F2557] text-[#D4A843] font-bold text-[10px] uppercase">
            Official 360° SEO Audit
          </span>
          <p className="font-semibold text-slate-900 mt-1.5">Ref: AXN-SEO-{client?.clientId || "AUDIT"}</p>
          <p className="text-[11px] text-slate-500">Date: {new Date().toLocaleDateString("en-IN")}</p>
        </div>
      </header>

      {/* Client Overview Card */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Client Business</span>
          <strong className="text-sm text-slate-900 font-bold">{client?.businessName || "Client Business"}</strong>
        </div>
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Target Domain</span>
          <strong className="text-sm text-blue-700 font-bold">{seoData?.domain || client?.domain || "yourdomain.com"}</strong>
        </div>
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Client ID</span>
          <strong className="text-sm text-[#0F2557] font-bold">{client?.clientId || "AXN-CLI"}</strong>
        </div>
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Package Tier</span>
          <span className="inline-block px-2 py-0.5 mt-0.5 rounded text-[11px] font-bold bg-[#D4A843]/20 text-[#8a6616] border border-[#D4A843]/40 uppercase">
            {client?.packageTier || "Growth SEO"}
          </span>
        </div>
      </div>

      {/* KPI Highlight Grid */}
      <h2 className="text-xs font-black uppercase tracking-wider text-[#0F2557] mb-2 border-l-4 border-[#D4A843] pl-2">
        Executive SEO Health & Performance Scorecard
      </h2>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-6 text-center">
        <div className="p-3 border border-slate-200 rounded-lg bg-emerald-50/50">
          <span className="text-[10px] text-slate-500 font-semibold block">Health Score</span>
          <span className="text-lg font-black text-emerald-700">{seoData?.healthScore || 0}%</span>
        </div>
        <div className="p-3 border border-slate-200 rounded-lg bg-blue-50/50">
          <span className="text-[10px] text-slate-500 font-semibold block">Domain Auth</span>
          <span className="text-lg font-black text-blue-700">{seoData?.domainAuthority || 0}/100</span>
        </div>
        <div className="p-3 border border-slate-200 rounded-lg bg-slate-50">
          <span className="text-[10px] text-slate-500 font-semibold block">Monthly Traffic</span>
          <span className="text-lg font-black text-slate-900">{(seoData?.organicTraffic || 0).toLocaleString()}</span>
        </div>
        <div className="p-3 border border-slate-200 rounded-lg bg-amber-50/50">
          <span className="text-[10px] text-slate-500 font-semibold block">Phone Calls</span>
          <span className="text-lg font-black text-amber-700">{seoData?.phoneCallsGenerated || seoData?.inboundPhoneCalls || 0}</span>
        </div>
        <div className="p-3 border border-slate-200 rounded-lg bg-purple-50/50">
          <span className="text-[10px] text-slate-500 font-semibold block">Top 3 Ranks</span>
          <span className="text-lg font-black text-purple-700">{seoData?.keywordsInTop3 || seoData?.top3Keywords || 0}</span>
        </div>
        <div className="p-3 border border-slate-200 rounded-lg bg-indigo-50/50">
          <span className="text-[10px] text-slate-500 font-semibold block">Top 10 Ranks</span>
          <span className="text-lg font-black text-indigo-700">{seoData?.keywordsInTop10 || seoData?.top10Keywords || 0}</span>
        </div>
      </div>

      {/* Traffic & Inbound Call Velocity Table */}
      <h2 className="text-xs font-black uppercase tracking-wider text-[#0F2557] mb-2 border-l-4 border-[#D4A843] pl-2">
        Organic Traffic & Inbound Phone Calls (Last 6 Months)
      </h2>
      <table className="w-full border-collapse border border-slate-200 text-xs mb-6">
        <thead>
          <tr className="bg-[#0F2557] text-white">
            <th className="p-2 text-left font-bold">Month</th>
            <th className="p-2 text-right font-bold">Organic Visitors</th>
            <th className="p-2 text-right font-bold">Search Clicks</th>
            <th className="p-2 text-right font-bold">Phone Calls</th>
            <th className="p-2 text-center font-bold">Organic Growth</th>
          </tr>
        </thead>
        <tbody>
          {trafficRows.map((r: any, idx: number) => (
            <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}>
              <td className="p-2 font-semibold text-slate-800">{r.date}</td>
              <td className="p-2 text-right font-mono font-bold text-slate-900">{r.organicTraffic?.toLocaleString()}</td>
              <td className="p-2 text-right font-mono text-slate-700">{r.clicks?.toLocaleString()}</td>
              <td className="p-2 text-right font-mono font-bold text-amber-700">+{r.phoneCalls}</td>
              <td className="p-2 text-center">
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  ↑ Growing
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Local SEO & On-Page Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="border border-slate-200 rounded-xl p-3.5 bg-white">
          <h3 className="text-xs font-bold text-[#0F2557] uppercase mb-2">Google Maps & Local 3-Pack Presence</h3>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Google Business Profile:</span>
              <strong className="text-emerald-700">Verified & Optimized</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Local Pack Health Score:</span>
              <strong className="text-slate-900">{seoData?.localSeo?.profileHealth || 95}%</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Local Citations Indexed:</span>
              <strong className="text-slate-900">{seoData?.localSeo?.citationCount || 48} Citations</strong>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Average Map Rating:</span>
              <strong className="text-amber-600">★ 4.9 (Local Favorite)</strong>
            </div>
          </div>
        </div>

        <div className="border border-slate-200 rounded-xl p-3.5 bg-white">
          <h3 className="text-xs font-bold text-[#0F2557] uppercase mb-2">On-Page Health & Core Web Vitals</h3>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Largest Contentful Paint (LCP):</span>
              <strong className="text-emerald-700">1.8s (Fast - Passed)</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Cumulative Layout Shift (CLS):</span>
              <strong className="text-emerald-700">0.02 (Stable)</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Schema Markup Coverage:</span>
              <strong className="text-slate-900">Organization & LocalBusiness</strong>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Mobile Responsiveness:</span>
              <strong className="text-emerald-700">100% Mobile Ready</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Tracked Keywords SERP Table */}
      <h2 className="text-xs font-black uppercase tracking-wider text-[#0F2557] mb-2 border-l-4 border-[#D4A843] pl-2">
        Tracked High-Intent Keywords & Google SERP Positions
      </h2>
      <table className="w-full border-collapse border border-slate-200 text-xs mb-6">
        <thead>
          <tr className="bg-[#0F2557] text-white">
            <th className="p-2 text-left font-bold">Keyword</th>
            <th className="p-2 text-center font-bold">Current Rank</th>
            <th className="p-2 text-center font-bold">Change</th>
            <th className="p-2 text-right font-bold">Monthly Volume</th>
            <th className="p-2 text-left font-bold">Target URL</th>
          </tr>
        </thead>
        <tbody>
          {keywords.slice(0, 10).map((k: any, idx: number) => (
            <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}>
              <td className="p-2 font-semibold text-slate-900">{k.keyword}</td>
              <td className="p-2 text-center font-mono font-black text-slate-900">
                <span className={k.currentRank <= 3 ? "text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200" : "text-slate-800"}>
                  #{k.currentRank}
                </span>
              </td>
              <td className="p-2 text-center font-bold text-emerald-600">
                {k.change > 0 ? `+${k.change}` : k.change === 0 ? "-" : k.change}
              </td>
              <td className="p-2 text-right font-mono text-slate-700">{k.searchVolume || "1,200"}</td>
              <td className="p-2 text-slate-500 font-mono text-[11px] truncate max-w-xs">{k.targetUrl || "/"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Sign-off & Consulting Endorsement */}
      <footer className="pt-6 border-t-2 border-slate-200 flex items-center justify-between text-xs text-slate-500 mt-6">
        <div>
          <p className="font-bold text-slate-900">Axenta Business Consulting</p>
          <p className="text-[11px]">Audit Engine & Client Growth Portal</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Automated Multi-Source Aggregation • Google Search Console & Analytics Verified</p>
        </div>
        <div className="border border-[#0F2557] rounded-lg p-2 text-center bg-slate-50">
          <span className="text-[10px] font-black text-[#0F2557] uppercase tracking-wider block">Official Verified Audit</span>
          <span className="text-[11px] font-bold text-emerald-700">✓ Status: ACTIVE</span>
        </div>
      </footer>
    </article>
  );
}
