"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Bell, CheckSquare, Target, Calendar, MessageSquare,
  Clock, CheckCircle, Trash2, Check, Filter
} from "lucide-react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/config/firebase";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Notification } from "@/types";
import { formatDateTime } from "@/lib/utils";

const demoNotifications: Notification[] = [
  { id: "1", userId: "u1", title: "New Task Assigned", message: "Complete quarterly sales report by tomorrow", type: "task", isRead: false, link: "/tasks", createdAt: new Date().toISOString() },
  { id: "2", userId: "u1", title: "Lead Assigned", message: 'You have been assigned "Tech Solutions Pvt Ltd"', type: "lead", isRead: false, link: "/leads", createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: "3", userId: "u1", title: "Follow-up Reminder", message: "Follow up with Digital Corp is due today", type: "reminder", isRead: false, link: "/leads", createdAt: new Date(Date.now() - 7200000).toISOString() },
  { id: "4", userId: "u1", title: "Work Approved", message: "Your report has been approved by CEO", type: "approval", isRead: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: "5", userId: "u1", title: "New Message", message: "Rahul Sharma sent you a message", type: "message", isRead: true, createdAt: new Date(Date.now() - 172800000).toISOString() },
  { id: "6", userId: "u1", title: "Attendance Alert", message: "You haven't checked in today", type: "attendance", isRead: true, createdAt: new Date(Date.now() - 259200000).toISOString() },
  { id: "7", userId: "u1", title: "System Update", message: "New features have been added to the CRM module", type: "system", isRead: true, createdAt: new Date(Date.now() - 604800000).toISOString() },
];

const typeIcons: Record<string, React.ElementType> = {
  task: CheckSquare,
  lead: Target,
  reminder: Calendar,
  approval: CheckCircle,
  message: MessageSquare,
  attendance: Clock,
  system: Bell,
};

const typeColors: Record<string, string> = {
  task: "bg-blue-500",
  lead: "bg-emerald-500",
  reminder: "bg-amber-500",
  approval: "bg-purple-500",
  message: "bg-cyan-500",
  attendance: "bg-red-500",
  system: "bg-slate-500",
};

export default function NotificationsPage() {
  const { notifications: liveNotifs } = useAuth();
  const [notifications, setNotifications] = useState(
    liveNotifs.length > 0 ? liveNotifs : demoNotifications
  );
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? notifications :
    filter === "unread" ? notifications.filter(n => !n.isRead) :
    notifications.filter(n => n.type === filter);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    try { updateDoc(doc(db, "notifications", id), { isRead: true }); } catch {}
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Notifications"
        description={`You have ${unreadCount} unread notifications`}
        icon={Bell}
        actions={
          <Button variant="outline" size="sm" onClick={markAllRead}>
            <Check className="w-4 h-4 mr-1" /> Mark All Read
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { key: "all", label: "All" },
          { key: "unread", label: `Unread (${unreadCount})` },
          { key: "task", label: "Tasks" },
          { key: "lead", label: "Leads" },
          { key: "reminder", label: "Reminders" },
          { key: "approval", label: "Approvals" },
          { key: "message", label: "Messages" },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              filter === tab.key ? "bg-[#0F2557] text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notification List */}
      <div className="space-y-3 max-w-3xl">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No notifications</p>
          </div>
        ) : (
          filtered.map((notif, idx) => {
            const Icon = typeIcons[notif.type] || Bell;
            return (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className={`cursor-pointer transition-all hover:shadow-md ${
                  !notif.isRead ? "border-l-4 border-l-[#D4A843] bg-amber-50/30 dark:bg-amber-900/5" : ""
                }`}
                onClick={() => markAsRead(notif.id)}>
                  <CardContent className="p-4 flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${typeColors[notif.type]}`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className={`text-sm ${!notif.isRead ? "font-bold" : "font-medium"} text-slate-900 dark:text-white`}>
                            {notif.title}
                          </h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{notif.message}</p>
                        </div>
                        {!notif.isRead && <div className="w-2 h-2 rounded-full bg-[#D4A843] flex-shrink-0 mt-2" />}
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{formatDateTime(notif.createdAt)}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>
    </DashboardLayout>
  );
}
