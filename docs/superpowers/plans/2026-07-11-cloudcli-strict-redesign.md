# CloudCLI Strict Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Привести главный экран CloudCLI (сайдбар + вкладка Chat) к визуальному направлению «strict» в двух режимах (Strict Light / Strict Dark), меняя только оформление.

**Architecture:** Заменяем значения strict-палитры в штатной системе тем (shadcn/ui: `:root` / `.dark`, HSL-токены; переключатель `.dark` бинарный). Добавляем недостающие токены и шрифты (Instrument Sans + JetBrains Mono). Компоненты главного экрана перекрашиваем классами, ссылаясь на токены; структурное изменение одно — переключатель режимов сайдбара выносится из шапки в отдельный вертикальный `SidebarNav`.

**Tech Stack:** React 18 + Vite + Tailwind (shadcn/ui, `@tailwindcss/typography`), lucide-react, `@fontsource/*`.

## Global Constraints

- **Node 22 для всех команд:** префиксить `export PATH="/opt/homebrew/opt/node@22/bin:$PATH"`. Глобальный node v26 ломает сборку.
- **Dev-окружение:** клиент `http://localhost:5180`, бэкенд `:3010` (см. `.env`, gitignored). Макеты — `http://localhost:8123/CloudCLI-strict-light.html` и `.../CloudCLI-strict-dark.html`. Панель браузера авторизуется инъекцией JWT в `localStorage['auth-token']` (см. память `dev-auth-setup`).
- **Не трогать** проекты `~/portfolio-deploy` и `~/Documents/redesign-claude-code` (последний держит порты 3001/5173/5174).
- **Объём:** только сайдбар + вкладка Chat. Shell/Files/Source Control/Settings/логин/диалоги/мобайл — структурно не менять (унаследуют токены).
- **Контент/раскладка** главного экрана = оригинал v1.36.1, кроме сайдбара, который делаем по макету. Реальные табы (включая Browser/Tasks/плагины, если есть) НЕ удалять — только перекрашивать.
- **Иконки** — только из lucide-react; глиф Claude — существующий ассет. Прототипные SVG не переносить.
- **Коммиты** на русском; заканчивать строкой `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`. **Перед `git commit`/`push` — спрашивать пользователя** (правило пользователя; коммит-шаги в плане выполнять только после подтверждения).
- **Верификация** каждого визуального шага: `npm run typecheck` + скриншот региона приложения → сравнение с тем же регионом макета. «Тест» здесь = визуальный диф, юнит-тестов нет.
- **Токены** — источник истины по цвету: hex из спеки (`docs/superpowers/specs/2026-07-11-cloudcli-strict-redesign-design.md`). В `src/index.css` хранятся HSL-тройками.

---

### Task 1: Фундамент — шрифты и strict-токены

**Files:**
- Modify: `package.json` (зависимости `@fontsource/instrument-sans`, `@fontsource/jetbrains-mono`)
- Modify: `src/index.css` (импорт шрифтов; блоки `:root` и `.dark`; `body` font-family; обнуление glass)
- Modify: `tailwind.config.js` (`fontFamily.sans`, `fontFamily.mono`, новые цвета)
- Modify: `src/contexts/ThemeContext.jsx:44,58` (meta theme-color под strict canvas)

**Interfaces:**
- Produces: CSS-переменные `--sidebar`, `--primary-tint`, `--primary-tint-border`, `--np-bg`, `--np-border`, `--np-text`, `--np-bg-hover`, `--user-bubble-bg`, `--user-bubble-text`, `--nav-selected`; Tailwind-классы `bg-sidebar`, `bg-primary-tint`, `text-np`, `bg-np`, `bg-user-bubble`, `bg-nav-selected` и т.п.; `font-mono` (JetBrains Mono), UI-шрифт Instrument Sans.

- [ ] **Step 1: Установить шрифтовые пакеты**

```bash
export PATH="/opt/homebrew/opt/node@22/bin:$PATH"
npm install @fontsource/instrument-sans @fontsource/jetbrains-mono
```

- [ ] **Step 2: Сгенерировать HSL-тройки из hex-палитры**

Запусти скрипт (детерминированная конвертация, чтобы не считать вручную). Вставь в него полную палитру из спеки и сверь вывод.

