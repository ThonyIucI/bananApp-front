# CultivApp — Design System

Sistema de diseño del frontend. Referencia rápida para mantener consistencia visual en todo el proyecto.

---

## Tipografía

| Token | Valor |
|-------|-------|
| Fuente principal | **Geist Sans** (`--font-geist-sans`, Google Fonts) |
| Fuente monoespaciada | **Geist Mono** (`--font-geist-mono`) |
| Antialiasing | `antialiased` en `<html>` |
| Clase base | `font-sans` en `<body>` |

### Escala de texto usada en la app

| Clase Tailwind | Uso típico |
|----------------|------------|
| `text-xs` (12px) | Etiquetas, metadatos, badges, código de socio |
| `text-sm` (14px) | Texto de formularios, cuerpo de tarjetas, botones |
| `text-base` (16px) | Títulos de modales, marca en navbar |
| `text-lg` (18px) | Subtítulos de sección |
| `text-xl` (20px) | Títulos de página |
| `text-2xl` (24px) | Títulos principales dentro del contenido |

---

## Paleta de colores

### Primario — Verde CultivApp

```
#27ae60   Brand principal, botones CTA, estados activos, anillos de foco
#219a52   Hover del verde primario
#27ae60/10  Fondos sutiles (badges, avatares, nav activo)
#27ae60/20  Ring de foco en inputs
```

### Grises (UI)

```
gray-50   (#f9fafb)  Fondo de tablas thead, hover de filas
gray-100  (#f3f4f6)  Bordes suaves, divisores, fondos secundarios
gray-200  (#e5e7eb)  Bordes de inputs (estado normal)
gray-300  (#d1d5db)  Textos vacíos / placeholders
gray-400  (#9ca3af)  Iconos en reposo, placeholder de inputs
gray-500  (#6b7280)  Texto secundario, subtítulos
gray-600  (#4b5563)  Texto de formulario normal
gray-700  (#374151)  Labels de formulario
gray-900  (#111827)  Texto principal
```

### Semánticos

```
green-100 / green-700   Estado: Activo
gray-100 / gray-500     Estado: Inactivo
red-50 / red-500        Errores, destructivo
red-400 / red-600       Bordes y texto de error
purple-100 / purple-700 Badge superadmin
```

### Fondo de la app

```
bg-gray-50   Fondo general del layout (main)
bg-white     Sidebar, tarjetas, modales, paneles
```

---

## Espaciado y layout

### Layout principal

```
Sidebar: w-64 (256px), fijo en desktop (md+)
Mobile: top bar h-14 + drawer lateral (z-40/z-50)
Main content: p-4 mobile → p-6 desktop, overflow-y-auto
Página máxima: max-w-4xl (cooperativas) / max-w-5xl (usuarios) / max-w-lg (formularios)
```

### Espaciado interno de componentes

```
Padding tarjeta:    px-4 py-4 → px-5 py-3 (tabla)
Gap de formulario:  space-y-3 (campos), space-y-4 (secciones)
Gap de botones:     gap-2
Padding modal:      px-6 py-4
```

---

## Radios de borde (border-radius)

| Clase | Uso |
|-------|-----|
| `rounded-lg` (8px) | Botones de icono, menús internos |
| `rounded-xl` (12px) | Inputs, botones primarios, badges, filas de detalle |
| `rounded-2xl` (16px) | Tarjetas, tablas, modales en desktop |
| `rounded-3xl` (24px) | Tarjetas destacadas (formulario enfunde) |
| `rounded-t-2xl` | Modales en mobile (bottom-sheet) |
| `rounded-full` | Badges de estado, avatares circulares |

---

## Sombras

```
shadow-sm    Tarjetas, sidebar
shadow-lg    Dropdowns, menus desplegables
shadow-2xl   Modales, panels laterales
```

---

## Botones

### Primario (CTA)

```tsx
className="flex cursor-pointer items-center gap-2 rounded-xl bg-[#27ae60] px-4 py-2
           text-sm font-medium text-white shadow-sm
           transition-[transform,background-color] duration-160 ease-out
           hover:bg-[#219a52] active:scale-[0.97] disabled:opacity-60"
```

### Secundario (cancelar)

```tsx
className="cursor-pointer rounded-xl border border-gray-200 px-4 py-2
           text-sm font-medium text-gray-600
           transition-[transform,background-color] duration-160 ease-out
           hover:bg-gray-50 active:scale-[0.97]"
```

### Icono (acciones de fila)

```tsx
className="cursor-pointer rounded-lg p-1.5 text-gray-400
           transition-colors hover:bg-gray-100 hover:text-gray-600"
```

### Destructivo (eliminar en dropdown)

```tsx
className="flex w-full cursor-pointer items-center gap-2 px-3 py-2
           text-sm text-red-600 hover:bg-red-50"
```

### Regla general

- `active:scale-[0.97]` en todos los botones presionables (feedback táctil)
- `disabled:opacity-60 disabled:cursor-not-allowed` cuando está deshabilitado
- `cursor-pointer` explícito siempre (no confiar en el default)

