// Envolvente para controladores async: captura cualquier rechazo de promesa
// y lo redirige a next(err), de modo que fluya al errorHandler central.
// Express 4 no captura errores async por sí mismo.
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
