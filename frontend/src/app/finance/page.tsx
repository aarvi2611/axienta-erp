"use client";
import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Landmark, ExternalLink, RefreshCw, Maximize2, Minimize2,
  ShieldCheck, CreditCard, DollarSign, Wallet, ArrowUpRight,
  Layers, Lock, Sparkles, CheckCircle2, AlertCircle
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type FinanceTab = "upi" | "business" | "dual";

interface PortalConfig {
  id: "upi" | "business";
  title: string;
  shortName: string;
  url: string;
  badge: string;
  badgeColor: string;
  tagline: string;
  icon: React.ElementType;
  gradient: string;
}

const PORTALS: Record<"upi" | "business", PortalConfig> = {
  upi: {
    id: "upi",
    title: "UPI Pay Manager",
    shortName: "UPI Payments",
    url: "https://upi-pay-manager.vercel.app/",
    badge: "Live Gateway",
    badgeColor: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    tagline: "Instant UPI collections, QR settlement & real-time payout tracking",
    icon: Wallet,
    gradient: "from-emerald-500/20 via-teal-500/10 to-transparent",
  },
  business: {
    id: "business",
    title: "Axienta Business Finance",
    shortName: "Business Ledger",
    url: "https://axientabusinessfinance.netlify.app/",
    badge: "Enterprise Suite",
    badgeColor: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    tagline: "Corporate financial statements, billing, revenue analytics & P&L",
    icon: Landmark,
    gradient: "from-amber-500/20 via-amber-600/10 to-transparent",
  },
};

