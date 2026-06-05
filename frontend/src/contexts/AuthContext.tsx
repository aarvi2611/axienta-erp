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
import { auth, db } from "@/config/firebase";
import { User, UserRole, ROLE_PERMISSIONS, Notification } from "@/types";

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

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setFirebaseUser(fbUser);
        // Fetch user profile from Firestore
        const userDoc = await getDoc(doc(db, "users", fbUser.uid));
        if (userDoc.exists()) {
          const userData = { uid: fbUser.uid, ...userDoc.data() } as User;
          setUser(userData);
          // Update last login
          await updateDoc(doc(db, "users", fbUser.uid), {
            lastLogin: new Date().toISOString(),
          });
        }
      } else {
        setFirebaseUser(null);
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Listen for notifications
  useEffect(() => {
    if (!user?.uid) return;
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
  }, [user?.uid]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const login = async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const userDoc = await getDoc(doc(db, "users", cred.user.uid));
    if (!userDoc.exists()) {
      throw new Error("User profile not found. Contact administrator.");
    }
    const userData = userDoc.data();
    if (!userData.isActive) {
      await signOut(auth);
      throw new Error("Your account has been deactivated. Contact administrator.");
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setFirebaseUser(null);
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
      if (!user) return false;
      return ROLE_PERMISSIONS[user.role]?.includes(permission) || false;
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
