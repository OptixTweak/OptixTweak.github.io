// test/escape.test.js
// Testet die gemeinsame XSS-Escaping-Utility (src/js/escape.js).
'use strict';

const { test } = require('node:test');
const assert = require('node:assert');
const path = require('node:path');

const escape = require(path.join(__dirname, '..', 'src', 'js', 'escape.js'));

test('escapeHtml maskiert HTML-Sonderzeichen', () => {
  assert.strictEqual(escape.escapeHtml('<script>alert(1)</script>'), '<script>alert(1)</script>');
  assert.strictEqual(escape.escapeHtml('a & b'), 'a &amp; b');
  assert.strictEqual(escape.escapeHtml('"quoted"'), '"quoted"');
  assert.strictEqual(escape.escapeHtml("'single'"), '&#39;single&#39;');
});

test('escapeHtml behandelt null/undefined als leeren String', () => {
  assert.strictEqual(escape.escapeHtml(null), '');
  assert.strictEqual(escape.escapeHtml(undefined), '');
});

test('escapeAttr entkommt doppelte Anführungszeichen', () => {
  assert.strictEqual(escape.escapeAttr('"><svg/onload=alert(1)>'), '"><svg/onload=alert(1)>');
});

test('escapeUrl blockiert gefährliche Schemata', () => {
  assert.strictEqual(escape.escapeUrl('javascript:alert(1)'), '');
  assert.strictEqual(escape.escapeUrl('vbscript:x'), '');
  assert.strictEqual(escape.escapeUrl('data:text/html,x'), '');
});

test('escapeUrl erlaubt http(s), data:image, mailto, tel und relative Pfade', () => {
  assert.strictEqual(escape.escapeUrl('https://example.com/a?b=1'), 'https://example.com/a?b=1');
  assert.ok(escape.escapeUrl('mailto:x@example.com').startsWith('mailto:'));
  assert.strictEqual(escape.escapeUrl('/assets/images/a.webp'), '/assets/images/a.webp');
  assert.strictEqual(escape.escapeUrl('data:image/png;base64,AAA'), 'data:image/png;base64,AAA');
});
