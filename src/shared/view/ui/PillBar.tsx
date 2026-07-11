import type { ReactNode } from 'react';

import { cn } from '../../../lib/utils';

/* ── Container ─────────────────────────────────────────────────── */
type PillBarProps = {
  children: ReactNode;
  className?: string;
};

export function PillBar({ children, className }: PillBarProps) {
  return (
    <div className={cn('inline-flex items-center gap-[2px] rounded-lg border border-border bg-secondary p-[3px]', className)}>
      {children}
    </div>
  );
}

/* ── Individual pill button ────────────────────────────────────── */
type PillProps = {
  isActive: boolean;
  onClick: () => void;
  children: ReactNode;
  className?: string;
};

export function Pill({ isActive, onClick, children, className }: PillProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex touch-manipulation items-center gap-1.5 rounded-md px-[13px] py-1.5 text-[12.5px] font-semibold transition-all duration-150',
        isActive
          ? 'bg-card text-primary shadow-sm'
          : 'text-muted-foreground hover:text-foreground active:bg-card/50',
        className,
      )}
    >
      {children}
    </button>
  );
}