---

## Inputs

### Input de texto

```tsx
className="w-full rounded-xl border bg-white px-3 py-2 text-sm text-gray-900
           placeholder:text-gray-400 outline-none transition-colors
           border-gray-200 focus:border-[#27ae60] focus:ring-2 focus:ring-[#27ae60]/20"

// Error:
"border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200"
```

### Input de fecha / textarea / código

```tsx
className="block w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm
           focus:border-[#27ae60] focus:outline-none focus:ring-2 focus:ring-[#27ae60]/20"
```

### Checkbox

```tsx
className="h-4 w-4 cursor-pointer rounded accent-[#27ae60]"
```

### Select (react-select)

Componente: `front/src/components/form/Select/index.tsx`

- Control: `rounded-xl border border-gray-200`, focus `border-[#27ae60] ring-2 ring-[#27ae60]/20`
- Opción seleccionada: `bg-[#27ae60]/10 text-[#27ae60] font-medium`
- Multi-value chip: `bg-[#27ae60]/10`, label en `text-[#27ae60]`
- Sin opciones: `text-gray-400`

### Select nativo

Componente: `front/src/components/form/NativeSelect/index.tsx`

- Mismos estilos que `Input` (borde gris → verde al focus)

---

## Formularios

### Labels

```tsx
className="mb-1 block text-xs font-medium text-gray-700"
// Con requerido:
<span className="text-red-500">*</span>
```

### Error inline

```tsx
<p className="mt-1 text-xs text-red-500">{error}</p>
```

### Agrupación de secciones dentro del form

```tsx
<div className="border-t border-gray-100 pt-3">
  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
    Título de sección
  </p>
  ...
</div>
```

---

## Modales

### Estructura base

- Fondo: `rgba(0,0,0,0.35)` + `backdropFilter: blur(4px)`
- Desktop: centrado `sm:items-center sm:p-4`, max-w-md / max-w-lg
- Mobile: **bottom-sheet** `items-end`, `rounded-t-2xl`
- Handle mobile: `<div className="h-1 w-10 rounded-full bg-gray-300" />`

### Animación de entrada

```css
@keyframes modal-in {
  from { opacity: 0; transform: scale(0.95); }
  to   { opacity: 1; transform: scale(1); }
}
/* duration: 250ms, easing: cubic-bezier(0.23, 1, 0.32, 1) */
```

### Z-index de modales

```
z-50   Modales primarios
z-60   Modales secundarios (sobre detalle/panel)
```

---

## Paneles laterales (detail panel)

- Desktop: slide desde la derecha (`translateX(100%) → 0`)
- Mobile: slide desde abajo (`translateY(100%) → 0`)
- Fondo overlay: `rgba(0,0,0,0.25)` + `blur(2px)`
- Ancho: `w-full sm:max-w-sm`

```css
@keyframes panel-in {
  from { opacity: 0; transform: translateX(100%); }
  to   { opacity: 1; transform: translateX(0); }
}
@media (max-width: 639px) {
  @keyframes panel-in {
    from { opacity: 0; transform: translateY(100%); }
    to   { opacity: 1; transform: translateY(0); }
  }
}
/* duration: 280ms, easing: cubic-bezier(0.23, 1, 0.32, 1) */
```

---

## Tablas

### Estructura

```tsx
<div className="hidden overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm md:block">
  <table className="w-full text-sm">
    <thead>
      <tr className="border-b border-gray-100 bg-gray-50">
        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500" />
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-50">
      <tr className="cursor-pointer transition-colors hover:bg-gray-50" />
    </tbody>
  </table>
</div>
```

### Mobile (tarjetas)

```tsx
<div className="space-y-3 md:hidden">
  <div className="flex items-center gap-2 rounded-2xl border border-gray-100 bg-white px-4 py-4 shadow-sm" />
</div>
```

> Patrón: tabla oculta en mobile (`hidden md:block`), tarjetas ocultas en desktop (`md:hidden`).

---

## Badges de estado

```tsx
// Activo
"rounded-full px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700"

// Inactivo
"rounded-full px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-500"

// Superadmin
"rounded-full bg-purple-100 px-1.5 py-0.5 text-xs font-medium text-purple-700"
```

---

## Avatares

```tsx
// Grande (panel lateral)
"flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#27ae60]/10 text-sm font-bold text-[#27ae60]"

// Pequeño (sidebar footer)
"flex h-8 w-8 items-center justify-center rounded-full bg-[#27ae60]/10 text-xs font-bold text-[#27ae60]"

// Logo app
"flex h-8 w-8 items-center justify-center rounded-xl bg-[#27ae60]"
```

---

## Dropdowns / menús contextuales

```tsx
<div className="absolute right-0 top-8 z-10 min-w-40 rounded-xl border border-gray-100 bg-white py-1 shadow-lg">
  <button className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50" />
  // Destructivo:
  <button className="... text-red-600 hover:bg-red-50" />
</div>
```

---

## Transiciones y animaciones

### Curva de easing principal

```
cubic-bezier(0.23, 1, 0.32, 1)   Ease-out fuerte — entrada de modales, paneles, celdas
```

