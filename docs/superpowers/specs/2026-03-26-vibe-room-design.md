# Vibe Room — Design Specification

Сайт-витрина коллекции музыкального оборудования и инструментов. Простой аналог loud-lemon.com — без e-commerce, только каталог коллекции с админкой для нетехнических пользователей.

## Architecture

### Stack

- **Frontend:** Astro (SSG) — статическая генерация для максимальной скорости и SEO
- **CMS:** Payload CMS 3.x — headless CMS с готовой админкой, авторизацией, медиа-загрузкой
- **Database:** SQLite (через Payload's db-sqlite adapter)
- **Monorepo:** pnpm workspaces

### Project Structure

```
vibe-room/
├── apps/
│   ├── web/              ← Astro frontend
│   │   ├── src/
│   │   │   ├── layouts/
│   │   │   │   └── Base.astro          ← общий layout (nav, footer, SEO meta)
│   │   │   ├── pages/
│   │   │   │   ├── index.astro         ← каталог (главная)
│   │   │   │   ├── about.astro         ← о коллекции
│   │   │   │   └── instrument/
│   │   │   │       └── [slug].astro    ← карточка инструмента
│   │   │   ├── components/
│   │   │   │   ├── Nav.astro
│   │   │   │   ├── Footer.astro
│   │   │   │   ├── InstrumentCard.astro
│   │   │   │   ├── CategoryFilter.astro  ← клиентский JS (островок)
│   │   │   │   ├── ImageGallery.astro    ← клиентский JS (островок)
│   │   │   │   └── SEOHead.astro
│   │   │   └── styles/
│   │   │       └── global.css          ← CSS variables, тема
│   │   ├── public/
│   │   │   ├── logo.svg
│   │   │   └── fonts/
│   │   └── astro.config.mjs
│   └── cms/              ← Payload CMS
│       ├── src/
│       │   ├── collections/
│       │   │   ├── Instruments.ts
│       │   │   ├── Categories.ts
│       │   │   ├── Media.ts
│       │   │   └── Users.ts
│       │   ├── globals/
│       │   │   ├── About.ts            ← контент страницы "О коллекции"
│       │   │   └── SiteSettings.ts     ← соцсети, билд-статус
│       │   └── payload.config.ts
│       └── package.json
├── packages/              ← зарезервировано для shared-кода при необходимости
├── package.json
├── pnpm-workspace.yaml
└── .gitignore
```

### Data Flow

1. Админ добавляет/редактирует инструмент в Payload (`/admin`)
2. Payload сохраняет данные в SQLite, фото на диск (`apps/cms/media/`)
3. Payload `afterChange` hook на коллекциях Instruments, Categories и globals About/SiteSettings запускает `astro build` через `child_process.exec`
4. Astro подтягивает данные через Payload Local API — инициализирует Payload runtime в процессе билда
5. Генерируются статические HTML-страницы
6. Посетитель получает статический HTML — мгновенная загрузка

**Payload Local API:** при `astro build` Payload инициализируется программно через `getPayload({ config })` в frontmatter Astro-страниц. HTTP-сервер CMS не нужен во время билда — Payload загружается in-process и подключается напрямую к SQLite.

```ts
// Пример использования в Astro-странице
import { getPayload } from 'payload'
import config from '@vibe-room/cms/payload.config'

const payload = await getPayload({ config })
const instruments = await payload.find({ collection: 'instruments' })
```

**Rebuild-механизм:** `afterChange` hook в Payload вызывает `astro build` при сохранении любого контента. Trailing-edge debounce (5 сек): если во время активного билда приходят новые изменения, один повторный билд ставится в очередь и выполняется после завершения текущего. Последний билд-timestamp сохраняется в Payload Global `SiteSettings` и отображается в админке.

## Data Model

### Collection: Instruments

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| title | text | yes | "Fender American Special Stratocaster HSS 3-Color Sunburst 2012 USA электрогитара" |
| slug | text | yes | Auto-generated from title, used in URL |
| status | select | yes | `available` \| `archive` |
| category | relationship | yes | → Categories |
| description | richText | no | Описание состояния, история |
| specs | array | no | Массив пар { key: string, value: string } — произвольные спецификации |
| images | array(upload) | yes | Галерея фото, без ограничения количества. Первое фото = обложка |
| year | number | no | Год выпуска |
| brand | text | no | Бренд (Fender, Gibson, Marshall...) |
| country | text | no | Страна производства |
| weight | number | no | Вес в кг |
| order | number | no | Порядок сортировки (для ручной сортировки в каталоге) |

**Спецификации (specs)** — массив произвольных пар ключ-значение. Позволяет добавлять любые характеристики без изменения схемы:
```
specs: [
  { key: "Материал деки", value: "ольха" },
  { key: "Профиль грифа", value: "Modern C" },
  { key: "Серийный номер", value: "US12206750" },
  ...
]
```

### Collection: Categories

| Field | Type | Required |
|-------|------|----------|
| name | text | yes |
| slug | text | yes |
| order | number | no |

Примеры: Электрогитары, Бас-гитары, Акустика, Усилители, Педали эффектов.

### Collection: Media

Стандартная Payload Media collection с настройками:
- Форматы: jpg, png, webp
- Поле `alt` (text) — alt-текст для SEO и accessibility
- Автоматическая генерация размеров: thumbnail (400px), card (800px), full (1600px)
- WebP-конвертация для оптимизации

### Collection: Users

Стандартная Payload Users collection:
- Email + password авторизация
- Роль admin (полный доступ)
- Поддержка нескольких аккаунтов

### Global: About

| Field | Type | Notes |
|-------|------|-------|
| heading | text | Заголовок страницы |
| content | richText | Текст о коллекции |
| photo | upload | Фото на странице |
| stats | array | Массив { number: string, label: string } — счётчики |

### Global: SiteSettings

| Field | Type | Notes |
|-------|------|-------|
| telegramUrl | text | Ссылка на Telegram |
| instagramUrl | text | Ссылка на Instagram |
| vkUrl | text | Ссылка на VK |
| siteUrl | text | Каноничный URL сайта (например, https://vibe-room.ru) — для og:image, sitemap, canonical |
| lastBuildAt | date | Timestamp последнего билда (заполняется автоматически) |

## Pages & Routes

### `/` — Каталог (главная)

- Табы: "В наличии" / "Архив"
- Фильтр-пиллы по категориям с счётчиками (счётчики обновляются в зависимости от активного таба)
- Сетка карточек инструментов (3 колонки desktop, 2 tablet, 1 mobile)
- Каждая карточка: фото, название, подзаголовок, мета (год, страна, вес)
- Клик → страница инструмента

**Табы и фильтры** работают на клиенте (Astro island с vanilla JS). Все данные загружены в HTML — JS только показывает/скрывает карточки. Никаких API-запросов от клиента.

### `/instrument/[slug]` — Карточка инструмента

- Галерея фото (клик для увеличения / свайп)
- Заголовок
- Описание (rich text)
- Блок спецификаций (таблица ключ-значение)
- Хлебные крошки: Каталог → Категория → Инструмент

### `/404` — Страница не найдена

- Стилизованная 404 в общем дизайне
- Ссылка на каталог

### `/about` — О коллекции

- Двухколоночный лейаут: фото слева, текст справа
- Eyebrow "GUITARS · MUSIC · WORKSHOP"
- Заголовок в стиле лого
- Rich text контент (редактируется из админки)
- Счётчики-статистика

## Visual Design

### Design Direction: Dark Synthwave (Refined)

Тёмная тема с неоновым розовым акцентом. Сдержанное свечение — неон только на ключевых элементах (лого, активные состояния). Фотографии инструментов — главный визуал.

### Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--bg` | `#0a0a0f` | Основной фон |
| `--bg-card` | `#121218` | Фон карточек |
| `--pink` | `#ff3d9a` | Основной акцент: лого, активные табы, hover |
| `--pink-glow` | `rgba(255,61,154,0.15)` | Свечение (box-shadow, text-shadow) — только на лого и активных элементах |
| `--cream` | `#e8dcc8` | Основной текст (тёплый, не чисто белый) |
| `--cream-dim` | `#e8dcc866` | Вторичный текст |
| `--teal` | `#6bb5b5` | Категории, бейджи, мета-акцент |
| `--border` | `#ffffff0a` | Тонкие разделители |

### Typography

- **Body:** Inter (300, 400, 500, 600)
- **Accent/Logo:** Playfair Display Italic — для "Vibe" в лого и заголовков
- **Размеры:** 11px labels, 13px nav/filters, 14-15px body, 42px headings

### Component Patterns

- **Навбар:** лого слева (курсив "Vibe" + геометричный "ROOM"), ссылки + соцсети справа
- **Табы:** минимальные, розовый underline на активном
- **Фильтры:** pill-кнопки с border, розовый на активном, бирюзовый счётчик
- **Карточки:** тёмный фон, тонкий border, hover с подъёмом (translateY -2px) и усилением тени
- **Бейджи категорий:** бирюзовый текст + бордер, верхний левый угол фото
- **Мета-информация:** розовые точки-разделители

### Responsive

- **Desktop:** 3 колонки карточек, двухколоночный about
- **Tablet (768px):** 2 колонки карточек, одноколоночный about
- **Mobile (480px):** 1 колонка, бургер-меню, горизонтальный скролл фильтров

## SEO

### Technical

- SSG — полностью статический HTML, максимальная скорость
- Семантический HTML: `<nav>`, `<main>`, `<article>`, `<footer>`
- Автоматические `<meta>` теги: title, description, og:image из данных инструмента
- JSON-LD structured data (`IndividualProduct` schema без `offers`) на каждой карточке инструмента
- Автогенерация `sitemap.xml` (Astro integration)
- `robots.txt`
- Оптимизация изображений: WebP, responsive sizes, lazy loading, alt-тексты из админки

### URL Structure

```
/                           ← каталог
/about                      ← о коллекции
/instrument/fender-strat-62 ← карточка инструмента
/sitemap.xml
/robots.txt
```

### Per-Instrument Meta

```html
<title>Fender American Special Stratocaster HSS — Vibe Room</title>
<meta name="description" content="2012, USA. Инструмент в околоидеальном состоянии...">
<meta property="og:image" content="https://vibe-room.ru/media/fender-strat-cover.webp">
```

**Fallback для description:** если поле `description` пустое, мета-описание генерируется из доступных полей: `"{year}, {country}. {brand} {title}. {category.name}."`

## Admin Panel (Payload CMS)

Payload предоставляет готовую админку на `/admin`:

- **Авторизация:** email + пароль, несколько аккаунтов
- **Список инструментов:** таблица с фильтрами по статусу и категории, поиск
- **Редактирование:** форма с полями, drag-and-drop загрузка фото, rich text редактор
- **Specs:** inline-массив пар ключ-значение — добавить/удалить строку
- **Категории:** отдельная секция, CRUD
- **Страница "О коллекции":** Payload Global — один экземпляр, редактируемый из админки
- **Rebuild сайта:** автоматически при сохранении инструмента (afterChange hook), timestamp последнего билда в интерфейсе

## Deployment

Рекомендуемый вариант — единый VPS (например, Railway, Render, или свой сервер):

- Payload CMS запущен как Node.js-сервер (порт 3000)
- Astro собирает статику при деплое и по webhook-у
- Статика раздаётся через Nginx или Caddy
- SQLite + медиафайлы на диске сервера
- Бэкап: периодическое копирование SQLite-файла + директории media (cron или встроенные средства хостинга)
- SSL через Let's Encrypt (автоматически на Railway/Render)

## Out of Scope

- Корзина, оплата, e-commerce
- Регистрация посетителей
- Комментарии
- Поиск (только фильтр по категориям)
- Мультиязычность
- Блог
