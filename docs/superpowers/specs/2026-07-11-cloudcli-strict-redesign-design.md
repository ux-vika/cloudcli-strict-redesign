# Дизайн-спека: редизайн главного экрана CloudCLI (Strict Light/Dark)

Дата: 2026-07-11
Статус: согласовано с пользователем (готово к плану реализации)
Источник истины по визуалу: `docs/redesign-handoff/` (HANDOFF-spec.md + макеты `CloudCLI-strict-light.html` / `CloudCLI-strict-dark.html`).

## Цель

Редизайн **главного экрана CloudCLI** (сайдбар + вкладка Chat) в визуальном направлении
**«strict»**, в двух режимах — **Strict Light** и **Strict Dark**. Контент главного
экрана сохраняем как в оригинале v1.36.1; оформление приводим к макету. Оба режима
идентичны по структуре и различаются только токенами.

## Согласованные решения (развилки)

1. **Мокап vs оригинал при расхождениях → полностью по макету.** Где макет
   переставил/убрал элементы сайдбара, следуем макету (а не исходной раскладке).
2. **Объём → только главный экран (сайдбар + Chat).** Остальные экраны
   (Shell/Files/Source Control, Settings, логин, диалоги, мобильная раскладка)
   структурно НЕ трогаем. Они лишь унаследуют новые глобальные токены/шрифты —
   допускается, что местами будут выглядеть смешанно. Это принято осознанно.
3. **Подход к темам → вариант A: заменить значения существующих light/dark на strict.**
   Работаем через штатный механизм тем (shadcn/ui: `:root` / `.dark`, HSL-токены,
   переключатель бинарный light↔dark). Не добавляем отдельную тему, не хардкодим цвета
   мимо системы.

## Механизм тем (как есть в кодовой базе)

- Токены — HSL-тройки в `src/index.css`: блок `:root` (light) и `.dark` (dark).
  Tailwind оборачивает их: `hsl(var(--token))` (`tailwind.config.js`).
- Переключение — `src/contexts/ThemeContext.jsx`: булев `isDarkMode`, класс `.dark`
  на `<html>`, значение в `localStorage['theme']`.
- **Важный маппинг:** в этой базе `--primary` = брендовый цвет, а `--accent` =
  служебная серая заливка (ховер). Поэтому **strict-accent → `--primary`**
  (НЕ `--accent`).

## Токены (значения — hex из HANDOFF; в реализации записываются HSL-тройками)

### Общие
- Шрифты: UI — **Instrument Sans** (400/500/600/700); mono — **JetBrains Mono** (400/500/600).
  Подключение — через npm-пакеты `@fontsource/instrument-sans` и `@fontsource/jetbrains-mono`
  (self-hosted, работает офлайн). Меняем `fontFamily.sans` и добавляем `fontFamily.mono`
  в `tailwind.config.js`; `body` font-family и импорты — в `src/index.css`.
- Типографика: H2 20px/700 (−0.01em); body 14.5px/1.65; UI-лейбл 13px; small/meta 11–12.5px;
  код-чип 12.5px mono.
- Радиусы: карточки/инпуты 10px; строки/кнопки 6px; бабблы `14 14 14 4` (ассистент) /
  `14 14 4 14` (юзер); пилюли/теги 20px. Базовый `--radius` подстроить под strict.
- Focus ring: 2px `--primary`, offset 1px.
- Иконки (lucide-react): nav 15px; шапка/таб 13px; тулбар композера 15px (кнопка 30px);
  mic 20px (кнопка 38px); экшены сообщения 14px (кнопка 28px).

### Strict Light
- Accent (→ `--primary`): `#1D4ED8`; текст-на-акценте: белый.
- Accent tint (→ новый `--primary-tint`): `#EEF2FE`; accent border (`--primary-tint-border`): `#C7D5F5`.
- Canvas (`--background`): `#FFFFFF`; сайдбар (новый `--sidebar`): `#F7F8FA`;
  поверхности карточек/композера/ассистент-баббла (`--card`): `#FFFFFF`.
- Нейтральные заливки: `#EEF0F3`; вторичная (`--secondary`): `#E9ECF1`;
  выбранный пункт nav (`--nav-selected`): `#E9ECF1`.
- Границы/разделители (`--border`): `#E2E5EA`.
- Текст: primary `#111827`; body `#374151`; secondary `#4B5563`; muted `#6B7280`; faint `#9AA1AD`.
- User-баббл (`--user-bubble-bg`/`--user-bubble-text`): `#EAF0FB` / `#1F2937`.
- Плашка **New project** (`--np-bg`/`--np-border`/`--np-text`): `#DCE4FB` / `#C0CFF6` / `#1D4ED8`; hover bg `#D2DCF9`.

### Strict Dark
- Accent (→ `--primary`): `#5B8DEF`; глиф-на-акценте: `#0E0F12`.
- Accent tint: `#1A2436`; accent border: `#31405F`.
- Canvas (`--background`): `#0F1115`; сайдбар (`--sidebar`): `#12141A`;
  поверхности (`--card`): `#14161C`.
- Нейтральные заливки: `#1E212A`; вторичная: `#1A1D25`.
- Границы (`--border`): `#262A33`.
- Текст: primary `#F0F2F5`; body `#C7CBD3`; secondary `#AEB4BF`; muted `#858C99`; faint `#6B7280`.
- User-баббл: `#243149` / `#E6EAF2`.
- Выбранная строка сессии: `#26292F`; панель раскрытого проекта: `#1B1D22` + 2px акцентная левая граница.

