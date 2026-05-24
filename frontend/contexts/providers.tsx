'use client';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getIdTokenResult, onIdTokenChanged, sendPasswordResetEmail, signInWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, initAnalytics } from '@/lib/firebase';
import {
  firebaseConfigFingerprint,
  hasPublicFirebaseConfig,
  missingPublicFirebaseEnvKeys
} from '@/lib/firebase-config';
import { employees } from '@/lib/demo-data';
import { Role, UserProfile } from '@/types';

type AuthCtx = { user: User|null; profile: UserProfile|null; loading:boolean; login:(email:string,password:string)=>Promise<void>; logout:()=>Promise<void>; reset:(email:string)=>Promise<void>; updateProfileData:(data:Partial<UserProfile>)=>Promise<void>; demoLogin:(role?:UserProfile['role'])=>void; };
const AuthContext = createContext<AuthCtx|null>(null); const queryClient = new QueryClient();
export const useAuth = () => { const v = useContext(AuthContext); if(!v) throw new Error('useAuth must be used inside Providers'); return v; };

const DEMO_PROFILE_STORAGE_KEY = 'Axienta-demo-profile';
const FIREBASE_CONFIG_STORAGE_KEY = 'Axienta-firebase-config';
const INACTIVITY_TIMEOUT_MS = 60 * 60 * 1000;
const ACTIVITY_EVENTS = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'] as const;
const supportedRoles: Role[] = ['CEO','Admin','Head Manager','Team Manager','Sales Executive','Calling Executive','Data Scraper','Operations Team','HR'];

function normalizeRole(role: unknown): Role {
  return supportedRoles.includes(role as Role) ? (role as Role) : 'Sales Executive';
}

function getFirebaseConfigError() {
  return `Missing Firebase public env vars in Vercel: ${missingPublicFirebaseEnvKeys.join(', ')}`;
}

async function syncFirebaseConfigFingerprint() {
  if (typeof window === 'undefined') return;

  const previousFingerprint = localStorage.getItem(FIREBASE_CONFIG_STORAGE_KEY);
  localStorage.setItem(FIREBASE_CONFIG_STORAGE_KEY, firebaseConfigFingerprint);

  if (previousFingerprint && previousFingerprint !== firebaseConfigFingerprint && auth.currentUser) {
    localStorage.removeItem(DEMO_PROFILE_STORAGE_KEY);
    await signOut(auth);
  }
}

async function ensureUserProfile(user: User) {
  const ref = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    const existingProfile = snap.data() as UserProfile;
    return { ...existingProfile, uid: existingProfile.uid || user.uid };
  }

  const tokenResult = await getIdTokenResult(user);
  const role = normalizeRole(tokenResult.claims.role);
  const profile: UserProfile = {
    uid: user.uid,
    employeeId: typeof tokenResult.claims.employeeId === 'string' ? tokenResult.claims.employeeId : '',
    name: user.displayName || user.email?.split('@')[0] || 'User',
    email: user.email || '',
    role,
    department: 'General',
    status: 'active',
    createdAt: new Date().toISOString()
  };

  await setDoc(ref, profile, { merge: true });
  return profile;
}

export function Providers({children}:{children:React.ReactNode}) {
 const [user,setUser]=useState<User|null>(null); const [profile,setProfile]=useState<UserProfile|null>(null); const [loading,setLoading]=useState(true);
 useEffect(()=>{
  let active = true;
  let unsub: () => void = () => {};

  const bootstrap = async () => {
    if (!hasPublicFirebaseConfig) {
      console.error(getFirebaseConfigError());
      const demo = localStorage.getItem(DEMO_PROFILE_STORAGE_KEY);
      if (active) {
        setProfile(demo ? JSON.parse(demo) : null);
        setLoading(false);
      }
      return;
    }

    initAnalytics();

    try {
      await syncFirebaseConfigFingerprint();
    } catch (error) {
      console.error('Failed to sync Firebase config fingerprint', error);
    }

    unsub = onIdTokenChanged(auth, async (u)=>{
      if (!active) return;

      setUser(u);

      try {
        if(u){
          const nextProfile = await ensureUserProfile(u);
          if (active) setProfile(nextProfile);
        } else {
          const demo=localStorage.getItem(DEMO_PROFILE_STORAGE_KEY);
          if (active) setProfile(demo?JSON.parse(demo):null);
        }
      } catch (error) {
        console.error('Failed to load Firebase user profile', error);
        if (active) setProfile(null);
      } finally {
        if (active) setLoading(false);
      }
    });
  };

  void bootstrap();

  return ()=>{
    active = false;
    unsub();
  };
 },[]);
 const value = useMemo<AuthCtx>(()=>({ user, profile, loading, login: async(e,p)=>{ if(!hasPublicFirebaseConfig) throw new Error(getFirebaseConfigError()); await signInWithEmailAndPassword(auth,e,p); }, logout: async()=>{ localStorage.removeItem(DEMO_PROFILE_STORAGE_KEY); setProfile(null); if(hasPublicFirebaseConfig) await signOut(auth); }, reset:(email)=>{ if(!hasPublicFirebaseConfig) return Promise.reject(new Error(getFirebaseConfigError())); return sendPasswordResetEmail(auth,email); }, updateProfileData: async(data)=>{ if(!profile) return; const next={...profile,...data}; setProfile(next); if(user && hasPublicFirebaseConfig) await updateDoc(doc(db,'users',user.uid), data); else localStorage.setItem(DEMO_PROFILE_STORAGE_KEY, JSON.stringify(next)); }, demoLogin:(role='CEO')=>{ const p={...employees.find(e=>e.role===role)!}; localStorage.setItem(DEMO_PROFILE_STORAGE_KEY,JSON.stringify(p)); setProfile(p); }}),[user,profile,loading]);
 useEffect(()=>{
  if(!profile || typeof window === 'undefined') return;

  let timeoutId: number | undefined;
  let lastActivityAt = Date.now();

  const logoutAfterInactivity = () => {
    void value.logout();
  };

  const scheduleLogout = () => {
    if (timeoutId) window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(logoutAfterInactivity, INACTIVITY_TIMEOUT_MS);
  };

  const markActivity = () => {
    lastActivityAt = Date.now();
    scheduleLogout();
  };

  const checkElapsedTime = () => {
    if (Date.now() - lastActivityAt >= INACTIVITY_TIMEOUT_MS) {
      logoutAfterInactivity();
      return;
    }
    scheduleLogout();
  };

  ACTIVITY_EVENTS.forEach((eventName) => window.addEventListener(eventName, markActivity, { passive: true }));
  window.addEventListener('focus', checkElapsedTime);
  document.addEventListener('visibilitychange', checkElapsedTime);
  scheduleLogout();

  return () => {
    if (timeoutId) window.clearTimeout(timeoutId);
    ACTIVITY_EVENTS.forEach((eventName) => window.removeEventListener(eventName, markActivity));
    window.removeEventListener('focus', checkElapsedTime);
    document.removeEventListener('visibilitychange', checkElapsedTime);
  };
 },[profile,value]);
 return <QueryClientProvider client={queryClient}><AuthContext.Provider value={value}>{children}</AuthContext.Provider></QueryClientProvider>;
}
