// server/routes/health.routes.js
// GET /health — Status-Check. Verhalten unverändert gegenüber der bisherigen
// Inline-Definition in server.js, zusätzlich wird jetzt der aktive DB-Treiber
// mit ausgegeben (nützlich zum Prüfen, ob Postgres oder JSON aktiv ist).
'use strict';

const express = require('express');
const { config } = require('../config/env');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'optixtweak-server',
    dbDriver: config.dbDriver,
    time: new Date().toISOString()
  });
});

module.exports = router;
