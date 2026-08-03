# Server-Scaffold (OptixTweak)

Express-Server für OptixTweak — Checkout, Webhooks, Lizenzen.

## Endpoints

| Methode | Pfad                        | Zweck |
|---------|-----------------------------|-------|
| GET     | `/health`                   | Status-Check (zeigt auch den aktiven DB-Treiber) |
| POST    | `/create-checkout-session`  | Stripe Checkout Session erstellen (Preise serverseitig validiert) |
| POST    | `/webhook`                  | Stripe Webhook `checkout.session.completed` → Lizenzen erzeugen |
| POST    | `/create-pr`                | GitHub PR automatisiert erstellen (Scaffold, benötigt `GITHUB_TOKEN` + `@octokit/rest`) |

## Architektur (seit Phase 1 — Fundament/Postgres-Vorbereitung)

Der Server ist in Schichten aufgeteilt, damit der Speicher (JSON-Datei heute,
PostgreSQL morgen) austauschbar ist, ohne Routen oder Business-Logik anzufassen:

```
server/
  config/env.js          Zentrale Konfiguration (liest .env einmalig)
  db/prisma.js            Prisma-Client-Singleton (nur bei DB_DRIVER=postgres aktiv)
  repositories/           Datenzugriff — pro Entität ein Interface + 2 Implementierungen
    licenseRepository.js     Factory: wählt json/ oder postgres/ Implementierung
    productRepository.js     Factory: wählt json/ oder postgres/ Implementierung
    json/                    Datei-basierte Implementierungen (heutiges Verhalten)
    postgres/                Prisma-basierte Implementierungen
  services/               Business-Logik, kennt nur das Repository-Interface
    licenseService.js        z.B. fulfillOrder(), validateLicense()
    productService.js
  routes/                 Ein Express-Router pro Endpoint-Gruppe
  middleware/errorHandler.js
  prisma/schema.prisma    Datenmodell für PostgreSQL (Users, Products, Orders, Licenses, AuditLog)
  lib/licenses.js         Alte, eigenständige Referenzimplementierung (unverändert, nicht mehr
                           von server.js genutzt, siehe Hinweis am Dateianfang)
  server.js               Bootstrap: bindet Middleware + Routen zusammen
```

**Wichtig:** Am Verhalten der bestehenden Endpoints ändert sich dadurch nichts.
Mit der Standardeinstellung `DB_DRIVER=json` läuft alles exakt wie vorher,
Lizenzen landen weiterhin in `server/data/licenses.json`.

## Speicher-Treiber wechseln (JSON ⇄ PostgreSQL)

Standardmäßig aktiv, kein Setup nötig:

```bash
DB_DRIVER=json
```

Für PostgreSQL:

```bash
cd server
npm install
cp .env.example .env
# .env öffnen:
#   DB_DRIVER=postgres
#   DATABASE_URL=postgresql://user:password@localhost:5432/optixtweak?schema=public
npm run db:generate      # erzeugt den Prisma Client aus prisma/schema.prisma
npm run db:migrate       # wendet die Migrationen an (prisma migrate dev)
npm start
```

Die Migrationshistorie liegt bereits vorbereitet unter
`server/prisma/migrations/0001_init/` (Users, Products, Orders, OrderItems,
Licenses, AuditLog — siehe `prisma/schema.prisma` für Details und Kommentare
zu geplanten Erweiterungen wie HWID-Bindung).

## Einrichtung (wie bisher)

```bash
cd server
npm install
cp .env.example .env
# .env öffnen und STRIPE_SECRET_KEY=sk_test_... eintragen
npm start
```

## Demo-Integration

Die Client-Seite erwartet den Server per Meta-Tags in `demo/checkout/checkout.html`:

```html
<meta name="stripe-pk" content="pk_test_YOUR_PUBLISHABLE_KEY">
<meta name="stripe-backend" content="http://localhost:4242/create-checkout-session">
```

oder per Config in `src/js/checkout.js`.

## Sicherheit

- **Secrets nur als Umgebungsvariablen** — niemals im Client oder Repo.
- **Preise serverseitig validieren** (aus dem Produkt-Repository), Client-Angaben nicht vertrauen.
- **Webhook-Signatur** mit `STRIPE_WEBHOOK_SECRET` prüfen.
- Fix in Phase 1: Der Webhook-Router wird jetzt **vor** `express.json()` eingebunden,
  damit `express.raw()` den unveränderten Rohkörper für die Stripe-Signaturprüfung
  bekommt (vorher hätte der globale JSON-Parser den Body schon konsumiert).
- Für Produktion: echte Datenbank (`DB_DRIVER=postgres`), Auth, Rate-Limiting, Idempotency
  (geplant in den Folge-Phasen "Sicherheit" und "Kundenkonto").

## Dateien

- `server.js` — Bootstrap (Middleware + Routen)
- `config/env.js` — zentrale Konfiguration
- `db/prisma.js` — Prisma-Client-Singleton
- `repositories/` — Datenzugriff (JSON- und Postgres-Implementierungen)
- `services/` — Business-Logik
- `routes/` — Express-Router je Endpoint-Gruppe
- `prisma/schema.prisma` — Datenmodell für PostgreSQL
- `lib/licenses.js` — alte eigenständige Referenzimplementierung (unverändert)
- `.env.example` — Vorlage für Umgebungsvariablen
