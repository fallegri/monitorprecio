# Documento de Requisitos

## Introducción

El **Monitor de Precios SCZ** es una aplicación web que automatiza el relevamiento, almacenamiento y visualización de precios de la canasta básica, divisas y datos demográficos en Bolivia, con soporte multi-departamento. La aplicación permite configurar productos a monitorear, ejecutar scrapers/consumidores de APIs de forma programada, y visualizar tendencias de precios por departamento a lo largo del tiempo.

El sistema está construido sobre Next.js (App Router) con TypeScript, desplegado en Vercel, con base de datos PostgreSQL serverless en Neon Tech y automatización mediante Vercel Cron Jobs.

---

## Glosario

- **Sistema**: La aplicación web Monitor de Precios SCZ en su totalidad.
- **Panel**: El dashboard de administración donde el usuario gestiona productos, configuraciones y visualiza gráficos.
- **Producto**: Un ítem de la canasta básica, divisa o dato demográfico que se monitorea (ej. "Carne de Pollo", "USD/BOB").
- **Registro_de_Precio**: Una entrada en la tabla `price_logs` que almacena el precio de un producto en un momento y fuente determinados.
- **Motor_de_Relevamiento**: El componente que ejecuta scrapers o consume APIs externas para obtener precios actualizados.
- **Cron_Job**: Tarea programada ejecutada por Vercel en intervalos definidos por una expresión cron.
- **Departamento**: Una de las nueve divisiones administrativas de Bolivia (ej. Santa Cruz, La Paz, Cochabamba).
- **Fuente**: El portal web o API externa de donde se extrae el precio (ej. Unitel, El Deber).
- **ORM**: Capa de abstracción de base de datos (Prisma o Drizzle ORM).
- **Endpoint_de_Salud**: Ruta HTTP que verifica que el sistema está operativo.
- **Endpoint_de_Spec**: Ruta HTTP que expone los contratos de datos para verificación de integridad con Antigravity.
- **Antigravity**: Sistema externo de verificación de contratos e integridad de flujo de datos.

---

## Requisitos

### Requisito 1: Gestión de Productos

**Historia de Usuario:** Como administrador, quiero crear, editar, activar y desactivar productos a monitorear, para mantener actualizado el catálogo de ítems relevantes.

#### Criterios de Aceptación

1. THE Panel SHALL mostrar la lista completa de productos registrados, incluyendo nombre, unidad, categoría, departamentos asociados y estado activo/inactivo.
2. WHEN el administrador envía el formulario de creación con nombre, unidad y categoría válidos, THE Panel SHALL persistir el nuevo producto en la base de datos con `is_active = true`.
3. IF el administrador envía el formulario de creación con nombre vacío o categoría inválida, THEN THE Panel SHALL mostrar un mensaje de error descriptivo sin persistir el registro.
4. WHEN el administrador edita un producto existente y confirma los cambios, THE Panel SHALL actualizar el registro en la base de datos y reflejar los cambios en la lista.
5. WHEN el administrador desactiva un producto, THE Panel SHALL establecer `is_active = false` y el Motor_de_Relevamiento SHALL omitir ese producto en futuras ejecuciones.
6. THE Panel SHALL permitir filtrar la lista de productos por categoría (Alimentos, Divisas, Demografía) y por departamento.

---

### Requisito 2: Soporte Multi-Departamento

**Historia de Usuario:** Como analista, quiero asociar productos y registros de precios a departamentos específicos de Bolivia, para comparar precios entre regiones.

#### Criterios de Aceptación

1. THE Sistema SHALL reconocer los nueve departamentos de Bolivia: Santa Cruz, La Paz, Cochabamba, Oruro, Potosí, Chuquisaca, Tarija, Beni y Pando.
2. WHEN se crea o edita un producto, THE Panel SHALL permitir asociar ese producto a uno o más departamentos.
3. WHEN el Motor_de_Relevamiento registra un precio, THE Sistema SHALL almacenar el departamento correspondiente en el Registro_de_Precio.
4. IF un Registro_de_Precio se intenta persistir sin departamento asociado, THEN THE Sistema SHALL rechazar la operación y registrar un error en el log.
5. THE Panel SHALL permitir filtrar los gráficos de tendencia por departamento, mostrando series de datos independientes por región.
6. WHERE el usuario selecciona múltiples departamentos, THE Panel SHALL mostrar las series de precios de cada departamento en el mismo gráfico para comparación directa.

---

### Requisito 3: Motor de Relevamiento y Scraping

**Historia de Usuario:** Como administrador, quiero que el sistema obtenga precios automáticamente desde fuentes externas, para no tener que ingresar datos manualmente.

