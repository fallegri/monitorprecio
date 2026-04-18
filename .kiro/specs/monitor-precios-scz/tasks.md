# Plan de Implementación: Monitor de Precios SCZ

## Descripción General

Implementación incremental de la aplicación web full-stack sobre Next.js (App Router) + TypeScript, con base de datos PostgreSQL serverless en Neon Tech (Drizzle ORM), Motor de Relevamiento con adaptadores scraper/REST, dashboard con Shadcn UI y automatización mediante Vercel Cron Jobs.

El lenguaje de implementación es **TypeScript** en todo el stack.

---

## Tareas

- [x] 1. Setup inicial del proyecto
  - Inicializar proyecto Next.js 14+ con App Router y TypeScript estricto (`npx create-next-app@latest --typescript --app --tailwind --eslint`)
  - Instalar y configurar Shadcn UI (`npx shadcn-ui@latest init`)
  - Instalar dependencias de base de datos: `@neondatabase/serverless`, `drizzle-orm`, `drizzle-kit`
  - Instalar dependencias del motor: `cheerio`, `zod`
  - Instalar dependencias de testing: `vitest`, `@vitest/coverage-v8`, `fast-check`, `@testing-library/react`, `supertest`
  - Crear archivo `.env.local` con las variables `DATABASE_URL`, `CRON_SECRET` (y opcionales Upstash)
  - Configurar `vitest.config.ts` con soporte para paths de TypeScript y entorno jsdom para componentes
  - Crear estructura de directorios base: `src/app`, `src/components`, `src/lib`, `tests/unit`, `tests/integration`, `tests/smoke`
  - _Requisitos: 9.1_

- [x] 2. Modelo de datos y migraciones
  - [x] 2.1 Implementar esquema Drizzle ORM
    - Crear `src/lib/db/schema.ts` con las cinco tablas: `departments`, `products`, `product_departments`, `price_logs`, `monitoring_config`
    - Definir el enum `category` con valores `Alimentos`, `Divisas`, `Demografía`
    - Configurar restricciones: PK, FK con `onDelete: cascade/restrict`, `unique`, `defaultNow()`
    - Crear `src/lib/db/index.ts` con conexión Neon serverless y exportación del cliente Drizzle
    - Crear `drizzle.config.ts` apuntando al schema y a la base de datos
    - _Requisitos: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [x] 2.2 Crear script de seed de departamentos
    - Crear `src/lib/db/seed.ts` con INSERT de los nueve departamentos de Bolivia (SCZ, LPZ, CBB, ORU, POT, CHU, TJA, BEN, PAN)
    - Agregar script `db:seed` en `package.json`
    - _Requisitos: 2.1, 6.1_

  - [x] 2.3 Configurar migraciones Drizzle Kit
    - Agregar scripts `db:generate`, `db:migrate`, `db:push` en `package.json`
    - Generar la migración inicial con `drizzle-kit generate`
    - _Requisitos: 6.1–6.5_

  - [ ]* 2.4 Smoke test: verificar schema y seed
    - Crear `tests/smoke/schema.test.ts` que verifique que las cinco tablas existen y tienen las columnas esperadas
    - Crear `tests/smoke/departments.test.ts` que verifique que los nueve departamentos están presentes tras el seed
    - _Requisitos: 2.1, 6.1–6.5_

- [~] 3. Checkpoint — Verificar base de datos
  - Ejecutar `db:push` y `db:seed` contra la base de datos de desarrollo
  - Asegurarse de que todos los smoke tests pasan antes de continuar

- [x] 4. Capa de API — Endpoints de infraestructura
  - [x] 4.1 Implementar `GET /api/health`
    - Crear `src/app/api/health/route.ts`
    - Ejecutar una query simple (`SELECT 1`) para verificar conectividad con Neon
    - Retornar `{ status, db, timestamp }` con código 200 u 503 según corresponda
    - Timestamp en formato ISO8601 con offset `America/La_Paz`
    - _Requisitos: 7.1, 7.2, 7.3_

  - [x] 4.2 Implementar `GET /api/spec`
    - Crear `src/app/api/spec/route.ts`
    - Retornar el objeto JSON estático con los modelos `Product`, `PriceLog`, `Department`, `MonitoringConfig`
    - _Requisitos: 7.4, 7.5_

  - [ ]* 4.3 Tests de integración para health y spec
    - Crear `tests/integration/health.test.ts` verificando respuestas 200 y 503
    - Crear `tests/integration/spec.test.ts` verificando que el contrato contiene los cuatro modelos
    - _Requisitos: 7.1–7.5_

