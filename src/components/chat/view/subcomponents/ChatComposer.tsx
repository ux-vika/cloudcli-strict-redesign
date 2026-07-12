import { useTranslation } from 'react-i18next';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type {
  ChangeEvent,
  ClipboardEvent,
  FormEvent,
  KeyboardEvent,
  MouseEvent,
  ReactNode,
  RefObject,
  TouchEvent,
} from 'react';
import { Paperclip, ShieldIcon, SlidersHorizontal, MessageSquareIcon, Loader2, Check, ArrowUpIcon, Mic, Square } from 'lucide-react';

import { useVoiceInput } from '../../hooks/useVoiceInput';
import { useVoiceAvailable } from '../../hooks/useVoiceAvailable';
import type { QueuedDraft } from '../../hooks/useChatComposerState';
import type { SessionActivity } from '../../../../hooks/useSessionProtection';
import type { PendingPermissionRequest, PermissionMode } from '../../types/types';
import type { ProviderModelOption } from '../../../../types/app';
import {
  PromptInput,
  PromptInputHeader,
  PromptInputBody,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputTools,
  PromptInputButton,
  PromptInputSubmit,
} from '../../../../shared/view/ui';

import CommandMenu from './CommandMenu';
import ActivityIndicator from './ActivityIndicator';
import ImageAttachment from './ImageAttachment';
import PermissionRequestsBanner from './PermissionRequestsBanner';
import TokenUsageSummary from './TokenUsageSummary';
import QueuedMessageCard from './QueuedMessageCard';

interface MentionableFile {
  name: string;
  path: string;
}

interface SlashCommand {
  name: string;
  description?: string;
  namespace?: string;
  path?: string;
  type?: string;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

interface ChatComposerProps {
  pendingPermissionRequests: PendingPermissionRequest[];
  handlePermissionDecision: (
    requestIds: string | string[],
    decision: { allow?: boolean; message?: string; rememberEntry?: string | null; updatedInput?: unknown },
  ) => void;
  handleGrantToolPermission: (suggestion: { entry: string; toolName: string }) => { success: boolean };
  activity: SessionActivity | null;
  isLoading: boolean;
  onAbortSession: () => void;
  permissionMode: PermissionMode | string;
  onModeSwitch: () => void;
  availablePermissionModes?: PermissionMode[];
  onSelectPermissionMode?: (mode: PermissionMode) => void;
  effort: string;
  availableEffortOptions: NonNullable<ProviderModelOption['effort']>['values'];
  onSelectEffort: (effort: string) => void;
  tokenBudget: Record<string, unknown> | null;
  onShowTokenUsage: () => void;
  slashCommandsCount: number;
  onToggleCommandMenu: () => void;
  hasInput: boolean;
  onClearInput: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement> | MouseEvent<HTMLButtonElement> | TouchEvent<HTMLButtonElement>) => void;
  isDragActive: boolean;
  queuedDraft: QueuedDraft | null;
  onEditQueuedDraft: () => void;
  onDeleteQueuedDraft: () => void;
  attachedImages: File[];
  onRemoveImage: (index: number) => void;
  uploadingImages: Map<string, number>;
  imageErrors: Map<string, string>;
  showFileDropdown: boolean;
  filteredFiles: MentionableFile[];
  selectedFileIndex: number;
  onSelectFile: (file: MentionableFile) => void;
  filteredCommands: SlashCommand[];
  selectedCommandIndex: number;
  onCommandSelect: (command: SlashCommand, index: number, isHover: boolean) => void;
  onCloseCommandMenu: () => void;
  isCommandMenuOpen: boolean;
  frequentCommands: SlashCommand[];
  getRootProps: (...args: unknown[]) => Record<string, unknown>;
  getInputProps: (...args: unknown[]) => Record<string, unknown>;
  openImagePicker: () => void;
  inputHighlightRef: RefObject<HTMLDivElement>;
  renderInputWithMentions: (text: string) => ReactNode;
  textareaRef: RefObject<HTMLTextAreaElement>;
  input: string;
  onVoiceTranscript?: (text: string, send?: boolean) => void;
  onInputChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  onTextareaClick: (event: MouseEvent<HTMLTextAreaElement>) => void;
  onTextareaKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  onTextareaPaste: (event: ClipboardEvent<HTMLTextAreaElement>) => void;
  onTextareaScrollSync: (target: HTMLTextAreaElement) => void;
  onTextareaInput: (event: FormEvent<HTMLTextAreaElement>) => void;
  isInputFocused?: boolean;
  onInputFocusChange?: (focused: boolean) => void;
  placeholder: string;
  isTextareaExpanded: boolean;
  sendByCtrlEnter?: boolean;
}

