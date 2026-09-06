"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, Target, CheckSquare, BarChart3,
  Calendar, Bell, Settings, Phone, UserCog, Briefcase,
  Map, ChevronLeft, ChevronRight, LogOut, Shield, User,
  Menu, X, FileSignature, Globe, Lock
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { ROLE_LABELS } from "@/types";
import { Avatar } from "@/components/ui/avatar";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  permission: string;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, permission: "dashboard" },
  { label: "Leads", href: "/leads", icon: Target, permission: "leads" },
  { label: "CRM Pipeline", href: "/crm", icon: Briefcase, permission: "crm" },
  { label: "Tasks", href: "/tasks", icon: CheckSquare, permission: "tasks" },
  { label: "Employees", href: "/employees", icon: Users, permission: "employees" },
  { label: "Data Scraper", href: "/scraper", icon: Map, permission: "scraper" },
  { label: "Calling Panel", href: "/calling", icon: Phone, permission: "calling" },
  { label: "Operations", href: "/operations", icon: Briefcase, permission: "operations" },
  { label: "Client Portal", href: "/client-portal", icon: Globe, permission: "client_portal" },
  { label: "HR Module", href: "/hr", icon: UserCog, permission: "hr" },
  { label: "Letters", href: "/letters", icon: FileSignature, permission: "letters" },
  { label: "Attendance", href: "/attendance", icon: Calendar, permission: "attendance" },
  { label: "Reports", href: "/reports", icon: BarChart3, permission: "reports" },
  { label: "Notifications", href: "/notifications", icon: Bell, permission: "notifications" },
  { label: "Settings", href: "/settings", icon: Settings, permission: "settings" },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout, hasPermission, unreadCount, isCheckedInToday } = useAuth();

  const filteredNav = navItems.filter((item) => hasPermission(item.permission));
  // Guarantee navigation is never empty for logged-in users
  const displayNav = filteredNav.length > 0 ? filteredNav : navItems;

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
        <div className="w-10 h-10 rounded-xl bg-[#07111f] border border-[#D4A843]/60 p-1 flex items-center justify-center flex-shrink-0 shadow-lg shadow-black/30">
          <img src="/axienta-logo-transparent.png" alt="Axienta logo" className="h-full w-full object-contain" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="overflow-hidden whitespace-nowrap"
            >
              <h1 className="text-lg font-bold text-white leading-tight">Axenta</h1>
              <p className="text-[10px] text-slate-400 leading-tight">Business Consulting</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {displayNav.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          const isLocked = !isCheckedInToday && item.href !== "/attendance";

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative",
                isActive
                  ? "bg-[#D4A843] text-white shadow-lg shadow-[#D4A843]/30"
                  : isLocked
                  ? "text-slate-400/80 hover:bg-white/5 hover:text-slate-300"
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon className={cn("w-5 h-5 flex-shrink-0", isActive && "animate-pulse")} />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="overflow-hidden whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>

              {/* Attendance Check-in Prompt Badge */}
              {!isCheckedInToday && item.href === "/attendance" && !collapsed && (
                <span className="ml-auto text-[9px] bg-gradient-to-r from-amber-400 to-[#D4A843] text-slate-950 font-black px-1.5 py-0.5 rounded uppercase tracking-tight animate-pulse">
                  Check In
                </span>
              )}

              {/* Workstation Lock Indicator Badge */}
              {isLocked && !collapsed && (
                <span className="ml-auto text-[9px] bg-amber-500/15 text-amber-300/90 border border-amber-500/30 px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5">
                  <Lock className="w-2.5 h-2.5" />
                </span>
              )}

              {item.label === "Notifications" && unreadCount > 0 && (
                <span className={cn(
                  "bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center",
                  collapsed ? "absolute -top-1 -right-1 w-4 h-4" : "ml-auto w-5 h-5"
                )}>
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap flex items-center gap-1">
                  <span>{item.label}</span>
                  {isLocked && <Lock className="w-3 h-3 text-amber-400" />}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Quick Launch Client Portal */}
      <div className="px-3 pb-2">
        <Link
          href="/portal"
          target="_blank"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-gradient-to-r from-[#D4A843]/20 to-[#D4A843]/10 border border-[#D4A843]/30 hover:bg-[#D4A843]/30 transition-all text-xs font-bold text-[#E8C976]"
          title="Open Client Portal in New Window"
        >
          <Globe className="w-4 h-4 text-[#D4A843] flex-shrink-0 animate-pulse" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="truncate font-semibold"
              >
                Launch Client View ↗
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* User Profile Section */}
      <div className="border-t border-white/10 p-3">
        <Link
          href="/profile"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/10 transition-all duration-200 group"
        >
          <Avatar name={user?.displayName || "User"} size="sm" />
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden flex-1 min-w-0"
              >
                <p className="text-sm font-medium text-white truncate">{user?.displayName}</p>
                <p className="text-[10px] text-slate-400 truncate">{user ? (ROLE_LABELS[user.role] || user.role || "Executive") : ""}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </Link>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition-all duration-200 w-full mt-1"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm font-medium"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-[#0F2557] text-white shadow-lg"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="lg:hidden fixed left-0 top-0 bottom-0 w-[270px] bg-gradient-to-b from-[#0F2557] to-[#091A3F] z-50 overflow-hidden"
          >
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 text-white/70 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 bg-gradient-to-b from-[#0F2557] to-[#091A3F] z-30 overflow-hidden"
      >
        <SidebarContent />
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute top-5 -right-3 w-6 h-6 bg-[#D4A843] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </motion.aside>

      {/* Spacer for desktop */}
      <div className={cn("hidden lg:block flex-shrink-0 transition-all duration-300", collapsed ? "w-[72px]" : "w-[260px]")} />
    </>
  );
}
