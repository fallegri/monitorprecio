# Monitor de Precios SCZ

Aplicación web para el relevamiento, almacenamiento y visualización de precios de la canasta básica, divisas y datos demográficos en Bolivia, con soporte multi-departamento.

## Stack

- **Framework:** Next.js 16 (App Router) + TypeScript
- **Base de datos:** Neon Tech (Serverless PostgreSQL) + Drizzle ORM
- **Estilo:** Tailwind CSS v4 + Shadcn UI
- **Despliegue:** Vercel + Vercel Cron Jobs

## Variables de entorno requeridas

Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```env
# Base de datos (Neon Tech)
DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require

# Seguridad — token para proteger el endpoint del cron job
CRON_SECRET=<token-aleatorio-seguro-de-al-menos-32-caracteres>

# URL base (para llamadas server-side en producción)
NEXT_PUBLIC_BASE_URL=https://tu-dominio.vercel.app
```

## Configuración inicial

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar la base de datos

Crea una base de datos en [Neon Tech](https://neon.tech) y copia el `DATABASE_URL` al `.env.local`.

### 3. Ejecutar migraciones

```bash
npm run db:migrate
```

### 4. Poblar departamentos

```bash
npm run db:seed
```

## Scripts disponibles

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción (incluye migraciones) |
| `npm run test` | Ejecutar tests |
| `npm run db:generate` | Generar migración desde el schema |
| `npm run db:migrate` | Aplicar migraciones pendientes |
| `npm run db:push` | Push directo del schema (desarrollo) |
| `npm run db:seed` | Poblar datos iniciales (departamentos) |
| `npm run db:studio` | Abrir Drizzle Studio |

## Despliegue en Vercel

1. Conecta el repositorio a Vercel
2. Configura las variables de entorno en el panel de Vercel
3. El build ejecuta automáticamente las migraciones (`drizzle-kit migrate`)
4. El cron job se configura automáticamente desde `vercel.json` (diario a las 08:00 America/La_Paz)

## Endpoints de la API

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/health` | Estado del sistema y BD |
| `GET` | `/api/spec` | Contratos de datos (Antigravity) |
| `GET/POST` | `/api/products` | Listar / crear productos |
| `GET/PUT/PATCH` | `/api/products/:id` | Detalle / editar / activar producto |
| `GET` | `/api/price-logs` | Registros de precios con filtros |
| `GET/PUT` | `/api/monitoring-config` | Configuración de frecuencia |
| `POST` | `/api/cron/run` | Disparar motor de relevamiento (requiere `CRON_SECRET`) |

## Seguridad

- Todas las credenciales se gestionan por variables de entorno
- El endpoint `/api/cron/run` requiere `Authorization: Bearer <CRON_SECRET>`
- Rate limiting activo en todos los endpoints API (5 req/min para cron/run)
- Headers de seguridad HTTP configurados en `next.config.ts`
- Sin stack traces en producción