```bash
export PATH="/opt/homebrew/opt/node@22/bin:$PATH"
node -e '
const hexToHsl=(h)=>{h=h.replace("#","");const r=parseInt(h.slice(0,2),16)/255,g=parseInt(h.slice(2,4),16)/255,b=parseInt(h.slice(4,6),16)/255;const mx=Math.max(r,g,b),mn=Math.min(r,g,b);let hh=0,s=0,l=(mx+mn)/2;const d=mx-mn;if(d){s=d/(1-Math.abs(2*l-1));switch(mx){case r:hh=((g-b)/d)%6;break;case g:hh=(b-r)/d+2;break;default:hh=(r-g)/d+4;}hh*=60;if(hh<0)hh+=360;}return `${hh.toFixed(1)} ${(s*100).toFixed(1)}% ${(l*100).toFixed(1)}%`;};
const P={light:{"--background":"#FFFFFF","--sidebar":"#F7F8FA","--card":"#FFFFFF","--primary":"#1D4ED8","--primary-tint":"#EEF2FE","--primary-tint-border":"#C7D5F5","--secondary":"#E9ECF1","--nav-selected":"#E9ECF1","--muted":"#EEF0F3","--border":"#E2E5EA","--input":"#E2E5EA","--foreground":"#111827","--muted-foreground":"#6B7280","--user-bubble-bg":"#EAF0FB","--user-bubble-text":"#1F2937","--np-bg":"#DCE4FB","--np-border":"#C0CFF6","--np-text":"#1D4ED8","--np-bg-hover":"#D2DCF9"},dark:{"--background":"#0F1115","--sidebar":"#12141A","--card":"#14161C","--primary":"#5B8DEF","--primary-tint":"#1A2436","--primary-tint-border":"#31405F","--secondary":"#1A1D25","--nav-selected":"#26292F","--muted":"#1E212A","--border":"#262A33","--input":"#262A33","--foreground":"#F0F2F5","--muted-foreground":"#858C99","--user-bubble-bg":"#243149","--user-bubble-text":"#E6EAF2","--np-bg":"#1A2436","--np-border":"#31405F","--np-text":"#5B8DEF","--np-bg-hover":"#22304a"}};
for(const mode of ["light","dark"]){console.log("\n== "+mode+" ==");for(const[k,v]of Object.entries(P[mode]))console.log(`    ${k}: ${hexToHsl(v)};`);}
'
```

- [ ] **Step 3: Прописать токены в `src/index.css`**

В `@layer base { :root { ... } }` заменить значения на strict-light из вывода Step 2 и добавить новые токены. В `.dark { ... }` — strict-dark. Обнулить glass: в `.nav-glass` фон сделать `hsl(var(--sidebar))` без blur, либо убрать `backdrop-blur-sm` в потребителях (см. Task 3/файл `SidebarContent.tsx:197`). Сверху файла добавить импорты:

```css
@import "@fontsource/instrument-sans/400.css";
@import "@fontsource/instrument-sans/500.css";
@import "@fontsource/instrument-sans/600.css";
@import "@fontsource/instrument-sans/700.css";
@import "@fontsource/jetbrains-mono/400.css";
@import "@fontsource/jetbrains-mono/500.css";
@import "@fontsource/jetbrains-mono/600.css";
```

Заменить `body { font-family: "Encode Sans", ... }` на `"Instrument Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;`.

- [ ] **Step 4: Добавить цвета/шрифты в `tailwind.config.js`**

В `theme.extend.fontFamily.sans` заменить `"Encode Sans"` на `"Instrument Sans"`; добавить `mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace']`. В `theme.extend.colors` добавить: `sidebar: "hsl(var(--sidebar))"`, `"primary-tint": "hsl(var(--primary-tint))"`, `"nav-selected": "hsl(var(--nav-selected))"`, `"user-bubble": { DEFAULT: "hsl(var(--user-bubble-bg))", foreground: "hsl(var(--user-bubble-text))" }`, `np: { DEFAULT: "hsl(var(--np-bg))", border: "hsl(var(--np-border))", foreground: "hsl(var(--np-text))" }`.

- [ ] **Step 5: Обновить meta theme-color**

`src/contexts/ThemeContext.jsx`: строка ~44 → `'#0F1115'` (dark canvas), строка ~58 → `'#FFFFFF'` (light canvas).

- [ ] **Step 6: Проверка**

```bash
export PATH="/opt/homebrew/opt/node@22/bin:$PATH"
npm run typecheck
```
Ожидается: без ошибок. Затем скриншот `http://localhost:5180` — фон/текст/акцент стали strict (белый canvas, синий акцент в light), шрифт — Instrument Sans. Переключить `.dark` (тумблер темы) — canvas `#0F1115`. Пока верстка компонентов старая — проверяем только палитру и шрифт.

