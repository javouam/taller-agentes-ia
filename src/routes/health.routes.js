const express = require('express');

const router = express.Router();

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Health check
 *     description: Verifica la disponibilidad del servicio.
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: El servicio está operativo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 */
router.get('/', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

module.exports = router;
