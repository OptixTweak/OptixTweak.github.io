// server/middleware/errorHandler.js
// Zentrales Fallback-Error-Handling. Die einzelnen Routen fangen ihre Fehler
// zwar weiterhin selbst ab (unverändertes Verhalten), dieser Handler greift
// zusätzlich, falls doch mal ein Fehler durchrutscht (z.B. in künftigen
// Phasen bei neuen Routen), statt dass Express mit einem Stacktrace antwortet.
'use strict';

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next){
  console.error('Unhandled error:', err);
  if(res.headersSent) return next(err);
  res.status(500).json({ error: 'Internal server error' });
}

module.exports = { errorHandler };
