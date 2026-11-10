# Plan: API Express con 3 rutas

## Objetivo
API REST con Express que exponga 3 endpoints: `GET /health`, `GET /users` y `POST /users`,
con manejo transversal (cross-cutting) de excepciones.

## Fase 1 — Configuración del proyecto

1. Instalar dependencias:
   - `express` (producción)
   - `nodemon` (desarrollo, reinicio automático)
2. Scripts en `package.json`:
   - `npm start` → `node src/server.js`
   - `npm run dev` → `nodemon src/server.js`
3. Puerto: `3000` (configurable vía `PORT` del entorno).
4. Estructura de archivos:

```
taller-agentes-ia/
├── src/
│   ├── app.js                  # App Express (middlewares + rutas, sin listen)
│   ├── server.js               # Punto de entrada (listen + handlers de proceso)
│   ├── routes/
│   │   ├── health.routes.js    # GET /health
│   │   └── users.routes.js     # GET /users, POST /users
│   ├── controllers/
│   │   └── users.controller.js # Lógica de cada endpoint
│   ├── middleware/
│   │   ├── asyncHandler.js     # Captura errores de controladores async
│   │   ├── notFoundHandler.js  # 404 para rutas desconocidas
│   │   └── errorHandler.js     # Manejador central de errores
│   ├── utils/
│   │   └── AppError.js         # Errores tipados con statusCode
│   └── data/
│       └── usersStore.js       # Almacenamiento en memoria (array)
├── PLAN.md
└── package.json
```

## Fase 2 — Rutas y lógica

| Ruta    | Método | Código éxito | Descripción |
|---------|--------|--------------|-------------|
| `/health` | GET  | 200 | `{ "status": "ok" }` para checks de disponibilidad |
| `/users`  | GET  | 200 | Lista de usuarios en JSON |
| `/users`  | POST | 201 | Crea usuario: valida body, asigna `id` único, devuelve el recurso creado |

Reglas de negocio (POST /users):
- Body requerido: `{ "name": string, "email": string }`
- Email duplicado → `409 Conflict`

## Fase 3 — Manejo transversal de excepciones

### 3.1 Errores tipados (`AppError`)
- Clase base `AppError(message, statusCode)` con flag `isOperational`.
- Derivadas: `ValidationError` (400), `NotFoundError` (404), `ConflictError` (409).

### 3.2 asyncHandler
- Envolvente que captura promesas rechazadas de controladores async y las
  redirige a `next(err)`. Ningún controlador necesita `try/catch` propio.

### 3.3 notFoundHandler
- Middleware para rutas desconocidas: lanza `NotFoundError` → todo fluye por
  el canal central de errores.

### 3.4 errorHandler (manejo central, único punto de salida de errores)
- `AppError` operacional → responde su `statusCode` y mensaje.
- Error de JSON malformado (body-parser) → `400 Bad Request`.
- Error inesperado → log del stack completo, respuesta `500` genérica sin
  filtrar detalles internos.
- Incluir `err.stack` en la respuesta solo en desarrollo.

### 3.5 Handlers a nivel de proceso (`server.js`)
- `process.on('uncaughtException')` y `process.on('unhandledRejection')`:
  loguear y cerrar el server limpiamente antes de salir.

## Fase 4 — Pruebas (curl)

1. `curl http://localhost:3000/health` → 200 `{ "status": "ok" }`
2. `curl http://localhost:3000/users` → 200 lista (vacía al inicio)
3. `curl -X POST http://localhost:3000/users -H "Content-Type: application/json" -d '{"name":"Ana","email":"ana@test.com"}'` → 201 usuario creado
4. POST repetido con el mismo email → 409
5. POST sin `name` o sin `email` → 400
6. POST con JSON malformado → 400
7. `curl http://localhost:3000/otra-cosa` → 404

## Fase 6 — Documentación Swagger/OpenAPI (implementada)

- Dependencias: `swagger-jsdoc` (genera la spec OpenAPI 3.0 desde anotaciones JSDoc en los
  archivos de rutas) + `swagger-ui-express` (UI interactiva).
- `src/docs/swagger.js`: configuración central y schemas reutilizables
  (`User`, `CreateUserInput`, `ErrorResponse`).
- Endpoints generados: `GET /api-docs` (UI interactiva) y `GET /api-docs.json` (spec en bruto).
- Anotaciones `@openapi` junto a cada ruta (`health.routes.js`, `users.routes.js`),
  documentando 200/201/400/409/404/500.

## Fase 5 — Futuras mejoras (fuera de alcance)
- Persistencia real (base de datos).
- Tests automatizados (Jest + Supertest).
- Rate limiting, CORS, logger estructurado (pino/winston).
