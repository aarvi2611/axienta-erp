'use client';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, BadgeCheck, BriefcaseBusiness, CalendarCheck, CheckCircle2, Flame, LockKeyhole } from 'lucide-react';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';
import { useAuth } from '@/contexts/providers';
import { canAccess, roleHome } from '@/lib/roles';
import { useAttendance, useTasks, updateTaskStatus } from '@/hooks/useFirestoreData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

const workGateRoles = ['Sales Executive', 'Calling Executive', 'Data Scraper', 'Operations Team'] as const;

export function AppShell({children}:{children:React.ReactNode}){
 const [open,setOpen]=useState(false);
 const [employeeIdInput,setEmployeeIdInput]=useState('');
 const [employeeIdError,setEmployeeIdError]=useState('');
 const [acceptingTasks,setAcceptingTasks]=useState(false);
 const {profile,loading,updateProfileData}=useAuth();
 const {data:tasks}=useTasks();
 const {data:attendance}=useAttendance();
 const router=useRouter();
 const path=usePathname();

 useEffect(()=>{ if(!loading && !profile) router.replace('/login'); if(profile && !canAccess(profile.role,path)) router.replace(roleHome(profile.role)); },[profile,loading,path,router]);

 const today = new Date().toISOString().slice(0, 10);
 const todayRecord = useMemo(() => profile ? attendance.find((record:any) => record.userId === profile.uid && record.date === today) : undefined, [attendance, profile, today]);
 const assignedTasks = useMemo(() => profile ? tasks.filter((task:any) => task.assignedTo === profile.uid) : [], [tasks, profile]);
 const urgentTasks = assignedTasks.filter((task:any) => task.priority === 'Urgent' || task.priority === 'High');
 const completedTasks = assignedTasks.filter((task:any) => ['Completed','Closed','Approved'].includes(task.status));
 const pendingTasks = assignedTasks.filter((task:any) => ['Pending','Accepted','In Progress','Revision Requested','Submitted for Review'].includes(task.status));
 const employeeGateKey = profile ? `Axienta-employee-verified-${profile.uid}` : '';
 const taskGateKey = profile ? `Axienta-task-briefing-${profile.uid}-${today}` : '';
 const [employeeVerified,setEmployeeVerified]=useState(false);
 const [taskBriefingAccepted,setTaskBriefingAccepted]=useState(false);

 useEffect(()=>{
  if(!profile) return;
  setEmployeeIdInput(profile.employeeId || '');
  setEmployeeVerified(localStorage.getItem(employeeGateKey) === 'yes');
  setTaskBriefingAccepted(localStorage.getItem(taskGateKey) === 'yes');
 },[profile, employeeGateKey, taskGateKey]);

 const verifyEmployeeId = async () => {
  if(!profile) return;
  const entered = employeeIdInput.trim();
  if(!entered) {
   setEmployeeIdError('Please enter your employee ID.');
   return;
  }
  if(profile.employeeId && entered.toLowerCase() !== profile.employeeId.toLowerCase()) {
   setEmployeeIdError('Employee ID does not match your profile.');
   return;
  }
  if(!profile.employeeId) await updateProfileData({ employeeId: entered });
  localStorage.setItem(employeeGateKey, 'yes');
  setEmployeeVerified(true);
  setEmployeeIdError('');
 };

 const acceptTaskBriefing = async () => {
  if(!profile) return;
  setAcceptingTasks(true);
  try {
   const tasksToAccept = assignedTasks.filter((task:any) => task.status === 'Pending');
   await Promise.all(tasksToAccept.map((task:any) => updateTaskStatus(task.id, 'Accepted')));
   localStorage.setItem(taskGateKey, 'yes');
   setTaskBriefingAccepted(true);
  } finally {
   setAcceptingTasks(false);
  }
 };

 if(loading) return <div className="grid h-screen place-items-center bg-navy-900 text-white"><div className="rounded-3xl border border-white/10 bg-white/10 px-6 py-5 shadow-2xl backdrop-blur"><p className="text-sm font-semibold tracking-[.25em] text-gold-400">AXIENTA ERP</p><p className="mt-2 text-lg font-bold">Loading workspace...</p></div></div>;
 if(!profile) return null;

 const needsAttendanceGate = workGateRoles.includes(profile.role as any) && path !== '/attendance' && !todayRecord?.checkIn;
 const showTaskBriefing = !taskBriefingAccepted;
 const showEmployeeGate = taskBriefingAccepted && !employeeVerified;

 return <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-navy-900 dark:text-slate-100">
  <Sidebar open={open} onClose={()=>setOpen(false)}/>
  {open && <button aria-label="Close navigation" className="fixed inset-0 z-30 bg-navy-900/60 backdrop-blur-sm lg:hidden" onClick={()=>setOpen(false)}/>}
  <div className="min-w-0 lg:pl-72">
   <Topbar onMenu={()=>setOpen(true)}/>
   <main className="mx-auto w-full max-w-[1720px] p-4 md:p-6 xl:p-8">{children}</main>
  </div>

  {showTaskBriefing && (
   <div className="fixed inset-0 z-[70] grid place-items-center bg-navy-900/72 p-4 backdrop-blur-md">
    <Card className="w-full max-w-2xl border-white/70 bg-white p-0 shadow-2xl">
     <div className="rounded-t-2xl bg-gradient-to-r from-navy-900 via-navy-700 to-orange-500 p-5 text-white">
      <div className="flex items-center justify-between gap-4">
       <div>
        <p className="text-xs font-bold uppercase tracking-[.22em] text-gold-100">Daily Task Briefing</p>
        <h2 className="mt-1 text-2xl font-black">Welcome, {profile.name}</h2>
       </div>
       <BriefcaseBusiness className="h-10 w-10 text-gold-100" />
      </div>
     </div>
     <div className="p-5">
      <div className="grid gap-3 sm:grid-cols-4">
       <div className="rounded-2xl bg-blue-50 p-4"><p className="text-xs font-bold uppercase text-blue-700">Assigned</p><b className="text-3xl text-blue-900">{assignedTasks.length}</b></div>
       <div className="rounded-2xl bg-orange-50 p-4"><p className="text-xs font-bold uppercase text-orange-700">Urgent</p><b className="text-3xl text-orange-900">{urgentTasks.length}</b></div>
       <div className="rounded-2xl bg-emerald-50 p-4"><p className="text-xs font-bold uppercase text-emerald-700">Complete</p><b className="text-3xl text-emerald-900">{completedTasks.length}</b></div>
       <div className="rounded-2xl bg-slate-100 p-4"><p className="text-xs font-bold uppercase text-slate-700">Active</p><b className="text-3xl text-slate-900">{pendingTasks.length}</b></div>
      </div>
      <div className="mt-5 max-h-56 space-y-3 overflow-y-auto pr-1">
       {pendingTasks.slice(0, 5).map((task:any) => (
        <div key={task.id} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
         {task.priority === 'Urgent' || task.priority === 'High' ? <Flame className="mt-1 h-5 w-5 text-orange-500" /> : <CheckCircle2 className="mt-1 h-5 w-5 text-blue-600" />}
         <div className="min-w-0 flex-1">
          <p className="font-bold text-slate-900">{task.title}</p>
          <p className="text-xs text-slate-500">{task.priority} priority • {task.status} • Due {task.deadline || 'not set'}</p>
         </div>
        </div>
       ))}
       {pendingTasks.length === 0 && <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">No active tasks assigned right now.</p>}
      </div>
      <Button className="mt-5 w-full bg-orange-500 hover:bg-orange-600" onClick={acceptTaskBriefing} disabled={acceptingTasks}>
       {acceptingTasks ? 'Accepting...' : 'Accept Tasks & Continue'}
      </Button>
     </div>
    </Card>
   </div>
  )}

  {showEmployeeGate && (
   <div className="fixed inset-0 z-[70] grid place-items-center bg-navy-900/72 p-4 backdrop-blur-md">
    <Card className="w-full max-w-md border-white/70 bg-white shadow-2xl">
     <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gold-100 text-navy-900"><LockKeyhole /></div>
     <h2 className="mt-4 text-center text-2xl font-black text-navy-900">Employee Verification</h2>
     <p className="mt-2 text-center text-sm text-slate-500">Enter your employee ID to unlock the workspace.</p>
     <Input className="mt-5 text-center text-lg font-bold tracking-wider" value={employeeIdInput} onChange={(e)=>setEmployeeIdInput(e.target.value)} placeholder="Employee ID" />
     {employeeIdError && <p className="mt-3 text-center text-sm font-semibold text-red-600">{employeeIdError}</p>}
     <Button className="mt-5 w-full" onClick={verifyEmployeeId}><BadgeCheck size={18}/> Verify & Continue</Button>
    </Card>
   </div>
  )}

  {needsAttendanceGate && employeeVerified && taskBriefingAccepted && (
   <div className="fixed inset-0 z-[60] grid place-items-center bg-navy-900/72 p-4 backdrop-blur-md">
    <Card className="w-full max-w-lg border-orange-100 bg-white text-center shadow-2xl">
     <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-orange-100 text-orange-600"><AlertTriangle size={30}/></div>
     <h2 className="mt-4 text-2xl font-black text-navy-900">Attendance Required</h2>
     <p className="mt-2 text-sm text-slate-600">Please complete photo check-in before using employee modules today.</p>
     <Button className="mt-5 bg-orange-500 hover:bg-orange-600" onClick={()=>router.push('/attendance')}><CalendarCheck size={18}/> Go to Attendance</Button>
    </Card>
   </div>
  )}
 </div>
}