#### Criterios de Aceptación

1. WHEN el Cron_Job se activa según la expresión cron configurada, THE Motor_de_Relevamiento SHALL ejecutar el relevamiento de todos los productos activos.
2. THE Motor_de_Relevamiento SHALL soportar dos modos de obtención de datos: consumo de API REST y scraping de páginas web (portales como Unitel y El Deber).
3. WHEN el Motor_de_Relevamiento obtiene un precio válido de una fuente, THE Sistema SHALL persistir un Registro_de_Precio con precio, nombre de fuente, URL de fuente, departamento y timestamp con zona horaria `America/La_Paz`.
4. IF una fuente externa devuelve un error HTTP o el scraping falla, THEN THE Motor_de_Relevamiento SHALL registrar el error con fuente, departamento y timestamp, y SHALL continuar con el siguiente producto sin interrumpir la ejecución completa.
5. THE Motor_de_Relevamiento SHALL ejecutarse de forma parametrizada, permitiendo filtrar la ejecución por categoría o por departamento específico.
6. WHEN el Motor_de_Relevamiento completa una ejecución, THE Sistema SHALL registrar un resumen con cantidad de registros exitosos, fallidos y timestamp de finalización.

---

### Requisito 4: Configuración de Frecuencia de Monitoreo

**Historia de Usuario:** Como administrador, quiero configurar la frecuencia con la que se ejecuta el relevamiento, para adaptarla a las necesidades del negocio.

#### Criterios de Aceptación

1. THE Panel SHALL mostrar la configuración actual de frecuencia de monitoreo, incluyendo la expresión cron y la zona horaria.
2. WHEN el administrador selecciona una frecuencia predefinida (diaria, semanal, mensual) o ingresa una expresión cron personalizada válida, THE Panel SHALL actualizar el registro en la tabla `monitoring_config`.
3. IF el administrador ingresa una expresión cron con formato inválido, THEN THE Panel SHALL mostrar un mensaje de error descriptivo sin persistir el cambio.
4. THE Sistema SHALL usar `America/La_Paz` como zona horaria por defecto para todas las ejecuciones programadas.
5. WHEN la configuración de frecuencia es actualizada, THE Sistema SHALL aplicar la nueva expresión cron en el archivo `vercel.json` en el siguiente despliegue.

---

### Requisito 5: Visualización de Tendencias de Precios

**Historia de Usuario:** Como analista, quiero visualizar gráficos de tendencia de precios por producto y departamento, para identificar variaciones y patrones a lo largo del tiempo.

#### Criterios de Aceptación

1. THE Panel SHALL mostrar un gráfico de líneas de tendencia para cada producto seleccionado, con el eje X representando el tiempo y el eje Y el precio.
2. WHEN el usuario selecciona un rango de fechas, THE Panel SHALL filtrar los datos del gráfico al período seleccionado.
3. WHEN el usuario selecciona uno o más departamentos, THE Panel SHALL renderizar una serie de datos independiente por departamento en el mismo gráfico.
4. THE Panel SHALL mostrar el último precio registrado, la variación porcentual respecto al registro anterior y la fuente del dato en una tarjeta de resumen por producto.
5. IF no existen registros de precio para un producto en el rango de fechas seleccionado, THEN THE Panel SHALL mostrar un mensaje indicando la ausencia de datos en lugar de un gráfico vacío.

---

### Requisito 6: Persistencia y Modelo de Datos

**Historia de Usuario:** Como desarrollador, quiero un modelo de datos bien definido con soporte multi-departamento, para garantizar la integridad y trazabilidad de los registros.

#### Criterios de Aceptación

1. THE Sistema SHALL mantener una tabla `departments` con los nueve departamentos de Bolivia, con campos `id` (UUID, PK), `name` (String) y `code` (String, único).
2. THE Sistema SHALL mantener una tabla `products` con campos `id` (UUID, PK), `name` (String), `unit` (String), `category` (Enum: Alimentos, Divisas, Demografía) e `is_active` (Boolean).
3. THE Sistema SHALL mantener una tabla `product_departments` como tabla de unión entre `products` y `departments` para la relación muchos-a-muchos.
4. THE Sistema SHALL mantener una tabla `price_logs` con campos `id` (BigInt, PK), `product_id` (UUID, FK), `department_id` (UUID, FK), `price` (Decimal), `source_name` (String), `source_url` (Text), `observations` (Text) y `timestamp` (Timestamp con zona horaria).
5. THE Sistema SHALL mantener una tabla `monitoring_config` con campos `id` (UUID, PK), `cron_expression` (String) y `timezone` (String, default `America/La_Paz`).
6. IF se intenta eliminar un departamento que tiene Registros_de_Precio asociados, THEN THE Sistema SHALL rechazar la operación y retornar un error descriptivo.

