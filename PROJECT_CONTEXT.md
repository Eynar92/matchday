# Worldcup Results — Contexto del Proyecto

> Última actualización: Junio 2026

---

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Framework | Astro 7 |
| UI (islas interactivas) | React 19 + ShadCN/ui (radix-nova) |
| Estilos | Tailwind CSS 4 (CSS-first config) |
| Iconos | Lucide React (render estático, sin `client:*`) |
| Fuentes | Inter Variable (via `@fontsource-variable/inter`) |
| Animaciones | `tw-animate-css` |
| Utilidades | `clsx` + `tailwind-merge` (vía `@/lib/utils.ts`) |

---

## Estructura del Proyecto

```
src/
├── components/
│   ├── atoms/           # Componentes atómicos (indivisibles)
│   │   ├── LucideIcon.tsx
│   │   ├── TeamLogo.astro
│   │   ├── PerformanceBar.astro
│   │   ├── StatItem.astro
│   │   ├── ScoreDisplay.astro
│   │   └── MatchEvent.astro
│   ├── molecules/       # Combinaciones de átomos
│   │   ├── MatchTeam.astro
│   │   ├── TeamScoreRow.astro
│   │   └── NavItem.astro
│   ├── organisms/       # Secciones completas de UI
│   │   ├── TopAppBar.astro
│   │   ├── LiveMatchHero.astro
│   │   ├── NextMatchCard.astro
│   │   ├── NextMatchesCarousel.astro
│   │   ├── RecentResultCard.astro
│   │   ├── RecentResultsList.astro
│   │   └── BottomNavBar.astro
│   └── ui/              # Componentes ShadCN (React)
│       └── button.tsx
├── layouts/
│   ├── Layout.astro           # Shell base (html, head, body)
│   └── MatchdayLayout.astro   # Layout matchday (TopAppBar + slot + BottomNavBar)
├── lib/
│   ├── utils.ts               # cn() utility
│   ├── types.ts               # Tipos compartidos (IconName, Team, Match, Stat, etc.)
│   └── espn/                  # Capa de datos ESPN API
│       ├── types.ts           # Interfaces de la respuesta de la API
│       ├── client.ts          # Funciones fetch (getScoreboard, getScoreboardRange)
│       └── mappers.ts         # Transformaciones API → tipos de la app
├── pages/
│   └── index.astro     # Página principal (orquestación de datos)
└── styles/
    └── global.css      # Tailwind + theme variables (shadcn)
```

---

## Jerarquía de Layouts

```
Layout.astro
  └─ <html class="dark">, fonts, viewport, <slot />
      └─ MatchdayLayout.astro
          ├─ TopAppBar (header fijo)
          ├─ <slot /> (contenido de página)
          └─ BottomNavBar (inferior fijo)
```

---

## Tipos Compartidos (`src/lib/types.ts`)

```typescript
IconName            // Union inferida de LucideIcon (autocompletado en el IDE)
Team                // { src: string; name: string }
Match               // { date: string; homeTeam: Team; awayTeam: Team }
Stat                // { icon: IconName; label: string; value1: number; value2: number; iconClass?: string }
PerformanceBarData  // { label, homeValue, awayValue, homePercent, homeColor?, awayColor? }
BarColor            // Union de clases bg-* (bg-green-500, bg-blue-500, etc.)
```

Regla: **todo tipo que se repita en 2+ componentes** va a `@/lib/types.ts`.

---

## Capa de Datos — ESPN API (`src/lib/espn/`)

### types.ts
Interfaces que modelan la respuesta de `site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard`:
- `WorldCupScoreBoardLive` — raíz del scoreboard
- `Event` — un partido (con `id`, `date`, `status`, `competitions`)
- `Competitor` — equipo dentro de una competición (`homeAway`, `score`, `statistics`)
- `Detail` — eventos del partido (tarjetas, goles)

### client.ts
```typescript
getScoreboard(date: string): Promise<WorldCupScoreBoardLive>
getScoreboardRange(start: string, end: string): Promise<WorldCupScoreBoardLive>
ApiError             // class con status + message para errores HTTP
```
- Endpoint base: `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world`
- Sin autenticación. Rate limiting no documentado.
- Formato de fecha: `YYYYMMDD` para día individual, `YYYYMMDD-YYYYMMDD` para rango.

### mappers.ts
Funciones puras de transformación:

| Función | Uso | Transforma |
|---------|-----|-----------|
| `mapToHeroEvent(event)` | LiveMatchHero | estado + line score → hero data con eventos destacados |
| `mapToMatchEvents(event)` | LiveMatchHero | detalles del partido → MatchEvent[] (goles, tarjetas) |
| `mapToMatch(event)` | NextMatchesCarousel → NextMatchCard | fecha (ISO → formato amigable) + equipos |
| `mapToResult(event)` | RecentResultsList → RecentResultCard | fecha + equipos + scores + estadísticas |
| `isEventLive(event)` | Filtro | `event.status.type.state === "in"` |
| `isEventPre(event)` | Filtro | `event.status.type.state === "pre"` |
| `isEventPost(event)` | Filtro | `event.status.type.state === "post"` |

**Estados ESPN**: `"in"` (en vivo), `"pre"` (programado), `"post"` (finalizado).

**`mapToResult`** organiza datos así:
- **performances** (barras de progreso): solo `Possession` (%)
- **stats** (icono + número): `Shots`, `SOT`, `Corners`, `YC`, `RC`