const MODE_DOT_CLASS: Record<string, string> = {
  default: 'bg-muted-foreground',
  auto: 'bg-blue-500',
  acceptEdits: 'bg-green-500',
  bypassPermissions: 'bg-orange-500',
  plan: 'bg-primary',
};

export default function ChatComposer({
  pendingPermissionRequests,
  handlePermissionDecision,
  handleGrantToolPermission,
  activity,
  isLoading,
  onAbortSession,
  permissionMode,
  onModeSwitch,
  availablePermissionModes,
  onSelectPermissionMode,
  effort,
  availableEffortOptions,
  onSelectEffort,
  tokenBudget,
  onShowTokenUsage,
  slashCommandsCount,
  onToggleCommandMenu,
  hasInput,
  onClearInput,
  onSubmit,
  isDragActive,
  queuedDraft,
  onEditQueuedDraft,
  onDeleteQueuedDraft,
  attachedImages,
  onRemoveImage,
  uploadingImages,
  imageErrors,
  showFileDropdown,
  filteredFiles,
  selectedFileIndex,
  onSelectFile,
  filteredCommands,
  selectedCommandIndex,
  onCommandSelect,
  onCloseCommandMenu,
  isCommandMenuOpen,
  frequentCommands,
  getRootProps,
  getInputProps,
  openImagePicker,
  inputHighlightRef,
  renderInputWithMentions,
  textareaRef,
  input,
  onVoiceTranscript,
  onInputChange,
  onTextareaClick,
  onTextareaKeyDown,
  onTextareaPaste,
  onTextareaScrollSync,
  onTextareaInput,
  isInputFocused = false,
  onInputFocusChange,
  placeholder,
  isTextareaExpanded,
  sendByCtrlEnter,
}: ChatComposerProps) {
  const { t } = useTranslation('chat');
  const commandMenuPosition = useMemo(() => {
    if (!isCommandMenuOpen) {
      return { top: 0, left: 16, bottom: 90 };
    }
    const textareaRect = textareaRef.current?.getBoundingClientRect();
    return {
      top: textareaRect ? Math.max(16, textareaRect.top - 316) : 0,
      left: textareaRect ? textareaRect.left : 16,
      bottom: textareaRect ? window.innerHeight - textareaRect.top + 8 : 90,
    };
  }, [isCommandMenuOpen, textareaRef]);

  // Voice state is hosted here (not in the mic button) so the main Send button can stop
  // recording and send the transcript in one tap, the way the mic button drops it in the box.
  const voiceAvailable = useVoiceAvailable();
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const voiceErrorTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleVoiceError = useCallback((msg: string) => {
    setVoiceError(msg);
    if (voiceErrorTimer.current) clearTimeout(voiceErrorTimer.current);
    voiceErrorTimer.current = setTimeout(() => setVoiceError(null), 4000);
  }, []);
  useEffect(() => () => {
    if (voiceErrorTimer.current) clearTimeout(voiceErrorTimer.current);
  }, []);
  const noopTranscript = useCallback(() => {}, []);
  const { state: voiceState, toggle: voiceToggle, stop: voiceStop } = useVoiceInput(
    onVoiceTranscript ?? noopTranscript,
    handleVoiceError,
  );
  const isRecording = voiceState === 'recording';
  const isTranscribing = voiceState === 'transcribing';
  const [isEffortDropdownOpen, setIsEffortDropdownOpen] = useState(false);
  // Дропдаун выбора режима прав (щит): портал, чтобы не резался overflow-hidden композера
  const [isModeMenuOpen, setIsModeMenuOpen] = useState(false);
  const [modeMenuPosition, setModeMenuPosition] = useState<{ left: number; top: number } | null>(null);
  const modeMenuRef = useRef<HTMLDivElement | null>(null);
  const modeMenuPanelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!isModeMenuOpen) return;
    const handle = (event: globalThis.MouseEvent) => {
      const target = event.target as Node;
      if (
        modeMenuRef.current && !modeMenuRef.current.contains(target) &&
        modeMenuPanelRef.current && !modeMenuPanelRef.current.contains(target)
      ) {
        setIsModeMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [isModeMenuOpen]);
  const effortDropdownRef = useRef<HTMLDivElement | null>(null);
  const effortDropdownMenuRef = useRef<HTMLDivElement | null>(null);
  const effortDropdownButtonRef = useRef<HTMLButtonElement | null>(null);
  const [effortDropdownPosition, setEffortDropdownPosition] = useState<{
    left: number;
    top: number;
    maxHeight: number;
  } | null>(null);
  const effortOptions = useMemo(
    () => [{ value: 'default' }, ...availableEffortOptions],
    [availableEffortOptions],
  );
  const selectedEffortLabel = effort === 'default' ? 'Default' : effort;
  const updateEffortDropdownPosition = useCallback(() => {
    const rect = effortDropdownButtonRef.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }

    setEffortDropdownPosition({
      left: rect.left,
      top: rect.top - 8,
      maxHeight: Math.max(96, rect.top - 16),
    });
  }, []);

  useEffect(() => {
    if (!isEffortDropdownOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        !effortDropdownRef.current?.contains(target)
        && !effortDropdownMenuRef.current?.contains(target)
      ) {
        setIsEffortDropdownOpen(false);
      }
    };

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        setIsEffortDropdownOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('resize', updateEffortDropdownPosition);
    window.addEventListener('scroll', updateEffortDropdownPosition, true);
    window.addEventListener('keydown', handleKeyDown, { capture: true });
    updateEffortDropdownPosition();

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('resize', updateEffortDropdownPosition);
      window.removeEventListener('scroll', updateEffortDropdownPosition, true);
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
    };
  }, [isEffortDropdownOpen, updateEffortDropdownPosition]);

  // Detect if the AskUserQuestion interactive panel is active
  const hasQuestionPanel = pendingPermissionRequests.some(
    (r) => r.toolName === 'AskUserQuestion'
  );

  // Hide the thinking/status bar while any permission request is pending
  const hasPendingPermissions = pendingPermissionRequests.length > 0;
  const hasActivityIndicator = Boolean(activity && !hasPendingPermissions);

  const hasQueuedDraft = Boolean(queuedDraft);
  const canQueueDraft = isLoading && Boolean(input.trim());
  const submitHint = canQueueDraft
    ? hasQueuedDraft
      ? t('input.hintText.updateQueued', { defaultValue: 'Enter to update queued message' })
      : t('input.hintText.queue', { defaultValue: 'Enter to queue your next message' })
    : sendByCtrlEnter
      ? t('input.hintText.ctrlEnter')
      : t('input.hintText.enter');
  const submitAriaLabel = canQueueDraft
    ? hasQueuedDraft
      ? t('input.queue.update', { defaultValue: 'Update queued message' })
      : t('input.queue.sendNext', { defaultValue: 'Queue next message' })
    : isLoading
      ? t('input.stop')
      : t('input.send');

  return (
    <div className="chat-composer-shell relative flex-shrink-0 px-2 pb-2 pt-0 sm:px-4 sm:pb-4 md:px-4 md:pb-6">
      {!hasPendingPermissions && (
        <div className="mx-auto mb-1 max-w-[45rem] px-1">
          <ActivityIndicator activity={activity} onAbort={onAbortSession} isInputFocused={isInputFocused} />
        </div>
      )}

      {pendingPermissionRequests.length > 0 && (
        <div className="mx-auto mb-3 max-w-[45rem]">
          <PermissionRequestsBanner
            pendingPermissionRequests={pendingPermissionRequests}
            handlePermissionDecision={handlePermissionDecision}
            handleGrantToolPermission={handleGrantToolPermission}
          />
        </div>
      )}

      {queuedDraft && (
        <QueuedMessageCard
          content={queuedDraft.content}
          imageCount={queuedDraft.images.length}
          onEdit={onEditQueuedDraft}
          onDelete={onDeleteQueuedDraft}
        />
      )}

      {!hasQuestionPanel && <div className="relative mx-auto max-w-[45rem]">
        {showFileDropdown && filteredFiles.length > 0 && (
          <div className="absolute bottom-full left-0 right-0 z-50 mb-2 max-h-48 overflow-y-auto rounded-xl border border-border/50 bg-card/95 shadow-lg backdrop-blur-md">
            {filteredFiles.map((file, index) => (
              <div
                key={file.path}
                className={`cursor-pointer touch-manipulation border-b border-border/30 px-4 py-3 last:border-b-0 ${
                  index === selectedFileIndex
                    ? 'bg-primary/8 text-primary'
                    : 'text-foreground hover:bg-accent/50'
                }`}
                onMouseDown={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                }}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onSelectFile(file);
                }}
              >
                <div className="text-sm font-medium">{file.name}</div>
                <div className="font-mono text-xs text-muted-foreground">{file.path}</div>
              </div>
            ))}
          </div>
        )}

        <CommandMenu
          commands={filteredCommands}
          selectedIndex={selectedCommandIndex}
          onSelect={onCommandSelect}
          onClose={onCloseCommandMenu}
          position={commandMenuPosition}
          isOpen={isCommandMenuOpen}
          frequentCommands={frequentCommands}
        />

        <PromptInput
          onSubmit={onSubmit as (event: FormEvent<HTMLFormElement>) => void}
          status={isLoading ? 'streaming' : 'ready'}
          className={[
            isTextareaExpanded ? 'chat-input-expanded' : '',
            hasActivityIndicator ? 'rounded-t-none' : '',
          ].filter(Boolean).join(' ')}
          {...getRootProps()}
        >
          {isDragActive && (
            <div className="absolute inset-0 z-50 flex items-center justify-center rounded-2xl border-2 border-dashed border-primary/50 bg-primary/15">
              <div className="rounded-xl border border-border/30 bg-card p-4 shadow-lg">
                <svg className="mx-auto mb-2 h-8 w-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <p className="text-sm font-medium">Drop images here</p>
              </div>
            </div>
          )}

          {attachedImages.length > 0 && (
            <PromptInputHeader>
              <div className="rounded-xl bg-muted/40 p-2">
                <div className="flex flex-wrap gap-2">
                  {attachedImages.map((file, index) => (
                    <ImageAttachment
                      key={index}
                      file={file}
                      onRemove={() => onRemoveImage(index)}
                      uploadProgress={uploadingImages.get(file.name)}
                      error={imageErrors.get(file.name)}
                    />
                  ))}
                </div>
              </div>
            </PromptInputHeader>
          )}

          <input {...getInputProps()} />

          <PromptInputBody>
            <div ref={inputHighlightRef} aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl">
              <div className="chat-input-placeholder block w-full whitespace-pre-wrap break-words px-4 py-2 text-sm leading-6 text-transparent">
                {renderInputWithMentions(input)}
              </div>
            </div>

            <PromptInputTextarea
              ref={textareaRef}
              dir="auto"
              value={input}
              onChange={onInputChange}
              onClick={onTextareaClick}
              onKeyDown={onTextareaKeyDown}
              onPaste={onTextareaPaste}
              onScroll={(event) => onTextareaScrollSync(event.target as HTMLTextAreaElement)}
              onFocus={() => onInputFocusChange?.(true)}
              onBlur={() => onInputFocusChange?.(false)}
              onInput={onTextareaInput}
              placeholder={placeholder}
            />
        </PromptInputBody>

        <PromptInputFooter>
          <PromptInputTools>
            <PromptInputButton
              tooltip={{ content: t('input.attachImages') }}
              onClick={openImagePicker}
              className="text-muted-foreground hover:text-foreground"
            >
              <Paperclip />
            </PromptInputButton>

            <div ref={modeMenuRef} className="relative">
              <button
                type="button"
                onClick={(e) => {
                  if (availablePermissionModes && availablePermissionModes.length > 0 && onSelectPermissionMode) {
                    const rect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect();
                    setModeMenuPosition({ left: rect.left, top: rect.top - 6 });
                    setIsModeMenuOpen((open) => !open);
                  } else {
                    onModeSwitch();
                  }
                }}
                className={`inline-flex h-8 w-8 items-center justify-center rounded-md transition-all duration-200 hover:bg-secondary active:scale-[0.94] ${
                  permissionMode === 'acceptEdits'
                    ? 'text-green-600 dark:text-green-400'
                    : permissionMode === 'auto'
                      ? 'text-blue-500'
                      : permissionMode === 'bypassPermissions'
                        ? 'text-orange-500'
                        : 'text-primary'
                }`}
                title={`${t('input.clickToChangeMode')}: ${
                  permissionMode === 'default' ? t('codex.modes.default')
                  : permissionMode === 'acceptEdits' ? t('codex.modes.acceptEdits')
                  : permissionMode === 'auto' ? t('codex.modes.auto')
                  : permissionMode === 'bypassPermissions' ? t('codex.modes.bypassPermissions')
                  : t('codex.modes.plan')}`}
              >
                <ShieldIcon className="h-[15px] w-[15px]" />
              </button>
              {isModeMenuOpen && modeMenuPosition && availablePermissionModes && onSelectPermissionMode && createPortal(
                <div
                  ref={modeMenuPanelRef}
                  className="fixed z-[100] w-48 animate-fade-in overflow-hidden rounded-md border border-border bg-card p-1 shadow-lg"
                  style={{ left: modeMenuPosition.left, top: modeMenuPosition.top, transform: 'translateY(-100%)' }}
                  role="menu"
                >
                  {availablePermissionModes.map((mode) => {
                    const isActive = mode === permissionMode;
                    return (
                      <button
                        key={mode}
                        type="button"
                        className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-[12.5px] transition-colors ${
                          isActive ? 'bg-primary-tint font-semibold text-primary' : 'text-foreground hover:bg-secondary'
                        }`}
                        onClick={() => {
                          onSelectPermissionMode(mode);
                          setIsModeMenuOpen(false);
                        }}
                      >
                        <span className={`h-2 w-2 flex-shrink-0 rounded-full ${MODE_DOT_CLASS[mode] ?? 'bg-muted-foreground'}`} />
                        <span className="min-w-0 flex-1 truncate">{t(`codex.modes.${mode}`)}</span>
                        {isActive && <Check className="h-3 w-3 flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>,
                document.body,
              )}
            </div>

            {availableEffortOptions.length > 0 && (
              <div ref={effortDropdownRef} className="relative">
                <button
                  ref={effortDropdownButtonRef}
                  type="button"
                  onClick={() => {
                    updateEffortDropdownPosition();
                    setIsEffortDropdownOpen((current) => !current);
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-all duration-200 hover:bg-secondary hover:text-foreground active:scale-[0.94]"
                  aria-haspopup="menu"
                  aria-expanded={isEffortDropdownOpen}
                  aria-label="Select reasoning effort"
                  title="Select reasoning effort"
                >
                  <SlidersHorizontal className="h-[15px] w-[15px]" />
                </button>

                {isEffortDropdownOpen && effortDropdownPosition && createPortal(
                  <div
                    ref={effortDropdownMenuRef}
                    className="fixed z-[100] w-48 animate-fade-in overflow-y-auto rounded-md border border-border bg-card p-1 shadow-lg"
                    style={{
                      left: effortDropdownPosition.left,
                      top: effortDropdownPosition.top,
                      maxHeight: effortDropdownPosition.maxHeight,
                      transform: 'translateY(-100%)',
                    }}
                    role="menu"
                  >
                    {effortOptions.map((option) => {
                      const isSelected = option.value === effort;
                      const label = option.value === 'default' ? 'Default' : option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          role="menuitemradio"
                          aria-checked={isSelected}
                          onClick={() => {
                            onSelectEffort(option.value);
                            setIsEffortDropdownOpen(false);
                          }}
                          className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-[12.5px] capitalize transition-colors ${
                            isSelected
                              ? 'bg-primary-tint font-semibold text-primary'
                              : 'text-foreground hover:bg-secondary'
                          }`}
                        >
                          <span className="flex h-3 w-3 items-center justify-center">
                            {isSelected && <Check className="h-3 w-3 text-primary" />}
                          </span>
                          <span>{label}</span>
                        </button>
                      );
                    })}
                  </div>,
                  document.body,
                )}
              </div>
            )}

            <TokenUsageSummary usage={tokenBudget} onClick={onShowTokenUsage} />

            <PromptInputButton
              tooltip={{ content: t('input.showAllCommands') }}
              onClick={onToggleCommandMenu}
              className="relative text-muted-foreground hover:text-foreground"
            >
              <MessageSquareIcon />
            </PromptInputButton>

          </PromptInputTools>

          <div className="flex items-center gap-2">
            {/* Пустое поле + доступен голос → большой mic (по макету); иначе — send */}
            {(() => {
              const showMic = Boolean(
                onVoiceTranscript && !input.trim() && !isLoading && !isTranscribing && !canQueueDraft,
              );
              if (showMic) {
                return (
                  <span className="relative inline-flex">
                    {voiceError && (
                      <span className="absolute bottom-full left-1/2 mb-1 -translate-x-1/2 whitespace-nowrap rounded bg-red-600 px-2 py-1 text-xs text-white shadow-lg">
                        {voiceError}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        voiceToggle();
                      }}
                      className={`flex h-7 w-7 items-center justify-center rounded-lg transition-all active:scale-[0.94] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring ${
                        isRecording
                          ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                          : 'bg-primary-tint text-primary hover:bg-primary-tint/70'
                      }`}
                      aria-label={isRecording ? 'Stop recording' : 'Voice input'}
                      title={isRecording ? 'Stop recording' : 'Voice input'}
                    >
                      {isRecording ? <Square className="h-3.5 w-3.5" /> : <Mic className="h-4 w-4" />}
                    </button>
                  </span>
                );
              }
              return (
                <PromptInputSubmit
                  onClick={
                    canQueueDraft
                      ? (e: MouseEvent<HTMLButtonElement>) => {
                          e.preventDefault();
                          onSubmit(e);
                        }
                      : isLoading
                        ? onAbortSession
                        : isRecording
                          ? (e: MouseEvent<HTMLButtonElement>) => {
                              e.preventDefault();
                              voiceStop({ send: true });
                            }
                          : undefined
                  }
                  disabled={isLoading ? false : isRecording ? false : isTranscribing ? true : !input.trim()}
                  aria-label={submitAriaLabel}
                  title={submitAriaLabel}
                  className="h-7 w-7 rounded-lg sm:h-7 sm:w-7"
                >
                  {isTranscribing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : canQueueDraft ? (
                    <ArrowUpIcon className="h-4 w-4" />
                  ) : undefined}
                </PromptInputSubmit>
              );
            })()}
          </div>
        </PromptInputFooter>
      </PromptInput>
      <div className="mt-2 text-center text-[11px] text-muted-foreground">{submitHint}</div>
      </div>}
    </div>
  );
}
