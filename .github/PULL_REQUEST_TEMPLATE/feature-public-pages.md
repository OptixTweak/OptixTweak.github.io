# Pull Request: feature/public-pages → main

Beschreibung

Dieser PR implementiert Phase 3 (Public Pages) — Basis‑Frontend für die öffentlichen Seiten der Demo:

- Home (Parallax Hero mit Partikeln)
- Produktübersicht (Filter, Suche, Sort)
- Produktdetail‑Template (Tabs, JSON‑LD, OG meta updates)
- FAQ (20 Fragen, accessible accordions)
- 404, Impressum, Datenschutz
- Responsive images (picture + WebP srcset pattern)
- WebP generation script + sitemap generator
- Accessibility improvements: keyboard navigable tabs, modal focus‑trap (aus Phase 2)

How to test

1. Checkout branch: git fetch && git checkout feature/public-pages
2. Generate WebP assets (optional for image checks):
   chmod +x tools/generate-webp.sh
   ./tools/generate-webp.sh
3. Start a simple server from repo root:
   npx serve demo
   (or python -m http.server 8000) und öffne /demo/public/index.html
4. Prüfen:
   - Produktliste lädt data/products.json, Suche/Filter/Sort arbeiten
   - Produktdetail seite: OG meta Werte werden zur Laufzeit gesetzt, JSON‑LD ist vorhanden
   - Sitemap: node tools/generate-sitemap.js → demo/public/sitemap.xml angelegt
   - Accessibility: Tabs und Accordions sind keyboard‑navigierbar; Modal focus trap aus feature/design funktioniert

Akzeptanzkriterien (Checklist)
- [ ] Responsive Layouts für Home, Produkte und Produktdetail
- [ ] Produktliste inkl. Filter & Suche (client‑side)
- [ ] Produktdetail Seite mit Tabs und JSON‑LD
- [ ] FAQ mit animierten Expand/Collapse (≥20 Fragen)
- [ ] sitemap.xml + robots.txt vorhanden (via generator)
- [ ] OG Meta + JSON‑LD vorhanden (Produktseite)
- [ ] Keine Console Errors
- [ ] Lighthouse Mobile ≥70 (Basis), Desktop ≥85 (Basis)

Bekannte Einschränkungen
- Social crawlers sehen die OG Meta möglicherweise nicht beim ersten Request, da Metas client‑seitig gesetzt werden. Für vollständigen Social‑Meta‑Support ist ein server‑rendered page oder prerendering/SSR nötig.
- Produktbilder müssen via tools/generate-webp.sh erzeugt werden, damit WebP‑Assets vorhanden sind.

Bitte reviewen und mergen wenn OK.
