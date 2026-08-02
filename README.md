# OptixTweak.github.io — Phase 0

Dieses Repository enthält das statische Gerüst für die Optix Tweaks Website. Dies ist Phase 0: Initiales Projekt-Setup mit Seed-Daten, Struktur und Basis-Dateien.

Was enthalten ist (Phase 0):

- index.html (Landing Page Grundgerüst)
- css/styles.css (Basis-Variablen & Layout)
- js/seed.js (Legt LocalStorage mit Owner-Account, Demo-Produkten & Lizenzen an)
- 404.html, robots.txt, sitemap.xml, .nojekyll
- README.md (dieses File)

Owner-Account (Demo — wird lokal per seed.js angelegt):
- Benutzername: Optix HANS
- Passwort: kqLsKR8O047qiBk

Hinweise:
- Die Seite ist rein statisch und für GitHub Pages geeignet.
- Alle sicherheitsrelevanten Funktionen sind nur clientseitig simuliert und müssen vor Produktion durch einen echten Backend-Service ersetzt werden (Authentication, Lizenzprüfung, Webhooks, Zahlungsvalidierung).

Schnellstart lokal:

1. Repository klonen
   git clone https://github.com/OptixTweak/OptixTweak.github.io
2. Dateien öffnen: index.html im Browser (kein Server nötig)
3. Seed-Skript läuft beim Laden automatisch und legt Demo-Daten in LocalStorage an.

Deployment auf GitHub Pages:
- Push auf main (Standard-Branch) — GitHub Pages dient statische Seite automatisch aus (Einstellungen -> Pages).
- Stelle sicher, dass `.nojekyll` vorhanden ist.

Nächste Schritte (Phase 1 wird UX/Wireframes sein):
- Sitemap & Wireframes
- Design-System
- Vollständige Seiten (Products, Product Detail, Auth, Dashboard, Admin)

