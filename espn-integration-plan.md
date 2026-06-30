# Plan de Integración — ESPN API

> Última actualización: Junio 2026

---

## Resumen

Conectar las secciones de `index.astro` (LiveMatchHero, NextMatchesCarousel, RecentResultsList) con la API pública de ESPN para el Mundial 2026.

**Endpoint principal:**
```
GET https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=YYYYMMDD
```

Una sola llamada obtiene todos los eventos de la fecha: en vivo, próximos y finalizados.

---

## Fase 1 — Capa de datos (`src/lib/espn/`)

### Archivos a crear

| Archivo | Propósito |
|---------|-----------|
| `src/lib/espn/types.ts` | Interfaces TypeScript de la respuesta ESPN (adaptadas de `espn_api/live-response.ts`) |
| `src/lib/espn/client.ts` | Funciones fetch con error handling |
| `src/lib/espn/mappers.ts` | Transformadores: tipos ESPN → tipos de la app (`Team`, `Match`, `Result`, etc.) |

### `client.ts`

```ts
const BASE = "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(`[${status}] ${message}`);
    this.name = "ApiError";
  }
}

export async function getScoreboard(date: string): Promise<WorldCupScoreBoardLive> {
  const res = await fetch(`${BASE}/scoreboard?dates=${date}`);
  if (!res.ok) {
    throw new ApiError(res.status, `ESPN API error`);
  }
  return res.json();
}

export async function getEventSummary(eventId: string): Promise<…> {
  const res = await fetch(`${BASE}/summary?event=${eventId}`);
  if (!res.ok) throw new ApiError(res.status, `ESPN API error`);
  return res.json();
}
```

### `mappers.ts` — Lógica de transformación

| Condición | Detección | Acción |
|-----------|-----------|--------|
| `state === "in"` | Evento en vivo | Hero con indicador Live + `displayClock` |
| `state === "pre"` | Programado | Agrupar en NextMatches |
| `state === "post"` | Finalizado | Agrupar en RecentResults |
| `competitor.homeAway === "home"` | Equipo local | Mapear a `homeTeam`, `homeScore` |
| `competitor.homeAway === "away"` | Equipo visitante | Mapear a `awayTeam`, `awayScore` |

Mapeos concretos:
- `competitor.team.logo` → `Team.src`
- `competitor.team.displayName` → `Team.name`
- `competitor.score` (string → number) → score
- `competition.details[]` donde `scoringPlay === true` → eventos del héroe (icono `Soccer`, texto `"X' Name"`)
- `competitor.statistics[]` → `PerformanceBarData[]` (possessionPct, totalShots, shotsOnTarget, wonCorners) y `Stat[]` (faltas, tarjetas)

---

## Fase 2 — LiveMatchHero (sección en vivo)

### Lógica en `index.astro`

```astro
---
try {
  const data = await getScoreboard("20260629");
  const liveEvent = data.events.find(e => e.status.type.state === "in")
    ?? data.events.find(e => e.status.type.state === "pre");
  // mapear liveEvent → props de LiveMatchHero
} catch (e) {
  // mostrar error UI
}
---
```

### Comportamiento

| Escenario | UI |
|-----------|-----|
| `state === "in"` | Hero con indicador "Live • 52'" + goles en eventos |
| Solo `state === "pre"` | Hero sin indicador Live, muestra "Próximo" |
| Error de red / API | Mensaje user-friendly con código HTTP |
| Sin eventos | No renderizar sección |

### Mapeo de eventos del partido (`details[]`)

| `type.text` | Icono | `iconClass` |
|-------------|-------|-------------|
| `Goal` o `Goal - Header` | `Soccer` | — |
| `Penalty - Scored` | `Soccer` | — |
| `Yellow Card` | `Square` | `text-yellow-500` |
| `Red Card` | `Square` | `text-destructive` |

---

## Fase 3 — NextMatchesCarousel (próximos partidos)

- Filtrar `events` donde `state === "pre"`
- Limitar a máximo 10
- Mapear a `Match[]`: `{ date, homeTeam, awayTeam }`
- Si no hay próximos o hay error, ocultar la sección

---

## Fase 4 — RecentResultsList (resultados recientes)

- Filtrar `events` donde `state === "post"`
- Mapear a `Result[]`:
  - `homeScore` / `awayScore` desde `competitor.score`
  - `performances`: Possession, Shots, Shots on Target, Corners (desde `competitor.statistics`)
  - `stats`: Yellow/Red cards (desde `details[]` contando por equipo)
- Si no hay resultados o hay error, ocultar la sección

---

## Fase 5 — Endpoints adicionales (futuro)

| Endpoint | Uso potencial |
|----------|---------------|
| `summary?event={id}` | Página de detalle de partido |
| `teams` | Página de equipos / ranking |
| `teams/{id}/schedule` | Calendario por equipo |
| `sports.core.api.espn.com/v2/sports/soccer/leagues/fifa.world/seasons/{year}/standings` | Tabla de posiciones (grupos) |
| `events/{id}/competitions/{id}/plays` | Play-by-play para detalle |

---

## Archivos a modificar/crear

| Archivo | Acción |
|---------|--------|
| `src/lib/espn/types.ts` | **Crear** |
| `src/lib/espn/client.ts` | **Crear** — incluir clase `ApiError` |
| `src/lib/espn/mappers.ts` | **Crear** |
| `src/pages/index.astro` | **Modificar** — reemplazar mocks con fetch + error handling |
| `src/lib/types.ts` | **Posible extensión** — agregar `abbreviation?` a `Team` si se necesita |

---

## Consideraciones

- **Error handling:** Sin mock data como fallback. Mostrar mensaje user-friendly con código de error HTTP.
- **Caching:** Astro cachea en build. Para datos en vivo considerar SSR (`export const prerender = false`) o ISR.
- **Rate limiting:** Una llamada por página load. Sin auth requerida.
- **SSG vs SSR:** Como es un torneo en vivo, lo ideal es renderizar del lado del servidor (SSR) para tener datos frescos en cada request.