- [ ] **Step 7: Commit (после подтверждения пользователя)**

```bash
git add package.json package-lock.json src/index.css tailwind.config.js src/contexts/ThemeContext.jsx
git commit -m "feat(redesign): strict-токены и шрифты (Instrument Sans + JetBrains Mono)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 2: Сайдбар — бренд-строка и поиск

**Files:**
- Modify: `src/components/sidebar/view/subcomponents/SidebarHeader.tsx`
- Modify: `src/components/sidebar/view/subcomponents/SidebarContent.tsx:197` (фон `bg-sidebar`, убрать `backdrop-blur-sm`)

**Interfaces:**
- Consumes: strict-токены из Task 1.
- Produces: шапка без GitHub-значка и без кнопки Plus; поиск в strict-стиле. (Переключатель режимов из шапки будет удалён в Task 3 — здесь пока оставить.)

- [ ] **Step 1: Прочитать `SidebarHeader.tsx` целиком** (уже известен: бренд-блок `LogoBlock` строки 64–78; иконки refresh/Plus/PanelLeftClose строки 100–133; `<GitHubStarBadge />` строка 136; поиск строки 209–236).

- [ ] **Step 2: Бренд-строка под макет**

Плитку `LogoBlock` (строка 66) увеличить до `h-[30px] w-[30px] rounded-md bg-primary` с глифом Claude 3.5→нужного размера (белый). Вордмарк оставить, привести к 15.5px/700 (`text-[15.5px] font-bold tracking-[-0.01em]`). В блоке иконок (строки 100–133) **удалить кнопку Plus** (строки 115–123) — New project уедет в nav. Кнопки refresh и PanelLeftClose привести к 28×28 (`h-7 w-7`), ghost, hover `bg-secondary`.

- [ ] **Step 3: Убрать GitHub-значок**

Удалить `<GitHubStarBadge />` (строка 136) и импорт (строка 10) в десктоп-версии. (Файл `GitHubStarBadge.tsx` не удалять — может использоваться где-то ещё; проверить `grep -rn GitHubStarBadge src`.)

- [ ] **Step 4: Поиск под strict**

Инпут (строки 209–236): border 1px `border-border`, `rounded-md`, `bg-card`, padding 7/10, иконка 13px, плейсхолдер 12.5px, чип `⌘K` — mono 10px (`font-mono text-[10px]`). Убрать класс `nav-search-input` (стеклянный) в пользу сплошного фона.

- [ ] **Step 5: Фон сайдбара**

`SidebarContent.tsx:197`: заменить `bg-background/80 backdrop-blur-sm` на `bg-sidebar`.

- [ ] **Step 6: Проверка**

```bash
export PATH="/opt/homebrew/opt/node@22/bin:$PATH"
npm run typecheck
```
Скриншот верхней части сайдбара `http://localhost:5180` → сравнить с той же зоной макета (`:8123`). Бренд-строка, отсутствие значка/Plus, поиск с `⌘K` совпадают в обоих режимах.

- [ ] **Step 7: Commit (после подтверждения)**

