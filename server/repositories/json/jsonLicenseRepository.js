// server/repositories/json/jsonLicenseRepository.js
// JSON-Datei-Implementierung des LicenseRepository-Interfaces.
// 1:1 die bisherige Logik aus server/lib/licenses.js (unverändertes Verhalten,
// unveränderte Key-Generierung), nur an die Repository-Schnittstelle angepasst,
// damit sie austauschbar mit der Postgres-Implementierung ist.
'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', '..', 'data', 'licenses.json');

function ensureDataFile(){
  const dir = path.dirname(DATA_FILE);
  if(!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if(!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]', 'utf8');
}

function readAll(){
  try{
    ensureDataFile();
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  }catch(e){
    return [];
  }
}

function writeAll(licenses){
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(licenses, null, 2), 'utf8');
}

// Format: OPTIX-XXXX-XXXX-XXXX-XXXX (20 Zeichen Zufall, Base32 ohne mehrdeutige Zeichen)
function generateKey(){
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // ohne I,O,0,1
  let key = '';
  const bytes = crypto.randomBytes(20);
  for(let i = 0; i < 20; i++){
    key += alphabet[bytes[i] % alphabet.length];
  }
  const groups = [];
  for(let i = 0; i < key.length; i += 4) groups.push(key.slice(i, i + 4));
  return 'OPTIX-' + groups.join('-');
}

async function create({ email, productId, orderId }){
  const all = readAll();
  const license = {
    key: generateKey(),
    productId,
    ownerEmail: email,
    orderId: orderId || null,
    status: 'active',
    createdAt: new Date().toISOString(),
    expiresAt: null
  };
  all.push(license);
  writeAll(all);
  return license;
}

async function findByEmail(email){
  return readAll().filter(l => l.ownerEmail === email);
}

async function findActiveByKey(key){
  return readAll().find(l => l.key === key && l.status === 'active') || null;
}

async function findByKey(key){
  return readAll().find(l => l.key === key) || null;
}

async function listAll(){
  return readAll();
}

module.exports = {
  create,
  findByEmail,
  findActiveByKey,
  findByKey,
  listAll,
  generateKey
};
