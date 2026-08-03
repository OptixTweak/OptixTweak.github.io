# TODO — Ausbau zur produktionsreifen Verkaufsplattform

Mehrstufiger Ausbau (siehe Anforderungsdokument). Jede Phase wird vollständig
fertiggestellt und freigegeben, bevor die nächste beginnt.

- [x] **Phase 1 — Fundament (Server-Struktur + PostgreSQL-Vorbereitung)**
  - `server/config/env.js` — zentrale Konfiguration
  - `server/db/prisma.js` — Prisma-Client-Singleton (nur bei `DB_DRIVER=postgres` aktiv)
  - `server/repositories/` — Repository-Pattern (JSON- und Postgres-Implementierung je Entität:
    Lizenzen, Produkte), austauschbar über `DB_DRIVER`
  - `server/services/` — Business-Logik (`licenseService`, `productService`), treiberunabhängig
  - `server/routes/` — Endpoints in einzelne Router aufgeteilt (`health`, `checkout`, `webhook`, `create-pr`)
  - `server/prisma/schema.prisma` + `server/prisma/migrations/0001_init/` — Datenmodell
    (Users, Products, Orders, OrderItems, Licenses, AuditLog), JSON bleibt Default-Fallback
  - `server/middleware/errorHandler.js` — zentrales Fallback-Error-Handling
  - Bugfix: Webhook-Router wird jetzt vor `express.json()` eingebunden, damit die
    Stripe-Signaturprüfung den unveränderten Rohkörper bekommt
  - Alle bisherigen Endpoints/Verhalten unverändert; `server/lib/licenses.js` bleibt
    als eigenständige Referenz erhalten
- [ ] **Phase 2 — Echtes Lizenzsystem** (HWID-Bindung, Geräteverwaltung, Aktivierung/Deaktivierung,
  Historie, Blacklist, verschlüsselte Speicherung)
- [ ] **Phase 3 — Sicherheit** (CSRF, CSP, Rate Limiting, sichere Sessions/Cookies, Audit Logs)
- [ ] **Phase 4 — Kundenkonto** (2FA, Passwort/E-Mail ändern, Sitzungen, API-Keys)
- [ ] **Phase 5 — Zahlungen erweitern** (PayPal, Gutscheine, Affiliate; Apple/Google Pay/Klarna als Hooks)
- [ ] **Phase 6 — Downloads & Admin-Dashboard/Analytics**
- [ ] **Phase 7 — Community, Ticketsystem, Marketing/Affiliate**
- [ ] **Phase 8 — i18n, UI-Politur, PWA, Performance, Codequalität/Tests**

---

# Abgeschlossen — Ursprüngliche Top 10 (Demo-Grundlage)

- [x] **1. Secrets aus Client-Code entfernen**
  - README.md: Klartext-Passwort entfernt
  - js/seed.js: zufälliges Passwort (nur Hash, Klartext einmalig in Console) — neu geschrieben
  - src/js/admin-auth.js: Admin-Token überschreibbar (localStorage 'optix-admin-token')
- [x] **2. XSS-Schutz überall**
  - src/js/escape.js (gemeinsame Utility, window.OptixEscape) — neu
  - products.js, cart.js, checkout.js, admin-products.js, auth.js, product.html, buy-wiring.js abgesichert
- [x] **3. Auth- & Produkt-System konsolidieren**
  - data/products.json → 9 echte Optix-Tweak-Produkte (eine Quelle)
  - js/seed.js: Owner in optix-users (kompatibel mit auth.js), kein Produkt-Seeding
  - Bugfix auth.js (OAuth-Element-Duplikate) + Auth-API (window.OptixAuth) exposed
  - index.html rendert Produkte aus data/products.json
- [x] **4. Backend-Scaffold**
  - server/ (Express: /health, /create-checkout-session, /webhook, /create-pr) + .env.example + README + lib/licenses.js
- [x] **5. Dashboard mit Lizenzen & Downloads**
  - src/js/dashboard.js (Orders, Lizenzen, Downloads mit Lizenz-Gate)
  - dashboard.html erweitert (Sektionen Bestellungen / Lizenzen / Downloads)
- [x] **6. Fehlende Seiten**
  - demo/public/downloads.html, support.html, privacy.html neu
  - Navigation/Footer-Links aktualisiert
  - Sitemap-Tool (Prioritäten) aktualisiert & sitemap.xml regeneriert (10 Einträge)
- [x] **7. PWA**
  - manifest.webmanifest, sw.js, register-sw.js neu
  - Einbindung auf allen Seiten (index.html, demo/*, checkout/*)
- [x] **8. Stripe-Webhook-Fulfillment**
  - server/lib/licenses.js (Key-Generierung + Persistenz)
  - server/server.js + examples/stripe-checkout/server.js: fulfillOrder on checkout.session.completed
  - src/js/checkout.js: simulierte Bestellung erzeugt Lizenzen
- [x] **9. Ein Partikel-System**
  - src/js/particles.js unterstützt #particles-canvas UND #hero-canvas (+ Parallax)
  - js/hero.js entfernt, index.html nutzt nur noch src/js/particles.js
- [x] **10. Quality-Gates**
  - Root package.json (lint/test/start), eslint.config.js, .prettierrc
  - test/ (products-Schema, escape.js, Routen-Check)
  - .github/workflows/ci.yml + .lighthouserc.json
  - Lint: 0 Errors / 0 Warnings · Tests: 10/10 bestanden

