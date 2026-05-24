import { Role } from '@/types';
export const roles: Role[] = ['CEO','Admin','Head Manager','Team Manager','Sales Executive','Calling Executive','Data Scraper','Operations Team','HR'];
export const routePermissions: Record<string, Role[]> = {
  '/dashboard': roles,
  '/leads': ['CEO','Admin','Head Manager','Team Manager','Sales Executive','Calling Executive','Data Scraper'],
  '/crm-pipeline': ['CEO','Admin','Head Manager','Team Manager','Sales Executive','Calling Executive'],
  '/tasks': roles,
  '/employees': ['CEO','Admin','Head Manager','HR'],
  '/reports': ['CEO','Admin','Head Manager','Team Manager','HR'],
  '/attendance': roles,
  '/notifications': roles,
  '/settings': roles,
  '/calling': ['CEO','Admin','Head Manager','Team Manager','Calling Executive','Sales Executive'],
  '/hr': ['CEO','Admin','Head Manager','HR'],
  '/operations': ['CEO','Admin','Head Manager','Operations Team'],
  '/data-scraper': ['CEO','Admin','Head Manager','Team Manager','Data Scraper']
};
export const canAccess = (role: Role|undefined, path: string) => !!role && (routePermissions[path] || roles).includes(role);
export const roleHome = (role: Role) => role === 'Data Scraper' ? '/data-scraper' : role === 'Calling Executive' ? '/calling' : role === 'Operations Team' ? '/operations' : role === 'HR' ? '/hr' : '/dashboard';
