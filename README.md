# Cerovueltas

**Plataforma que conecta PYMEs de Antofagasta con contadores, asesores tributarios y abogados verificados.**

---

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 14 (App Router) |
| Base de datos | Supabase (PostgreSQL) |
| Autenticación | Supabase Auth |
| Chat en tiempo real | Supabase Realtime |
| Storage (PDFs) | Supabase Storage |
| Hosting | Vercel |
| Estilos | Tailwind CSS |

---

## Requisitos

- Node.js 18+
- Cuenta en [Supabase](https://supabase.com) (gratuita)
- Cuenta en [Vercel](https://vercel.com) (gratuita)

---

## Instalación local

### 1. Clonar el repositorio

```bash
git clone https://github.com/TU_USUARIO/cerovueltas.git
cd cerovueltas
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

```bash
cp .env.local.example .env.local
```

Edita `.env.local` con tus credenciales de Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://TU_PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=TU_ANON_KEY
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Configurar Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com)
2. Ve a **SQL Editor** → ejecuta el archivo `supabase/schema.sql`
3. Ve a **Storage** → crea un bucket llamado `informes` (público)
4. Ve a **Authentication → URL Configuration** → agrega `http://localhost:3000` en Site URL

### 5. Iniciar el servidor de desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

---

## Despliegue en Vercel

### 1. Subir a GitHub

```bash
git add .
git commit -m "feat: cerovueltas inicial"
git remote add origin https://github.com/TU_USUARIO/cerovueltas.git
git push -u origin main
```

### 2. Importar en Vercel

1. Ve a [vercel.com](https://vercel.com) → **Add New Project**
2. Importa el repositorio de GitHub
3. Agrega las variables de entorno:

| Variable | Valor |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL de tu proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key de Supabase |
| `NEXT_PUBLIC_APP_URL` | `https://cerovueltas.vercel.app` |

4. Click **Deploy**

### 3. Configurar Supabase para producción

En Supabase → **Authentication → URL Configuration**:
- **Site URL**: `https://cerovueltas.vercel.app`
- **Redirect URLs**: `https://cerovueltas.vercel.app/auth/callback`

---

## Estructura del Proyecto

```
cerovueltas/
├── app/
│   ├── (auth)/
│   │   ├── login/          # Página de inicio de sesión
│   │   └── registro/       # Página de registro (cliente o profesional)
│   ├── auth/callback/      # Callback de autenticación por email
│   ├── cliente/            # Dashboard del cliente (PYME)
│   │   ├── page.tsx        # Home del dashboard
│   │   ├── buscar/         # Búsqueda y filtros de profesionales
│   │   ├── mensajes/       # Chat en tiempo real
│   │   └── informes/       # Solicitar y ver informes financieros
│   └── profesional/        # Dashboard del profesional
│       ├── page.tsx        # Home con stats e ingresos
│       ├── perfil/         # Editar perfil profesional
│       ├── clientes/       # Gestionar clientes conectados
│       ├── mensajes/       # Chat con clientes
│       └── informes/       # Tomar y entregar informes
├── components/
│   ├── dashboard/          # Sidebar, Topbar, StatCard, ProfesionalCard
│   └── chat/               # ChatWrapper con Supabase Realtime
├── lib/
│   ├── supabase/
│   │   ├── client.ts       # Cliente browser
│   │   ├── server.ts       # Cliente server (SSR)
│   │   └── types.ts        # Tipos TypeScript de la DB
│   └── utils.ts            # Utilidades (formatCLP, formatDate, etc.)
├── supabase/
│   └── schema.sql          # Tablas, RLS, triggers y funciones
└── middleware.ts            # Protección de rutas por rol
```

---

## Roles de Usuario

| Rol | Acceso | Descripción |
|-----|--------|-------------|
| `cliente` | `/cliente/*` | PYMEs que buscan profesionales |
| `profesional` | `/profesional/*` | Contadores, abogados, asesores |

El rol se asigna en el registro y se almacena en la tabla `profiles`.

---

## Funcionalidades por Etapa

- ✅ **Etapa 1** — Auth (login, registro, callback, middleware)
- ✅ **Etapa 2** — Dashboard cliente, búsqueda de profesionales, informes, chat
- ✅ **Etapa 3** — Dashboard profesional, perfil, gestión de clientes e informes
- 🔜 **Etapa 4** — Chat mejorado + notificaciones push
- 🔜 **Etapa 5** — Pagos con Transbank / Stripe

---

## Variables de Entorno

| Variable | Descripción | Requerida |
|----------|-------------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave pública de Supabase | ✅ |
| `NEXT_PUBLIC_APP_URL` | URL de la aplicación | ✅ |

---

## Apoyado por

- CORFO Antofagasta
- Gobierno Regional de Antofagasta
- ERI — Estrategia Regional de Innovación
- CORE — Consejo Regional Región de Antofagasta

---

© 2025 Cerovueltas — Antofagasta, Chile
