"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users, Target, CheckSquare, TrendingUp, Phone, Calendar,
  BarChart3, DollarSign, Clock, AlertCircle, ArrowUpRight,
  Activity, Briefcase, FileText
} from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Area, AreaChart, Legend
} from "recharts";
import DashboardLayout from "@/components/layout/DashboardLayout";
import StatsCard from "@/components/common/StatsCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { getGreeting, formatDate } from "@/lib/utils";

// Demo data
const revenueData = [
  { month: "Jan", revenue: 42000, leads: 120 },
  { month: "Feb", revenue: 55000, leads: 150 },
  { month: "Mar", revenue: 48000, leads: 135 },
  { month: "Apr", revenue: 61000, leads: 180 },
  { month: "May", revenue: 53000, leads: 160 },
  { month: "Jun", revenue: 72000, leads: 210 },
  { month: "Jul", revenue: 68000, leads: 195 },
];

const leadPipelineData = [
  { name: "New", value: 45, color: "#3B82F6" },
  { name: "Contacted", value: 32, color: "#8B5CF6" },
  { name: "Follow-Up", value: 28, color: "#F59E0B" },
  { name: "Interested", value: 18, color: "#10B981" },
  { name: "Confirmed", value: 12, color: "#06B6D4" },
  { name: "Converted", value: 8, color: "#22C55E" },
];

const teamPerformance = [
  { name: "Sales", completed: 85, target: 100 },
  { name: "Calling", completed: 72, target: 100 },
  { name: "Operations", completed: 93, target: 100 },
  { name: "Data Team", completed: 68, target: 100 },
];

const recentActivities = [
  { id: 1, user: "Rahul Sharma", action: "Converted lead", target: "Tech Solutions Pvt Ltd", time: "2 min ago", type: "success" },
  { id: 2, user: "Priya Patel", action: "Added new lead", target: "CloudNine Industries", time: "15 min ago", type: "info" },
  { id: 3, user: "Amit Kumar", action: "Completed task", target: "Client Onboarding Report", time: "1 hr ago", type: "success" },
  { id: 4, user: "Sneha Gupta", action: "Follow-up scheduled", target: "Digital Corp", time: "2 hr ago", type: "warning" },
  { id: 5, user: "Vikram Singh", action: "Uploaded 150 leads", target: "Google Maps Scrape", time: "3 hr ago", type: "info" },
];

const upcomingTasks = [
  { id: 1, title: "Review quarterly report", priority: "high", deadline: "Today", assignee: "You" },
  { id: 2, title: "Client meeting - ABC Corp", priority: "urgent", deadline: "Today", assignee: "You" },
  { id: 3, title: "Follow-up with 12 leads", priority: "medium", deadline: "Tomorrow", assignee: "Sales Team" },
  { id: 4, title: "Data validation batch #45", priority: "low", deadline: "This week", assignee: "Data Team" },
];

const weeklyAttendance = [
  { day: "Mon", present: 45, absent: 3 },
  { day: "Tue", present: 47, absent: 1 },
  { day: "Wed", present: 44, absent: 4 },
  { day: "Thu", present: 46, absent: 2 },
  { day: "Fri", present: 43, absent: 5 },
];

