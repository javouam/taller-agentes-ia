const { AppError } = require('../utils/AppError');

const isDev = process.env.NODE_ENV !== 'production';

// Manejador central de errores: único punto de salida de errores de la API.
// Se registra al final del stack de middlewares (4 argumentos obligatorios).
const errorHandler = (err, _req, res, _next) => {
  // Normalizar errores de body-parser (JSON malformado) a un 400 operacional.
  let error = err;
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    error = new AppError('JSON malformado en el cuerpo de la petición', 400);
  }

  // Errores inesperados: log completo para diagnóstico.
  if (!error.isOperational) {
    console.error('ERROR INESPERADO:', error);
  }

  const statusCode = error.isOperational ? error.statusCode : 500;
  const message = error.isOperational
    ? error.message
    : 'Error interno del servidor';

  res.status(statusCode).json({
    error: {
      message,
      // Detalles de implementación solo visibles en desarrollo.
      ...(isDev && { stack: error.stack }),
    },
  });
};

module.exports = errorHandler;
