# OptixTweak — Style Guide (Phase 2)

Ziel
- Visuelles System: Schwarz / Dunkelgrau / Lila‑Akzent, Glassmorphism, moderne Animationen.
- Output: style‑guide.md, CSS‑Variables, optimierte Assets, Demo‑Seite mit Musterkomponenten.

Design Tokens
- Farben: Basis (Schwarz / Dunkelgrau), Accent (Lila), Neutral‑Töne, Surface/Glass
- Typografie: H1..H6, Body, Monospace
- Spacing: 4px base scale (4,8,12,16,24,32,48,64)
- Radius / Shadows / Z‑Layers / Motion durations

Accessibility
- Kontrast: alle Texte mindestens AA (4.5:1 normal, 3:1 large)
- Focus‑Styles: sichtbare, hohe Kontrast‑Outline
- Keyboard‑Nav & ARIA für Komponenten

Komponenten (Specs)
- Header: sticky, reduziert auf mobile, logo + nav + CTA (Account/Cart)
- Footer: sitemap, legal, Social, small print
- ProductCard: image, title, price, badge, hover‑glow, quick actions
- Modal: centered, backdrop glass, close via ESC & click outside
- Badge: small accent pill, variants: info/sale/disabled
- Table: responsive, zebra, sortable headers
- Rating: stars with aria‑label
- Buttons: primary (purple), secondary (transparent), ghost, danger, disabled

Formular‑Styles & Input‑States
- Input states: default / hover / focus / error / disabled
- Validation rules & messages (client‑side)
- Password strength meter + Web Crypto hashing note

Animations
- Parallax Hero: subtle depth, 2–3 layers with translateY on scroll
- Particles: light density, low CPU; fallback to static image
- Hover:  transform/scale + soft shadow + color shift
- Focus: 0.2s outline + subtle glow
- Loading: skeletons, spinner, progress bar

Assets & Export
- Icons: SVG sprite + individual optimized SVG, export to WebP for bitmaps
- Commands: svgo, imagemin, cwebp
- Deliverables: /assets/icons.svg, /assets/images/*.webp (responsive sizes)

Demo Page
- Musterkomponenten: Header, Hero (Parallax + Particles), Grid mit ProductCards, Modal, Form, Footer
- Lighthouse Ziel: Mobile ≥70, Desktop ≥85

Akzeptanzkriterien
- Konsistente Komponenten mit Tokens
- Farbkontrast AA
- Demo‑Seite mit Musterkomponenten funktionsfähig
- Exportierte/optimierte Assets vorhanden

Dateistruktur (Vorschlag)
- /design/style-guide.md
- /src/styles/_variables.css
- /src/styles/components/*.css
- /demo/index.html (Musterkomponenten)
- /assets/icons.svg
- /assets/images/optimized/*

Tasks (Kurz)
- [ ] Farben & Tokens definieren
- [ ] Typografie + Webfont preload
- [ ] Komponenten CSS (Buttons, Cards, Modal, Inputs)
- [ ] Animations Guide & JS‑hooks (parallax, particles)
- [ ] Demo‑Seite auf feature/design
- [ ] Accessibility & Contrast Check
- [ ] Assets optimieren und exportieren
