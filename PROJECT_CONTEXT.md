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
│   ├── utils.ts        # cn() utility
│   └── types.ts        # Tipos compartidos (IconName, Team, Match, Stat, etc.)
├── pages/
│   └── index.astro     # Página principal
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

- **`Layout.astro`** — Solo el shell HTML. Se usa para páginas sin sidebar (login, etc.).
- **`MatchdayLayout.astro`** — Layout específico de matchday. Extiende `Layout`.

---

## Tipos Compartidos (`src/lib/types.ts`)

```typescript
IconName        // Union inferida de LucideIcon (autocompletado en el IDE)
Team            // { src: string; name: string }
Match           // { date: string; homeTeam: Team; awayTeam: Team }
Stat            // { icon: IconName; value1: number; value2: number; iconClass?: string }
PerformanceBarData  // { label, homeValue, awayValue, homePercent, homeColor?, awayColor? }
BarColor        // Union de clases bg-* (bg-green-500, bg-blue-500, etc.)
```

Regla: **todo tipo que se repita en 2+ componentes** va a `@/lib/types.ts`.

---

## Cómo Usar los Componentes

### Átomos — Props principales

```astro
<TeamLogo src="..." name="Man City" size={48} />
<ScoreDisplay homeScore={0} awayScore={1} size="sm|md|lg" />
<PerformanceBar label="Possession" homeValue="62%" awayValue="38%" homePercent={62}
  homeColor="bg-green-500" awayColor="bg-blue-500" />
<StatItem icon="Square" value1={2} value2={4} iconClass="text-yellow-500" />
<MatchEvent icon="Soccer" text="22' Saka" muted />
```

### Moléculas

```astro
<MatchTeam src="..." name="Arsenal" size={64} />
<TeamScoreRow homeSrc="..." awaySrc="..." homeName="Chelsea" awayName="Spurs"
  homeScore={3} awayScore={1} scoreSize="sm" />
<NavItem icon="Radio" label="Live" active />
```

### Organismos — Se alimentan con data objects (no props sueltas)

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
En el marco de los posible con clases Tailwind, en caso extremo de ser necesario con JS:
- `active:scale-95` — efecto press en botones
- `active:scale-[0.98]` — efecto press en cards
- `transition-transform duration-150` — suavizado
- `hover:opacity-80` — fade en iconos

### Data Flow
- `index.astro` → pasa data objects a organismos
- Organismos → mapean props a moléculas/átomos
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
pnpm astro dev --host         # Inicia el servidor y expone la IP para acceder desde otros dispositivos
pnpm astro dev --background   # En background
pnpm astro dev logs           # Ver logs
pnpm astro build              # Build producción
pnpm astro check              # Type checking
```
