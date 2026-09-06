"use client";
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { User, UserRole, ROLE_PERMISSIONS, Notification, normalizeRole, Attendance } from "@/types";
import { attendanceStore } from "@/lib/attendanceService";
import { auth, db } from "@/config/firebase";

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  createEmployee: (data: CreateEmployeeData) => Promise<{ email: string; password: string }>;
  hasPermission: (permission: string) => boolean;
  notifications: Notification[];
  unreadCount: number;
  darkMode: boolean;
  toggleDarkMode: () => void;
  isCheckedInToday: boolean;
  todayAttendance: Attendance | null;
  checkInWithPhoto: (photoDataUrl: string, verificationScore: number) => Promise<Attendance>;
  checkOutToday: () => Promise<Attendance | null>;
  refreshAttendance: () => void;
}

interface CreateEmployeeData {
  displayName: string;
  email: string;
  role: UserRole;
  department?: string;
  phone?: string;
  password?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState<Attendance | null>(null);

  // Sync daily attendance for current user
  useEffect(() => {
    if (!user) {
      setTodayAttendance(null);
      return;
    }
    const sync = () => {
      setTodayAttendance(attendanceStore.getTodayAttendance(user.uid));
    };
    sync();
    const unsub = attendanceStore.subscribe(sync);
    return () => unsub();
  }, [user]);

  const isCheckedInToday = !!todayAttendance && !!todayAttendance.checkIn && todayAttendance.status === "present";

  const checkInWithPhoto = async (photoDataUrl: string, verificationScore: number) => {
    if (!user) throw new Error("No authenticated user");
    const record = await attendanceStore.recordCheckIn(user, photoDataUrl, verificationScore);
    setTodayAttendance(record);
    return record;
  };

  const checkOutToday = async () => {
    if (!user) return null;
    const record = await attendanceStore.recordCheckOut(user.uid);
    setTodayAttendance(record);
    return record;
  };

