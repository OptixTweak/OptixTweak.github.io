// test/products-schema.test.js
// Validiert die Struktur von data/products.json (eine zentrale Produktquelle).
'use strict';

const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const PRODUCTS_PATH = path.join(__dirname, '..', 'data', 'products.json');

function loadProducts(){
  return JSON.parse(fs.readFileSync(PRODUCTS_PATH, 'utf8'));
}

test('products.json ist ein nicht-leeres Array', () => {
  const products = loadProducts();
  assert.ok(Array.isArray(products), 'products.json ist kein Array');
  assert.ok(products.length > 0, 'products.json ist leer');
});

test('Jedes Produkt hat eine eindeutige ID und Pflichtfelder', () => {
  const products = loadProducts();
  const ids = new Set();
  for(const p of products){
    assert.ok(typeof p.id === 'string' && p.id.length > 0, 'Produkt hat keine gültige id');
    assert.ok(!ids.has(p.id), `Doppelte Produkt-ID: ${p.id}`);
    ids.add(p.id);

    for(const field of ['name', 'short', 'description', 'price', 'category']){
      assert.ok(p[field] !== undefined && p[field] !== null, `Produkt ${p.id} fehlt Feld "${field}"`);
    }
    assert.ok(typeof p.price === 'number' && p.price > 0, `Produkt ${p.id} hat ungültigen Preis`);
    assert.ok(Array.isArray(p.images) && p.images.length > 0, `Produkt ${p.id} hat keine Bilder`);
    assert.ok(Array.isArray(p.features), `Produkt ${p.id} braucht features-Array`);
    assert.ok(Array.isArray(p.system), `Produkt ${p.id} braucht system-Array`);
  }
});
