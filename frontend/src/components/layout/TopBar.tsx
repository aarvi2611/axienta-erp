"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Bell, Moon, Sun, ChevronDown, User, Settings, LogOut, Globe
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ROLE_LABELS } from "@/types";
import { formatDateTime } from "@/lib/utils";
import Link from "next/link";

export default function TopBar() {
  const { user, logout, notifications, unreadCount, darkMode, toggleDarkMode } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between h-16 px-4 lg:px-8">
        {/* Left - Search & Brand */}
        <div className="flex items-center gap-3 sm:gap-4 flex-1">
          {/* Mobile brand indicator */}
          <Link href="/dashboard" className="lg:hidden flex items-center gap-2 mr-1 ml-9">
            <div className="h-8 w-8 rounded-xl bg-[#07111f] border border-[#D4A843]/60 p-1 flex items-center justify-center flex-shrink-0 shadow-sm">
              <img src="/axienta-logo-transparent.png" alt="Axienta logo" className="h-full w-full object-contain" />
            </div>
            <span className="font-bold text-xs sm:text-sm text-[#0F2557] dark:text-white">Axenta</span>
          </Link>

          <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-2 w-full max-w-md transition-all duration-200 focus-within:ring-2 focus-within:ring-[#0F2557]">
            <Search className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search leads, tasks, employees..."
              className="bg-transparent text-sm outline-none w-full dark:text-slate-200 placeholder:text-slate-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            className="sm:hidden p-2 text-slate-500 hover:text-slate-700"
            onClick={() => setSearchOpen(!searchOpen)}
          >
            <Search className="w-5 h-5" />
          </button>
        </div>

        {/* Right - Actions */}
        <div className="flex items-center gap-2">
          {/* Client Portal Quick Launcher */}
          <Link
            href="/portal"
            target="_blank"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors"
            title="Open Live Client Portal in New Window"
          >
            <Globe className="w-3.5 h-3.5 text-[#D4A843]" />
            <span>Client Portal ↗</span>
          </Link>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 top-12 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50"
                >
                  <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <h3 className="font-semibold dark:text-white">Notifications</h3>
                    <Badge variant="info">{unreadCount} new</Badge>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-slate-400">
                        <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No notifications yet</p>
                      </div>
                    ) : (
                      notifications.slice(0, 5).map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-3 border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors ${
                            !notif.isRead ? "bg-blue-50/50 dark:bg-blue-900/10" : ""
                          }`}
                        >
                          <p className="text-sm font-medium dark:text-white">{notif.title}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{notif.message}</p>
                          <p className="text-[10px] text-slate-400 mt-1">{formatDateTime(notif.createdAt)}</p>
                        </div>
                      ))
                    )}
                  </div>
                  <Link
                    href="/notifications"
                    onClick={() => setNotifOpen(false)}
                    className="block p-3 text-center text-sm text-[#0F2557] dark:text-[#D4A843] font-medium hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    View All Notifications
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Avatar name={user?.displayName || "User"} size="sm" />
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{user?.displayName}</p>
                <p className="text-[10px] text-slate-400">{user ? (ROLE_LABELS[user.role] || user.role || "Executive") : ""}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 hidden md:block" />
            </button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 top-12 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50"
                >
                  <div className="p-3 border-b border-slate-200 dark:border-slate-700">
                    <p className="font-medium dark:text-white">{user?.displayName}</p>
                    <p className="text-xs text-slate-400">{user?.email}</p>
                    <Badge variant="gold" className="mt-1">{user ? (ROLE_LABELS[user.role] || user.role || "Executive") : ""}</Badge>
                  </div>
                  <div className="py-1">
                    <Link
                      href="/profile"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                    >
                      <User className="w-4 h-4" /> My Profile
                    </Link>
                    <Link
                      href="/settings"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                    >
                      <Settings className="w-4 h-4" /> Settings
                    </Link>
                    <button
                      onClick={logout}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 w-full"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="sm:hidden border-t border-slate-200 dark:border-slate-700 overflow-hidden"
          >
            <div className="p-3">
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-2">
                <Search className="w-4 h-4 text-slate-400 mr-2" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="bg-transparent text-sm outline-none w-full dark:text-slate-200"
                  autoFocus
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
