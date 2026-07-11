# Handoff: CloudCLI — Strict Themes (Light & Dark)

## Overview
Redesign of the CloudCLI main screen (sidebar + chat/session view) in the **"strict"** visual direction, delivered in two color modes: **Strict Light** and **Strict Dark**. The redesign modernizes typography, iconography, controls, and color while keeping the original **content and element layout 1:1** with the shipped app (v1.36.1). Target audience: 20–35, modern/clean aesthetic.

Only the two strict-mode themes are in scope for this handoff.

## About the Design Files
The files in this bundle are **design references created in HTML** — prototypes showing the intended look and behavior, **not** production code to copy directly. The task is to **recreate these designs in CloudCLI's existing codebase** (React + Vite + Tailwind, per the repo) using its established components, tokens, and patterns. Where the app already has a theming mechanism, wire these two palettes into it as a light/dark pair.

Reference files:
- `CloudCLI-strict-light.html` — Strict Light mode
- `CloudCLI-strict-dark.html` — Strict Dark mode

Each is a self-contained HTML file (fonts via Google Fonts link, the Claude glyph inlined as a data URI). Open directly in a browser to inspect.

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

### Strict Dark
- Accent (primary): `#5B8DEF` (glyph-on-accent uses `#0E0F12`)
- Accent tint: `#1A2436`; accent border: `#31405F`
- App canvas: `#0F1115` (frame border `#262A33`); sidebar: `#12141A`; surfaces (cards, composer, assistant bubble): `#14161C`
- Neutral fills: `#1E212A`; secondary fill: `#1A1D25`
- Borders / dividers: `#262A33`
- Text: primary `#F0F2F5`; body `#C7CBD3`; secondary `#AEB4BF`; muted `#858C99`; faint `#6B7280`
- User bubble: bg `#243149`, text `#E6EAF2`
- Selected session row fill: `#26292F`; expanded-project panel: subtle `#1B1D22`-class surface with 2px accent left border

### Spacing
- Screen paddings: sidebar sections 12–20px; header 12/20; conversation 24/40; composer 12/40/16.
- Common gaps: 2px (list rows), 4px (composer toolbar), 8–10px (row internals), 12px (bubble/avatar), 20–26px (section rhythm).

## Assets
- **Claude glyph** — inlined in each reference file as an SVG data URI (originally `public/icons/claude-ai-icon.svg` in the repo). Use the codebase's existing asset.
- **All other icons** are inline SVGs in the outline/lucide style (paperclip, shield, sliders, activity, folder, mic, search, gear, chevrons, refresh, panel, copy, pencil, speaker). Map to the codebase's existing icon set (e.g. lucide-react) — do not ship the prototype SVGs.
- No raster images.

## Files
- `CloudCLI-strict-light.html` — Strict Light reference (self-contained).
- `CloudCLI-strict-dark.html` — Strict Dark reference (self-contained).
- Source of truth for both (all 4 explored themes on one canvas): `CloudCLI Redesign.dc.html` in the project root — options `#1c` (Strict Light) and `#1d` (Strict Dark).
