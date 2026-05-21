import { clsx, type ClassValue } from 'clsx'; import { twMerge } from 'tailwind-merge';
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
export const formatDate = (date?: string|number|Date) => date ? new Intl.DateTimeFormat('en-IN', { dateStyle:'medium' }).format(new Date(date)) : '—';
export const initials = (name='Axienta') => name.split(' ').map(n=>n[0]).slice(0,2).join('').toUpperCase();