- [x] 5. Capa de API — Endpoints de productos
  - [x] 5.1 Implementar validaciones Zod para inputs de API
    - Crear `src/lib/validations/schemas.ts` con schemas Zod para `CreateProductInput`, `UpdateProductInput`, `PatchProductInput`
    - Crear `src/lib/utils/api-error.ts` con el wrapper `handleApiError` que distingue `ZodError` (400) de errores internos (500)
    - _Requisitos: 9.2, 9.3_

  - [x] 5.2 Implementar `GET /api/products` y `POST /api/products`
    - Crear `src/app/api/products/route.ts`
    - `GET`: consultar productos con joins a `product_departments` y `departments`; soportar query params `category`, `departmentId`, `isActive`
    - `POST`: validar body con Zod, insertar en `products` y en `product_departments`, retornar 201 con el objeto creado
    - _Requisitos: 1.1, 1.2, 1.3, 1.6_

  - [ ]* 5.3 Test de propiedad: creación de producto válido persiste correctamente
    - Crear `tests/unit/api/products.test.ts`
    - **Propiedad 1: Creación de producto válido persiste correctamente**
    - **Valida: Requisitos 1.2**

  - [ ]* 5.4 Test de propiedad: inputs inválidos son rechazados con HTTP 400
    - **Propiedad 2: Inputs inválidos son rechazados con HTTP 400**
    - **Valida: Requisitos 1.3, 4.3, 9.2, 9.3**

  - [x] 5.5 Implementar `GET /api/products/:id`, `PUT /api/products/:id` y `PATCH /api/products/:id`
    - Crear `src/app/api/products/[id]/route.ts`
    - `GET`: retornar producto con departamentos o 404
    - `PUT`: validar body, actualizar todos los campos enviados, actualizar `product_departments`, retornar 200
    - `PATCH`: validar body parcial (ej. solo `isActive`), actualizar solo los campos presentes, retornar 200
    - _Requisitos: 1.4, 1.5_

  - [ ]* 5.6 Test de propiedad: edición actualiza todos los campos enviados
    - **Propiedad 3: Edición de producto actualiza todos los campos enviados**
    - **Valida: Requisitos 1.4**

  - [ ]* 5.7 Test de propiedad: desactivación establece is_active = false
    - **Propiedad 4: Desactivación de producto establece is_active = false**
    - **Valida: Requisitos 1.5**

  - [ ]* 5.8 Test de propiedad: filtrado respeta el criterio aplicado
    - **Propiedad 5: Filtrado respeta el criterio aplicado**
    - **Valida: Requisitos 1.6, 2.5, 3.5**

  - [ ]* 5.9 Test de propiedad: asociación producto-departamento persiste correctamente
    - **Propiedad 6: Asociación producto-departamento persiste correctamente**
    - **Valida: Requisitos 2.2**

- [x] 6. Capa de API — Endpoints de price-logs y monitoring-config
  - [x] 6.1 Implementar `GET /api/price-logs`
    - Crear `src/app/api/price-logs/route.ts`
    - Soportar query params: `productId`, `departmentId`, `from` (ISO8601), `to` (ISO8601), `limit` (default 100)
    - Retornar array de registros con todos los campos del contrato
    - _Requisitos: 5.2, 6.4_

  - [ ]* 6.2 Test de propiedad: todo price_log tiene department_id válido
    - Crear `tests/unit/api/price-logs.test.ts`
    - **Propiedad 7: Todo price_log tiene department_id válido**
    - **Valida: Requisitos 2.3, 2.4**

  - [ ]* 6.3 Test de propiedad: filtrado temporal respeta el rango de fechas
    - **Propiedad 11: Filtrado temporal de price_logs respeta el rango de fechas**
    - **Valida: Requisitos 5.2**

  - [ ]* 6.4 Test de propiedad: cálculo de variación porcentual es correcto
    - **Propiedad 12: Cálculo de variación porcentual es correcto**
    - **Valida: Requisitos 5.4**

  - [x] 6.5 Implementar `GET /api/monitoring-config` y `PUT /api/monitoring-config`
    - Crear `src/app/api/monitoring-config/route.ts`
    - Crear `src/lib/utils/cron.ts` con función `isValidCronExpression(expr: string): boolean`
    - `GET`: retornar la fila única de `monitoring_config`
    - `PUT`: validar expresión cron con la utilidad, actualizar registro, retornar 200 o 400
    - _Requisitos: 4.1, 4.2, 4.3_

  - [ ]* 6.6 Test de propiedad: inputs inválidos de monitoring-config rechazados con 400
    - Crear `tests/unit/api/monitoring-config.test.ts`
    - **Propiedad 2 (cron): Inputs inválidos son rechazados con HTTP 400**
    - **Valida: Requisitos 4.3, 9.2, 9.3**

  - [ ]* 6.7 Test de propiedad: integridad referencial de departamentos
    - Crear `tests/unit/db/integrity.test.ts`
    - **Propiedad 13: Integridad referencial de departamentos**
    - **Valida: Requisitos 6.6**

