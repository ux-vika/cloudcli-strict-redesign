# Handoff: CloudCLI — Strict Themes (Light & Dark)

## Overview
Redesign of CloudCLI in the **"strict"** visual direction, delivered in two color modes: **Strict Light** and **Strict Dark**. The redesign modernizes typography, iconography, controls, and color while keeping the original **content and element layout 1:1** with the shipped app (v1.36.1). Target audience: 20–35, modern/clean aesthetic.

Scope now covers **nine screens**: Main (chat), Files (code editor), Settings, Project Creation Wizard, Command Palette, Quick Settings, Source Control (Git), Onboarding, and Task Master — each in both strict modes. An **interactive prototype** of the light mode also exists in the source project (`CloudCLI Prototype.dc.html`).

Only the two strict-mode themes are in scope for this handoff.

## About the Design Files
The files in this bundle are **design references created in HTML** — prototypes showing the intended look and behavior, **not** production code to copy directly. The task is to **recreate these designs in CloudCLI's existing codebase** (React + Vite + Tailwind, per the repo) using its established components, tokens, and patterns. Where the app already has a theming mechanism, wire these two palettes into it as a light/dark pair.

Reference files (each self-contained — fonts via Google Fonts link, Claude glyph inlined as data URI; open directly in a browser):
- `CloudCLI-strict-light.html` / `CloudCLI-strict-dark.html` — **Main** (sidebar + chat)
- `CloudCLI-files-strict-light.html` / `CloudCLI-files-strict-dark.html` — **Files** (file tree + code editor)
- `CloudCLI-settings-strict-light.html` / `CloudCLI-settings-strict-dark.html` — **Settings** (modal, Appearance tab)
- `CloudCLI-wizard-strict-light.html` / `CloudCLI-wizard-strict-dark.html` — **Project Creation Wizard** (step 1)
- `CloudCLI-palette-strict-light.html` / `CloudCLI-palette-strict-dark.html` — **Command Palette** (⌘K)
- `CloudCLI-quicksettings-strict-light.html` / `-dark.html` — **Quick Settings** (right drawer)
- `CloudCLI-git-strict-light.html` / `-dark.html` — **Source Control** (branch header, changes, diff)
- `CloudCLI-onboarding-strict-light.html` / `-dark.html` — **Onboarding** (Connect Agents step)
- `CloudCLI-tasks-strict-light.html` / `-dark.html` — **Task Master** (kanban board)

Note: the Main-screen references reflect the compact conversation column (720px, ChatGPT-like density).

## Fidelity
**High-fidelity (hifi).** Final colors, typography, spacing, radii, and states are specified below and should be reproduced precisely using the codebase's existing libraries/patterns. The two modes are identical in structure and layout — only tokens differ.

## Screens / Views

### Screen: Main — Sidebar + Session (Chat) view
Full-app single screen, split into a fixed left sidebar and a flexible main column.

**Layout**
- Root: horizontal flex, `100%` height. Light canvas `#FFFFFF`; Dark canvas `#0F1115` (1px border `#262A33`). Corner radius on the app frame 12px (prototype only — full app is edge-to-edge).
- **Sidebar**: fixed width **296px**, `flex-shrink:0`, full-height vertical flex, 1px right border. Sections top→bottom:
  1. **Brand row** (padding 16/16/12): 30×30 rounded-6 accent tile with white chat glyph; wordmark "CloudCLI" (15.5px/700, letter-spacing −0.01em); two 28×28 ghost icon buttons (refresh, panel-toggle) at the end.
  2. **Search** (padding 0/12/10): full-width field, 1px border, radius 6px, padding 7/10; search icon 13px; placeholder "Search projects…" (12.5px); trailing `⌘K` chip (mono 10px).
  3. **Primary nav** (padding 0/12; gap 2): rows padding 8/10, radius 6, 15px icon + 13px label. Items: **New project** (accent, soft tinted row — see New project token), **Projects** (selected: filled neutral bg), **Chats**, **Running**, **Archive**.
  4. **Project list** (flex:1, scroll; padding 12/12/0; gap 2): collapsible project rows (label + chevron). Expanded project **"Передала эстафету"** shows a 2px accent left border + nested items: **New Session** (accent outline row w/ plus), then session rows (Claude glyph 14px + name + right-aligned relative time in mono 10.5px). Sessions: "Install superpowers plugin" (6hr, selected), "открой" (6hr), "/hooks" (1d). Other collapsed projects: обучение-figma+claude, claude-house, dota-tournament, figma-access-question, new-chat, portfolio-deploy.
  5. **Footer** (padding 12/16; 1px top border): **Settings** row (gear 15px) + version string "CloudCLI v1.36.1" (mono 11px, muted).
