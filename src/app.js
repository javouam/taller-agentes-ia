const express = require('express');

const healthRoutes = require('./routes/health.routes');
const usersRoutes = require('./routes/users.routes');
const notFoundHandler = require('./middleware/notFoundHandler');
const errorHandler = require('./middleware/errorHandler');
const swaggerSpec = require('./docs/swagger');
const swaggerUi = require('swagger-ui-express');

const app = express();

// Parsear body JSON (los errores de JSON malformado se normalizan en errorHandler)
app.use(express.json());

// Rutas
app.use('/health', healthRoutes);
app.use('/users', usersRoutes);

// Documentación interactiva (Swagger UI) y spec OpenAPI en bruto
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api-docs.json', (_req, res) => {
  res.status(200).json(swaggerSpec);
});

// Manejo transversal de errores (deben registrarse al final del stack)
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