- [~] 7. Checkpoint — Verificar capa de API
  - Asegurarse de que todos los tests de la capa de API pasan
  - Verificar manualmente los endpoints con curl o un cliente HTTP

- [x] 8. Motor de Relevamiento — Parser y adaptadores
  - [x] 8.1 Implementar parser y schemas Zod del motor
    - Crear `src/lib/engine/parser.ts` con `PriceRecordSchema`, `serializePriceRecord` y `deserializePriceLog`
    - El schema debe validar: `productId` (uuid), `departmentId` (uuid), `price` (number positivo), `sourceName` (min 1), `sourceUrl` (url), `observations` (opcional), `timestamp` (datetime con offset)
    - _Requisitos: 8.1, 8.2, 8.3, 8.4, 8.5_

  - [ ]* 8.2 Test de propiedad: round-trip de PriceRecord preserva todos los campos
    - Crear `tests/unit/engine/parser.test.ts`
    - **Propiedad 14: Round-trip de PriceRecord preserva todos los campos**
    - **Valida: Requisitos 8.3, 8.4, 8.5**

  - [ ]* 8.3 Test de propiedad: parseo de respuesta válida produce PriceRecord completo
    - **Propiedad 15: Parseo de respuesta válida produce PriceRecord completo**
    - **Valida: Requisitos 8.1**

  - [ ]* 8.4 Test de propiedad: parseo de respuesta inválida falla sin persistir datos
    - **Propiedad 16: Parseo de respuesta inválida falla sin persistir datos**
    - **Valida: Requisitos 8.2**

  - [x] 8.5 Implementar interfaces base y adaptadores del motor
    - Crear `src/lib/engine/scrapers/base.ts` con la interfaz `ScraperAdapter`
    - Crear `src/lib/engine/clients/base.ts` con la interfaz `RestApiAdapter`
    - Crear `src/lib/engine/scrapers/unitel.ts` implementando `ScraperAdapter` con Cheerio
    - Crear `src/lib/engine/scrapers/eldeber.ts` implementando `ScraperAdapter` con Cheerio
    - Crear `src/lib/engine/clients/bcb.ts` implementando `RestApiAdapter` para el Banco Central de Bolivia
    - _Requisitos: 3.2_

  - [x] 8.6 Implementar orquestador del motor (`lib/engine/index.ts`)
    - Crear `src/lib/engine/index.ts` con la función `runEngine(options?)` que:
      1. Consulta productos activos con sus departamentos (filtrando por `category` y `departmentCode` si se proveen)
      2. Itera sobre cada combinación producto-departamento
      3. Resuelve el adaptador desde `ADAPTER_REGISTRY`
      4. Llama a `adapter.fetch()`, valida con `PriceRecordSchema.parse()` y persiste con Drizzle
      5. Captura errores por producto sin interrumpir el loop
      6. Retorna `EngineRunResult` con `successful`, `failed`, `errors` y `finishedAt`
    - _Requisitos: 3.1, 3.3, 3.4, 3.5, 3.6_

  - [ ]* 8.7 Test de propiedad: motor procesa todos los productos activos
    - Crear `tests/unit/engine/engine.test.ts`
    - **Propiedad 8: Motor procesa todos los productos activos**
    - **Valida: Requisitos 3.1**

  - [ ]* 8.8 Test de propiedad: registros persistidos contienen todos los campos requeridos
    - **Propiedad 9: Registros persistidos contienen todos los campos requeridos**
    - **Valida: Requisitos 3.3**

  - [ ]* 8.9 Test de propiedad: motor continúa ante errores parciales
    - **Propiedad 10: Motor continúa ante errores parciales**
    - **Valida: Requisitos 3.4, 3.6**