- **Main column**: flex:1, vertical flex.
  1. **Header** (padding 12/20; 1px bottom border): Claude glyph 26px + title "Install superpowers plugin" (14.5px/700) with subtitle "Передала эстафету" (11.5px muted); right — **segmented tab group** (tray bg, 1px border, radius 8, padding 3): **Chat** (active: accent text + raised surface), **Shell**, **Files**, **Source Control**. Tab = 13px icon + 12.5px/600 label, padding 6/13, radius 6.
  2. **Conversation** (flex:1, scroll; padding 24/40/0), centered column max-width 860px, rendered as **chat bubbles**:
     - **User message** — right-aligned bubble, max-width 560px, radius `14px 14px 4px 14px`, padding 11/16, 14.5px/1.5. Below it, right-aligned: **copy** and **edit** icon buttons (28×28, 14px icons, muted). Sample text: "С чего начать редизайн проекта?" *(placeholder — replace with the real user turn from session data).*
     - **Assistant message** — left-aligned bubble, max-width 720px, surface bg, 1px border, radius `14px 14px 14px 4px`, padding 16/20, 14.5px/1.65. Contains the full markdown answer: two lead bullets (🔗 upstream…, 📄 Открыт в новом окне VSCode…), H2 "Важный момент про «где я»", paragraphs, a bulleted list with an inline-code chip, H2 "С чего начнём редизайн (когда перейдёшь в то окно)", an ordered list with `npm install` / `src/` code chips, a divider, closing paragraphs, and a right-aligned footer (MD-format chip + read-aloud icon). Reproduce copy verbatim from the reference file.
  3. **Composer** (padding 12/40/16), centered max-width 860px:
     - Input card: surface bg, 1px border, radius 10px, padding 14/16. Placeholder "Type / for commands, @ for files, or ask Claude anything…" (13.5px muted).
     - **Toolbar row** (gap 4): five ghost icon buttons **30×30** (15px icons) — **attach (paperclip)**, **permissions (shield, accent-colored)**, **modes (sliders)**, **running (activity)**, **files (folder)** — and a right-aligned **mic** button **38×38** (20px icon) with an accent-tinted fill (primary voice action).
     - Hint line (centered, 11px muted): "Enter to send · Shift+Enter for new line · Tab to change modes · / for slash commands".

**Interactive states** (both modes)
- Sidebar nav / project / session rows: hover = subtle neutral fill.
- Icon buttons: hover = neutral fill + stronger icon color; keyboard focus = 2px accent outline, 1px offset. Hit areas ≥30px (composer) / 28px (message actions).
- Tabs: active = accent text on raised surface; inactive = muted, hover neutral fill.

### Screen: Files — File Tree + Code Editor (Files tab)
Two-pane layout inside the main column (app sidebar + header/tabs unchanged; **Files** tab active).
- **File tree panel**: fixed **300px**, 1px right border. Sub-header: title "Files" + toolbar of 26×26 ghost icon buttons (upload, new file, new folder, refresh, divider, view-mode/list — active tinted) + a search field ("Search files…"). Tree rows: padding 4px + `level*16px` indent, 5px radius; chevron (13px, rotates 90° when open) + folder/file icon (open folder = accent) + name (13px; folders 600 weight). Selected file row = accent tint + 2px accent left border. Sample tree: `src › components › session-list › [SessionList.tsx active] · SessionRow.tsx · index.ts`, plus collapsed `sidebar`, `code-editor`, `hooks`, and root `App.tsx`, `main.tsx`, `package.json`, `tailwind.config.js`, `README.md`.
- **Editor**: header = filename "SessionList.tsx" (13.5px/600) + "Modified" chip (accent tint) + path (mono 11px) + right-side ghost buttons (preview, settings, download, **save** accent-tinted, fullscreen, close — 28×28, 15px). Code surface: `JetBrains Mono` 12.5px, line-height 1.75, gutter line numbers (42px, right-aligned, muted), syntax-highlighted (keyword = accent, string = green `#0E7C57`/dark `#3DD68C`, function = purple `#8250DF`/dark `#C29CFF`, comment = muted). Footer status bar (muted mono): "Lines 17 · Characters 486" left, "⌘S save · Esc close · TypeScript" right.

