"use client";
import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { auth } from "@/config/firebase";
import { Lock, Camera, ArrowRight, ShieldAlert, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import BiometricCameraModal from "@/components/attendance/BiometricCameraModal";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isCheckedInToday, checkInWithPhoto } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [cameraModalOpen, setCameraModalOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user && !auth.currentUser) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#07111f] border border-[#D4A843]/60 p-2 flex items-center justify-center mx-auto mb-4 shadow-xl animate-pulse">
            <img src="/axienta-logo-transparent.png" alt="Axienta ERP" className="h-full w-full object-contain" />
          </div>
          <div className="flex items-center gap-1 justify-center">
            <div className="w-2 h-2 rounded-full bg-[#0F2557] animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-2 h-2 rounded-full bg-[#0F2557] animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="w-2 h-2 rounded-full bg-[#0F2557] animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
          <p className="text-sm text-slate-500 mt-3">Loading Axenta ERP...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  // Enforce mandatory daily attendance check-in before any work sections are accessible
  const isAttendancePage = pathname === "/attendance";
  const isWorkstationLocked = !isCheckedInToday && !isAttendancePage;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        <TopBar />
        <main className="flex-1 p-4 lg:p-8">
          {isWorkstationLocked ? (
            <div className="max-w-2xl mx-auto my-12 p-8 rounded-3xl bg-white dark:bg-slate-900 border-2 border-amber-300/80 dark:border-amber-700/60 shadow-2xl text-center animate-fade-in relative overflow-hidden">
              <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />
              
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-[#D4A843] text-slate-950 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/25">
                <Lock className="w-8 h-8" />
              </div>

              <span className="text-[10px] font-black uppercase tracking-widest text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/80 px-3 py-1 rounded-full inline-flex items-center gap-1 mb-2">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600" /> Mandatory Security Gate
              </span>

              <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-2 mb-2">
                Workstation Locked: Daily Check-In Required
              </h2>

              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-6 leading-relaxed">
                Company policy strictly mandates <strong>live biometric photo verification</strong> before access to any ERP work sections, client portfolios, leads, calling pipelines, or operational tools is granted.
              </p>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 max-w-lg mx-auto mb-6 text-left text-xs space-y-2">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Face verified against registered employee profile image</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Instant workstation unlocking upon successful biometric match</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  onClick={() => setCameraModalOpen(true)}
                  className="bg-gradient-to-r from-[#D4A843] to-[#E8C976] text-slate-950 font-bold px-6 py-2.5 rounded-xl shadow-md hover:brightness-105 flex items-center gap-2 text-xs"
                >
                  <Camera className="w-4 h-4" /> Open Camera & Check In Now
                </Button>
                <Link
                  href="/attendance"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors inline-flex items-center gap-1"
                >
                  <span>Go to Attendance Hub</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            children
          )}
        </main>
      </div>

      <BiometricCameraModal
        isOpen={cameraModalOpen}
        onClose={() => setCameraModalOpen(false)}
        onSuccess={async (photo, score) => {
          await checkInWithPhoto(photo, score);
          setCameraModalOpen(false);
        }}
      />
    </div>
  );
}
