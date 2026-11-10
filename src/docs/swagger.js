const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Taller Agentes IA',
      version: '1.0.0',
      description:
        'API REST de ejemplo con Express: health check y CRUD básico de usuarios. ' +
        'Manejo transversal de errores con respuestas tipadas.',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de desarrollo',
      },
    ],
    components: {
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', description: 'Identificador único', example: 1 },
            name: { type: 'string', description: 'Nombre del usuario', example: 'Ana' },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email único del usuario (normalizado a minúsculas)',
              example: 'ana@test.com',
            },
          },
        },
        CreateUserInput: {
          type: 'object',
          required: ['name', 'email'],
          properties: {
            name: { type: 'string', example: 'Ana' },
            email: { type: 'string', format: 'email', example: 'ana@test.com' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            error: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  example: 'El campo name es obligatorio y debe ser un string no vacío',
                },
                stack: {
                  type: 'string',
                  description: 'Stack trace (solo incluido en desarrollo)',
                },
              },
            },
          },
        },
      },
    },
  },
  // Archivos donde viven las anotaciones @openapi
  apis: [`${__dirname}/../routes/*.routes.js`],
};

module.exports = swaggerJsdoc(options);
