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
import {
  deleteObject,
  getDownloadURL,
  ref as storageRef,
  uploadBytes
} from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import {
  ClientAsset,
  ClientDailyUpdate,
  ClientProfile,
  ClientTicket,
  DailyUpdateNotification,
  Lead,
  PaymentReminder,
  Task,
  User
} from '@/types';
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

  const ref = await addDoc(collection(db, 'client_daily_updates'), {
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

  // Record missed-update notification atomically (used by /operations/daily-updates)
  try {
    await recordDailyUpdateNotification(clientId, data.updateDate, createdBy);
  } catch (err) {
    console.warn('Failed to record daily-update notification', err);
  }

  return ref;
}

// --- Client Tickets ---
export function useClientTickets(clientId?: string) {
  const normalized = clientId?.trim().toUpperCase();
  const constraints = normalized
    ? [where('clientId', '==', normalized), orderBy('createdAt', 'desc')]
    : [orderBy('createdAt', 'desc')];
  return useCollection<ClientTicket>('client_tickets', constraints, [normalized]);
}

export function useAllOpenTickets() {
  return useCollection<ClientTicket>(
    'client_tickets',
    [where('status', 'in', ['Open', 'In Progress', 'Awaiting Client']), orderBy('createdAt', 'desc')],
    []
  );
}

export async function createClientTicket(data: Partial<ClientTicket>) {
  const clientId = normalizeClientId(data.clientId || '');
  if (!clientId) throw new Error('Client ID is required');
  if (!data.title?.trim() || !data.description?.trim()) {
    throw new Error('Title and description are required');
  }

  const ticketRef = await addDoc(collection(db, 'client_tickets'), {
    clientId,
    businessName: data.businessName || '',
    businessProfile: data.businessProfile || '',
    title: data.title,
    description: data.description,
    category: data.category || 'Other',
    priority: data.priority || 'Medium',
    status: 'Open',
    raisedBy: data.raisedBy || '',
    assignedTo: '',
    createdBy: '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  // Notify operations team via existing notifications collection
  try {
    await addDoc(collection(db, 'notifications'), {
      userId: 'operations-team',
      type: 'client_ticket',
      title: `New ticket from ${data.businessName || clientId}`,
      body: data.title,
      clientId,
      ticketId: ticketRef.id,
      read: false,
      createdAt: serverTimestamp()
    });
  } catch (err) {
    console.warn('Failed to create ops notification for ticket', err);
  }

  return ticketRef;
}

export async function updateClientTicket(id: string, data: Partial<ClientTicket>) {
  return updateDoc(doc(db, 'client_tickets', id), {
    ...data,
    updatedAt: serverTimestamp()
  });
}

export async function deleteClientTicket(id: string) {
  return deleteDoc(doc(db, 'client_tickets', id));
}

// --- Payment Reminders ---
export function usePaymentReminders(clientId?: string) {
  const normalized = clientId?.trim().toUpperCase();
  const constraints = normalized
    ? [where('clientId', '==', normalized), orderBy('dueDate', 'asc')]
    : [orderBy('dueDate', 'asc')];
  return useCollection<PaymentReminder>('payment_reminders', constraints, [normalized]);
}

export async function createPaymentReminder(data: Partial<PaymentReminder>, userId?: string) {
  const clientId = normalizeClientId(data.clientId || '');
  if (!clientId || !data.dueDate) {
    throw new Error('Client ID and due date are required');
  }
  return addDoc(collection(db, 'payment_reminders'), {
    clientId,
    title: data.title || 'Payment',
    amount: Number(data.amount || 0),
    dueDate: data.dueDate,
    status: data.status || 'Upcoming',
    invoiceNo: data.invoiceNo || '',
    notes: data.notes || '',
    createdBy: userId || '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
}

export async function updatePaymentReminder(id: string, data: Partial<PaymentReminder>) {
  return updateDoc(doc(db, 'payment_reminders', id), {
    ...data,
    updatedAt: serverTimestamp()
  });
}

export async function deletePaymentReminder(id: string) {
  return deleteDoc(doc(db, 'payment_reminders', id));
}

// --- Client Assets (logo / cover via Firebase Storage) ---
export function useClientAsset(clientId?: string) {
  const normalized = clientId?.trim().toUpperCase();
  const constraints = normalized ? [where('clientId', '==', normalized)] : [];
  return useCollection<ClientAsset>('client_assets', constraints, [normalized]);
}

export async function uploadClientAsset(
  clientId: string,
  file: File,
  kind: 'logo' | 'cover',
  userId?: string
) {
  const id = normalizeClientId(clientId);
  if (!id) throw new Error('Client ID is required');
  if (!file.type.startsWith('image/')) throw new Error('Only image files are allowed');

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `clients/${id}/${kind}-${Date.now()}-${safeName}`;
  const ref = storageRef(storage, path);
  await uploadBytes(ref, file);
  const url = await getDownloadURL(ref);

  const field = kind === 'logo' ? 'logoUrl' : 'coverUrl';
  const pathField = kind === 'logo' ? 'logoPath' : 'coverPath';

  await setDoc(
    doc(db, 'client_assets', id),
    {
      clientId: id,
      [field]: url,
      [pathField]: path,
      updatedBy: userId || '',
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );

  return { url, path };
}

export async function removeClientAsset(clientId: string, kind: 'logo' | 'cover') {
  const id = normalizeClientId(clientId);
  if (!id) return;

  const pathField = kind === 'logo' ? 'logoPath' : 'coverPath';
  const urlField = kind === 'logo' ? 'logoUrl' : 'coverUrl';

  const snap = await getDocs(query(collection(db, 'client_assets'), where('clientId', '==', id)));
  const oldPath = snap.docs[0]?.data()?.[pathField] as string | undefined;
  if (oldPath) {
    try {
      await deleteObject(storageRef(storage, oldPath));
    } catch (err) {
      console.warn('Failed to delete old asset from storage', err);
    }
  }

  await setDoc(
    doc(db, 'client_assets', id),
    {
      [urlField]: '',
      [pathField]: '',
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );
}

// --- Daily Update Notifications (missed-update tracking) ---
export function useDailyUpdateNotificationsToday() {
  const today = new Date().toISOString().slice(0, 10);
  return useCollection<DailyUpdateNotification>(
    'daily_update_notifications',
    [where('updateDate', '==', today)],
    [today]
  );
}

export async function recordDailyUpdateNotification(
  clientId: string,
  updateDate: string,
  userId?: string
) {
  const id = normalizeClientId(clientId);
  if (!id || !updateDate) return;
  const docId = `${id}_${updateDate}`;
  return setDoc(
    doc(db, 'daily_update_notifications', docId),
    {
      id: docId,
      clientId: id,
      updateDate,
      updatedBy: userId || '',
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );
}

