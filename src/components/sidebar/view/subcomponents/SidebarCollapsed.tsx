import { Activity, Archive, Folder, FolderPlus, MessageSquare, PanelLeftOpen, Settings, Sparkles, AlertTriangle } from 'lucide-react';
import type { TFunction } from 'i18next';

import { cn } from '../../../../lib/utils';
import type { SidebarSearchMode } from '../../types/types';

type SidebarCollapsedProps = {
  onExpand: () => void;
  onShowSettings: () => void;
  updateAvailable: boolean;
  restartRequired: boolean;
  onShowVersionModal: () => void;
  searchMode: SidebarSearchMode;
  onSearchModeChange: (mode: SidebarSearchMode) => void;
  onCreateProject: () => void;
  t: TFunction;
};

/**
 * Свёрнутый сайдбар (strict): иконки навигации повторяют вертикальное меню
 * развёрнутой панели, Settings прижат к низу. Внешних ссылок нет.
 */
export default function SidebarCollapsed({
  onExpand,
  onShowSettings,
  updateAvailable,
  restartRequired,
  onShowVersionModal,
  searchMode,
  onSearchModeChange,
  onCreateProject,
  t,
}: SidebarCollapsedProps) {
  const navItems: { mode: SidebarSearchMode; icon: typeof Folder; label: string }[] = [
    { mode: 'projects', icon: Folder, label: t('nav.projects', 'Projects') },
    { mode: 'conversations', icon: MessageSquare, label: t('nav.chats', 'Chats') },
    { mode: 'running', icon: Activity, label: t('nav.running', 'Running') },
    { mode: 'archived', icon: Archive, label: t('nav.archive', 'Archive') },
  ];

  return (
    <div className="flex h-full w-12 flex-col items-center gap-1 bg-sidebar py-3">
      {/* Развернуть панель */}
      <button
        onClick={onExpand}
        className="group flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-secondary"
        aria-label={t('common:versionUpdate.ariaLabels.showSidebar')}
        title={t('common:versionUpdate.ariaLabels.showSidebar')}
      >
        <PanelLeftOpen className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground" />
      </button>

      <div className="my-1 h-px w-6 bg-border" />

      {/* New project */}
      <button
        onClick={onCreateProject}
        className="flex h-8 w-8 items-center justify-center rounded-md border border-primary-tint-border bg-card text-primary transition-colors hover:bg-primary-tint"
        aria-label={t('nav.newProject', 'New project')}
        title={t('nav.newProject', 'New project')}
      >
        <FolderPlus className="h-4 w-4" />
      </button>

      {/* Режимы навигации */}
      {navItems.map(({ mode, icon: Icon, label }) => (
        <button
          key={mode}
          onClick={() => onSearchModeChange(mode)}
          aria-pressed={searchMode === mode}
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-md transition-colors',
            searchMode === mode
              ? 'bg-nav-selected text-foreground'
              : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
          )}
          aria-label={label}
          title={label}
        >
          <Icon className="h-4 w-4" />
        </button>
      ))}

      {/* Прижимаем низ */}
      <div className="mt-auto flex flex-col items-center gap-1">
        {restartRequired && (
          <div
            className="relative flex h-8 w-8 items-center justify-center rounded-md"
            aria-label={t('version.restartRequired')}
            title={t('version.restartRequired')}
          >
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
          </div>
        )}

        {updateAvailable && (
          <button
            onClick={onShowVersionModal}
            className="relative flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-secondary"
            aria-label={t('common:versionUpdate.ariaLabels.updateAvailable')}
            title={t('common:versionUpdate.ariaLabels.updateAvailable')}
          >
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
          </button>
        )}

        {/* Settings — всегда внизу, не «скачет» */}
        <button
          onClick={onShowSettings}
          className="group flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-secondary"
          aria-label={t('actions.settings')}
          title={t('actions.settings')}
        >
          <Settings className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground" />
        </button>
      </div>
    </div>
  );
}
