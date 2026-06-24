'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  BarChart3,
  BriefcaseBusiness,
  Building2,
  Eye,
  EyeOff,
  LineChart,
  Lock,
  Mail,
  Rocket,
  ShieldCheck,
  Users,
  Workflow
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/providers';

const stats = [
  { label: 'Businesses Empowered', value: '100+', icon: Building2 },
  { label: 'Active Users', value: '10K+', icon: Users },
  { label: 'System Uptime', value: '99.9%', icon: LineChart },
  { label: 'Enterprise Grade Security', value: 'Secure', icon: ShieldCheck }
];

const modules = [
  {
    title: 'Business Management',
    body: 'CRM, Sales, Leads, Clients & Projects',
    icon: ShieldCheck
  },
  {
    title: 'Workforce Management',
    body: 'HR, Attendance, Leaves & Payroll',
    icon: Users
  },
  {
    title: 'Analytics & Reports',
    body: 'Real-time Insights, KPIs & Dashboards',
    icon: BarChart3
  },
  {
    title: 'Automation & Integrations',
    body: 'Tasks, Workflows, APIs & More',
    icon: Workflow
  }
];

const securityNotes = ['Role-Based Access', 'Data Protection', 'Secure Cloud Infrastructure', 'Regular Backups'];

export default function Login() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [err, setErr] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setErr('');
    setSubmitting(true);
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (ex: any) {
      setErr(ex.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-y-auto bg-[#020b1f] text-white lg:h-screen lg:overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(19,91,188,.42),transparent_32%),radial-gradient(circle_at_84%_20%,rgba(245,158,11,.16),transparent_24%),linear-gradient(135deg,#020816_0%,#071b3b_48%,#020713_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-[48%] bg-[linear-gradient(180deg,transparent_0%,rgba(8,43,91,.58)_45%,rgba(2,8,22,.92)_100%)]" />
      <div className="absolute bottom-0 left-[38%] hidden h-[62%] w-[34%] opacity-55 lg:block">
        <div className="absolute bottom-0 left-4 h-[48%] w-14 rounded-t-lg bg-blue-950/80 shadow-[0_0_35px_rgba(59,130,246,.25)]" />
        <div className="absolute bottom-0 left-24 h-[66%] w-20 rounded-t-xl bg-slate-950/80 shadow-[0_0_45px_rgba(59,130,246,.28)]" />
        <div className="absolute bottom-0 left-52 h-[54%] w-16 rounded-t-xl bg-blue-950/80 shadow-[0_0_35px_rgba(59,130,246,.22)]" />
        <div className="absolute bottom-0 left-80 h-[78%] w-24 rounded-t-2xl bg-slate-950/85 shadow-[0_0_55px_rgba(59,130,246,.26)]" />
        <div className="absolute bottom-0 left-[26rem] h-[44%] w-20 rounded-t-xl bg-blue-950/75" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-64 opacity-50 [background-image:linear-gradient(rgba(59,130,246,.16)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,.16)_1px,transparent_1px)] [background-size:42px_42px] [transform:perspective(420px)_rotateX(62deg)] [transform-origin:bottom]" />

      <div className="relative z-10 grid min-h-screen gap-6 p-5 lg:h-screen lg:grid-cols-[1.45fr_.95fr] lg:p-8 xl:p-10">
        <section className="flex min-h-0 flex-col justify-between gap-6">
          <div>
            <div className="flex items-center gap-4">
              <div className="grid h-16 w-16 place-items-center overflow-hidden rounded-2xl border border-gold-400 bg-navy-950/45 p-1.5 shadow-2xl shadow-gold-500/10 md:h-20 md:w-20">
                <img src="/axienta-logo-transparent.png" alt="Axienta Business Consulting logo" className="h-full w-full object-contain" />
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight md:text-4xl">Axienta Business Consulting</h1>
                <p className="mt-2 text-base text-slate-200">
                  Business Growth <span className="text-gold-400">.</span> ERP <span className="text-gold-400">.</span> CRM <span className="text-gold-400">.</span> Digital Solutions
                </p>
              </div>
            </div>

            <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="mt-7 max-w-4xl xl:mt-9">
              <div className="inline-flex items-center gap-3 rounded-full border border-gold-500 bg-navy-950/70 px-4 py-2 text-xs font-black uppercase tracking-[.22em] text-gold-300 shadow-lg shadow-gold-500/10">
                <BriefcaseBusiness size={16} />
                Enterprise Business Operating System
              </div>
              <h2 className="mt-5 max-w-3xl text-4xl font-black leading-[1.05] tracking-tight md:text-6xl xl:text-7xl">
                One Platform. <br />
                Unlimited <span className="text-gold-400">Growth.</span>
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-100 xl:text-lg xl:leading-8">
                Axienta Business Consulting empowers organizations to streamline operations, boost productivity, and drive growth with intelligent automation and real-time insights.
              </p>
              <div className="mt-5 h-1 w-20 rounded-full bg-gold-400" />
            </motion.div>

            <div className="mt-6 grid max-w-4xl gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex items-start gap-3 border-white/10 xl:border-r xl:last:border-r-0">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-gold-500 bg-blue-950/70 text-gold-400">
                    <Icon size={22} />
                  </span>
                  <div>
                    <p className="text-2xl font-black text-gold-300">{value}</p>
                    <p className="text-sm leading-5 text-slate-100">{label}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 max-w-5xl xl:mt-8">
              <div className="flex items-center gap-4">
                <h3 className="text-xl font-bold text-white">Everything You Need. All in One Place.</h3>
                <span className="hidden h-px flex-1 bg-white/20 md:block" />
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {modules.map(({ title, body, icon: Icon }) => (
                  <div key={title} className="rounded-xl border border-white/10 bg-white/[.075] p-4 shadow-2xl shadow-blue-950/20 backdrop-blur-xl">
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-blue-900/70 text-gold-400">
                      <Icon size={21} />
                    </span>
                    <h4 className="mt-3 text-base font-black">{title}</h4>
                    <p className="mt-1 text-sm leading-6 text-slate-200">{body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex max-w-3xl items-center gap-4 border-t border-white/10 pt-4 text-slate-200">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-gold-400 bg-white/5 text-white">
              <ShieldCheck size={24} />
            </div>
            <p>Employee accounts are created and managed exclusively by Axienta Administrators.</p>
          </div>
        </section>

        <section className="flex items-center justify-center">
          <motion.form
            onSubmit={submit}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.08 }}
            className="w-full max-w-xl rounded-3xl border border-white/25 bg-blue-950/35 p-6 shadow-2xl shadow-black/30 backdrop-blur-2xl md:p-8 xl:p-9"
          >
            <div className="mx-auto grid h-24 w-24 place-items-center overflow-hidden rounded-full border border-gold-400 bg-navy-950/40 p-2 shadow-2xl shadow-gold-500/10 xl:h-28 xl:w-28">
              <img src="/axienta-logo-transparent.png" alt="Axienta logo" className="h-full w-full object-contain" />
            </div>

            <div className="mt-5 text-center">
              <h2 className="text-3xl font-black xl:text-4xl">
                Welcome <span className="text-gold-400">Back!</span>
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-200 xl:text-base xl:leading-7">
                Sign in to access your Axienta Business Consulting workspace and manage your business with ease.
              </p>
            </div>

            <div className="mt-6 space-y-4">
              <label className="block">
                <span className="text-sm font-bold text-white">Email Address</span>
                <span className="relative mt-2 block">
                  <Mail className="absolute left-4 top-3.5 text-slate-300" size={20} />
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    className="h-12 rounded-xl border-white/25 bg-navy-950/45 pl-12 text-base text-white placeholder:text-slate-300 hover:border-gold-400/70 xl:h-14"
                  />
                </span>
              </label>

              <label className="block">
                <span className="text-sm font-bold text-white">Password</span>
                <span className="relative mt-2 block">
                  <Lock className="absolute left-4 top-3.5 text-slate-300" size={20} />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    className="h-12 rounded-xl border-white/25 bg-navy-950/45 pl-12 pr-12 text-base text-white placeholder:text-slate-300 hover:border-gold-400/70 xl:h-14"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-4 top-3.5 text-slate-300 transition hover:text-gold-300"
                    onClick={() => setShowPassword((current) => !current)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </span>
              </label>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3 text-sm font-bold">
              <a className="text-gold-300 transition hover:text-gold-200" href="/forgot-password">
                Forgot Password?
              </a>
              <a className="text-cyan-300 transition hover:text-cyan-200" href="/client-portal">
                Client Portal
              </a>
            </div>

            {err && <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-600">{err}</p>}

            <Button type="submit" disabled={submitting} className="mt-5 h-12 w-full rounded-xl bg-gradient-to-r from-gold-400 to-yellow-500 text-base font-black text-navy-950 shadow-xl shadow-gold-500/20 hover:from-gold-300 hover:to-yellow-400 xl:h-14">
              <Rocket size={19} />
              {submitting ? 'Signing In...' : 'Access Dashboard'}
            </Button>

            <div className="mt-6 grid grid-cols-2 gap-3 text-xs text-slate-200 sm:grid-cols-4">
              {securityNotes.map((note) => (
                <div key={note} className="flex items-center gap-2">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-blue-800/70 text-gold-300">
                    <ShieldCheck size={16} />
                  </span>
                  <span>{note}</span>
                </div>
              ))}
            </div>
          </motion.form>
        </section>
      </div>
    </main>
  );
}
