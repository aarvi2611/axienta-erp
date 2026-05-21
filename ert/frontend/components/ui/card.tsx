import * as React from 'react'; import { cn } from '@/lib/utils';
export const Card=({className,...p}:React.HTMLAttributes<HTMLDivElement>)=><div className={cn('glass rounded-2xl p-5 animate-fade-in',className)} {...p}/>;
export const CardTitle=({className,...p}:React.HTMLAttributes<HTMLHeadingElement>)=><h3 className={cn('text-lg font-bold text-navy-900 dark:text-white',className)} {...p}/>;