### Screen: Settings (modal)
Centered modal **1000×700**, radius 16, 1px border, heavy shadow, over a dimmed app backdrop.
- Header: title "Settings" (16px/700) + "Saved" status + close (X) button.
- **Left nav** (220px, 1px right border, sidebar-surface bg): icon+label rows (13px, 7px radius, 9/11 padding) — Agents, **Appearance (active: accent tint + accent text + 600)**, Git, API Tokens, Voice, Tasks, Browser, Plugins, Notifications, About.
- **Content** (Appearance tab): H1 "Appearance" (22px/700) + subtitle; uppercase group label (11px, muted, letter-spacing .05em). Rows (14px vertical, 1px bottom divider, last none): title (13.5px/600) + sub (12px muted) on the left, control on the right —
  - **Theme**: segmented control Light/Dark/System (icons: sun/moon/monitor), active = white/surface raised chip + accent text + 1px border.
  - **Language**, **Project sort order**: select control (surface bg, 1px border, 8px radius, chevron-down).
  - Code-editor group: **Word wrap** (toggle off), **Show minimap** (toggle on), **Line numbers** (toggle on), **Font size** (select "14 px").
- **Toggle**: 40×23 pill, radius 20; on = accent fill + white knob shifted right; off = neutral fill + muted knob left.

### Screen: Project Creation Wizard (modal)
Centered modal **660px** wide, radius 16, over a dimmed backdrop.
- Header: 34×34 accent-tint tile with folder-plus icon + title "Создание проекта" (17px/700) + close (X).
- **Progress**: two steps — ① "Настройка" (active: accent-filled 30px circle) — connector bar — ② "Подтверждение" (inactive: neutral circle + muted label).
- **Body** (step 1, ≥280px): field group = label (13px/600) + control + help (12px muted):
  - **Путь к рабочей папке**: mono input + 42px browse (folder) button; help "Проект будет создан в этой папке."
  - **GitHub URL**: mono input; help "Оставьте пустым, чтобы создать пустой проект."
  - **Авторизация GitHub** card (1px border, sidebar-surface bg, 12px radius): github icon + title; segmented token mode Сохранённый/Новый токен/Без токена (first active); token select "vika-github-token".
- **Footer**: "Отмена" (outline) left, "Далее ›" (accent primary) right.

### Screen: Command Palette (⌘K)
Centered dialog **640px**, radius 16, near top of a dimmed backdrop.
- Search row: search icon + query text with caret + "esc" kbd chip; 1px bottom border.
- **Grouped list** (max-height ~460, 6px padding): uppercase group headings (11px muted) + rows (9/12 padding, 8px radius, 16px icon + 13.5px label, optional right meta/kbd). Active row = accent tint + accent text/icon + 600. Groups: **Actions** (Start new chat [active], Open settings, Toggle theme), **Git** (Fetch/Pull/Push), **Navigate** (Go to Chat/Files/Shell), **Files** (file rows with mono path meta).
- **Footer hint bar** (sidebar-surface, mono): `↑↓` навигация · `↵` выбрать · `⌫` назад · right-aligned `⌘K`.

### Screen: Quick Settings (right drawer)
Right-anchored panel **288px**, full height, 1px left border + left shadow, over a dimmed backdrop.
- Header: title "Быстрые настройки" (15px/700) + close.
- Sections with uppercase labels: Оформление (Тёмная тема toggle, Язык select), Отображение инструментов (Сырые параметры, Показывать thinking), Ввод (Ctrl+Enter, Голосовой ввод + description). Setting rows: sidebar-surface bg, 1px border, 9px radius, icon 15px + 13px label + toggle.

