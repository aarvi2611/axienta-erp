"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Shield, Lock, Mail, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.replace("/dashboard");
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.replace("/dashboard");
    } catch (err: any) {
      if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        setError("Invalid email or password. Please check your credentials.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many failed attempts. Please wait a moment or reset your password.");
      } else {
        setError(err.message || "Login failed. Please check your credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0F2557] via-[#1A3A7A] to-[#091A3F] relative overflow-hidden">
        <div className="absolute inset-0">
          {/* Decorative circles */}
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-[#D4A843]/10 blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-[#D4A843]/5 blur-3xl" />
          <div className="absolute top-1/2 left-1/3 w-32 h-32 rounded-full border border-white/5" />
          <div className="absolute top-1/3 right-1/4 w-48 h-48 rounded-full border border-white/5" />
        </div>
        <div className="relative z-10 flex flex-col justify-center items-center p-12 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="w-24 h-24 rounded-3xl bg-[#07111f] border border-[#D4A843]/60 p-2.5 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-[#D4A843]/20">
              <img src="/axienta-logo-transparent.png" alt="Axienta logo" className="h-full w-full object-contain" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-3">Axenta</h1>
            <p className="text-xl text-[#D4A843] font-medium mb-6">Business Consulting</p>
            <p className="text-slate-300 text-lg max-w-md leading-relaxed">
              Enterprise Resource Planning & Customer Relationship Management Platform
            </p>
            <div className="flex items-center gap-8 mt-12">
              <div className="text-center">
                <p className="text-3xl font-bold text-[#D4A843]">500+</p>
                <p className="text-xs text-slate-400 mt-1">Clients Served</p>
              </div>
              <div className="w-px h-12 bg-white/10" />
              <div className="text-center">
                <p className="text-3xl font-bold text-[#D4A843]">98%</p>
                <p className="text-xs text-slate-400 mt-1">Success Rate</p>
              </div>
              <div className="w-px h-12 bg-white/10" />
              <div className="text-center">
                <p className="text-3xl font-bold text-[#D4A843]">24/7</p>
                <p className="text-xs text-slate-400 mt-1">Support</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-900">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-[#07111f] border border-[#D4A843]/60 p-1.5 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#0F2557]/20">
              <img src="/axienta-logo-transparent.png" alt="Axienta logo" className="h-full w-full object-contain" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Axenta Business Consulting</h1>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome Back</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Sign in to your ERP dashboard</p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm p-3 rounded-lg mb-4 border border-red-200 dark:border-red-800"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <input type="checkbox" className="rounded border-slate-300" />
                  Remember me
                </label>
                <Link href="/forgot-password" className="text-sm text-[#0F2557] dark:text-[#D4A843] hover:underline font-medium">
                  Forgot Password?
                </Link>
              </div>

              <Button type="submit" className="w-full h-12 bg-[#0F2557] hover:bg-[#1A3A7A] text-white font-bold" disabled={loading}>
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    Sign In to ERP Console <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 text-center space-y-2">
              <Link
                href="/portal/login"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0F2557] dark:text-[#D4A843] hover:underline"
              >
                Are you a Client? Access Client Portal Hub ↗
              </Link>
              <p className="text-[11px] text-slate-400">
                Staff accounts are managed by Axenta ERP administrators.
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-slate-400 mt-6">
            © {new Date().getFullYear()} Axenta Business Consulting. All rights reserved.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
