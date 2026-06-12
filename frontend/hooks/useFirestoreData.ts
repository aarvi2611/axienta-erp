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
  updateDoc,
  where,
  getDocs,
  type QueryConstraint
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Lead, Task, UserProfile } from '@/types';
import { useAuth } from '@/contexts/providers';

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
  constraints: QueryConstraint[] = []
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
  }, [collectionName, key]);

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

  return useCollection<Lead>('leads', constraints);
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

  return useCollection<Task>('tasks', constraints);
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

export async function checkIn(userId: string) {
  return addDoc(collection(db, 'attendance'), {
    userId,
    date: new Date().toISOString().slice(0, 10),
    checkIn: new Date().toISOString(),
    status: 'Present',
    createdAt: serverTimestamp()
  });
}

export async function checkOut(userId: string) {
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