### Screen: Source Control (Git tab)
Inside the app shell, **Source Control** tab active.
- **Git header**: branch selector chip (git-branch icon + "main" + `↑2` green / `↓1` accent mono + chevron) left; right — **Fetch** (accent), **Pull 1** (green `#0E7C57`), **Push 2** (orange `#C2410C`) buttons + revert/refresh ghost icons.
- **View tabs** (full-width, underline style): Changes (+count pill) / Commits / Branches; active = accent text + 2px accent underline.
- **Changes view**: commit box (sidebar-surface card: placeholder + "Сгенерировать" sparkles chip + accent Commit button); STAGED CHANGES / CHANGES sections with file rows (20px status chip M/U/D on tinted bg + name + mono path); expandable **diff block** — header (chip + filename + `+4 −2` mono) and +/- lines on tinted backgrounds with gutter numbers.
- Diff tokens light: del bg `#FDECEA` text `#7A271A`; add bg `#E6F4EC` text `#134E2C`. Dark: del `#2E1210`/`#F5B3AD`; add `#0F2A1B`/`#9BE3BC`.

### Screen: Onboarding (Connect Agents step)
Full-screen welcome: dot-grid background (22px, ~6% fg) + top accent glow (blurred radial), centered column **620px**.
- **Step progress**: ① Git Configuration — completed (green `#0E7C57` filled circle + check, "Required" red note) — green connector — ② Connect Agents — active (accent filled circle).
- **Card** (radius 16, 1px border, large soft shadow): centered H2 + subtitle; provider rows — 38px icon tile + title/sub + right state: **Подключён** (green check, accent-tinted card) or **Войти** (accent button). Providers: Claude Code, Cursor, OpenAI Codex, OpenCode (real brand icons; white variants in dark mode).
- Footer: Назад (ghost) / **Завершить настройку** (green filled + shadow).

### Screen: Task Master (Tasks tab)
Inside the app shell, **Tasks** tab active (5th tab in the group).
- **Toolbar**: search field (Поиск задач…), view-mode segmented (kanban active / list / grid), Фильтры outline button, **PRDs·2** purple button (light `#6D28D9` on `#F1EAFE`; dark `#B79DF5` on `#241A38`), **+ Задача** accent button.
- **Kanban**: 3 columns with tinted headers — Pending (neutral), In Progress (accent tint), Done (green tint) + mono count. Cards: mono id chip, title 13px/600, priority icon (high = red chevron-up tile, medium = amber minus, low = accent dot), status dot + label, subtask progress bar (accent/green fill + `n/m` mono).

## Interactions & Behavior
- **Tab switch** (Chat / Shell / Files / Source Control) swaps the main panel; Chat shown here.
- **Composer**: Enter sends; Shift+Enter newline; Tab cycles modes; `/` opens slash commands; `@` file reference; mic toggles voice input.
- **Message actions**: copy (copies message text), edit (edits the user turn).
- **Sidebar**: project rows expand/collapse (chevron rotates); "New project" and "New Session" are primary actions; search filters projects (`⌘K` focus).
- No custom animations beyond standard hover/focus transitions (~120–150ms ease).

## State Management
- `theme`: `'strict-light' | 'strict-dark'` (drives the token set below).
- `activeTab`: `'chat' | 'shell' | 'files' | 'source-control'`.
- `expandedProjects`: set of expanded project ids.
- `selectedProjectId`, `selectedSessionId`.
- `composerValue`, `composerMode`, `isRecording`.
- `messages[]`: `{ role: 'user' | 'assistant', content (markdown), timestamp }` — rendered as bubbles.

## Design Tokens

### Shared
- **Fonts**: UI — `Instrument Sans` (400/500/600/700). Mono/technical (times, versions, code chips, kbd) — `JetBrains Mono` (400/500/600).
- **Type**: H2 20px/700 (−0.01em); body 14.5px/1.65; UI label 13px; small/meta 11–12.5px; code chip 12.5px mono.
- **Radii**: app frame 12px; cards/inputs 10px; rows/buttons 6px; message-action buttons 6px; bubbles `14px 14px 14px 4px` (assistant) / `14px 14px 4px 14px` (user); pills/tags 20px.
- **Icon sizes**: nav 15px; header/tab 13px; composer toolbar 15px (30px button); mic 20px (38px button); message actions 14px (28px button).
- **Focus ring**: 2px accent, 1px offset.