```bash
git add src/components/sidebar/view/subcomponents/SidebarHeader.tsx src/components/sidebar/view/subcomponents/SidebarContent.tsx
git commit -m "feat(redesign): strict бренд-строка и поиск сайдбара

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 3: Сайдбар — вертикальное меню режимов (New project / Projects / Chats / Running / Archive)

**Files:**
- Create: `src/components/sidebar/view/subcomponents/SidebarNav.tsx`
- Modify: `src/components/sidebar/view/subcomponents/SidebarContent.tsx` (рендер `SidebarNav` между `SidebarHeader` и `ScrollArea`; проброс пропсов)
- Modify: `src/components/sidebar/view/subcomponents/SidebarHeader.tsx` (удалить горизонтальный переключатель режимов, строки ~141–208 desktop и ~282–349 mobile)

**Interfaces:**
- Consumes: `searchMode`, `onSearchModeChange`, `onCreateProject`, `runningSessionsCount` (из `SidebarContentProps`, уже прокинуты в `SidebarContent`).
- Produces: компонент `SidebarNav({ searchMode, onSearchModeChange, onCreateProject, runningSessionsCount, t })`.

- [ ] **Step 1: Создать `SidebarNav.tsx`**

Вертикальный список. Пункты: New project (`FolderPlus`, акцентная плашка `bg-np text-np-foreground border border-np-border hover:bg-[hsl(var(--np-bg-hover))]`, `onClick={onCreateProject}`); затем 4 режима — Projects (`Folder`, `'projects'`), Chats (`MessageSquare`, `'conversations'`), Running (`Activity`, `'running'`, бейдж-счётчик если >0), Archive (`Archive`, `'archived'`). Строка: `flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px]`, иконка `h-[15px] w-[15px]`; выбранный режим — `bg-nav-selected text-foreground`, невыбранный — `text-muted-foreground hover:bg-secondary`. Обёртка `px-3 pb-1 pt-1 space-y-0.5`.

- [ ] **Step 2: Подключить в `SidebarContent.tsx`**

Импортировать и отрендерить `<SidebarNav .../>` сразу после `<SidebarHeader .../>` (после закрывающего тега, перед `<ScrollArea>`), передав `searchMode`, `onSearchModeChange`, `onCreateProject`, `runningSessionsCount`, `t`.

- [ ] **Step 3: Удалить старый переключатель из `SidebarHeader.tsx`**

Удалить блок «Search mode toggle» в десктоп-версии (обёртка `flex rounded-lg bg-muted/50 p-0.5`, строки ~142–208) и аналогичный в мобильной (~282–349). Оставить только сам инпут поиска. Пропсы `searchMode`/`onSearchModeChange` в шапке нужны только для плейсхолдера — оставить их использование в `searchPlaceholder`.

- [ ] **Step 4: Проверка**

```bash
export PATH="/opt/homebrew/opt/node@22/bin:$PATH"
npm run typecheck
```
Скриншот сайдбара. Проверить: вертикальное меню как в макете; клики переключают режимы (Projects → список проектов, Chats → поиск бесед, Running, Archive); New project открывает мастер. Сверить оба режима с макетом.

- [ ] **Step 5: Commit (после подтверждения)**

```bash
git add src/components/sidebar/view/subcomponents/SidebarNav.tsx src/components/sidebar/view/subcomponents/SidebarContent.tsx src/components/sidebar/view/subcomponents/SidebarHeader.tsx
git commit -m "feat(redesign): вертикальное меню режимов сайдбара по макету

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 4: Сайдбар — список проектов и сессии

**Files:**
- Modify: `src/components/sidebar/view/subcomponents/SidebarProjectItem.tsx`
- Modify: `src/components/sidebar/view/subcomponents/SidebarProjectSessions.tsx`
- Modify: `src/components/sidebar/view/subcomponents/SidebarSessionItem.tsx`

**Interfaces:**
- Consumes: strict-токены; глиф Claude (`SessionProviderLogo`).

- [ ] **Step 1: Прочитать три файла**, зафиксировать текущие классы строк проекта/сессии, раскрытого состояния, кнопки New Session.

- [ ] **Step 2: Строка проекта**

Строка проекта: `px-2.5 py-2 rounded-md text-[13px] hover:bg-secondary`, шеврон справа, поворот при раскрытии. Раскрытая панель проекта: **2px акцентная левая граница** (`border-l-2 border-primary`), фон-подложка (light: прозрачный/`--sidebar`; dark: `#1B1D22` — можно `bg-card/40`).

- [ ] **Step 3: New Session и строки сессий**

Кнопка New Session: акцентный outline-ряд с плюсом (`border border-primary-tint-border text-primary rounded-md`). Строка сессии: глиф Claude 14px + имя (`text-[13px]`) + относительное время справа (`font-mono text-[10.5px] text-muted-foreground`). Выбранная сессия — `bg-nav-selected`. Ховер — `hover:bg-secondary`.

- [ ] **Step 4: Проверка**

```bash
export PATH="/opt/homebrew/opt/node@22/bin:$PATH"
npm run typecheck
```
Раскрыть проект «Передала эстафету» в приложении, скриншот → сравнить с макетом (акцентная граница, New Session, строки сессий, время mono). Оба режима.

- [ ] **Step 5: Commit (после подтверждения)**

