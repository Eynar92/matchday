# Plan de Refactorización: ConvertToComponents.html → Astro + Atomic Design

> **Stack:** Astro 7 + Tailwind CSS 4 + Lucide Icons (SVG inline) + ShadCN/ui (solo interactivos)
> **Metodología:** Atomic Design (Brad Frost)
> **Estado:** ⬜ Pendiente | 🔄 En progreso | ✅ Completado

---

## Fase 1: Configuración Base

- [x] **1.1** Modificar `src/layouts/Layout.astro`
  - Añadir `class="dark"` al `<html>`
  - Añadir `viewport-fit=cover` al meta viewport
  - Añadir `selection:bg-secondary/30` al body
  - Cambiar título a `MATCHDAY | Apex Pitch`
  - Eliminar `<style>` inline redundante (global.css ya lo maneja)

---

## Fase 2: Átomos

Los componentes más pequeños e indivisibles.

- [x] **2.1** `src/components/atoms/Icon.astro`
  - Mapa de nombres Lucide → paths SVG
  - Props: `name`, `size`, `class`
  - Iconos necesarios: `Menu`, `Search`, `CircleUser`, `Soccer`, `Square`, `Flag`, `CornerDownRight`, `Bell`, `Radio`, `Calendar`, `Trophy`, `User`

- [x] **2.2** `src/components/atoms/TeamLogo.astro`
  - `<img>` con dimensiones y `object-contain`
  - Props: `src`, `alt`, `size` (default 48px)

- [x] **2.3** `src/components/atoms/LiveIndicator.astro`
  - Punto rojo pulsante + texto "Live • 48:38"
  - Usa `animate-pulse` de Tailwind (reemplaza keyframe custom)
  - Props: `time` (string, e.g. "48:38")

- [x] **2.4** `src/components/atoms/PerformanceBar.astro`
  - Barra de progreso dual con labels
  - Props: `homeLabel`, `awayLabel`, `homePercent`, `awayPercent`

- [x] **2.5** `src/components/atoms/StatItem.astro`
  - Icono + valor numérico (para grilla de estadísticas)
  - Props: `icon`, `value`, `iconColor`

- [x] **2.6** `src/components/atoms/ScoreDisplay.astro`
  - Marcador tipográfico "0 : 1"
  - Props: `homeScore`, `awayScore`, `awayHighlight` (boolean)

- [x] **2.7** `src/components/atoms/MatchEvent.astro`
  - Icono + texto tipo "22' Saka"
  - Props: `icon`, `text`, `iconColor`

---

## Fase 3: Moléculas

Combinaciones de átomos con significado propio.

- [x] **3.1** `src/components/molecules/MatchTeam.astro`
  - `TeamLogo` + nombre del equipo
  - Props: `src`, `alt`, `name`, `size`

- [x] **3.2** `src/components/molecules/TeamScoreRow.astro`
  - Fila: equipo local ↔ marcador ↔ equipo visitante
  - Props: `home`, `away`, `homeScore`, `awayScore`

- [x] **3.3** `src/components/molecules/NavItem.astro`
  - Icono + label (activo/desactivado)
  - Props: `icon`, `label`, `active`

---

## Fase 4: Organismos

Componentes complejos que forman secciones completas de la UI.

- [x] **4.1** `src/components/organisms/TopAppBar.astro`
  - Header fijo: botón menú | título | search + account
  - Sin estado, solo presentacional

- [x] **4.2** `src/components/organisms/LiveMatchHero.astro`
  - Hero completo: `LiveIndicator` + `ScoreDisplay` + `MatchTeam` x2 + eventos
  - Background glow decorativo con `bg-destructive/10` + blur

- [x] **4.3** `src/components/organisms/NextMatchCard.astro`
  - Card de próximo partido: fecha, recordatorio (Bell), equipos, botón "Match Details"
  - Botón usa shadcn `Button` con `client:load`

