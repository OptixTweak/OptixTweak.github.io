// server/config/env.js
// Zentrale Konfiguration für den OptixTweak-Server.
// Liest & validiert Umgebungsvariablen an EINER Stelle, statt verteilt über
// die ganze Codebasis. Alle anderen Module importieren `config` von hier.
//
// Phase 1 (Fundament): neu hinzugekommen ist DB_DRIVER + DATABASE_URL für die
// PostgreSQL-Vorbereitung. Ohne DATABASE_URL läuft der Server unverändert mit
// der bisherigen JSON-Datei als Speicher (DB_DRIVER=json ist der Default).
'use strict';

require('dotenv').config();

function bool(value, fallback){
  if(value === undefined || value === '') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
}

const DB_DRIVER = (process.env.DB_DRIVER || 'json').toLowerCase();

if(!['json', 'postgres'].includes(DB_DRIVER)){
  throw new Error(`Ungültiger DB_DRIVER "${DB_DRIVER}". Erlaubt: "json" | "postgres".`);
}

if(DB_DRIVER === 'postgres' && !process.env.DATABASE_URL){
  throw new Error('DB_DRIVER=postgres gesetzt, aber DATABASE_URL fehlt. Siehe server/.env.example.');
}

const config = {
  port: parseInt(process.env.PORT || '4242', 10),
  corsOrigin: process.env.CORS_ORIGIN || true,
  currency: process.env.CURRENCY || 'eur',

  // Speicher-Treiber: 'json' (Standard, Datei-basiert, kein Setup nötig)
  // oder 'postgres' (Prisma + echte Datenbank, siehe server/prisma/schema.prisma)
  dbDriver: DB_DRIVER,
  databaseUrl: process.env.DATABASE_URL || null,

  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || ''
  },

  urls: {
    success: process.env.SUCCESS_URL || 'http://localhost:5500/demo/account/dashboard.html',
    cancel: process.env.CANCEL_URL || 'http://localhost:5500/demo/checkout/cart.html'
  },

  github: {
    token: process.env.GITHUB_TOKEN || '',
    repoOwner: process.env.REPO_OWNER || '',
    repoName: process.env.REPO_NAME || ''
  },

  // Für spätere Phasen bereits vorgesehen (Rate Limiting, Sessions, ...),
  // aktuell nur gelesen, noch nicht überall verdrahtet.
  isProduction: bool(process.env.NODE_ENV === 'production', false)
};

module.exports = { config };
