# API Taller Agentes IA

API REST construida con **Express 5** que expone un health check y un CRUD básico de
usuarios, con **manejo transversal (cross-cutting) de excepciones** y **documentación
interactiva con Swagger / OpenAPI 3.0**.

## Requisitos

- Node.js >= 18
- npm

## Instalación

```bash
npm install
```

## Uso

```bash
# Producción
npm start

# Desarrollo (reinicio automático con nodemon)
npm run dev
```

El servidor escucha por defecto en `http://localhost:3000`. Variables de entorno:

| Variable    | Default      | Descripción                                              |
|-------------|--------------|----------------------------------------------------------|
| `PORT`      | `3000`       | Puerto de escucha                                        |
| `NODE_ENV`  | `development`| En `production`, las respuestas de error omiten el stack |

## Endpoints

| Método | Ruta            | Descripción                              | Respuestas                |
|--------|-----------------|------------------------------------------|---------------------------|
| GET    | `/health`       | Health check de disponibilidad           | `200` `{ status: "ok" }`  |
| GET    | `/users`        | Lista todos los usuarios                 | `200` `[User]`            |
| POST   | `/users`        | Crea un usuario (email único)            | `201` `User`, `400`, `409`|
| GET    | `/api-docs`     | Documentación interactiva (Swagger UI)   | `200` HTML                |
| GET    | `/api-docs.json`| Especificación OpenAPI 3.0 en bruto      | `200` JSON                |

### POST /users

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Ana","email":"ana@test.com"}'
```

Respuesta `201 Created`:

```json
{
  "id": 1,
  "name": "Ana",
  "email": "ana@test.com"
}
```

Errores posibles:

- `400` — falta `name` o `email`, o el JSON está malformado
- `409` — ya existe un usuario con ese email

Formato de error estándar:

```json
{
  "error": {
    "message": "El campo 'name' es obligatorio y debe ser un string no vacío"
  }
}
```

## Manejo transversal de errores

Ningún controlador usa `try/catch`: los errores fluyen por un canal central.

- **`utils/AppError.js`** — errores operacionales tipados con `statusCode`:
  `ValidationError` (400), `NotFoundError` (404), `ConflictError` (409).
- **`middleware/asyncHandler.js`** — envuelve controladores y captura rechazos de
  promesas (`Express 4` no los captura solo; aquí aplica igualmente por uniformidad).
- **`middleware/notFoundHandler.js`** — rutas desconocidas → `NotFoundError` (404).
- **`middleware/errorHandler.js`** — único punto de salida de errores:
  - Operacionales → responden su código y mensaje.
  - JSON malformado de body-parser → normalizado a `400`.
  - Inesperados → se loguea el stack y se responde `500` genérico sin filtrar detalles.
  - El stack solo se incluye en la respuesta cuando `NODE_ENV !== 'production'`.
- **`server.js`** — `process.on('uncaughtException')` y
  `process.on('unhandledRejection')` loguean y cierran el servidor limpiamente.

## Estructura del proyecto

```
├── src/
│   ├── app.js                  # App Express (middlewares + rutas, sin listen)
│   ├── server.js               # Punto de entrada (listen + handlers de proceso)
│   ├── routes/
│   │   ├── health.routes.js    # GET /health (con anotaciones @openapi)
│   │   └── users.routes.js     # GET/POST /users (con anotaciones @openapi)
│   ├── controllers/
│   │   └── users.controller.js # Lógica de los endpoints
│   ├── middleware/
│   │   ├── asyncHandler.js     # Captura errores de controladores async
│   │   ├── notFoundHandler.js  # 404 para rutas desconocidas
│   │   └── errorHandler.js     # Manejador central de errores
│   ├── utils/
│   │   └── AppError.js         # Errores tipados con statusCode
│   ├── docs/
│   │   └── swagger.js          # Config OpenAPI + schemas reutilizables
│   └── data/
│       └── usersStore.js       # Almacenamiento en memoria (array)
├── PLAN.md                     # Plan de diseño de la API
└── package.json
```

> **Nota:** los usuarios se guardan en memoria; se pierden al reiniciar el proceso.

## Documentación

La documentación se genera con `swagger-jsdoc` a partir de anotaciones `@openapi`
que viven junto a cada ruta, y se sirve con `swagger-ui-express`:

- UI interactiva: <http://localhost:3000/api-docs>
- Spec OpenAPI: <http://localhost:3000/api-docs.json>

## Roadmap

- [ ] Persistencia real (base de datos)
- [ ] Tests automatizados (Jest + Supertest)
- [ ] Rate limiting y CORS
- [ ] Logger estructurado (pino/winston)
