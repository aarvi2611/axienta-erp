"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, CheckCircle, XCircle, LogIn, LogOut, Users } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/common/PageHeader";
import StatsCard from "@/components/common/StatsCard";
import DataTable from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { Attendance } from "@/types";

const today = new Date().toISOString().slice(0, 10);

const demoAttendance: Attendance[] = [
  { id: "1", userId: "u1", userName: "Arjun Malhotra", date: today, checkIn: "09:05", checkOut: "18:30", status: "present", hoursWorked: 9.42 },
  { id: "2", userId: "u2", userName: "Sunita Verma", date: today, checkIn: "09:00", checkOut: "18:00", status: "present", hoursWorked: 9 },
  { id: "3", userId: "u3", userName: "Rahul Sharma", date: today, checkIn: "09:15", checkOut: "", status: "present", hoursWorked: 0 },
  { id: "4", userId: "u4", userName: "Priya Patel", date: today, status: "absent" },
  { id: "5", userId: "u5", userName: "Amit Kumar", date: today, checkIn: "09:30", checkOut: "", status: "present", hoursWorked: 0 },
  { id: "6", userId: "u6", userName: "Sneha Gupta", date: today, checkIn: "10:00", checkOut: "14:00", status: "half_day", hoursWorked: 4 },
  { id: "7", userId: "u7", userName: "Vikram Singh", date: today, checkIn: "09:10", checkOut: "18:15", status: "present", hoursWorked: 9.08 },
  { id: "8", userId: "u8", userName: "Meena Reddy", date: today, status: "leave", notes: "Sick leave approved" },
];

export default function AttendancePage() {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState(demoAttendance);
  const [checkedIn, setCheckedIn] = useState(false);

  const present = attendance.filter(a => a.status === "present").length;
  const absent = attendance.filter(a => a.status === "absent").length;
  const onLeave = attendance.filter(a => a.status === "leave").length;
  const halfDay = attendance.filter(a => a.status === "half_day").length;

  const handleCheckIn = () => {
    setCheckedIn(true);
    // In production, save to Firestore
  };

  const handleCheckOut = () => {
    setCheckedIn(false);
    // In production, update Firestore
  };

  const columns = [
    {
      key: "userName", label: "Employee", sortable: true,
      render: (row: Attendance) => (
        <div className="flex items-center gap-2">
          <Avatar name={row.userName} size="sm" />
          <span className="font-medium dark:text-white">{row.userName}</span>
        </div>
      ),
    },
    {
      key: "checkIn", label: "Check In",
      render: (row: Attendance) => row.checkIn ? (
        <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
          <LogIn className="w-3 h-3" />{row.checkIn}
        </span>
      ) : <span className="text-xs text-slate-400">—</span>,
    },
    {
      key: "checkOut", label: "Check Out",
      render: (row: Attendance) => row.checkOut ? (
        <span className="text-xs text-blue-600 font-medium flex items-center gap-1">
          <LogOut className="w-3 h-3" />{row.checkOut}
        </span>
      ) : <span className="text-xs text-slate-400">—</span>,
    },
    {
      key: "hoursWorked", label: "Hours",
      render: (row: Attendance) => row.hoursWorked ? (
        <span className="text-xs font-medium">{row.hoursWorked.toFixed(1)}h</span>
      ) : <span className="text-xs text-slate-400">—</span>,
    },
    {
      key: "status", label: "Status",
      render: (row: Attendance) => {
        const variants: Record<string, any> = {
          present: "success", absent: "destructive", half_day: "warning", leave: "info"
        };
        const labels: Record<string, string> = {
          present: "Present", absent: "Absent", half_day: "Half Day", leave: "On Leave"
        };
        return <Badge variant={variants[row.status]}>{labels[row.status]}</Badge>;
      },
    },
    {
      key: "notes", label: "Notes",
      render: (row: Attendance) => <span className="text-xs text-slate-500">{row.notes || ""}</span>,
    },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="Attendance"
        description={`Today's attendance overview — ${today}`}
        icon={Calendar}
      />

      {/* Quick Check In/Out */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <Card className="border-[#D4A843]/30 bg-gradient-to-r from-[#0F2557]/5 to-transparent">
          <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#0F2557] flex items-center justify-center">
                <Clock className="w-6 h-6 text-[#D4A843]" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">Quick Attendance</h3>
                <p className="text-sm text-slate-500">
                  {checkedIn ? "You are checked in. Don't forget to check out!" : "Mark your attendance for today"}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {!checkedIn ? (
                <Button onClick={handleCheckIn} className="bg-emerald-500 hover:bg-emerald-600">
                  <LogIn className="w-4 h-4 mr-1" /> Check In
                </Button>
              ) : (
                <Button onClick={handleCheckOut} variant="outline" className="border-red-300 text-red-500 hover:bg-red-50">
                  <LogOut className="w-4 h-4 mr-1" /> Check Out
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard title="Present" value={present} icon={CheckCircle} color="green" />
        <StatsCard title="Absent" value={absent} icon={XCircle} color="red" delay={0.1} />
        <StatsCard title="On Leave" value={onLeave} icon={Calendar} color="blue" delay={0.2} />
        <StatsCard title="Half Day" value={halfDay} icon={Clock} color="gold" delay={0.3} />
      </div>

      <DataTable columns={columns} data={attendance} searchable searchKeys={["userName"]} />
    </DashboardLayout>
  );
}
