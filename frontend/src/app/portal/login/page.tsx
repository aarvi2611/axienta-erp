"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Building,
  Lock,
  ArrowRight,
  Info
} from "lucide-react";
import { usePortalData } from "@/hooks/usePortalData";
import { Button } from "@/components/ui/button";

export default function ClientPortalLoginPage() {
  const router = useRouter();
  const { clientLogin, isAuthenticated } = usePortalData();
  const [clientIdInput, setClientIdInput] = useState("");
  const [pinInput, setPinInput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // If already authenticated, redirect straight to portal
  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/portal");
    }
  }, [isAuthenticated, router]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = clientLogin(clientIdInput, pinInput);
    if (!res.success) {
      setError(res.error || "Authentication failed. Please verify your Client ID or PIN.");
      setLoading(false);
      return;
    }

    router.push("/portal");
  };

  return (
    <div className="w-full max-w-md py-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-7 sm:p-8"
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-[#07111f] border border-[#D4A843]/60 p-1.5 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-[#0F2557]/20">
            <img src="/axienta-logo-transparent.png" alt="Axienta logo" className="h-full w-full object-contain" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Client Portal Access
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            Log in with your assigned <strong className="text-[#0F2557] dark:text-[#D4A843]">Client ID</strong> to access your invoices, daily SEO reports, and project deliverables.
          </p>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-2">
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-bold text-slate-800 dark:text-slate-200 block text-xs">
                Enter Your Client ID
              </label>
              <span className="text-[10px] text-[#B88E30] dark:text-[#E8C976] font-semibold bg-[#D4A843]/15 px-2 py-0.5 rounded">
                Direct ID Login
              </span>
            </div>
            <div className="relative">
              <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="e.g. AXN-CLI-01"
                value={clientIdInput}
                onChange={(e) => setClientIdInput(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#0F2557] transition-all font-semibold tracking-wide text-sm"
                required
                autoFocus
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
              Client ID automatically isolates your company invoices, projects, and SEO data.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-medium text-slate-500 dark:text-slate-400 text-[11px]">
                Security PIN <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <span className="text-[10px] text-slate-400">Default: 1234</span>
            </div>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                placeholder="Leave blank or enter your PIN"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#0F2557] transition-all text-xs"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#0F2557] to-[#1A3A7A] hover:from-[#0B1E47] hover:to-[#162F64] text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all text-xs cursor-pointer"
          >
            {loading ? "Authenticating..." : "Access My Portal"}
            <ArrowRight className="w-4 h-4 text-[#D4A843]" />
          </Button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Need assistance or your official Client ID? Contact your Axenta Account Manager or reach our corporate desk at{" "}
            <strong className="text-slate-700 dark:text-slate-300">Info@axientabusinessconsulting.in</strong>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
