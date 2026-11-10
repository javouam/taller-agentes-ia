const { NotFoundError } = require('../utils/AppError');

// Rutas no encontradas: lanza NotFoundError para que todo pase
// por el canal central de errores.
const notFoundHandler = (req, _res, next) => {
  next(new NotFoundError(`Ruta no encontrada: ${req.method} ${req.originalUrl}`));
};

module.exports = notFoundHandler;