### Новые токены (которых сейчас нет, но требует макет)
`--sidebar`, `--primary-tint`, `--primary-tint-border`, `--np-bg`, `--np-border`,
`--np-text`, `--np-bg-hover`, `--user-bubble-bg`, `--user-bubble-text`, `--nav-selected`.
Плюс уточнить шкалу текста и границы. Добавить соответствующие ключи в `tailwind.config.js`.

### Плоский вид (убрать «стекло»)
«Стеклянные» токены и утилиты (`--nav-glass-*`, `.nav-glass`, blur/saturate,
`backdrop-blur` на сайдбаре) на главном экране обнуляем: фон сайдбара — сплошной `--sidebar`.

## Компоненты главного экрана

### Сайдбар (`src/components/sidebar/view/subcomponents/`)
- **`SidebarHeader`** — бренд-строка: плитка 30×30 radius-6 (акцент) + глиф Claude;
  вордмарк «CloudCLI» 15.5px/700 (letter-spacing −0.01em); две ghost-кнопки 28×28
  (refresh, свернуть). **GitHub-значок «Star» убрать.** Поиск: инпут во всю ширину,
  border 1px, radius 6, padding 7/10, иконка 13px, плейсхолдер «Search projects…» 12.5px,
  чип `⌘K` (mono 10px) справа.
- **Вертикальное меню** — перенести существующий `searchMode`-переключатель из шапки
  в вертикальный список между поиском и списком проектов. Пункты и маппинг:
  New project → `onCreateProject`; Projects → `searchMode:'projects'`;
  Chats → `searchMode:'conversations'`; Running → `searchMode:'running'`;
  Archive → `searchMode:'archived'`. Строки padding 8/10, radius 6, иконка 15px + лейбл 13px.
  New project — акцентная плашка (`--np-*`); выбранный пункт — заливка `--nav-selected`.
  Иконки lucide: FolderPlus, Folder, MessageSquare, Activity, Archive.
- **`SidebarProjectItem` / `SidebarProjectSessions` / `SidebarSessionItem`** —
  раскрытый проект: 2px акцентная левая граница + вложенные строки. New Session —
  акцентный outline-ряд с плюсом. Строки сессий: глиф Claude 14px + имя + относительное
  время (mono 10.5px, справа). Ховер строк — мягкая нейтральная заливка.
- **`SidebarFooter`** — Settings (шестерёнка 15px) + версия «CloudCLI v1.36.1»
  (mono 11px, muted), 1px верхняя граница. Ссылки Report Issue / Join Community убрать (по макету).

### Шапка главной колонки (`src/components/main-content/view/subcomponents/`)
- **`MainContentHeader` / `MainContentTitle`** — глиф Claude 26px + заголовок сессии
  14.5px/700 + подзаголовок-проект 11.5px muted; 1px нижняя граница, padding 12/20.
- **`MainContentTabSwitcher`** — сегментная группа: лоток (фон-«tray», border 1px, radius 8,
  padding 3). Табы Chat / Shell / Files / Source Control: активный = акцентный текст на
  приподнятой поверхности; неактивный = muted, ховер нейтральный. Таб = иконка 13px +
  лейбл 12.5px/600, padding 6/13, radius 6.

### Чат и композер (`src/components/chat/view/`)
- **`MessageComponent`** — User-баббл: справа, max-width 560, radius `14 14 4 14`,
  padding 11/16, фон `--user-bubble-bg`, текст 14.5px/1.5; под ним справа copy/edit
  (28×28, иконки 14px, muted). Assistant-баббл: слева, max-width 720, фон `--card` + border,
  radius `14 14 14 4`, padding 16/20, 14.5px/1.65; markdown через `@tailwindcss/typography`
  (`prose`) со strict-типографикой, код-чипы JetBrains Mono; правый футер (чип формата + read-aloud).
- **`ChatComposer`** — карточка `--card` + border, radius 10, padding 14/16, плейсхолдер
  13.5px muted. Тулбар (gap 4): 5 ghost-кнопок 30×30 (иконки 15px) — attach (paperclip),
  permissions (shield, акцентный), modes (sliders), running (activity), files (folder);
  справа mic 38×38 (иконка 20px) с акцентной заливкой. Подсказка по центру 11px muted:
  «Enter to send · Shift+Enter for new line · Tab to change modes · / for slash commands».

## Интерактивные состояния (оба режима)
- Строки nav/проектов/сессий: hover = мягкая нейтральная заливка.
- Icon-кнопки: hover = нейтральная заливка + усиление цвета иконки; focus (клавиатура) =
  2px акцентный outline, offset 1px. Зоны нажатия ≥30px (композер) / 28px (экшены сообщения).
- Табы: активный = акцентный текст на приподнятой поверхности; неактивный = muted, hover нейтральный.
- Переходы — стандартные hover/focus ~120–150ms ease, без кастомных анимаций.

## Что НЕ трогаем
Shell / Files / Source Control-панели, Settings, логин, диалоги, мобильная раскладка —
структурно без изменений. Разметку и логику главного экрана не переписываем: меняем только
оформление (цвет, шрифты, иконки, радиусы, отступы под макет).

## Критерии готовности
- Главный экран (сайдбар + Chat) визуально совпадает с макетами Strict Light и Strict Dark
  (сверка «скриншот приложения → макет»).
- Переключатель light/dark даёт корректную пару strict-режимов.
- Контент и раскладка главного экрана соответствуют оригиналу v1.36.1 (с учётом решения
  «сайдбар — по макету»).
- Иконки — из lucide-react (прототипные SVG не переносим), глиф Claude — существующий ассет.
- `npm run typecheck` и сборка проходят.
