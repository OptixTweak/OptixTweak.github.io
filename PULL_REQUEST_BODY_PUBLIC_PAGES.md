---
name: Feature: Public Pages (Phase 3)
about: Implements public pages skeleton — Home, Products, ProductDetail, FAQ, 404, legal pages.

---

# Pull Request: feature/public-pages → main

This PR implements Phase 3 (Public Pages) — the public frontend for the demo site.

What’s included:
- Home with Parallax Hero + Particles (canvas, reduced‑motion friendly)
- Product listing with client‑side filter/search/sort and responsive images
- Product detail template with accessible tabs, JSON‑LD product schema and dynamic OG meta updates
- FAQ (≥20 Q/A using native <details> accordions)
- 404, Impressum and Datenschutz pages
- tools/generate-webp.sh + assets/images/README.md for WebP generation
- tools/generate-sitemap.js to create demo/public/sitemap.xml and update robots.txt

How to test locally
1. git fetch && git checkout feature/public-pages
2. (Optional) Generate WebP images: chmod +x tools/generate-webp.sh && ./tools/generate-webp.sh
3. Start a simple server from repository root and open the demo pages (e.g. npx serve demo)
4. Test product listing (/demo/public/products.html) and product detail (/demo/public/product.html?id=pack-a)
5. Run node tools/generate-sitemap.js to regenerate sitemap.xml

Acceptance checklist
- [ ] Responsive layouts for Home, Products and Product Detail
- [ ] Product list with filter & search (client-side)
- [ ] Product detail with tabs and JSON-LD
- [ ] FAQ with animated expand/collapse (≥20 questions)
- [ ] sitemap.xml + robots.txt generated
- [ ] OG meta + JSON-LD present (Product pages)
- [ ] No console errors
- [ ] Lighthouse Mobile ≥70 and Desktop ≥85 (baseline)

Known limitations
- OG meta is set client-side; for social crawlers you’d need server-side rendering or prerendering.
- WebP assets must be generated with the provided script to be used by <picture> sources.

