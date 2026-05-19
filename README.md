# Ema IA — Panel para estéticas

Asistente web para clínicas de estética: centraliza conversaciones de WhatsApp y la agenda de citas. Los clientes hablan con **Ema** por WhatsApp; este repositorio es el **panel de control** donde el equipo ve mensajes, gestiona citas y configura la clínica.

Repositorio: [elsegundocorreodejose-lab/ema-s-beauty-ai](https://github.com/elsegundocorreodejose-lab/ema-s-beauty-ai)

## Características

- **Landing** pública con propuesta de valor y CTA de registro
- **Autenticación** con Supabase (login y registro)
- **Dashboard** con tres áreas:
  - **Mensajes** — historial agrupado por número (lectura; respuestas automáticas vía integración externa)
  - **Citas** — listado, estados (`pendiente` / `confirmada` / `cancelada`) y alta manual
  - **Configuración** — datos de la estética, servicios, horarios y URL de webhook WhatsApp (solo administradores)
- **Roles**: el primer usuario registrado es `admin`; los siguientes, `staff`
- **SSR** con TanStack Start y despliegue orientado a **Cloudflare Workers**

## Stack

| Capa | Tecnología |
|------|------------|
| UI | React 19, Tailwind CSS 4, shadcn/ui (Radix) |
| Routing / SSR | TanStack Router, TanStack Start |
| Datos | Supabase (Auth, Postgres, Realtime) |
| Estado servidor | TanStack React Query |
| Build | Vite 7, `@lovable.dev/vite-tanstack-config` |
| Deploy | Cloudflare (`wrangler.jsonc`) |

## Requisitos

- **Node.js** 22+ o **Bun** (recomendado si usas `bun.lock`)
- Cuenta y proyecto en [Supabase](https://supabase.com)
- (Opcional) [Git](https://git-scm.com/) para clonar el repositorio

## Instalación

```bash
git clone https://github.com/elsegundocorreodejose-lab/ema-s-beauty-ai.git
cd ema-s-beauty-ai
```

Con Bun:

```bash
bun install
```

Con npm:

```bash
npm install
```

## Variables de entorno

Crea un archivo `.env` en la raíz del proyecto (o copia desde `.env.example` si lo añades al repo):

```env
SUPABASE_URL=https://TU_PROYECTO.supabase.co
SUPABASE_PUBLISHABLE_KEY=tu_clave_anon_publicable

VITE_SUPABASE_URL=https://TU_PROYECTO.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=tu_clave_anon_publicable
VITE_SUPABASE_PROJECT_ID=tu_project_id
```

Para operaciones de servidor con privilegios elevados (solo backend, nunca en el cliente):

```env
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```

> No subas claves reales a Git. Usa variables de entorno en producción (por ejemplo Lovable Cloud o secretos de Cloudflare).

## Base de datos (Supabase)

Aplica la migración incluida en el proyecto:

```bash
# Con Supabase CLI, desde la raíz del repo
supabase db push
```

O ejecuta manualmente el SQL en el panel de Supabase:

`supabase/migrations/20260518151852_686eab2d-303c-4116-aa05-3988cec05465.sql`

Crea tablas: `messages`, `appointments`, `esthetic_settings`, `profiles`, `user_roles`, políticas RLS y triggers de registro.

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` / `bun run dev` | Servidor de desarrollo (Vite) |
| `npm run build` | Build de producción |
| `npm run build:dev` | Build en modo development |
| `npm run preview` | Previsualizar el build |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |

En desarrollo, la app suele estar en **http://localhost:8080** (configuración Lovable/TanStack Start).

## Rutas

| Ruta | Acceso | Descripción |
|------|--------|-------------|
| `/` | Público | Landing |
| `/login` | Público | Inicio de sesión y registro |
| `/dashboard` | Autenticado | Panel principal |

## Estructura del proyecto

```
src/
├── routes/                 # Rutas file-based (TanStack Router)
├── components/
│   ├── dashboard/          # Mensajes, citas, configuración
│   └── ui/                 # Componentes shadcn
├── integrations/supabase/  # Cliente, tipos, middleware de auth
├── lib/                    # Utilidades y manejo de errores SSR
├── router.tsx
├── server.ts               # Entrada Cloudflare / SSR
└── start.ts
supabase/
├── migrations/             # Esquema SQL
└── config.toml
```

## Integración WhatsApp

La lógica de la IA y el envío/recepción por WhatsApp **no viven en este frontend**. Un servicio externo (webhook) debe:

1. Recibir mensajes de WhatsApp e insertarlos en `messages`
2. Leer `esthetic_settings` (servicios, horarios, contexto) para responder como Ema
3. Crear o actualizar filas en `appointments` cuando corresponda

La URL del webhook se configura en **Dashboard → Configuración**.

## Despliegue (Cloudflare)

El proyecto incluye `wrangler.jsonc` con entrada en `src/server.ts`. Tras `npm run build`, despliega con [Wrangler](https://developers.cloudflare.com/workers/wrangler/) según tu flujo Lovable/Cloudflare.

Configura las mismas variables de entorno de Supabase en el entorno de producción.

## Desarrollo local en Windows

Si no tienes Git o Bun en el PATH, puedes usar Node portable o los scripts auxiliares que genera el setup (`download-missing.mjs` solo aplica si descargaste el repo sin `git clone`).

## Licencia

Proyecto privado (`"private": true` en `package.json`). Consulta al propietario del repositorio para uso y distribución.