export default function FinancePage() {
  const [activeTab, setActiveTab] = useState<FinanceTab>("upi");
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [upiLoading, setUpiLoading] = useState(true);
  const [businessLoading, setBusinessLoading] = useState(true);
  const [refreshKeyUpi, setRefreshKeyUpi] = useState(0);
  const [refreshKeyBusiness, setRefreshKeyBusiness] = useState(0);

  const handleRefresh = (target: "upi" | "business" | "all") => {
    if (target === "upi" || target === "all") {
      setUpiLoading(true);
      setRefreshKeyUpi((prev) => prev + 1);
    }
    if (target === "business" || target === "all") {
      setBusinessLoading(true);
      setRefreshKeyBusiness((prev) => prev + 1);
    }
  };

  const openInNewTab = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <DashboardLayout>
      <div className={cn("transition-all duration-300", isFullScreen && "fixed inset-0 z-50 bg-slate-950 p-4 overflow-y-auto")}>
        {/* Top Header */}
        <PageHeader
          title="Finance Department"
          description="Centralized corporate finance management • UPI Pay Manager & Axienta Business Finance"
          icon={Landmark}
          actions={
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRefresh(activeTab === "dual" ? "all" : activeTab)}
                className="border-slate-300 dark:border-slate-700 hover:border-[#D4A843]"
                title="Reload active finance portal"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1 text-[#D4A843]" />
                Reload
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFullScreen(!isFullScreen)}
                className="border-slate-300 dark:border-slate-700 hover:border-[#D4A843]"
                title={isFullScreen ? "Exit Fullscreen" : "Fullscreen View"}
              >
                {isFullScreen ? (
                  <>
                    <Minimize2 className="w-3.5 h-3.5 mr-1" /> Normal
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-3.5 h-3.5 mr-1" /> Full Window
                  </>
                )}
              </Button>
              <Button
                size="sm"
                className="bg-gradient-to-r from-[#0F2557] to-[#1A3A7A] hover:from-[#153478] hover:to-[#224ba0] text-white border border-[#D4A843]/40"
                onClick={() =>
                  openInNewTab(
                    activeTab === "business" ? PORTALS.business.url : PORTALS.upi.url
                  )
                }
              >
                <ExternalLink className="w-3.5 h-3.5 mr-1 text-[#D4A843]" />
                Open External
              </Button>
            </div>
          }
        />

        {/* Quick Portal Switcher & Metric Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Card 1: UPI Pay Manager */}
          <div
            onClick={() => setActiveTab("upi")}
            className={cn(
              "p-4 rounded-xl cursor-pointer border transition-all duration-200 relative overflow-hidden group",
              activeTab === "upi"
                ? "bg-gradient-to-br from-[#0F2557] to-[#142d63] border-[#D4A843] shadow-lg shadow-[#0F2557]/20 text-white"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-800 dark:text-slate-200"
            )}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-11 h-11 rounded-xl flex items-center justify-center font-bold",
                    activeTab === "upi"
                      ? "bg-[#D4A843] text-slate-950 shadow-md shadow-[#D4A843]/30"
                      : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                  )}
                >
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base tracking-tight">UPI Pay Manager</h3>
                    <span
                      className={cn(
                        "text-[10px] px-2 py-0.5 rounded-full font-semibold border",
                        PORTALS.upi.badgeColor
                      )}
                    >
                      {PORTALS.upi.badge}
                    </span>
                  </div>
                  <p className={cn("text-xs mt-0.5", activeTab === "upi" ? "text-slate-300" : "text-slate-500 dark:text-slate-400")}>
                    {PORTALS.upi.tagline}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="p-1 h-auto text-xs opacity-75 hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  openInNewTab(PORTALS.upi.url);
                }}
              >
                <ArrowUpRight className="w-4 h-4" />
              </Button>
            </div>
            {activeTab === "upi" && (
              <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-xs text-[#E8C976]">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Active Embedded Workspace
                </span>
                <span className="font-mono text-[11px] opacity-80">upi-pay-manager.vercel.app</span>
              </div>
            )}
          </div>

          {/* Card 2: Axienta Business Finance */}
          <div
            onClick={() => setActiveTab("business")}
            className={cn(
              "p-4 rounded-xl cursor-pointer border transition-all duration-200 relative overflow-hidden group",
              activeTab === "business"
                ? "bg-gradient-to-br from-[#0F2557] to-[#142d63] border-[#D4A843] shadow-lg shadow-[#0F2557]/20 text-white"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-800 dark:text-slate-200"
            )}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-11 h-11 rounded-xl flex items-center justify-center font-bold",
                    activeTab === "business"
                      ? "bg-[#D4A843] text-slate-950 shadow-md shadow-[#D4A843]/30"
                      : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                  )}
                >
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base tracking-tight">Axienta Business Finance</h3>
                    <span
                      className={cn(
                        "text-[10px] px-2 py-0.5 rounded-full font-semibold border",
                        PORTALS.business.badgeColor
                      )}
                    >
                      {PORTALS.business.badge}
                    </span>
                  </div>
                  <p className={cn("text-xs mt-0.5", activeTab === "business" ? "text-slate-300" : "text-slate-500 dark:text-slate-400")}>
                    {PORTALS.business.tagline}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="p-1 h-auto text-xs opacity-75 hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  openInNewTab(PORTALS.business.url);
                }}
              >
                <ArrowUpRight className="w-4 h-4" />
              </Button>
            </div>
            {activeTab === "business" && (
              <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-xs text-[#E8C976]">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Active Embedded Workspace
                </span>
                <span className="font-mono text-[11px] opacity-80">axientabusinessfinance.netlify.app</span>
              </div>
            )}
          </div>
        </div>

        {/* View Selection Tabs & Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <button
              onClick={() => setActiveTab("upi")}
              className={cn(
                "px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5",
                activeTab === "upi"
                  ? "bg-[#0F2557] text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              <Wallet className="w-3.5 h-3.5 text-[#D4A843]" />
              Section 1: UPI Pay Manager
            </button>
            <button
              onClick={() => setActiveTab("business")}
              className={cn(
                "px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5",
                activeTab === "business"
                  ? "bg-[#0F2557] text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              <Landmark className="w-3.5 h-3.5 text-[#D4A843]" />
              Section 2: Business Finance
            </button>
            <button
              onClick={() => setActiveTab("dual")}
              className={cn(
                "hidden xl:flex px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all items-center gap-1.5",
                activeTab === "dual"
                  ? "bg-[#0F2557] text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              <Layers className="w-3.5 h-3.5 text-[#D4A843]" />
              Dual Split View
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" /> Secure Sandbox Embedded
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span>Single-Sign-On Workspace</span>
          </div>
        </div>

        {/* Embedded Frame Area */}
        <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-xl">
          {/* Section 1: UPI Pay Manager */}
          {(activeTab === "upi" || activeTab === "dual") && (
            <div
              className={cn(
                "relative flex flex-col transition-all duration-300",
                activeTab === "dual" ? "h-[750px] xl:w-1/2 xl:inline-block border-r border-slate-200 dark:border-slate-800 align-top" : "h-[780px] lg:h-[calc(100vh-270px)] min-h-[650px]"
              )}
            >
              {/* Frame Header Bar */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 text-white border-b border-slate-800 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-semibold text-slate-200">UPI Pay Manager</span>
                  <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                    https://upi-pay-manager.vercel.app/
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRefresh("upi")}
                    className="p-1.5 hover:bg-white/10 rounded text-slate-300 hover:text-white transition-colors"
                    title="Reload UPI Portal"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => openInNewTab(PORTALS.upi.url)}
                    className="flex items-center gap-1 px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-slate-200 transition-colors"
                    title="Open in new window"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Open Tab</span>
                  </button>
                </div>
              </div>

              {/* Loader Overlay */}
              {upiLoading && (
                <div className="absolute inset-x-0 top-10 bottom-0 bg-slate-900/90 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-3">
                  <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-slate-300 font-medium">Connecting to UPI Pay Manager...</p>
                  <p className="text-xs text-slate-500">Secured via Vercel Edge Network</p>
                </div>
              )}

              {/* iFrame */}
              <iframe
                key={refreshKeyUpi}
                src={PORTALS.upi.url}
                title="UPI Pay Manager"
                onLoad={() => setUpiLoading(false)}
                className="w-full h-full border-0 bg-white"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; payment"
                sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-downloads"
              />
            </div>
          )}

          {/* Section 2: Axienta Business Finance */}
          {(activeTab === "business" || activeTab === "dual") && (
            <div
              className={cn(
                "relative flex flex-col transition-all duration-300",
                activeTab === "dual" ? "h-[750px] xl:w-1/2 xl:inline-block align-top" : "h-[780px] lg:h-[calc(100vh-270px)] min-h-[650px]"
              )}
            >
              {/* Frame Header Bar */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 text-white border-b border-slate-800 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                  <span className="font-semibold text-slate-200">Axienta Business Finance</span>
                  <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                    https://axientabusinessfinance.netlify.app/
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRefresh("business")}
                    className="p-1.5 hover:bg-white/10 rounded text-slate-300 hover:text-white transition-colors"
                    title="Reload Finance Portal"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => openInNewTab(PORTALS.business.url)}
                    className="flex items-center gap-1 px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-slate-200 transition-colors"
                    title="Open in new window"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Open Tab</span>
                  </button>
                </div>
              </div>

              {/* Loader Overlay */}
              {businessLoading && (
                <div className="absolute inset-x-0 top-10 bottom-0 bg-slate-900/90 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-3">
                  <div className="w-10 h-10 border-3 border-amber-400 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-slate-300 font-medium">Connecting to Axienta Business Finance...</p>
                  <p className="text-xs text-slate-500">Secured via Netlify Enterprise CDN</p>
                </div>
              )}

              {/* iFrame */}
              <iframe
                key={refreshKeyBusiness}
                src={PORTALS.business.url}
                title="Axienta Business Finance"
                onLoad={() => setBusinessLoading(false)}
                className="w-full h-full border-0 bg-white"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; payment"
                sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-downloads"
              />
            </div>
          )}
        </div>

        {/* Helpful User Information Banner */}
        <div className="mt-4 p-3.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#D4A843] flex-shrink-0" />
            <span>
              Both finance modules are embedded inside Axienta ERP for uninterrupted workflow. If any external payment gateway prompts for a standalone window, you can use the <strong>Open External</strong> button above.
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 font-medium">
            <button
              onClick={() => openInNewTab(PORTALS.upi.url)}
              className="text-[#0F2557] dark:text-[#D4A843] hover:underline"
            >
              Launch UPI ↗
            </button>
            <span>•</span>
            <button
              onClick={() => openInNewTab(PORTALS.business.url)}
              className="text-[#0F2557] dark:text-[#D4A843] hover:underline"
            >
              Launch Finance ↗
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
