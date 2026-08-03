# Stripe Checkout example (OptixTweak)

Dieses Verzeichnis enthält ein minimal lauffähiges Beispiel für einen Node/Express‑Server, der Stripe Checkout (Testmode) verwendet und kompatibel mit dem Demo‑Warenkorb (`localStorage` key `optix-cart`) ist.

Dateien:
- `server.js` — Express‑Server, Endpoint `POST /create-checkout-session` erwartet `{ cart: [{ id, name, price, qty, image? }], customerEmail? }` und erstellt eine Stripe Checkout Session. Antwort: `{ sessionId }` (oder `{ url }` bei direkter URL‑Antwort).
- `package.json` — Abhängigkeiten und Startskripte.
- `.env.example` — Beispielumgebungsvariablen (STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, SUCCESS_URL, CANCEL_URL, PORT).
- `client-example.html` — Minimaler Client, der `optix-cart` aus localStorage ausliest und den Server aufruft.

Schnellstart (lokal):

1) Node dependencies installieren

```bash
cd examples/stripe-checkout
npm install
```

2) .env anlegen

```bash
cp .env.example .env
# dann .env öffnen und STRIPE_SECRET_KEY=sk_test_... setzen
```

3) Server starten

```bash
npm start
# startet standardmäßig auf PORT=4242
```

4) Demo‑Seite konfigurieren

- Auf deiner Checkout‑Seite lade Stripe.js:
  `<script src="https://js.stripe.com/v3/"></script>`
- Setze Metatags (oder passe checkout.js direkt):
  `<meta name="stripe-pk" content="pk_test_YOUR_PUBLISHABLE_KEY">`
  `<meta name="stripe-backend" content="http://localhost:4242/create-checkout-session">`

5) Testdaten

- Testkarte: `4242 4242 4242 4242`
- Erfolg/Abbruch Weiterleitungen konfigurierbar in `.env` via SUCCESS_URL / CANCEL_URL.

Webhooks (optional, empfohlen):

- Installiere Stripe CLI und leite Webhooks an deinen lokalen Server weiter:

```bash
stripe login
stripe listen --forward-to localhost:4242/webhook
# Kopiere das webhook secret aus dem CLI output in STRIPE_WEBHOOK_SECRET in .env
```

Sicherheits‑Hinweise / Empfehlungen:
- Nimm Preise niemals unvalidiert vom Client — verwende serverseitige Preis‑Mapping oder Stripe Price IDs.
- Verwende Webhooks für verlässliche Fulfillment‑Trigger (checkout.session.completed).
- Schütze den Endpoint (Rate limiting, Auth) falls notwendig.

Wenn du möchtest, passe ich das Beispiel so an, dass es Stripe Price IDs verwendet (du müsstest dann price IDs anliefern) oder ich kann den Checkout‑Flow in `src/js/checkout.js` direkt im Branch patchen (habe eine pluggable Variante vorbereitet).