- [x] 9. Capa de API — Endpoint del cron job
  - [x] 9.1 Implementar `POST /api/cron/run`
    - Crear `src/app/api/cron/run/route.ts`
    - Verificar header `Authorization: Bearer <CRON_SECRET>` antes de cualquier otra operación
    - Rechazar con 401 si el token es ausente o inválido
    - Invocar `runEngine(options)` con los query params opcionales `category` y `departmentCode`
    - Retornar `EngineRunResult` serializado con código 200
    - _Requisitos: 3.1, 3.5, 3.6, 9.7, 9.8_

  - [ ]* 9.2 Test de propiedad: autenticación CRON_SECRET protege el endpoint
    - Crear `tests/unit/api/cron-run.test.ts`
    - **Propiedad 17: Autenticación CRON_SECRET protege el endpoint del motor**
    - **Valida: Requisitos 9.7, 9.8**

  - [ ]* 9.3 Test de propiedad: errores en producción no exponen detalles internos
    - **Propiedad 18: Errores en producción no exponen detalles internos**
    - **Valida: Requisitos 9.6**

- [~] 10. Checkpoint — Verificar motor y endpoint cron
  - Asegurarse de que todos los tests del motor y del endpoint cron pasan
  - Verificar que el motor retorna `EngineRunResult` correcto con productos de prueba

- [x] 11. Seguridad — Headers HTTP y rate limiting
  - [x] 11.1 Configurar headers de seguridad HTTP
    - Modificar `next.config.js` para agregar los headers `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options` y `Referrer-Policy` en todas las rutas
    - _Requisitos: 9.5_

  - [x] 11.2 Implementar rate limiting en middleware
    - Crear `src/middleware.ts` con lógica de rate limiting por IP usando un contador en memoria (o Upstash Redis si `UPSTASH_REDIS_REST_URL` está definido)
    - Aplicar los límites definidos en el diseño: 60 req/min para health/spec, 30 para products/price-logs, 10 para POST products, 5 para cron/run
    - Retornar 429 con header `Retry-After` cuando se supera el límite
    - _Requisitos: 9.4_

  - [ ]* 11.3 Smoke test: verificar headers de seguridad
    - Crear `tests/smoke/security-headers.test.ts` que verifique la presencia de los cuatro headers en las respuestas
    - _Requisitos: 9.5_

  - [ ]* 11.4 Test de integración: rate limiting
    - Crear `tests/integration/rate-limiting.test.ts` que verifique que el endpoint cron retorna 429 tras superar el límite
    - _Requisitos: 9.4_

- [x] 12. Dashboard UI — Componentes base y layout
  - [x] 12.1 Crear layout del dashboard
    - Crear `src/app/(dashboard)/layout.tsx` con navegación lateral (Shadcn Sidebar o nav simple) con enlaces a `/`, `/productos`, `/tendencias`, `/configuracion`
    - Instalar componentes Shadcn necesarios: `button`, `card`, `dialog`, `form`, `input`, `select`, `table`, `badge`
    - _Requisitos: 1.1, 5.1_

  - [x] 12.2 Implementar página principal del dashboard (`/`)
    - Crear `src/app/(dashboard)/page.tsx` como Server Component
    - Mostrar resumen de últimos precios por categoría usando `PriceSummaryCard`
    - Mostrar estado del último cron job (exitosos/fallidos) si está disponible
    - Incluir accesos rápidos a `/tendencias` y `/configuracion`
    - _Requisitos: 5.4_

