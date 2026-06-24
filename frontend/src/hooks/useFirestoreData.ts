'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  type QueryConstraint,
  updateDoc,
  where
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ClientDailyUpdate, ClientProfile, Lead, Task, User } from '@/types';
import { useAuth } from '@/contexts/providers';

type Status = 'loading' | 'success' | 'error';

export function useCollection<T>(collectionName: string, constraints: QueryConstraint[] = [], deps: any[] = []) {
  const [data, setData] = useState<T[]>([]);
  const [status, setStatus] = useState<Status>('loading');
  const [error, setError] = useState<string | null>(null);

  const key = useMemo(() => JSON.stringify(constraints.map((constraint: any) => constraint.type || 'constraint')), [constraints]);

  useEffect(() => {
    setStatus('loading');
    setError(null);

    const q = query(collection(db, collectionName), ...constraints);
    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        setData(snap.docs.map((item) => ({ id: item.id, ...item.data() }) as T));
        setStatus('success');
      },
      (err) => {
        console.error(`Firestore ${collectionName} error`, err);
        setError(err.message || 'Failed to load data');
        setStatus('error');
      }
    );

    return unsubscribe;
  }, [collectionName, key, ...deps]);

  return { data, status, error, loading: status === 'loading' };
}

export function useLeads() {
  const { profile } = useAuth();
  const managerRoles = ['CEO', 'Admin', 'Head Manager', 'Team Manager', 'Data Scraper'];
  const constraints = profile && !managerRoles.includes(profile.role) ? [where('ownerId', '==', profile.uid)] : [];
  return useCollection<Lead>('leads', constraints, [profile?.uid, profile?.role]);
}

export function useEmployees() {
  return useCollection<User>('users', []);
}

export function useTasks() {
  const { profile } = useAuth();
  const managerRoles = ['CEO', 'Admin', 'Head Manager', 'Team Manager'];
  const constraints = profile && !managerRoles.includes(profile.role) ? [where('assignedTo', '==', profile.uid)] : [];
  return useCollection<Task>('tasks', constraints, [profile?.uid, profile?.role]);
}

export function useAttendance() {
  return useCollection<any>('attendance', [orderBy('date', 'desc')]);
}

export function useClients() {
  return useCollection<ClientProfile>('clients', [orderBy('createdAt', 'desc')]);
}

export function useClientDailyUpdates(clientId?: string) {
  const normalizedClientId = clientId?.trim().toUpperCase();
  const constraints = normalizedClientId ? [where('clientId', '==', normalizedClientId)] : [];
  return useCollection<ClientDailyUpdate>('client_daily_updates', constraints, [normalizedClientId]);
}

function normalizeClientId(clientId: string) {
  return clientId.trim().toUpperCase();
}

export async function createClient(data: Partial<ClientProfile>, createdBy?: string) {
  const clientId = normalizeClientId(data.clientId || '');
  if (!clientId) throw new Error('Client ID is required');

  return setDoc(doc(db, 'clients', clientId), {
    clientId,
    businessName: data.businessName || 'Untitled Client',
    businessProfiles: data.businessProfiles || [],
    contactName: data.contactName || '',
    contactEmail: data.contactEmail || '',
    contactPhone: data.contactPhone || '',
    supportEmail: data.supportEmail || '',
    supportPhone: data.supportPhone || '',
    clientStatus: data.clientStatus || 'Active',
    accountManager: data.accountManager || '',
    monthlyRetainer: Number(data.monthlyRetainer || 0),
    notes: data.notes || '',
    createdBy: createdBy || '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }, { merge: true });
}

export async function updateClient(id: string, data: Partial<ClientProfile>) {
  return updateDoc(doc(db, 'clients', id), {
    ...data,
    clientId: data.clientId ? normalizeClientId(data.clientId) : data.clientId,
    updatedAt: serverTimestamp()
  });
}

export async function deleteClient(id: string) {
  return deleteDoc(doc(db, 'clients', id));
}

export async function createClientDailyUpdate(data: Partial<ClientDailyUpdate>, createdBy?: string) {
  const clientId = normalizeClientId(data.clientId || '');
  if (!clientId || !data.updateDate || !data.businessProfile) {
    throw new Error('Client ID, business profile and date are required');
  }

  return addDoc(collection(db, 'client_daily_updates'), {
    clientId,
    businessProfile: data.businessProfile,
    updateDate: data.updateDate,
    reviewsReceived: Number(data.reviewsReceived || 0),
    reviewsDropped: Number(data.reviewsDropped || 0),
    callsReceived: Number(data.callsReceived || 0),
    paymentsMade: Number(data.paymentsMade || 0),
    paymentsPending: Number(data.paymentsPending || 0),
    issueStatus: data.issueStatus || 'None',
    issueSummary: data.issueSummary || '',
    contactStatus: data.contactStatus || 'Open',
    note: data.note || '',
    createdBy: createdBy || '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
}

