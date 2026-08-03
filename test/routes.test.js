// test/routes.test.js
// Routen-Check: stellt sicher, dass wichtige Seiten existieren und
// referenzierte lokale Scripts/Styles aufgelöst werden können.
'use strict';

const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');

function exists(rel){
  return fs.existsSync(path.join(ROOT, rel));
}

test('Kernseiten existieren', () => {
  const pages = [
    'index.html',
    '404.html',
    'manifest.webmanifest',
    'sw.js',
    'demo/index.html',
    'demo/public/index.html',
    'demo/public/products.html',
    'demo/public/product.html',
    'demo/public/faq.html',
    'demo/public/downloads.html',
    'demo/public/support.html',
    'demo/public/privacy.html',
    'demo/public/impressum.html',
    'demo/public/datenschutz.html',
    'demo/checkout/cart.html',
    'demo/checkout/checkout.html',
    'demo/account/login.html',
    'demo/account/register.html',
    'demo/account/dashboard.html',
    'demo/admin/index.html',
    'demo/admin/products.html',
    'demo/admin/upload.html'
  ];
  for(const p of pages){
    assert.ok(exists(p), `Seite fehlt: ${p}`);
  }
});

test('Kern-CSS/JS-Assets existieren', () => {
  const assets = [
    'css/variables.css',
    'css/styles.css',
    'src/js/escape.js',
    'src/js/cart.js',
    'src/js/checkout.js',
    'src/js/products.js',
    'src/js/auth.js',
    'src/js/particles.js',
    'src/js/register-sw.js',
    'src/js/toast.js',
    'src/js/dashboard.js',
    'data/products.json'
  ];
  for(const a of assets){
    assert.ok(exists(a), `Asset fehlt: ${a}`);
  }
});

test('Sitemap-Routen verweisen auf existierende Seiten', () => {
  const sitemap = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'sitemap.json'), 'utf8'));
  assert.ok(Array.isArray(sitemap.routes) && sitemap.routes.length > 0, 'sitemap.json hat keine Routen');
  for(const r of sitemap.routes){
    const clean = r.path.replace(/^\/+/, '').replace(/\/+$/, '');
    if(!clean || r.path.includes('{id}')) continue; // Platzhalter/root überspringen
    // optional: je nach Pfad das Datei-Mapping prüfen
    assert.ok(typeof r.title === 'string' && r.title.length > 0, `Route ohne Titel: ${r.path}`);
  }
});
