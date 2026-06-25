'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  getDocs,
  type QueryConstraint
} from 'firebase/firestore';
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
  UserProfile
} from '@/types';
import { useAuth } from '@/contexts/providers';
import {
  deleteObject,
  getDownloadURL,
  ref as storageRef,
  uploadBytes
} from 'firebase/storage';

type Status = 'loading' | 'success' | 'error';

function taskStatusToOperation(status?: Task['status']) {
  switch (status) {
    case 'Accepted':
      return { status: 'In Progress', progress: 10 };
    case 'In Progress':
      return { status: 'In Progress', progress: 40 };
    case 'Submitted for Review':
      return { status: 'In Progress', progress: 75 };
    case 'Revision Requested':
      return { status: 'In Progress', progress: 55 };
    case 'Approved':
      return { status: 'In Progress', progress: 90 };
    case 'Closed':
    case 'Completed':
      return { status: 'Completed', progress: 100 };
    case 'Rejected':
      return { status: 'Cancelled', progress: 0 };
    default:
      return { status: 'Pending', progress: 0 };
  }
}

export function useCollection<T>(
  collectionName: string,
  constraints: QueryConstraint[] = [],
  deps: any[] = []
) {
  const [data, setData] = useState<T[]>([]);
  const [status, setStatus] = useState<Status>('loading');
  const [error, setError] = useState<string | null>(null);

  const key = useMemo(
    () => JSON.stringify(constraints.map((c: any) => c.type || 'constraint')),
    [constraints]
  );

  useEffect(() => {
    setStatus('loading');
    setError(null);

    const q = query(collection(db, collectionName), ...constraints);

    const unsub = onSnapshot(
      q,
      (snap) => {
        setData(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as T));
        setStatus('success');
      },
      (err) => {
        console.error(`Firestore ${collectionName} error`, err);
        setError(err.message || 'Failed to load data');
        setStatus('error');
      }
    );

    return unsub;
  }, [collectionName, key, ...deps]);

  return {
    data,
    status,
    error,
    loading: status === 'loading'
  };
}

export function useLeads() {
  const { profile } = useAuth();

  const managerRoles = [
    'CEO',
    'Admin',
    'Head Manager',
    'Team Manager',
    'Data Scraper'
  ];

  const constraints =
    profile && !managerRoles.includes(profile.role)
      ? [where('ownerId', '==', profile.uid)]
      : [];

  return useCollection<Lead>('leads', constraints, [profile?.uid, profile?.role]);
}

export function useEmployees() {
  return useCollection<UserProfile>('employees', []);
}

export function useTasks() {
  const { profile } = useAuth();

  const managerRoles = ['CEO', 'Admin', 'Head Manager', 'Team Manager'];

  const constraints =
    profile && !managerRoles.includes(profile.role)
      ? [where('assignedTo', '==', profile.uid)]
      : [];

  return useCollection<Task>('tasks', constraints, [profile?.uid, profile?.role]);
}

export function useAttendance() {
  return useCollection<any>('attendance', [orderBy('date', 'desc')]);
}

export function useLeaveRequests() {
  return useCollection<any>('leave_requests', [orderBy('createdAt', 'desc')]);
}

export function useCallLogs() {
  return useCollection<any>('call_logs', [orderBy('createdAt', 'desc')]);
}

