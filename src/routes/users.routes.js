const express = require('express');

const { getUsers, createUser } = require('../controllers/users.controller');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

/**
 * @openapi
 * /users:
 *   get:
 *     summary: Listar usuarios
 *     description: Devuelve todos los usuarios registrados (almacenamiento en memoria).
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
router.get('/', asyncHandler(getUsers));

/**
 * @openapi
 * /users:
 *   post:
 *     summary: Crear usuario
 *     description: Crea un usuario con name y email. El email es único (se normaliza a minúsculas).
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserInput'
 *           example:
 *             name: Ana
 *             email: ana@test.com
 *     responses:
 *       201:
 *         description: Usuario creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Body inválido (campo faltante o JSON malformado)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Ya existe un usuario con ese email
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', asyncHandler(createUser));

module.exports = router;