```bash
git add src/components/sidebar/view/subcomponents/SidebarProjectItem.tsx src/components/sidebar/view/subcomponents/SidebarProjectSessions.tsx src/components/sidebar/view/subcomponents/SidebarSessionItem.tsx
git commit -m "feat(redesign): strict список проектов и сессии сайдбара

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 5: Сайдбар — футер

**Files:**
- Modify: `src/components/sidebar/view/subcomponents/SidebarFooter.tsx`

- [ ] **Step 1: Прочитать `SidebarFooter.tsx`**, найти ссылки Report Issue / Join Community и блок Settings/версия.

- [ ] **Step 2: Привести к макету**

Оставить: **Settings** (шестерёнка 15px, `text-[13px]`, hover `bg-secondary`) + строку версии «CloudCLI v1.36.1» (`font-mono text-[11px] text-muted-foreground`). **Удалить** Report Issue и Join Community. Верхняя граница `border-t border-border`, padding 12/16.

- [ ] **Step 3: Проверка**

```bash
export PATH="/opt/homebrew/opt/node@22/bin:$PATH"
npm run typecheck
```
Скриншот низа сайдбара → сравнить с макетом (только Settings + версия). Оба режима.

- [ ] **Step 4: Commit (после подтверждения)**

```bash
git add src/components/sidebar/view/subcomponents/SidebarFooter.tsx
git commit -m "feat(redesign): strict футер сайдбара (Settings + версия)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 6: Шапка главной колонки и переключатель табов

**Files:**
- Modify: `src/components/main-content/view/subcomponents/MainContentHeader.tsx`
- Modify: `src/components/main-content/view/subcomponents/MainContentTitle.tsx`
- Modify: `src/shared/view/ui` — компоненты `Pill` / `PillBar` (перекрасить сегментную группу) ИЛИ `MainContentTabSwitcher.tsx` через className.

**Interfaces:**
- Consumes: strict-токены.
- Note: сначала `grep -rn "PillBar\|<Pill" src` — если `Pill/PillBar` используются вне табов, менять их аккуратно (не ломать другие места) либо задать strict-вид через проп/вариант.

- [ ] **Step 1: Прочитать** `MainContentHeader.tsx`, `MainContentTitle.tsx`, и `Pill`/`PillBar` в `shared/view/ui`.

- [ ] **Step 2: Шапка**

Глиф Claude 26px + заголовок сессии `text-[14.5px] font-bold` + подзаголовок-проект `text-[11.5px] text-muted-foreground`. Нижняя граница `border-b border-border`, padding 12/20.

- [ ] **Step 3: Табы**

Сегментная группа: лоток `bg-secondary border border-border rounded-lg p-[3px]`. Таб (`Pill`): иконка 13px + лейбл 12.5px/600, `px-[13px] py-1.5 rounded-md`; активный — `bg-card text-primary shadow-sm`; неактивный — `text-muted-foreground hover:bg-secondary`.

- [ ] **Step 4: Проверка**

```bash
export PATH="/opt/homebrew/opt/node@22/bin:$PATH"
npm run typecheck
```
Скриншот шапки. Проверить активный таб Chat (акцентный текст на приподнятой поверхности), переключение табов не сломано; другие места с `Pill` (если есть) не испорчены. Оба режима.

- [ ] **Step 5: Commit (после подтверждения)**

```bash
git add src/components/main-content/view/subcomponents/MainContentHeader.tsx src/components/main-content/view/subcomponents/MainContentTitle.tsx src/shared/view/ui
git commit -m "feat(redesign): strict шапка и табы главной колонки

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 7: Чат — бабблы сообщений

**Files:**
- Modify: `src/components/chat/view/subcomponents/MessageComponent.tsx`
- Modify: `src/components/chat/view/subcomponents/Markdown.tsx` (при необходимости — strict-типографика `prose`)

**Interfaces:**
- Consumes: strict-токены; `@tailwindcss/typography`.

- [ ] **Step 1: Прочитать** `MessageComponent.tsx` (найти ветки user/assistant, экшены copy/edit) и `Markdown.tsx`.

- [ ] **Step 2: User-баббл**

Справа, `max-w-[560px] rounded-[14px_14px_4px_14px] px-4 py-[11px] bg-user-bubble text-user-bubble-foreground text-[14.5px] leading-[1.5]`. Под ним справа copy/edit — кнопки 28×28, иконки 14px, `text-muted-foreground`.

- [ ] **Step 3: Assistant-баббл**

Слева, `max-w-[720px] rounded-[14px_14px_14px_4px] px-5 py-4 bg-card border border-border text-[14.5px] leading-[1.65]`. Markdown через `prose` с strict-настройками: заголовки, списки, `code`-чипы `font-mono text-[12.5px]` на фоне `bg-secondary rounded`. Правый футер (чип формата + read-aloud) — как в оригинале, перекрасить.

- [ ] **Step 4: Проверка**

```bash
export PATH="/opt/homebrew/opt/node@22/bin:$PATH"
npm run typecheck
```
Открыть сессию «Install superpowers plugin», скриншот диалога → сравнить с макетом (форма/цвет бабблов, типографика, код-чипы, экшены). Оба режима.

- [ ] **Step 5: Commit (после подтверждения)**

```bash
git add src/components/chat/view/subcomponents/MessageComponent.tsx src/components/chat/view/subcomponents/Markdown.tsx
git commit -m "feat(redesign): strict чат-бабблы и типографика

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 8: Чат — композер