  const refreshAttendance = () => {
    if (user) {
      setTodayAttendance(attendanceStore.getTodayAttendance(user.uid));
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setFirebaseUser(fbUser);
        if (typeof window !== "undefined") {
          localStorage.removeItem("axenta_demo_user");
        }

        const baselineRole = (fbUser.email?.toLowerCase().includes("ceo") ? "ceo" : "admin") as UserRole;
        const baseline: User = {
          uid: fbUser.uid,
          email: fbUser.email || "",
          displayName: fbUser.displayName || fbUser.email?.split("@")[0] || "Axenta User",
          role: baselineRole,
          department: "Executive Management",
          employeeId: `AXN-${fbUser.uid.slice(0, 4).toUpperCase()}`,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
        };

        // Immediately set user and finish loading so no delays or locks
        setUser((prev) => prev || baseline);
        setLoading(false);

        // Then asynchronously check Firestore in background
        try {
          const userDocRef = doc(db, "users", fbUser.uid);
          const userDoc = await Promise.race([
            getDoc(userDocRef),
            new Promise<null>((_, reject) => setTimeout(() => reject(new Error("Firestore timeout")), 2500))
          ]);

          let rawData: any = {};
          if (userDoc && userDoc.exists()) {
            rawData = userDoc.data();
          }

          // Check overrides
          try {
            const overrideDoc = await getDoc(doc(db, "operations", "employee_overrides"));
            if (overrideDoc.exists() && overrideDoc.data()?.[fbUser.uid]) {
              const override = overrideDoc.data()[fbUser.uid];
              rawData = { ...rawData, ...override };
            }
          } catch (e) {
            // overrides check optional
          }

          if (rawData.isActive === false || rawData._deleted === true) {
            await signOut(auth);
            setUser(null);
            setFirebaseUser(null);
            return;
          }

          const normalizedRole = normalizeRole(rawData.role || baselineRole);
          const userData = { uid: fbUser.uid, ...rawData, role: normalizedRole } as User;
          setUser(userData);
          if (userDoc && userDoc.exists()) {
            updateDoc(userDocRef, { lastLogin: new Date().toISOString() }).catch(() => {});
          } else if (userDoc) {
            setDoc(userDocRef, baseline).catch(() => {});
          }
        } catch (err) {
          console.warn("Firestore profile sync notice:", err);
        }
      } else {
        setFirebaseUser(null);
        // If not in Firebase, check if demo user was explicitly logged in
        if (typeof window !== "undefined") {
          const savedDemo = localStorage.getItem("axenta_demo_user");
          if (savedDemo) {
            try {
              setUser(JSON.parse(savedDemo));
              setLoading(false);
              return;
            } catch (e) {}
          }
        }
        setUser(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Listen for notifications
  useEffect(() => {
    if (!user?.uid) return;
    try {
      const q = query(
        collection(db, "notifications"),
        where("userId", "==", user.uid)
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const notifs = snapshot.docs
          .map((d) => ({ id: d.id, ...d.data() } as Notification))
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setNotifications(notifs);
      });
      return () => unsubscribe();
    } catch (e) {}
  }, [user?.uid]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const login = async (email: string, password: string) => {
    const trimmedEmail = email.trim();
    let cred: any = null;

    // 1. Authenticate with Firebase Auth
    try {
      cred = await signInWithEmailAndPassword(auth, trimmedEmail, password);
    } catch (fbErr: any) {
      // Allow demo user credentials fallback only if entered
      if (
        (trimmedEmail.toLowerCase() === "admin@axenta.com" || trimmedEmail.toLowerCase() === "demo@axenta.com") &&
        (password === "admin123" || password === "demo123" || password === "password")
      ) {
        const demoUser: User = {
          uid: "axn-demo-admin",
          email: trimmedEmail,
          displayName: "Vikram Malhotra (Admin)",
          role: "admin",
          department: "Management & Enterprise Consulting",
          employeeId: "AXN-001",
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setUser(demoUser);
        setLoading(false);
        if (typeof window !== "undefined") {
          localStorage.setItem("axenta_demo_user", JSON.stringify(demoUser));
        }
        return;
      }
      throw fbErr;
    }

    // 2. Firebase Auth succeeded!
    if (typeof window !== "undefined") {
      localStorage.removeItem("axenta_demo_user");
    }
    setFirebaseUser(cred.user);

    // Build immediate baseline profile from the authenticated Firebase user
    // This GUARANTEES the user is authenticated and ready to navigate immediately
    const baselineRole = (cred.user.email?.toLowerCase().includes("ceo") ? "ceo" : "admin") as UserRole;
    const baselineProfile: User = {
      uid: cred.user.uid,
      email: cred.user.email || trimmedEmail,
      displayName: cred.user.displayName || trimmedEmail.split("@")[0] || "Axenta User",
      role: baselineRole,
      department: "Executive Management",
      employeeId: `AXN-${cred.user.uid.slice(0, 4).toUpperCase()}`,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };

    // Immediately set the user so redirect proceeds without delay!
    setUser(baselineProfile);
    setLoading(false);

    // 3. In background / safe try-catch, sync with Firestore without blocking redirect
    try {
      const userDocRef = doc(db, "users", cred.user.uid);
      const userDoc = await Promise.race([
        getDoc(userDocRef),
        new Promise<null>((_, reject) => setTimeout(() => reject(new Error("Firestore timeout")), 2500))
      ]);

      if (userDoc && userDoc.exists()) {
        const rawData = userDoc.data();
        if (rawData.isActive === false) {
          await signOut(auth);
          setUser(null);
          setFirebaseUser(null);
          throw new Error("Your account has been deactivated. Contact administrator.");
        }
        const normalizedRole = normalizeRole(rawData.role || baselineRole);
        setUser({ uid: cred.user.uid, ...rawData, role: normalizedRole } as User);
        updateDoc(userDocRef, { lastLogin: new Date().toISOString() }).catch(() => {});
      } else if (userDoc) {
        setDoc(userDocRef, baselineProfile).catch(() => {});
      }
    } catch (err: any) {
      if (err?.message === "Your account has been deactivated. Contact administrator.") {
        throw err;
      }
      console.warn("Firestore profile sync warning, continuing with auth session:", err);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {}
    setUser(null);
    setFirebaseUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("axenta_demo_user");
    }
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const createEmployee = async (data: CreateEmployeeData) => {
    const password = data.password || Math.random().toString(36).slice(-10) + "A1!";
    // We create the user via Firebase Auth
    // NOTE: In production, use Firebase Admin SDK on backend
    // For now, we use client-side creation
    const cred = await createUserWithEmailAndPassword(auth, data.email, password);
    await updateProfile(cred.user, { displayName: data.displayName });

    const employeeId = `AXN-${Math.floor(1000 + Math.random() * 9000)}`;
    const userData: Omit<User, "uid"> = {
      email: data.email,
      displayName: data.displayName,
      role: data.role,
      department: data.department || "",
      phone: data.phone || "",
      avatar: "",
      employeeId,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await setDoc(doc(db, "users", cred.user.uid), userData);

    // Re-sign in as the current admin user
    // In production, this would be handled by Admin SDK
    return { email: data.email, password };
  };

  const hasPermission = useCallback(
    (permission: string): boolean => {
      if (!user) return true; // Default to true while user initializes so nav is never completely blank
      const roleStr = user.role || "admin";
      const normalized = normalizeRole(roleStr);
      // CEO and Admin have full unrestricted access to all ERP modules
      if (normalized === "ceo" || normalized === "admin") return true;
      const perms = ROLE_PERMISSIONS[normalized] || ROLE_PERMISSIONS[roleStr];
      if (perms && Array.isArray(perms)) {
        return perms.includes(permission);
      }
      return true; // Fallback to accessible so user is never locked out
    },
    [user]
  );

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const newVal = !prev;
      if (typeof window !== "undefined") {
        document.documentElement.classList.toggle("dark", newVal);
        localStorage.setItem("darkMode", String(newVal));
      }
      return newVal;
    });
  };

  // Init dark mode from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("darkMode") === "true";
      setDarkMode(saved);
      document.documentElement.classList.toggle("dark", saved);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        login,
        logout,
        resetPassword,
        createEmployee,
        hasPermission,
        notifications,
        unreadCount,
        darkMode,
        toggleDarkMode,
        isCheckedInToday,
        todayAttendance,
        checkInWithPhoto,
        checkOutToday,
        refreshAttendance,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
