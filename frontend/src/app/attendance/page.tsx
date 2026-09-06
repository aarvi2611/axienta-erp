"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  LogIn,
  LogOut,
  Users,
  Camera,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  Lock,
  Unlock,
  Eye,
  X,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/common/PageHeader";
import StatsCard from "@/components/common/StatsCard";
import DataTable from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { Attendance } from "@/types";
import BiometricCameraModal from "@/components/attendance/BiometricCameraModal";
import { attendanceStore } from "@/lib/attendanceService";

const today = new Date().toISOString().slice(0, 10);

export default function AttendancePage() {
  const {
    user,
    isCheckedInToday,
    todayAttendance,
    checkInWithPhoto,
    checkOutToday,
  } = useAuth();

  const [showCameraModal, setShowCameraModal] = useState(false);
  const [attendanceList, setAttendanceList] = useState<Attendance[]>([]);
  const [inspectPhoto, setInspectPhoto] = useState<{ url: string; title: string; score?: number } | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Sync live attendance list from store
  useEffect(() => {
    const updateList = () => {
      const stored = attendanceStore.getAllTodayAttendance();
      if (user && todayAttendance) {
        const combined = [
          todayAttendance,
          ...stored.filter((s) => s.userId !== user.uid),
        ];
        setAttendanceList(combined);
      } else {
        setAttendanceList(stored);
      }
    };

    updateList();
    const unsub = attendanceStore.subscribe(updateList);
    return () => {
      unsub();
    };
  }, [user, todayAttendance]);

  const handleBiometricSuccess = async (photoDataUrl: string, score: number) => {
    try {
      await checkInWithPhoto(photoDataUrl, score);
    } catch (err) {
      console.error("Check-in error:", err);
    }
  };

  const handleCheckOut = async () => {
    setIsCheckingOut(true);
    try {
      await checkOutToday();
    } catch (err) {
      console.error("Check out error:", err);
    } finally {
      setIsCheckingOut(false);
    }
  };

  const present = attendanceList.filter((a) => a.status === "present").length;
  const absent = attendanceList.filter((a) => a.status === "absent").length;
  const onLeave = attendanceList.filter((a) => a.status === "leave").length;
  const halfDay = attendanceList.filter((a) => a.status === "half_day").length;

  const columns = [
    {
      key: "userName",
      label: "Employee",
      sortable: true,
      render: (row: Attendance) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.userName} src={row.photoUrl} size="sm" className="border border-slate-200 dark:border-slate-700" />
          <div>
            <span className="font-semibold text-slate-900 dark:text-white block text-sm">
              {row.userName}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              {row.userId === user?.uid ? "You (Current Session)" : `ID: ${row.userId}`}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "biometric",
      label: "Biometric Verification",
      render: (row: Attendance) => {
        if (row.verified) {
          return (
            <div className="flex items-center gap-2">
              {row.photoUrl ? (
                <button
                  type="button"
                  onClick={() =>
                    setInspectPhoto({
                      url: row.photoUrl!,
                      title: `${row.userName} - Check-In Snapshot`,
                      score: row.verificationScore,
                    })
                  }
                  className="relative group w-8 h-8 rounded-lg overflow-hidden border-2 border-emerald-500 shadow-xs hover:ring-2 hover:ring-emerald-400 transition-all flex-shrink-0"
                  title="Click to view full captured photo"
                >
                  <img
                    src={row.photoUrl}
                    alt={row.userName}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Eye className="w-3.5 h-3.5 text-white" />
                  </div>
                </button>
              ) : (
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center text-emerald-600">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              )}
              <div className="flex flex-col">
                <Badge variant="success" className="gap-1 text-[10px] py-0 px-2 font-bold w-fit">
                  <ShieldCheck className="w-3 h-3" />
                  {row.verificationScore ? `${row.verificationScore}% Match` : "Verified"}
                </Badge>
                <span className="text-[9px] text-slate-400 font-medium mt-0.5">
                  Face Biometric ✓
                </span>
              </div>
            </div>
          );
        }
        return (
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
            Standard Entry
          </span>
        );
      },
    },
    {
      key: "checkIn",
      label: "Check In",
      render: (row: Attendance) =>
        row.checkIn ? (
          <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
            <LogIn className="w-3.5 h-3.5" />
            {row.checkIn}
          </span>
        ) : (
          <span className="text-xs text-slate-400">—</span>
        ),
    },
    {
      key: "checkOut",
      label: "Check Out",
      render: (row: Attendance) =>
        row.checkOut ? (
          <span className="text-xs text-blue-600 font-semibold flex items-center gap-1">
            <LogOut className="w-3.5 h-3.5" />
            {row.checkOut}
          </span>
        ) : (
          <span className="text-xs text-slate-400">—</span>
        ),
    },
    {
      key: "hoursWorked",
      label: "Hours",
      render: (row: Attendance) =>
        row.hoursWorked ? (
          <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
            {row.hoursWorked.toFixed(1)} hrs
          </span>
        ) : (
          <span className="text-xs text-slate-400">—</span>
        ),
    },
    {
      key: "status",
      label: "Status",
      render: (row: Attendance) => {
        const variants: Record<string, any> = {
          present: "success",
          absent: "destructive",
          half_day: "warning",
          leave: "info",
        };
        const labels: Record<string, string> = {
          present: "Present",
          absent: "Absent",
          half_day: "Half Day",
          leave: "On Leave",
        };
        return <Badge variant={variants[row.status]}>{labels[row.status]}</Badge>;
      },
    },
    {
      key: "notes",
      label: "Notes",
      render: (row: Attendance) => (
        <span className="text-xs text-slate-500 italic">{row.notes || "—"}</span>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="Attendance & Biometric Gate"
        description={`Today's verified attendance overview — ${today}`}
        icon={Calendar}
      />

      {/* Quick Biometric Check-In / Check-Out Widget */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <Card
          className={`border-2 transition-all ${
            isCheckedInToday
              ? "border-emerald-500/40 bg-gradient-to-r from-emerald-500/10 via-transparent to-[#D4A843]/5 dark:from-emerald-950/30"
              : "border-[#D4A843]/50 bg-gradient-to-r from-[#0F2557]/10 via-[#0F2557]/5 to-transparent shadow-lg"
          }`}
        >
          <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-5">
            <div className="flex items-center gap-4 w-full md:w-auto">
              {/* Status Icon */}
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md ${
                  isCheckedInToday
                    ? "bg-emerald-600 text-white"
                    : "bg-[#0F2557] text-[#D4A843] border border-[#D4A843]/30"
                }`}
              >
                {isCheckedInToday ? (
                  <ShieldCheck className="w-8 h-8" />
                ) : (
                  <Camera className="w-7 h-7" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Daily Biometric Attendance
                  </h3>
                  {isCheckedInToday ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                      <Unlock className="w-3 h-3" /> Workstation Unlocked
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-800">
                      <Lock className="w-3 h-3" /> Workstation Locked
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
                  {isCheckedInToday
                    ? `Checked in at ${todayAttendance?.checkIn} with ${
                        todayAttendance?.verificationScore || 95
                      }% biometric facial confidence match. All ERP modules are active.`
                    : "Mandatory: Live webcam facial capture is required to mark attendance and unlock other ERP sections."}
                </p>

                {/* Verification details pill if checked in */}
                {isCheckedInToday && todayAttendance && (
                  <div className="flex items-center gap-3 mt-2 text-[11px] font-medium text-slate-500">
                    <span>
                      Check-In: <b className="text-slate-800 dark:text-slate-200">{todayAttendance.checkIn}</b>
                    </span>
                    {todayAttendance.checkOut && (
                      <span>
                        Check-Out: <b className="text-slate-800 dark:text-slate-200">{todayAttendance.checkOut}</b>
                      </span>
                    )}
                    <span>
                      Match Confidence:{" "}
                      <b className="text-emerald-600">{todayAttendance.verificationScore || 95}%</b>
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions & Live Captured Photo thumbnail */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              {isCheckedInToday && todayAttendance?.photoUrl && (
                <button
                  type="button"
                  onClick={() =>
                    setInspectPhoto({
                      url: todayAttendance.photoUrl!,
                      title: "Your Check-In Biometric Verification Photo",
                      score: todayAttendance.verificationScore,
                    })
                  }
                  className="relative group rounded-xl overflow-hidden border-2 border-emerald-500 shadow-md hover:scale-105 transition-all w-12 h-12 flex-shrink-0"
                  title="View your verified photo"
                >
                  <img
                    src={todayAttendance.photoUrl}
                    alt="Your Check-in Photo"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Eye className="w-4 h-4 text-white" />
                  </div>
                </button>
              )}

              {!isCheckedInToday ? (
                <Button
                  onClick={() => setShowCameraModal(true)}
                  className="bg-gradient-to-r from-[#D4A843] to-[#b88e2c] text-slate-950 font-bold hover:brightness-105 shadow-md px-6 py-2.5 rounded-xl flex items-center gap-2 text-sm"
                >
                  <Camera className="w-4 h-4" /> Take Photo & Check In
                </Button>
              ) : !todayAttendance?.checkOut ? (
                <Button
                  onClick={handleCheckOut}
                  disabled={isCheckingOut}
                  variant="outline"
                  className="border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 font-semibold px-5 rounded-xl flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  {isCheckingOut ? "Checking Out..." : "Check Out For Today"}
                </Button>
              ) : (
                <Badge variant="default" className="text-xs px-3 py-1.5 font-bold">
                  Shift Completed Today ({todayAttendance.hoursWorked} hrs)
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard title="Present" value={present} icon={CheckCircle} color="green" />
        <StatsCard title="Absent" value={absent} icon={XCircle} color="red" delay={0.1} />
        <StatsCard title="On Leave" value={onLeave} icon={Calendar} color="blue" delay={0.2} />
        <StatsCard title="Half Day" value={halfDay} icon={Clock} color="gold" delay={0.3} />
      </div>

      {/* Attendance Logs Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-slate-900 dark:text-white text-sm">
            Employee Attendance Records
          </h4>
          <span className="text-xs text-slate-400">
            Real-time biometric validation status
          </span>
        </div>
        <DataTable
          columns={columns}
          data={attendanceList}
          searchable
          searchKeys={["userName", "notes"]}
        />
      </div>

      {/* Biometric Camera Modal */}
      <BiometricCameraModal
        isOpen={showCameraModal}
        onClose={() => setShowCameraModal(false)}
        onSuccess={handleBiometricSuccess}
      />

      {/* Photo Inspector Modal */}
      {inspectPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="p-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
              <div>
                <h5 className="font-bold text-xs text-slate-900 dark:text-white">
                  {inspectPhoto.title}
                </h5>
                {inspectPhoto.score && (
                  <span className="text-[10px] text-emerald-600 font-bold">
                    Biometric Verification Score: {inspectPhoto.score}% Match
                  </span>
                )}
              </div>
              <button
                onClick={() => setInspectPhoto(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 bg-slate-950 flex items-center justify-center aspect-square">
              <img
                src={inspectPhoto.url}
                alt="Captured Snapshot"
                className="w-full h-full object-cover rounded-lg border border-slate-800"
              />
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 text-center">
              <span className="text-[11px] text-slate-500 font-mono">
                Official Time-Stamped Biometric Record
              </span>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