**Files:**
- Modify: `src/components/chat/view/subcomponents/ChatComposer.tsx`

**Interfaces:**
- Consumes: strict-токены.

- [ ] **Step 1: Прочитать** `ChatComposer.tsx` (карточка инпута, тулбар иконок, mic, строка-подсказка).

- [ ] **Step 2: Карточка и плейсхолдер**

Карточка: `bg-card border border-border rounded-[10px] p-4`; плейсхолдер `text-[13.5px] text-muted-foreground`.

- [ ] **Step 3: Тулбар**

5 ghost-кнопок 30×30 (иконки 15px): attach (`Paperclip`), permissions (`Shield`, `text-primary`), modes (`SlidersHorizontal`), running (`Activity`), files (`Folder`); `hover:bg-secondary`, focus 2px accent. Справа mic 38×38 (иконка 20px) с акцентной заливкой (`bg-primary-tint text-primary`, либо `bg-primary text-primary-foreground`). Строка-подсказка по центру `text-[11px] text-muted-foreground` с текстом из спеки. Иконки/кнопки, которых нет в оригинале, не добавлять сверх существующей функциональности — только перекрасить имеющиеся; недостающие (по макету) добавить как ghost-кнопки, если соответствующее действие уже есть.

- [ ] **Step 4: Проверка**

```bash
export PATH="/opt/homebrew/opt/node@22/bin:$PATH"
npm run typecheck
```
Скриншот композера → сравнить с макетом (карточка, тулбар, акцентный mic, подсказка). Оба режима.

- [ ] **Step 5: Commit (после подтверждения)**

```bash
git add src/components/chat/view/subcomponents/ChatComposer.tsx
git commit -m "feat(redesign): strict композер чата

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 9: Финальная сверка — паритет light/dark и полировка

**Files:**
- Modify: точечно — любые компоненты главного экрана с захардкоженными цветами (`bg-gray-*`, `text-blue-*`, `dark:*`), ломающими один из режимов.

- [ ] **Step 1: Сверка обоих режимов**

Пройти весь главный экран в Strict Light и Strict Dark, регион за регионом (сайдбар: бренд/поиск/nav/проекты/сессии/футер; главная: шапка/табы/бабблы/композер), сравнивая скриншот приложения с соответствующим макетом. Зафиксировать расхождения.

- [ ] **Step 2: Вычистить захардкоженные цвета**

Для найденных расхождений заменить захардкоженные Tailwind-классы на токен-классы. Проверить focus-ring (2px accent, offset 1px) и hover-состояния строк/иконок. Переходы 120–150ms.

- [ ] **Step 3: Финальная проверка**

```bash
export PATH="/opt/homebrew/opt/node@22/bin:$PATH"
npm run typecheck && npm run build
```
Ожидается: typecheck без ошибок, сборка успешна. Скриншоты обоих режимов ≈ макеты.

- [ ] **Step 4: Commit (после подтверждения)**

```bash
git add -A
git commit -m "feat(redesign): финальная сверка паритета strict light/dark

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Self-Review: покрытие спеки

- Токены (все, включая новые) + шрифты + плоский вид → Task 1. ✅
- Бренд-строка, поиск, убрать GitHub-значок → Task 2. ✅
- Вертикальное меню режимов (New project/Projects/Chats/Running/Archive) → Task 3. ✅
- Список проектов, раскрытие с акцентной границей, New Session, строки сессий → Task 4. ✅
- Футер (Settings + версия, убрать Report Issue/Join Community) → Task 5. ✅
- Шапка (глиф+заголовок+подзаголовок) и сегментные табы → Task 6. ✅
- User/assistant бабблы, markdown-типографика, экшены → Task 7. ✅
- Композер (карточка, тулбар, mic, подсказка) → Task 8. ✅
- Состояния (hover/focus/selected), паритет light/dark, «что не трогаем» → Task 9 + Global Constraints. ✅