export async function createLeaveRequest(data: Partial<any>, userId?: string) {
  return addDoc(collection(db, 'leave_requests'), {
    userId: data.userId || userId || '',
    userName: data.userName || '',
    fromDate: data.fromDate || '',
    toDate: data.toDate || '',
    type: data.type || 'Paid Leave',
    reason: data.reason || '',
    status: 'Pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
}

export async function updateLeaveRequest(id: string, data: Partial<any>) {
  return updateDoc(doc(db, 'leave_requests', id), {
    ...data,
    updatedAt: serverTimestamp()
  });
}

export async function createLead(data: Partial<Lead>, createdBy?: string) {
  return addDoc(collection(db, 'leads'), {
    businessName: data.businessName || 'Untitled Lead',
    phone: data.phone || '',
    email: data.email || '',
    website: data.website || '',
    address: data.address || '',
    category: data.category || '',
    rating: Number(data.rating || 0),
    stage: data.stage || 'New Lead',
    ownerId: data.ownerId || createdBy || '',
    tags: data.tags || [],
    notes: data.notes || '',
    source: data.source || 'Manual',
    createdBy: createdBy || '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
}

export async function updateLead(id: string, data: Partial<Lead>) {
  return updateDoc(doc(db, 'leads', id), {
    ...data,
    updatedAt: serverTimestamp()
  });
}

export async function removeLead(id: string) {
  return deleteDoc(doc(db, 'leads', id));
}

export async function createTask(data: Partial<Task>, createdBy?: string) {
  const taskPayload = {
    title: data.title || 'Untitled Task',
    description: data.description || '',
    assignedTo: data.assignedTo || '',
    assignedName: data.assignedName || '',
    deadline: data.deadline || '',
    priority: data.priority || 'Medium',
    status: data.status || 'Pending',
    attachments: data.attachments || [],
    createdBy: createdBy || '',
    completionNote: '',
    managerFeedback: '',
    stageNote: '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  const ref = await addDoc(collection(db, 'tasks'), taskPayload);

  if (data.assignedTo) {
    await addDoc(collection(db, 'notifications'), {
      userId: data.assignedTo,
      type: 'task_assigned',
      title: 'New task assigned',
      body: data.title || 'Untitled Task',
      read: false,
      createdAt: serverTimestamp()
    });
  }

  await addDoc(collection(db, 'operations'), {
    clientName: data.title || 'Untitled Task',
    leadId: '',
    taskId: ref.id,
    source: 'Task Assignment',
    serviceType: 'Assigned Work',
    description: data.description || '',
    status: 'Pending',
    progress: 0,
    priority: data.priority || 'Medium',
    assignedTo: data.assignedTo || '',
    assignedName: data.assignedName || '',
    deadline: data.deadline || '',
    startDate: new Date().toISOString().split('T')[0],
    budget: 0,
    spent: 0,
    expenses: 0,
    notes: '',
    details: data.description || '',
    attachments: data.attachments || [],
    createdBy: createdBy || '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  return ref;
}

export async function updateTaskStatus(id: string, status: Task['status']) {
  await updateDoc(doc(db, 'tasks', id), {
    status,
    updatedAt: serverTimestamp()
  });
  await syncTaskOperation(id, { status });
}

export async function updateTask(id: string, data: Partial<Task>) {
  await updateDoc(doc(db, 'tasks', id), {
    ...data,
    updatedAt: serverTimestamp()
  });
  await syncTaskOperation(id, data);
}

async function syncTaskOperation(taskId: string, data: Partial<Task>) {
  const q = query(collection(db, 'operations'), where('taskId', '==', taskId));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return;

  const taskStage = taskStatusToOperation(data.status);
  const operationUpdates: Record<string, any> = {
    updatedAt: serverTimestamp()
  };

  if (data.status) {
    operationUpdates.status = taskStage.status;
    operationUpdates.progress = taskStage.progress;
  }
  if (data.title) operationUpdates.clientName = data.title;
  if (data.description) {
    operationUpdates.description = data.description;
    operationUpdates.details = data.description;
  }
  if (data.assignedTo !== undefined) operationUpdates.assignedTo = data.assignedTo || '';
  if (data.assignedName !== undefined) operationUpdates.assignedName = data.assignedName || '';
  if (data.deadline !== undefined) operationUpdates.deadline = data.deadline || '';
  if (data.priority) operationUpdates.priority = data.priority;
  if (data.completionNote !== undefined) operationUpdates.notes = data.completionNote || '';
  if (data.managerFeedback !== undefined) operationUpdates.managerFeedback = data.managerFeedback || '';

  await Promise.all(snapshot.docs.map((item) => updateDoc(doc(db, 'operations', item.id), operationUpdates)));
}

type AttendancePhotoPayload = {
  photo?: string;
  employeeId?: string;
  employeeName?: string;
};

export async function checkIn(userId: string, payload: AttendancePhotoPayload = {}) {
  return addDoc(collection(db, 'attendance'), {
    userId,
    employeeId: payload.employeeId || '',
    employeeName: payload.employeeName || '',
    date: new Date().toISOString().slice(0, 10),
    checkIn: new Date().toISOString(),
    checkInPhoto: payload.photo || '',
    status: 'Present',
    createdAt: serverTimestamp()
  });
}

export async function checkOut(userId: string, payload: AttendancePhotoPayload = {}) {
  const today = new Date().toISOString().slice(0, 10);
  const q = query(
    collection(db, 'attendance'),
    where('userId', '==', userId),
    where('date', '==', today)
  );
  
  const snapshot = await getDocs(q);
  if (snapshot.empty) {
    throw new Error('No check-in record found for today');
  }

  const docId = snapshot.docs[0].id;
  return updateDoc(doc(db, 'attendance', docId), {
    checkOut: new Date().toISOString(),
    checkOutPhoto: payload.photo || '',
    employeeId: payload.employeeId || snapshot.docs[0].data().employeeId || '',
    employeeName: payload.employeeName || snapshot.docs[0].data().employeeName || '',
    updatedAt: serverTimestamp()
  });
}

export async function createCallLog(data: { leadId: string; status: string; notes: string; remarks?: string }, userId?: string) {
  return addDoc(collection(db, 'call_logs'), {
    leadId: data.leadId,
    status: data.status,
    notes: data.notes,
    remarks: data.remarks || '',
    userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
}

export async function updateCallLog(id: string, data: { leadId: string; status: string; notes: string; remarks?: string }) {
  return updateDoc(doc(db, 'call_logs', id), {
    ...data,
    remarks: data.remarks || '',
    updatedAt: serverTimestamp()
  });
}

export async function removeCallLog(id: string) {
  return deleteDoc(doc(db, 'call_logs', id));
}

export function useOperations() {
  return useCollection<any>('operations', [orderBy('createdAt', 'desc')]);
}

export function useClients() {
  return useCollection<ClientProfile>('clients', [orderBy('createdAt', 'desc')]);
}

export function useClientDailyUpdates(clientId?: string) {
  const normalizedClientId = clientId?.trim().toUpperCase();
  const constraints = normalizedClientId ? [where('clientId', '==', normalizedClientId)] : [];
  return useCollection<ClientDailyUpdate>('client_daily_updates', constraints, [normalizedClientId]);
}

export async function createOperation(data: any, createdBy?: string) {
  return addDoc(collection(db, 'operations'), {
    clientName: data.clientName || '',
    leadId: data.leadId || '',
    taskId: data.taskId || '',
    source: data.source || 'Manual',
    serviceType: data.serviceType || 'General',
    description: data.description || '',
    status: data.status || 'Pending',
    progress: Number(data.progress || 0),
    priority: data.priority || 'Medium',
    assignedTo: data.assignedTo || '',
    assignedName: data.assignedName || '',
    deadline: data.deadline || '',
    startDate: data.startDate || new Date().toISOString().split('T')[0],
    budget: Number(data.budget || 0),
    spent: Number(data.spent || 0),
    expenses: Number(data.expenses || data.spent || 0),
    notes: data.notes || '',
    details: data.details || '',
    attachments: data.attachments || [],
    createdBy: createdBy || '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
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
    createdAt: data.createdAt || serverTimestamp(),
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

export async function updateOperation(id: string, data: any) {
  return updateDoc(doc(db, 'operations', id), {
    ...data,
    updatedAt: serverTimestamp()
  });
}

export async function deleteOperation(id: string) {
  return deleteDoc(doc(db, 'operations', id));
}

export async function addOperationNote(operationId: string, note: string, userId?: string) {
  const operationDoc = doc(db, 'operations', operationId);
  const snapshot = await getDocs(collection(db, 'operations'));
  const operation = snapshot.docs.find(d => d.id === operationId)?.data();
  
  const existingNotes = operation?.notesList || [];
  return updateDoc(operationDoc, {
    notesList: [
      ...existingNotes,
      {
        id: Date.now().toString(),
        text: note,
        userId,
        createdAt: new Date().toISOString()
      }
    ],
    notes: note,
    updatedAt: serverTimestamp()
  });
}
