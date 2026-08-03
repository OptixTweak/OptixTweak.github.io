// server/server.js
// Express-Server für OptixTweak.
//
// Phase 1 (Fundament): Diese Datei war bisher ein einzelner ~160-Zeilen-Block
// mit allen Endpoints, Stripe-Setup und direktem Dateizugriff. Für die
// PostgreSQL-Vorbereitung (Aufgabe 16) wurde sie in Config/DB/Repositories/
// Services/Routes aufgeteilt (siehe server/README.md, Abschnitt "Architektur").
// Die Endpoints und ihr Verhalten sind bewusst unverändert geblieben:
//   GET  /health                    → Status-Check
//   POST /create-checkout-session   → erstellt eine Stripe Checkout Session (Testmodus)
//   POST /webhook                   → Stripe Webhook (fulfillment: Lizenzen erstellen)
//   POST /create-pr                 → GitHub Pull Request erstellen (optional, @octokit)
//
// Secrets niemals in den Client-Code! Nur via Umgebungsvariablen (.env).
'use strict';

const express = require('express');
const cors = require('cors');

const { config } = require('./config/env');
const { errorHandler } = require('./middleware/errorHandler');

const healthRoutes = require('./routes/health.routes');
const { router: checkoutRoutes, stripe } = require('./routes/checkout.routes');
const createWebhookRouter = require('./routes/webhook.routes');
const createPrRoutes = require('./routes/createPr.routes');

const app = express();

// CORS für lokale Demo (anpassen für Produktion)
app.use(cors({ origin: config.corsOrigin }));

// Webhook-Route MUSS vor express.json() eingebunden werden, da sie den
// Raw-Body für die Stripe-Signaturprüfung braucht (express.raw innerhalb der
// Route selbst) — Reihenfolge daher wie schon vorher: Webhook-Router zuerst,
// dann global express.json() für alle übrigen Routen.
app.use(createWebhookRouter(stripe));

// Body-Parsing für alle übrigen Routen
app.use(express.json());

app.use(healthRoutes);
app.use(checkoutRoutes);
app.use(createPrRoutes);

// Fallback-Error-Handler (greift nur, falls eine Route einen Fehler nicht
// selbst abfängt)
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`OptixTweak server listening on http://localhost:${config.port}`);
  console.log(`DB driver: ${config.dbDriver}`);
  if(!config.stripe.secretKey) console.warn('Warning: STRIPE_SECRET_KEY not set. Set it in .env before using Stripe endpoints.');
});

module.exports = app;