### Strict Light
- Accent (primary/navy): `#1D4ED8`
- Accent tint (fills/hover): `#EEF2FE`; accent border: `#C7D5F5`
- App canvas: `#FFFFFF`; sidebar: `#F7F8FA`; surfaces (cards, composer, bubbles): `#FFFFFF`
- Neutral fills: `#EEF0F3`; secondary fill: `#E9ECF1`; selected nav fill: `#E9ECF1`
- Borders / dividers: `#E2E5EA`
- Text: primary `#111827`; body `#374151`; secondary `#4B5563`; muted `#6B7280`; faint `#9AA1AD`
- User bubble: bg `#EAF0FB`, text `#1F2937`
- **New project** row: bg `#DCE4FB`, 1px border `#C0CFF6`, text/icon `#1D4ED8`, hover bg `#D2DCF9`
- Syntax (code editor): keyword `#1D4ED8`, string `#0E7C57`, function `#8250DF`, comment `#8A93A3`, line numbers `#B6BCC7`

### Strict Dark
- Accent (primary): `#5B8DEF` (glyph-on-accent uses `#0E0F12`)
- Accent tint: `#1A2436`; accent border: `#31405F`
- App canvas: `#0F1115` (frame border `#262A33`); sidebar: `#12141A`; surfaces (cards, composer, assistant bubble): `#14161C`
- Neutral fills: `#1E212A`; secondary fill: `#1A1D25`
- Borders / dividers: `#262A33`
- Text: primary `#F0F2F5`; body `#C7CBD3`; secondary `#AEB4BF`; muted `#858C99`; faint `#6B7280`
- User bubble: bg `#243149`, text `#E6EAF2`
- Selected session row fill: `#26292F`; expanded-project panel: subtle `#1B1D22`-class surface with 2px accent left border
- Syntax (code editor): keyword `#5B8DEF`, string `#3DD68C`, function `#C29CFF`, comment `#7C8492`, line numbers `#4C525E`

### Spacing
- Screen paddings: sidebar sections 12–20px; header 12/20; conversation 24/40; composer 12/40/16.
- Common gaps: 2px (list rows), 4px (composer toolbar), 8–10px (row internals), 12px (bubble/avatar), 20–26px (section rhythm).

## Assets
- **Claude glyph** — inlined in each reference file as an SVG data URI (originally `public/icons/claude-ai-icon.svg` in the repo). Use the codebase's existing asset.
- **All other icons** are inline SVGs in the outline/lucide style (paperclip, shield, sliders, activity, folder, mic, search, gear, chevrons, refresh, panel, copy, pencil, speaker). Map to the codebase's existing icon set (e.g. lucide-react) — do not ship the prototype SVGs.
- No raster images.

## Files
- `CloudCLI-strict-light.html` / `-dark.html` — Main (sidebar + chat, compact 720px column).
- `CloudCLI-files-strict-light.html` / `-dark.html` — Files (tree + editor).
- `CloudCLI-settings-strict-light.html` / `-dark.html` — Settings modal.
- `CloudCLI-wizard-strict-light.html` / `-dark.html` — Project Creation Wizard.
- `CloudCLI-palette-strict-light.html` / `-dark.html` — Command Palette.
- `CloudCLI-quicksettings-strict-light.html` / `-dark.html` — Quick Settings drawer.
- `CloudCLI-git-strict-light.html` / `-dark.html` — Source Control.
- `CloudCLI-onboarding-strict-light.html` / `-dark.html` — Onboarding.
- `CloudCLI-tasks-strict-light.html` / `-dark.html` — Task Master kanban.
- Source of truth (all screens + themes on one canvas): `CloudCLI Redesign.dc.html` — Main `#1c`/`#1d`, Files `#2a`/`#2b`, Settings `#3a`/`#3b`, Wizard `#4a`/`#4b`, Palette `#5a`/`#5b`, Quick Settings `#6a`/`#6b`, Git `#7a`/`#7b`, Onboarding `#8a`/`#8b`, Tasks `#9a`/`#9b`.
- Interactive light-mode prototype: `CloudCLI Prototype.dc.html` (tabs, chat send, palette ⌘K, settings modal, quick drawer, kanban advance).
