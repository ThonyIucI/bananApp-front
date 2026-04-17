# bananApp — Front

Next.js 16 + React 19 + Tailwind CSS v4.

## Requisitos

- Node.js 20+
- npm 10+
- El servidor del back corriendo (ver `/saas/back/README.md`)

## Primer arranque (solo la primera vez)

```bash
cd saas/front
npm install
```

## Variables de entorno

Crea un archivo `.env.local` en `saas/front/`:

```env
NEXT_PUBLIC_API_URL=http://192.168.18.5:3000
```

> Reemplaza `192.168.18.5` con la IP de tu máquina en la red local.
> Para desarrollo solo en tu PC podés usar `http://localhost:3000`.

## Levantar el servidor de desarrollo

```bash
cd saas/front
npm run dev
```

El servidor arranca en:
- **PC:** http://localhost:3001
- **Celular (misma WiFi):** http://192.168.18.5:3001

> El script usa `-H 0.0.0.0 -p 3001` para que sea accesible desde la red local.

## Estructura del proyecto

```
src/
├── app/                        # Rutas (Next.js App Router)
│   ├── (auth)/login/page.tsx   # Página de login
│   ├── dashboard/page.tsx      # Dashboard post-login
│   └── layout.tsx              # Layout raíz con AuthProvider
├── lib/
│   └── api/
│       └── client.ts           # Instancia Axios con interceptores
└── modules/
    └── auth/
        ├── components/LoginForm.tsx
        ├── context/auth.context.tsx  # AuthProvider + sesión en localStorage
        ├── hooks/
        │   ├── useLogin.ts     # Hook de login (un hook por archivo)
        │   └── useAuth.ts      # Hook para leer la sesión
        ├── schemas/login.schema.ts   # Validación Zod
        ├── services/auth.service.ts  # Llamadas a la API (sin estado)
        └── types/auth.types.ts       # Interfaces TypeScript
```

## Convenciones

- **Un hook por archivo** — igual que en el back (un handler por archivo)
- **Services** — solo funciones que llaman a la API, sin estado
- **Hooks** — consumen los services y manejan el estado de UI
- **Axios client** (`src/lib/api/client.ts`) — instancia única con:
  - Token inyectado automáticamente en cada request desde `localStorage`
  - Errores normalizados en español
  - Cookie httpOnly de refresh token enviada automáticamente (`withCredentials`)
  - Timeout de 15 segundos
- **UI/UX** — siempre usar la skill `ui-ux-pro-max` antes de codear pantallas nuevas

## Tailwind CSS v4 — importante

Esta versión usa la nueva API de Tailwind v4:
- **Configuración:** solo vía `@import "tailwindcss"` en `globals.css`
- **PostCSS:** `postcss.config.mjs` usa `@tailwindcss/postcss` (¡distinto a v3!)
- **Sin** `tailwind.config.js`

> Si ves el error `tailwindcss doesn't exist` o `node_modules is not a directory`:
> 1. Asegurate de estar en la carpeta `saas/front/` (no en `saas/` ni en otro lugar)
> 2. Verifica que existe `postcss.config.mjs` — **no lo borres, es necesario en v4**
> 3. Corre `npm install` si no tenés `node_modules`

## Build de producción

```bash
npm run build
npm start
```
