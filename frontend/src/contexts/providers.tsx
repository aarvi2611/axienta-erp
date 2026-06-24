"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getIdTokenResult, onIdTokenChanged, sendPasswordResetEmail, signInWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

type Role = 'CEO' | 'Admin' | 'Head Manager' | 'Team Manager' | 'Sales Executive' | 'Calling Executive' | 'Data Scraper' | 'Operations Team' | 'HR';

export interface Profile {
  uid: string;
  employeeId: string;
  name: string;
  email: string;
  role: Role;
  department: string;
  status: 'active' | 'inactive';
  avatar?: string;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
}

type AuthCtx = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  reset: (email: string) => Promise<void>;
  updateProfileData: (data: Partial<Profile>) => Promise<void>;
  demoLogin: (role?: Role) => void;
};

const AuthContext = createContext<AuthCtx | null>(null);
const queryClient = new QueryClient();
const DEMO_PROFILE_STORAGE_KEY = 'Axienta-demo-profile';

const roleMap: Record<string, Role> = {
  ceo: 'CEO',
  admin: 'Admin',
  head_manager: 'Head Manager',
  team_manager: 'Team Manager',
  sales_executive: 'Sales Executive',
  calling_executive: 'Calling Executive',
  data_scraper: 'Data Scraper',
  operations: 'Operations Team',
  hr: 'HR'
};

function coerceRole(role: unknown): Role {
  if (typeof role === 'string') {
    if ((Object.values(roleMap) as string[]).includes(role)) return role as Role;
    if (role in roleMap) return roleMap[role];
  }
  return 'CEO';
}

async function loadProfile(user: User): Promise<Profile> {
  const ref = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);
  const fallbackRole = coerceRole((await getIdTokenResult(user)).claims.role);
  const data = snap.exists() ? snap.data() : {};

  return {
    uid: user.uid,
    employeeId: typeof data.employeeId === 'string' ? data.employeeId : '',
    name: typeof data.displayName === 'string' ? data.displayName : user.displayName || user.email || 'User',
    email: typeof data.email === 'string' ? data.email : user.email || '',
    role: coerceRole(data.role || fallbackRole),
    department: typeof data.department === 'string' ? data.department : '',
    status: data.isActive === false ? 'inactive' : 'active',
    avatar: typeof data.avatar === 'string' ? data.avatar : '',
    phone: typeof data.phone === 'string' ? data.phone : '',
    createdAt: typeof data.createdAt === 'string' ? data.createdAt : undefined,
    updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : undefined
  };
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const unsubscribe = onIdTokenChanged(auth, async (currentUser) => {
      if (!mounted) return;

      setUser(currentUser);

      if (currentUser) {
        try {
          const nextProfile = await loadProfile(currentUser);
          if (mounted) setProfile(nextProfile);
        } catch (error) {
          console.error('Failed to load profile', error);
          if (mounted) setProfile(null);
        }
      } else {
        const demo = typeof window !== 'undefined' ? localStorage.getItem(DEMO_PROFILE_STORAGE_KEY) : null;
        if (demo) {
          try {
            setProfile(JSON.parse(demo));
          } catch {
            setProfile(null);
          }
        } else {
          setProfile(null);
        }
      }

      if (mounted) setLoading(false);
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const value = useMemo<AuthCtx>(() => ({
    user,
    profile,
    loading,
    login: async (email, password) => {
      await signInWithEmailAndPassword(auth, email, password);
    },
    logout: async () => {
      localStorage.removeItem(DEMO_PROFILE_STORAGE_KEY);
      await signOut(auth);
      setProfile(null);
    },
    reset: (email) => sendPasswordResetEmail(auth, email),
    updateProfileData: async (data) => {
      if (!profile) return;
      const next = { ...profile, ...data };
      setProfile(next);
      if (user) {
        await updateDoc(doc(db, 'users', user.uid), data);
      } else {
        localStorage.setItem(DEMO_PROFILE_STORAGE_KEY, JSON.stringify(next));
      }
    },
    demoLogin: (role = 'CEO') => {
      const next: Profile = {
        uid: `demo-${role.toLowerCase()}`,
        employeeId: 'DEMO-000',
        name: role,
        email: `${role.toLowerCase()}@demo.local`,
        role,
        department: 'Demo',
        status: 'active'
      };
      localStorage.setItem(DEMO_PROFILE_STORAGE_KEY, JSON.stringify(next));
      setProfile(next);
      setUser(null);
    }
  }), [user, profile, loading]);

  return <QueryClientProvider client={queryClient}><AuthContext.Provider value={value}>{children}</AuthContext.Provider></QueryClientProvider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within Providers');
  }
  return ctx;
}