export default function DashboardPage() {
  const { user, hasPermission } = useAuth();
  const isManager = hasPermission("view_analytics");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-[#0F2557] to-[#1A3A7A] rounded-2xl p-6 lg:p-8 text-white relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4A843]/10 rounded-full blur-3xl -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-1/2 w-48 h-48 bg-[#D4A843]/5 rounded-full blur-2xl" />
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold">
                  {getGreeting()}, {user?.displayName?.split(" ")[0]}! 👋
                </h1>
                <p className="text-slate-300 mt-1 text-sm lg:text-base">
                  Here&apos;s what&apos;s happening at Axenta today
                </p>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                  <p className="text-slate-300 text-xs">Today&apos;s Date</p>
                  <p className="font-semibold">{formatDate(new Date().toISOString())}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                  <p className="text-slate-300 text-xs">Employee ID</p>
                  <p className="font-semibold text-[#D4A843]">{user?.employeeId || "AXN-0001"}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Total Employees" value="48" change={8.2} icon={Users} color="blue" delay={0} />
          <StatsCard title="Active Leads" value="285" change={12.5} icon={Target} color="gold" delay={0.1} />
          <StatsCard title="Tasks Completed" value="156" change={5.3} icon={CheckSquare} color="green" delay={0.2} />
          <StatsCard title="Revenue (MTD)" value="₹7.2L" change={15.8} icon={DollarSign} color="purple" delay={0.3} />
        </div>

        {isManager && (
          <>
            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Revenue Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="lg:col-span-2"
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-[#D4A843]" />
                        Revenue & Lead Analytics
                      </CardTitle>
                      <Badge variant="gold">This Year</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={revenueData}>
                        <defs>
                          <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0F2557" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#0F2557" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="leadsGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#D4A843" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#D4A843" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                        <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} />
                        <YAxis stroke="#94A3B8" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #E2E8F0",
                            borderRadius: "8px",
                            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                          }}
                        />
                        <Legend />
                        <Area type="monotone" dataKey="revenue" stroke="#0F2557" fill="url(#revenueGrad)" strokeWidth={2} name="Revenue (₹)" />
                        <Area type="monotone" dataKey="leads" stroke="#D4A843" fill="url(#leadsGrad)" strokeWidth={2} name="Leads" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Lead Pipeline */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-[#D4A843]" />
                      Lead Pipeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={leadPipelineData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {leadPipelineData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {leadPipelineData.map((item) => (
                        <div key={item.name} className="flex items-center gap-2 text-xs">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-slate-600 dark:text-slate-400">{item.name}</span>
                          <span className="font-semibold ml-auto dark:text-white">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Team Performance & Attendance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Team Performance */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-[#D4A843]" />
                      Team Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {teamPerformance.map((team) => (
                      <div key={team.name}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{team.name}</span>
                          <span className="text-sm font-bold text-[#0F2557] dark:text-[#D4A843]">{team.completed}%</span>
                        </div>
                        <Progress value={team.completed} color={team.completed > 80 ? "bg-emerald-500" : team.completed > 60 ? "bg-[#D4A843]" : "bg-red-500"} />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Weekly Attendance */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-[#D4A843]" />
                      Weekly Attendance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={weeklyAttendance}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                        <XAxis dataKey="day" stroke="#94A3B8" fontSize={12} />
                        <YAxis stroke="#94A3B8" fontSize={12} />
                        <Tooltip />
                        <Bar dataKey="present" fill="#0F2557" radius={[4, 4, 0, 0]} name="Present" />
                        <Bar dataKey="absent" fill="#EF4444" radius={[4, 4, 0, 0]} name="Absent" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </>
        )}

        {/* Recent Activity & Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#D4A843]" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3">
                      <Avatar name={activity.user} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm dark:text-slate-200">
                          <span className="font-medium">{activity.user}</span>{" "}
                          <span className="text-slate-500 dark:text-slate-400">{activity.action}</span>{" "}
                          <span className="font-medium text-[#0F2557] dark:text-[#D4A843]">{activity.target}</span>
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Upcoming Tasks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-[#D4A843]" />
                  Upcoming Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/30 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
                    >
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        task.priority === "urgent" ? "bg-red-500" :
                        task.priority === "high" ? "bg-orange-500" :
                        task.priority === "medium" ? "bg-amber-500" : "bg-emerald-500"
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{task.title}</p>
                        <p className="text-xs text-slate-400">{task.assignee}</p>
                      </div>
                      <Badge variant={
                        task.priority === "urgent" ? "destructive" :
                        task.priority === "high" ? "warning" : "secondary"
                      }>
                        {task.deadline}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