---

### Requisito 7: Integración con Antigravity

**Historia de Usuario:** Como operador, quiero que el sistema exponga endpoints de salud y de especificación de contratos, para que Antigravity pueda verificar la integridad del flujo de datos.

#### Criterios de Aceptación

1. THE Sistema SHALL exponer un Endpoint_de_Salud en la ruta `GET /api/health` que retorne un objeto JSON con estado del sistema y timestamp.
2. WHEN el Endpoint_de_Salud recibe una solicitud GET, THE Sistema SHALL verificar la conectividad con la base de datos y retornar `{ "status": "ok", "db": "connected", "timestamp": "<ISO8601>" }` con código HTTP 200 si todo está operativo.
3. IF la base de datos no está disponible cuando el Endpoint_de_Salud recibe una solicitud, THEN THE Sistema SHALL retornar `{ "status": "error", "db": "disconnected", "timestamp": "<ISO8601>" }` con código HTTP 503.
4. THE Sistema SHALL exponer un Endpoint_de_Spec en la ruta `GET /api/spec` que retorne el esquema de los contratos de datos en formato JSON.
5. WHEN el Endpoint_de_Spec recibe una solicitud GET, THE Sistema SHALL retornar la definición de los modelos `Product`, `PriceLog`, `Department` y `MonitoringConfig` con sus campos y tipos.

---

### Requisito 8: Parseo y Serialización de Datos

**Historia de Usuario:** Como desarrollador, quiero que el sistema parsee y serialice correctamente los datos provenientes de fuentes externas, para garantizar la integridad de los registros almacenados.

#### Criterios de Aceptación

1. WHEN el Motor_de_Relevamiento recibe una respuesta de una API externa, THE Sistema SHALL parsear el JSON de respuesta en un objeto `PriceRecord` tipado.
2. IF la respuesta de la API externa no contiene los campos requeridos (`price`, `source_name`, `timestamp`), THEN THE Sistema SHALL retornar un error de parseo descriptivo sin persistir datos parciales.
3. THE Sistema SHALL serializar los objetos `PriceRecord` al formato de la tabla `price_logs` antes de persistirlos en la base de datos.
4. FOR ALL objetos `PriceRecord` válidos, parsear luego serializar luego parsear SHALL producir un objeto equivalente al original (propiedad de round-trip).
5. WHEN el Panel solicita datos de precios para visualización, THE Sistema SHALL deserializar los registros de la base de datos en objetos `PriceLog` tipados con todos sus campos correctamente mapeados.

---

### Requisito 9: Seguridad Mínima de la Aplicación

**Historia de Usuario:** Como administrador, quiero que la aplicación implemente controles de seguridad mínimos de bajo costo y alto impacto, para reducir la superficie de ataque sin incrementar significativamente la complejidad del sistema.

#### Criterios de Aceptación

1. THE Sistema SHALL gestionar todas las credenciales, API keys y tokens exclusivamente mediante variables de entorno, sin que ningún valor sensible aparezca hardcodeado en el código fuente.
2. WHEN un endpoint de la API recibe una solicitud con datos de entrada, THE Sistema SHALL validar esos datos en el servidor antes de procesarlos o persistirlos, independientemente de cualquier validación realizada en el cliente.
3. IF un endpoint de la API recibe datos de entrada que no cumplen el esquema esperado, THEN THE Sistema SHALL rechazar la solicitud con código HTTP 400 y un mensaje de error descriptivo sin persistir datos parciales.
4. THE Sistema SHALL aplicar rate limiting en todos los endpoints de la API, con un límite más restrictivo en el endpoint que dispara el Motor_de_Relevamiento para prevenir ejecuciones no autorizadas por abuso.
5. THE Sistema SHALL configurar los headers de seguridad HTTP `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options` y `Referrer-Policy` en el archivo `next.config.js` para todas las respuestas de la aplicación.
6. WHILE el Sistema opera en entorno de producción, THE Sistema SHALL retornar únicamente mensajes de error genéricos en las respuestas HTTP, sin exponer stack traces ni detalles internos del sistema.
7. WHEN el endpoint que dispara el Cron_Job recibe una solicitud, THE Sistema SHALL verificar la presencia y validez del token `CRON_SECRET` en el header de autorización antes de ejecutar el Motor_de_Relevamiento.
8. IF el token `CRON_SECRET` está ausente o es inválido en una solicitud al endpoint del Cron_Job, THEN THE Sistema SHALL rechazar la solicitud con código HTTP 401 sin ejecutar el Motor_de_Relevamiento.
