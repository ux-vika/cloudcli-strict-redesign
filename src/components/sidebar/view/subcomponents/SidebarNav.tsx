import { Activity, Archive, Folder, FolderPlus, MessageSquare, type LucideIcon } from 'lucide-react';
import type { TFunction } from 'i18next';

import { cn } from '../../../../lib/utils';
import type { SidebarSearchMode } from '../../types/types';

type SidebarNavProps = {
  searchMode: SidebarSearchMode;
  onSearchModeChange: (mode: SidebarSearchMode) => void;
  onCreateProject: () => void;
  runningSessionsCount: number;
  t: TFunction;
};

type NavItem = {
  mode: SidebarSearchMode;
  icon: LucideIcon;
  label: string;
};

/**
 * Вертикальное меню режимов сайдбара (strict-редизайн).
 * Переносит переключатель searchMode из шапки в список по макету:
 * New project / Projects / Chats / Running / Archive.
 */
export default function SidebarNav({
  searchMode,
  onSearchModeChange,
  onCreateProject,
  runningSessionsCount,
  t,
}: SidebarNavProps) {
  const items: NavItem[] = [
    { mode: 'projects', icon: Folder, label: t('nav.projects', 'Projects') },
    { mode: 'conversations', icon: MessageSquare, label: t('nav.chats', 'Chats') },
    { mode: 'running', icon: Activity, label: t('nav.running', 'Running') },
    { mode: 'archived', icon: Archive, label: t('nav.archive', 'Archive') },
  ];

  const runningBadgeText = runningSessionsCount > 99 ? '99+' : String(runningSessionsCount);

  return (
    <nav className="hidden space-y-0.5 px-3 pb-2.5 pt-0.5 md:block">
      <button
        onClick={onCreateProject}
        className="flex w-full items-center gap-2.5 rounded-md border border-np-border bg-np px-2.5 py-2 text-[13px] font-medium text-np-foreground transition-colors hover:bg-np-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring"
      >
        <FolderPlus className="h-[15px] w-[15px]" />
        {t('nav.newProject', 'New project')}
      </button>

      {items.map(({ mode, icon: Icon, label }) => {
        const isActive = searchMode === mode;
        return (
          <button
            key={mode}
            onClick={() => onSearchModeChange(mode)}
            aria-pressed={isActive}
            className={cn(
              'flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring',
              isActive
                ? 'bg-nav-selected font-medium text-foreground'
                : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
            )}
          >
            <Icon className="h-[15px] w-[15px]" />
            {label}
            {mode === 'running' && runningSessionsCount > 0 && (
              <span className="ml-auto rounded-full bg-primary-tint px-1.5 py-0.5 font-mono text-[10px] font-medium leading-none text-primary">
                {runningBadgeText}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