---

## Data Flow (`src/pages/index.astro`)

1. **Past week results** — Una llamada `getScoreboardRange(today-7, today)` → filtra `isEventPost` → mapea con `mapToResult` → invierte orden (.reverse())
2. **Hero (live/pre)** — Loop de 7 días hacia adelante. Busca primer `live` o `pre` event. Si hay error y no hay hero data, muestra mensaje de error.
3. **Próximos partidos** — Loop de 7 días. Acumula `pre` events hasta 10.

**Render condicional**:
- `heroError` → mensaje de error con código HTTP
- `heroData` → `LiveMatchHero`
- `preMatches.length > 0` → `NextMatchesCarousel`
- `postResults.length > 0` → `RecentResultsList` (agrupado por fecha)

**Formato de fecha**: `formatEventDate("2026-06-30T17:00Z")` → `"Tue, Jun 30, 17:00"` usando `Intl.DateTimeFormat`.

---

## Componentes Actualizados

### StatItem.astro
Nuevo prop `label: string` — se renderiza como texto diminuto (`text-[10px] uppercase tracking-wider`) debajo de los valores.

### RecentResultCard.astro
Nuevo prop `date: string` (ISO) — para agrupación por fecha.

### RecentResultsList.astro
- Agrupa resultados por fecha usando `Map<string, Result[]>`
- Ordena grupos descendente (más reciente primero)
- Renderiza header de fecha: `"Mon, Jun 22, 2026"`

---

## Cómo Usar los Componentes

### Átomos — Props principales

```astro
<TeamLogo src="..." name="Man City" size={48} />
<ScoreDisplay homeScore={0} awayScore={1} size="sm|md|lg" />
<PerformanceBar label="Possession" homeValue="62%" awayValue="38%" homePercent={62}
  homeColor="bg-green-500" awayColor="bg-blue-500" />
<StatItem icon="Crosshair" label="Shots" value1={14} value2={9} />
<MatchEvent icon="Soccer" text="22' Saka" muted />
```

### Moléculas

```astro
<MatchTeam src="..." name="Arsenal" size={64} />
<TeamScoreRow homeSrc="..." awaySrc="..." homeName="Chelsea" awayName="Spurs"
  homeScore={3} awayScore={1} scoreSize="sm" />
<NavItem icon="Radio" label="Live" active />
```

### Organismos — Data objects

```astro
<LiveMatchHero homeTeam={teamObj} awayTeam={teamObj} homeScore={0} awayScore={1} />
<NextMatchesCarousel matches={matchArray} />
<RecentResultsList results={resultArray} />
<BottomNavBar activeIndex={0} />
<TopAppBar />
```

---

## Convenciones

### ¿Astro o React?
| Tipo | Archivo | Razón |
|------|---------|-------|
| Sin interactividad | `*.astro` | Render estático, 0 JS al cliente |
| Con interacción (hover/click) | `*.astro` con clases Tailwind | `active:scale-95`, `hover:bg-*` |
| Botones tipo ShadCN | `ui/button.tsx` + `client:load` | Solo si requiere estado/hydratación |
| Iconos | `LucideIcon.tsx` (React) | Render estático sin `client:*` |

### Iconos — LucideIcon
Se usa sin `client:*` porque Astro lo pre-renderiza a SVG estático:

```astro
<LucideIcon name="Search" size={24} className="text-foreground" />
```

### Micro-interacciones
- `active:scale-95` — efecto press en botones
- `active:scale-[0.98]` — efecto press en cards
- `transition-transform duration-150` — suavizado
- `hover:opacity-80` — fade en iconos

### Data Flow
- `index.astro` → orquesta fetch + mappers → pasa data objects a organismos
- Capa ESPN (`client.ts` → `mappers.ts`) aísla la API del resto de la app
- No hay props drilling profundo (máx 2 niveles)

---

## Dependencias Clave

```json
{
  "astro": "^7.0.3",
  "react": "^19.2.7",
  "lucide-react": "^1.21.0",
  "tailwindcss": "^4.3.1",
  "class-variance-authority": "^0.7.1",
  "tailwind-merge": "^3.6.0"
}
```

---

## Comandos Útiles

```bash
pnpm astro dev                # Inicia servidor
pnpm astro dev --host         # Inicia el servidor y expone la IP
pnpm astro dev --background   # En background
pnpm astro dev logs           # Ver logs
pnpm astro build              # Build producción
pnpm astro check              # Type checking
```

---

## Posibles Mejoras

### Abstraer helpers en `src/lib/utils.ts`
- `formatDate(iso: string): string` — formateo ISO → legible (actualmente inline en mappers.ts)
- `formatDateGroup(iso: string): string` — formateo para headers de sección (actualmente en RecentResultsList.astro)
- `groupByDate<T>(items: T[], getDate: (t: T) => string): Map<string, T[]>` — utilidad de agrupación genérica

### SSR vs SSG
Actualmente la página se renderiza en cada request (SSR por defecto con Astro 7). Si se necesita caché, considerar:
- `export const prerender = false` (SSR dinámico, ya es default en Astro 7)
- Astro `output: 'server'` explícito si se añaden endpoints
- SWR/caché en el cliente para datos en vivo

### Manejo de errores
- El catch de `getScoreboardRange` silencia errores. Podría mostrar toast o badge de "no se pudieron cargar resultados anteriores".
- Diferenciar errores de red vs API (status code) vs datos vacíos.
