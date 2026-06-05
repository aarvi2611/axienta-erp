"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Settings, Shield, Users, Bell, Palette, Globe,
  Lock, Database, Key, Save, ChevronRight
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { ROLE_LABELS, ROLE_PERMISSIONS, UserRole } from "@/types";

export default function SettingsPage() {
  const { user, hasPermission, darkMode, toggleDarkMode } = useAuth();
  const [activeSection, setActiveSection] = useState("general");

  const sections = [
    { key: "general", label: "General", icon: Settings },
    { key: "security", label: "Security", icon: Lock },
    { key: "notifications", label: "Notifications", icon: Bell },
    { key: "appearance", label: "Appearance", icon: Palette },
    ...(hasPermission("manage_roles") ? [{ key: "roles", label: "Role Permissions", icon: Shield }] : []),
  ];

  return (
    <DashboardLayout>
      <PageHeader title="Settings" description="Manage application settings" icon={Settings} />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="space-y-1">
          {sections.map(section => (
            <button
              key={section.key}
              onClick={() => setActiveSection(section.key)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                activeSection === section.key
                  ? "bg-[#0F2557] text-white shadow-md"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <section.icon className="w-4 h-4" />
              {section.label}
              <ChevronRight className="w-4 h-4 ml-auto" />
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {activeSection === "general" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card>
                <CardHeader><CardTitle>General Settings</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Company Name</label>
                    <Input value="Axenta Business Consulting" disabled />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Company Email</label>
                    <Input value="info@axenta.com" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Company Phone</label>
                    <Input value="+91-1234567890" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Address</label>
                    <Input value="Business Tower, Mumbai, Maharashtra, India" />
                  </div>
                  <Button><Save className="w-4 h-4 mr-1" /> Save Changes</Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeSection === "security" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card>
                <CardHeader><CardTitle>Security Settings</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
                    <h4 className="font-medium dark:text-white mb-1">Change Password</h4>
                    <p className="text-xs text-slate-500 mb-3">Update your account password</p>
                    <div className="space-y-3 max-w-md">
                      <Input type="password" placeholder="Current password" />
                      <Input type="password" placeholder="New password" />
                      <Input type="password" placeholder="Confirm new password" />
                      <Button size="sm"><Lock className="w-4 h-4 mr-1" /> Update Password</Button>
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
                    <h4 className="font-medium dark:text-white mb-1">Two-Factor Authentication</h4>
                    <p className="text-xs text-slate-500 mb-3">Add an extra layer of security</p>
                    <Button variant="outline" size="sm"><Key className="w-4 h-4 mr-1" /> Enable 2FA</Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeSection === "notifications" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card>
                <CardHeader><CardTitle>Notification Preferences</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: "Task Assignments", desc: "Get notified when tasks are assigned" },
                    { label: "Lead Updates", desc: "Notifications for lead status changes" },
                    { label: "Follow-up Reminders", desc: "Reminders for scheduled follow-ups" },
                    { label: "Attendance Alerts", desc: "Check-in/check-out reminders" },
                    { label: "System Updates", desc: "Important system announcements" },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
                      <div>
                        <p className="text-sm font-medium dark:text-white">{item.label}</p>
                        <p className="text-xs text-slate-500">{item.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-9 h-5 bg-slate-200 peer-focus:ring-2 peer-focus:ring-[#0F2557] rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0F2557]" />
                      </label>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeSection === "appearance" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card>
                <CardHeader><CardTitle>Appearance</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
                    <div>
                      <p className="font-medium dark:text-white">Dark Mode</p>
                      <p className="text-xs text-slate-500">Switch between light and dark theme</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={darkMode} onChange={toggleDarkMode} className="sr-only peer" />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:ring-2 peer-focus:ring-[#0F2557] rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0F2557]" />
                    </label>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
                    <p className="font-medium dark:text-white mb-3">Brand Colors</p>
                    <div className="flex gap-3">
                      <div className="text-center">
                        <div className="w-12 h-12 rounded-lg bg-[#0F2557] shadow-md" />
                        <p className="text-[10px] text-slate-400 mt-1">Primary</p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 rounded-lg bg-[#D4A843] shadow-md" />
                        <p className="text-[10px] text-slate-400 mt-1">Accent</p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 rounded-lg bg-white border shadow-md" />
                        <p className="text-[10px] text-slate-400 mt-1">White</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeSection === "roles" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card>
                <CardHeader><CardTitle>Role Permission Manager</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(Object.keys(ROLE_PERMISSIONS) as UserRole[]).map(role => (
                      <div key={role} className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium dark:text-white">{ROLE_LABELS[role]}</h4>
                          <Badge variant="secondary">{ROLE_PERMISSIONS[role].length} permissions</Badge>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {ROLE_PERMISSIONS[role].map(perm => (
                            <Badge key={perm} variant="outline" className="text-[10px]">{perm}</Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
