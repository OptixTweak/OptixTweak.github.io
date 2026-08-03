// server/lib/licenses.js
// Lizenz-Key-Generierung & Persistenz (serverseitig).
// In dieser Demo werden Lizenzen in einer JSON-Datei gespeichert.
// Für Produktion: Datenbank (Postgres/MySQL) + kryptografisch sichere Zufallswerte (crypto.randomBytes).
//
// HINWEIS (Phase 1 — Fundament/Postgres-Vorbereitung):
// server.js nutzt seit dieser Phase nicht mehr direkt diese Datei, sondern
// server/services/licenseService.js, das transparent zwischen der JSON-Datei
// (server/repositories/json/jsonLicenseRepository.js) und Postgres/Prisma
// (server/repositories/postgres/postgresLicenseRepository.js) umschalten kann
// (siehe DB_DRIVER in server/.env.example). Diese Datei bleibt unverändert
// bestehen — als eigenständige, funktionierende Referenzimplementierung und
// falls sie irgendwo direkt importiert wird.

'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'data', 'licenses.json');

// Sicherstellen, dass das data-Verzeichnis existiert
function ensureDataFile(){
  const dir = path.dirname(DATA_FILE);
  if(!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if(!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]', 'utf8');
}

function readLicenses(){
  try{
    ensureDataFile();
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  }catch(e){
    return [];
  }
}

function writeLicenses(licenses){
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(licenses, null, 2), 'utf8');
}

// Format: OPTIX-XXXX-XXXX-XXXX-XXXX (16 Zeichen Zufall, Base32 ohne mehrdeutige Zeichen)
function generateKey(){
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // ohne I,O,0,1
  let key = '';
  const bytes = crypto.randomBytes(20);
  for(let i=0;i<20;i++){
    key += alphabet[bytes[i] % alphabet.length];
  }
  // in Gruppen von 4 aufteilen
  const groups = [];
  for(let i=0;i<key.length;i+=4) groups.push(key.slice(i, i+4));
  return 'OPTIX-' + groups.join('-');
}

/**
 * Erzeugt eine Lizenz für einen Kauf.
 * @param {object} opts { email, productId, orderId }
 * @returns {object} license
 */
function createLicense({ email, productId, orderId }){
  const licenses = readLicenses();
  const key = generateKey();
  const license = {
    key,
    productId,
    ownerEmail: email,
    orderId: orderId || null,
    status: 'active',
    createdAt: new Date().toISOString(),
    expiresAt: null
  };
  licenses.push(license);
  writeLicenses(licenses);
  return license;
}

/**
 * Bestellung erfüllen: für jeden Artikel eine Lizenz anlegen.
 * @param {object} order { id, email, items:[{id,name,qty}] }
 */
function fulfillOrder(order){
  const created = [];
  (order.items || []).forEach(item => {
    const qty = Math.max(1, parseInt(item.qty || 1, 10));
    for(let i=0;i<qty;i++){
      created.push(createLicense({ email: order.email, productId: item.id, orderId: order.id }));
    }
  });
  return created;
}

function getLicensesByEmail(email){
  return readLicenses().filter(l => l.ownerEmail === email);
}

function validateLicense(key){
  return readLicenses().find(l => l.key === key && l.status === 'active') || null;
}

module.exports = {
  createLicense,
  fulfillOrder,
  getLicensesByEmail,
  validateLicense,
  generateKey,
  readLicenses
};