- [x] 13. Dashboard UI — Gestión de productos
  - [x] 13.1 Implementar `ProductFilters` y `ProductTable`
    - Crear `src/components/products/ProductFilters.tsx` (Client Component) con selectores de Categoría y Departamento
    - Crear `src/components/products/ProductTable.tsx` (Server Component) con columnas: Nombre, Unidad, Categoría, Departamentos, Estado; acciones: Editar, Activar/Desactivar
    - _Requisitos: 1.1, 1.5, 1.6_

  - [x] 13.2 Implementar `ProductForm` (modal de creación/edición)
    - Crear `src/components/products/ProductForm.tsx` (Client Component) usando Shadcn Dialog
    - Incluir campos: nombre, unidad, categoría (Select), departamentos (multi-select), estado
    - Validar en cliente con Zod antes de enviar; mostrar errores descriptivos
    - Llamar a `POST /api/products` o `PUT /api/products/:id` según corresponda
    - _Requisitos: 1.2, 1.3, 1.4, 2.2_

  - [x] 13.3 Implementar página de productos (`/productos`)
    - Crear `src/app/(dashboard)/productos/page.tsx` componiendo `ProductFilters` y `ProductTable`
    - Crear `src/app/(dashboard)/productos/[id]/page.tsx` para detalle/edición de producto
    - _Requisitos: 1.1, 1.2, 1.4, 1.6_

- [x] 14. Dashboard UI — Tendencias y configuración
  - [x] 14.1 Implementar `PriceTrendChart` y `PriceSummaryCard`
    - Instalar Recharts: `npm install recharts`
    - Crear `src/components/charts/PriceTrendChart.tsx` (Client Component) con gráfico de líneas, DateRangePicker de Shadcn y selector multi-departamento
    - Crear `src/components/charts/PriceSummaryCard.tsx` (Server Component) con último precio, variación porcentual y fuente
    - Mostrar mensaje de ausencia de datos cuando no hay registros en el rango seleccionado
    - _Requisitos: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [x] 14.2 Implementar página de tendencias (`/tendencias`)
    - Crear `src/app/(dashboard)/tendencias/page.tsx` componiendo `PriceTrendChart` y `PriceSummaryCard`
    - _Requisitos: 5.1–5.5_

  - [x] 14.3 Implementar `MonitoringConfigForm` y página de configuración
    - Crear `src/components/config/MonitoringConfigForm.tsx` (Client Component) con:
      - Selector de frecuencia predefinida (Diaria `0 8 * * *`, Semanal `0 8 * * 1`, Mensual `0 8 1 * *`)
      - Input de expresión cron personalizada con validación en tiempo real usando `isValidCronExpression`
      - Botón "Ejecutar ahora" que invoca `POST /api/cron/run` con el `CRON_SECRET` desde variable de entorno pública o acción de servidor
    - Crear `src/app/(dashboard)/configuracion/page.tsx`
    - _Requisitos: 4.1, 4.2, 4.3, 4.4_

- [~] 15. Checkpoint — Verificar dashboard completo
  - Asegurarse de que todas las páginas renderizan sin errores
  - Verificar que los formularios validan correctamente y llaman a los endpoints esperados

- [x] 16. Configuración de despliegue
  - [x] 16.1 Crear `vercel.json` con configuración de cron job
    - Crear `vercel.json` en la raíz con el cron job apuntando a `/api/cron/run` con schedule `0 8 * * *` (valor por defecto de `monitoring_config`)
    - _Requisitos: 4.5_

  - [x] 16.2 Configurar script de migración en build
    - Modificar el script `build` en `package.json` para ejecutar `drizzle-kit migrate` antes de `next build`
    - Documentar en `README.md` las variables de entorno requeridas: `DATABASE_URL`, `CRON_SECRET`
    - _Requisitos: 6.1–6.5_

- [-] 17. Checkpoint final — Verificar suite completa de tests
  - Ejecutar `vitest --run` y asegurarse de que todos los tests (unit, integration, smoke) pasan
  - Verificar que no hay errores de TypeScript con `tsc --noEmit`
  - Asegurarse de que el build de producción completa sin errores con `next build`

---

## Notas

- Las tareas marcadas con `*` son opcionales y pueden omitirse para un MVP más rápido, pero se recomienda implementarlas para garantizar las propiedades de corrección del sistema.
- Cada tarea de propiedad referencia explícitamente la propiedad del documento de diseño y los requisitos que valida.
- Los checkpoints aseguran validación incremental antes de avanzar a la siguiente fase.
- El lenguaje de implementación es TypeScript en todo el stack (Next.js, Drizzle, Zod, fast-check).
- Las propiedades de corrección 1–18 están distribuidas como sub-tareas opcionales junto a la implementación que validan, para detectar errores temprano.
