const usersStore = require('../data/usersStore');
const { ValidationError, ConflictError } = require('../utils/AppError');

// GET /users → 200 con la lista de usuarios
const getUsers = (_req, res) => {
  res.status(200).json(usersStore.getAll());
};

// POST /users → 201 con el usuario creado
// Validación de body y regla de email único. Los errores se lanzan
// (no try/catch): el manejo es transversal vía asyncHandler + errorHandler.
const createUser = (req, res) => {
  const { name, email } = req.body ?? {};

  if (typeof name !== 'string' || name.trim() === '') {
    throw new ValidationError("El campo 'name' es obligatorio y debe ser un string no vacío");
  }
  if (typeof email !== 'string' || email.trim() === '') {
    throw new ValidationError("El campo 'email' es obligatorio y debe ser un string no vacío");
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (usersStore.findByEmail(normalizedEmail)) {
    throw new ConflictError(`Ya existe un usuario con el email '${normalizedEmail}'`);
  }

  const user = usersStore.create({ name: name.trim(), email: normalizedEmail });
  res.status(201).json(user);
};

module.exports = { getUsers, createUser };
