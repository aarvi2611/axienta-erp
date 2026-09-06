"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  TrendingUp,
  LifeBuoy,
  LogOut,
  Building,
  ShieldCheck,
  ExternalLink,
  Bell,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Menu,
  X
} from "lucide-react";
import { usePortalData } from "@/hooks/usePortalData";
import { cn } from "@/lib/utils";

interface ClientPortalLayoutProps {
  children: React.ReactNode;
}

const clientNavItems = [
  { label: "Overview", href: "/portal", icon: LayoutDashboard },
  { label: "Invoices & Dues", href: "/portal/invoices", icon: FileText },
  { label: "Work Progress & Deliverables", href: "/portal/projects", icon: Briefcase },
  { label: "Daily SEO Hub", href: "/portal/seo", icon: TrendingUp, highlight: true },
  { label: "Support & Tickets", href: "/portal/support", icon: LifeBuoy },
];

export default function ClientPortalLayout({ children }: ClientPortalLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { client, dues, tickets, isAuthenticated, clientLogout } = usePortalData();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Authentication Guard: Redirect unauthenticated users to /portal/login after mounting
  useEffect(() => {
    if (mounted && !isAuthenticated && pathname !== "/portal/login") {
      router.replace("/portal/login");
    }
  }, [mounted, isAuthenticated, pathname, router]);

  const openTicketsCount = tickets.filter((t) => t.status !== "Resolved" && t.status !== "Closed").length;

  // Render standalone layout for login page
  if (pathname === "/portal/login") {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] text-slate-900 dark:text-slate-100 flex flex-col antialiased">
        <header className="bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#07111f] border border-[#D4A843]/60 p-1 flex items-center justify-center flex-shrink-0 shadow-md">
                <img src="/axienta-logo-transparent.png" alt="Axienta logo" className="h-full w-full object-contain" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Enterprise Gateway</span>
                <h1 className="text-base font-bold text-[#0F2557] dark:text-white leading-tight">Axenta Client Portal</h1>
              </div>
            </div>
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#0F2557]/10 dark:bg-white/10 text-[#0F2557] dark:text-white hover:bg-[#0F2557] hover:text-white dark:hover:bg-white dark:hover:text-[#0F2557] transition-all"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#D4A843]" />
              <span>Back to ERP</span>
            </Link>
          </div>
        </header>
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full flex items-center justify-center">
          {children}
        </main>
        <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] py-4 text-xs text-slate-400 text-center">
          Axenta ERP Secure Client Portal • SSL 256-bit Encrypted Session
        </footer>
      </div>
    );
  }

  // Loading state during SSR and before client hydration or while checking authentication
  if (!mounted || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] flex flex-col items-center justify-center p-4">
        <div className="w-14 h-14 rounded-2xl bg-[#07111f] border border-[#D4A843]/60 p-1.5 flex items-center justify-center mb-4 shadow-lg animate-pulse">
          <img src="/axienta-logo-transparent.png" alt="Axienta logo" className="h-full w-full object-contain" />
        </div>
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Loading Client Portal...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] text-slate-900 dark:text-slate-100 flex flex-col antialiased">
      {/* Client Portal Standalone Header */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm">
        {/* Top utility alert bar if dues are pending */}
        {dues.totalDue > 0 && (
          <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/15 to-transparent border-b border-amber-200 dark:border-amber-900/40 px-4 py-1.5 text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between">
            <div className="flex items-center gap-2 max-w-5xl mx-auto w-full">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500 text-white">
                Pending Due
              </span>
              <span>
                You have an outstanding balance of{" "}
                <strong className="font-bold">₹{dues.totalDue.toLocaleString()}</strong>.
              </span>
              <Link
                href="/portal/invoices"
                className="ml-auto underline font-medium hover:text-amber-900 dark:hover:text-amber-200 flex items-center gap-1"
              >
                View Invoice Details <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand & Client Identification */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#07111f] border border-[#D4A843]/60 p-1 flex items-center justify-center flex-shrink-0 shadow-md">
              <img src="/axienta-logo-transparent.png" alt="Axienta logo" className="h-full w-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Axienta Portal
                </span>
                <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Verified Client
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-bold text-[#0F2557] dark:text-white leading-tight flex items-center gap-1.5">
                {client?.businessName || "Client Business"}
              </h1>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
            {clientNavItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 relative",
                    isActive
                      ? "bg-white dark:bg-slate-900 text-[#0F2557] dark:text-[#D4A843] shadow-sm font-bold"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50"
                  )}
                >
                  <Icon className={cn("w-3.5 h-3.5", isActive ? "text-[#D4A843]" : "text-slate-400")} />
                  {item.label}
                  {item.highlight && (
                    <span className="text-[9px] bg-gradient-to-r from-[#D4A843] to-[#E8C976] text-slate-950 px-1.5 py-0.2 rounded font-black uppercase tracking-tight">
                      Daily
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Header Actions & Isolated Client Badge */}
          <div className="flex items-center gap-2.5">
            {/* Scoped Client Identification (Strictly Isolated - No Public Switcher) */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-slate-600 dark:text-slate-300">
                ID: <strong className="text-[#0F2557] dark:text-[#D4A843] font-bold">{client?.clientId}</strong>
              </span>
            </div>

            {/* Support Tickets Quick Counter */}
            <Link
              href="/portal/support"
              className="relative p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Support Tickets"
            >
              <LifeBuoy className="w-4 h-4" />
              {openTicketsCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-amber-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {openTicketsCount}
                </span>
              )}
            </Link>

            {/* Client Logout Button */}
            <button
              onClick={() => {
                clientLogout();
                router.push("/portal/login");
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-900/50 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>

            {/* Admin Portal Shortcut */}
            <Link
              href="/client-portal"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#0F2557]/10 dark:bg-white/10 text-[#0F2557] dark:text-white hover:bg-[#0F2557] hover:text-white dark:hover:bg-white dark:hover:text-[#0F2557] transition-all"
              title="Back to Admin ERP Manager"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#D4A843]" />
              <span>Admin Console</span>
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 space-y-1"
            >
              <div className="pb-2 mb-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[#0F2557] dark:text-white">{client?.businessName}</p>
                  <p className="text-[10px] text-slate-400">Client ID: {client?.clientId}</p>
                </div>
                <button
                  onClick={() => {
                    clientLogout();
                    router.push("/portal/login");
                  }}
                  className="text-xs text-rose-600 font-semibold flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" /> Logout
                </button>
              </div>

              {clientNavItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-[#0F2557] text-white font-bold"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    {item.highlight && (
                      <span className="text-[10px] bg-[#D4A843] text-slate-950 px-2 py-0.5 rounded font-bold">
                        Daily
                      </span>
                    )}
                  </Link>
                );
              })}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <Link
                  href="/client-portal"
                  className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                >
                  <ShieldCheck className="w-4 h-4 text-[#D4A843]" />
                  Return to Admin ERP Console
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Client Portal Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full">
        {children}
      </main>

      {/* Portal Professional Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] py-6 mt-12 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 dark:text-slate-200">Axenta Enterprise Client Portal</span>
            <span>•</span>
            <span>Account Manager: <strong className="text-slate-700 dark:text-slate-300">{client?.accountManager}</strong></span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/portal/support" className="hover:text-slate-800 dark:hover:text-slate-200 underline">
              Need Assistance? Raise a Ticket
            </Link>
            <span>•</span>
            <span className="text-slate-400">Security Encrypted (SSL 256-bit)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