### Transiciones de botones

```
transition-[transform,background-color] duration-160 ease-out
```

### Transiciones de colores (nav, filas)

```
transition-colors   (usa el default de Tailwind: 150ms ease-in-out)
```

### Animaciones globales definidas en `globals.css`

| Nombre | Uso | Duración | Easing |
|--------|-----|----------|--------|
| `animate-page-in` | Transición entre páginas | 180ms | `ease-out` |
| `animate-cell-in` | Celdas del calendario de cintas | 180ms | `cubic-bezier(0.23,1,0.32,1)` |
| `modal-in` | Apertura de modales | 250ms | `cubic-bezier(0.23,1,0.32,1)` |
| `panel-in` | Apertura de panel lateral | 280ms | `cubic-bezier(0.23,1,0.32,1)` |

### Reglas de animación (Emil Kowalski)

- `ease-out` para elementos que **entran** (respuesta inmediata)
- `ease-in-out` para movimientos **en pantalla**
- Nunca `ease-in` en UI (se siente lento)
- UI animations < 300ms
- `active:scale-[0.97]` en todo elemento presionable
- Nunca `scale(0)` en entrada — usar `scale(0.95) + opacity: 0`
- `prefers-reduced-motion`: desactivar animaciones decorativas

---

## Toasts (notificaciones)

Librería: **react-toastify** (no sonner)

```tsx
// Configuración global en layout.tsx
<ToastContainer
  position="top-right"
  autoClose={5000}
  hideProgressBar={false}
  closeOnClick
  pauseOnHover
  draggable={false}
  theme="light"
/>

// Uso en hooks
import { toast } from 'react-toastify';
toast.success('Mensaje de éxito');
toast.error('Mensaje de error');
```

---

## Estados vacíos

```tsx
<div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 py-16">
  <svg className="mb-3 h-10 w-10 text-gray-300" ... />
  <p className="text-sm font-medium text-gray-500">Texto principal</p>
  <p className="mt-1 text-xs text-gray-400">Subtexto de ayuda</p>
</div>
```

---

## Spinners de carga

```tsx
// Spinner inline
<div className="h-6 w-6 animate-spin rounded-full border-2 border-[#27ae60] border-t-transparent" />

// Skeleton de celdas (calendario)
<div className="aspect-square animate-pulse rounded-lg bg-gray-100" />
```

---

## Navegación lateral (sidebar)

### Item activo

```tsx
"bg-[#27ae60]/10 text-[#27ae60]"
```

### Item inactivo

```tsx
"text-gray-600 hover:bg-gray-100 hover:text-gray-900"
```

### Estructura del nav item

```tsx
className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors"
```

---

## Iconos

- **Fuente**: Heroicons (stroke, `strokeWidth={1.8}` en nav, `strokeWidth={2}` en acciones)
- Tamaños: `h-3.5 w-3.5` (micro), `h-4 w-4` (acción), `h-5 w-5` (nav), `h-6 w-6` (hamburger)
- Siempre `fill="none"` con `viewBox="0 0 24 24"`

---

## Colores de cinta (dominio)

Usados en calendario de cintas y formulario de enfunde:

| Color | Hex | Label |
|-------|-----|-------|
| `red` | `#ef4444` | Roja |
| `brown` | `#92400e` | Marrón |
| `black` | `#374151` | Negra |
| `green` | `#22c55e` | Verde |
| `blue` | `#3b82f6` | Azul |
| `white` | `#f3f4f6` | Blanca |
| `yellow` | `#eab308` | Amarilla |
| `lilac` | `#a78bfa` | Lila |
| `orange` | `#f97316` | Naranja (especial) |

> Textos sobre cintas claras (`white`, `yellow`) usan `text-gray-700`. Resto usan `text-white`.

---

## Componentes de formulario reutilizables

| Componente | Path | Descripción |
|------------|------|-------------|
| `Input` | `@/components/form/Input` | Input de texto con label + error |
| `Select` | `@/components/form/Select` | React-select, single/multi, creatable |
| `NativeSelect` | `@/components/form/NativeSelect` | HTML select nativo para listas pequeñas |

> Todos siguen estructura `ComponentName/index.tsx` (nunca archivo plano).

---

## Breakpoints (Tailwind por defecto)

```
sm   640px   Modales centrados (vs bottom-sheet mobile)
md   768px   Sidebar visible, tabla vs tarjetas, padding p-6
lg   1024px  (no usado explícitamente aún)
```

---

## Convenciones rápidas

- Color primario siempre como **hex literal** `#27ae60` (no clase Tailwind personalizada)
- Foco: `focus:border-[#27ae60] focus:ring-2 focus:ring-[#27ae60]/20`
- Hover destructivo: `hover:bg-red-50 hover:text-red-600`
- `overflow-hidden` + `rounded-2xl` siempre juntos en tarjetas con tabla
- `min-w-0 flex-1` en contenedores de texto truncado para evitar overflow
- `shrink-0` en avatares/iconos que no deben comprimirse