- [ ] **4.4** `src/components/organisms/NextMatchesCarousel.astro`
  - Título "Next Matches" + "View All" + scroll horizontal
  - Contiene 2+ `NextMatchCard`
  - Scroll drag con script vanilla (mouse drag)
  - `hide-scrollbar` con clases Tailwind

- [ ] **4.5** `src/components/organisms/RecentResultCard.astro`
  - Card completa: `TeamScoreRow` + `PerformanceBar` x2 + grilla `StatItem` x4
  - `active:scale-[0.98]` para micro-interacción touch

- [ ] **4.6** `src/components/organisms/RecentResultsList.astro`
  - Título "Recent Results" + lista vertical de `RecentResultCard`

- [ ] **4.7** `src/components/organisms/BottomNavBar.astro`
  - Barra fija inferior con 4 `NavItem`: Live, Matches, Leagues, Profile
  - Ítem activo con estilo destacado

---

## Fase 5: Página Principal

- [ ] **5.1** Modificar `src/pages/index.astro`
  - Eliminar import de `Welcome.astro`
  - Componer: `TopAppBar` + `LiveMatchHero` + `NextMatchesCarousel` + `RecentResultsList` + `BottomNavBar`
  - Spacing: `pt-20 pb-28 px-4 space-y-8`

- [ ] **5.2** Eliminar `src/components/Welcome.astro` (starter, ya no necesario)

---

## Fase 6: Verificación

- [ ] **6.1** Ejecutar `pnpm astro dev` y verificar compilación sin errores
- [ ] **6.2** Verificar que el layout se ve correcto en modo oscuro
- [ ] **6.3** Verificar interacciones: hover, active scale, drag carrusel
- [ ] **6.4** Verificar que no hay errores de iconos (todos los paths SVG existen)

---

## Resumen de Archivos

| Acción | Archivo |
|--------|---------|
| 🖊️ Modificar | `src/layouts/Layout.astro` |
| 🖊️ Modificar | `src/pages/index.astro` |
| ✨ Crear | `src/components/atoms/Icon.astro` |
| ✨ Crear | `src/components/atoms/TeamLogo.astro` |
| ✨ Crear | `src/components/atoms/LiveIndicator.astro` |
| ✨ Crear | `src/components/atoms/PerformanceBar.astro` |
| ✨ Crear | `src/components/atoms/StatItem.astro` |
| ✨ Crear | `src/components/atoms/ScoreDisplay.astro` |
| ✨ Crear | `src/components/atoms/MatchEvent.astro` |
| ✨ Crear | `src/components/molecules/MatchTeam.astro` |
| ✨ Crear | `src/components/molecules/TeamScoreRow.astro` |
| ✨ Crear | `src/components/molecules/NavItem.astro` |
| ✨ Crear | `src/components/organisms/TopAppBar.astro` |
| ✨ Crear | `src/components/organisms/LiveMatchHero.astro` |
| ✨ Crear | `src/components/organisms/NextMatchCard.astro` |
| ✨ Crear | `src/components/organisms/NextMatchesCarousel.astro` |
| ✨ Crear | `src/components/organisms/RecentResultCard.astro` |
| ✨ Crear | `src/components/organisms/RecentResultsList.astro` |
| ✨ Crear | `src/components/organisms/BottomNavBar.astro` |
| 🗑️ Eliminar | `src/components/Welcome.astro` |

---

## Decisiones de Arquitectura

| Decisión | Opción elegida |
|----------|---------------|
| **Paleta de colores** | Usar tema oscuro existente de `global.css` (oklch neutral) |
| **Iconos** | SVG inline sin React (componente `Icon.astro`) |
| **Carrusel drag** | Script vanilla dentro del componente Astro |
| **Micro-interacciones** | Clases Tailwind (`active:scale-*`, `transition-*`) |
| **Shadcn/React** | Solo para botones interactivos (`Button` con `client:load`) |
| **Componentes sin interacción** | Archivos `.astro` nativos |
