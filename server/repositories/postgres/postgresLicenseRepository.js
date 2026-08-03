// server/repositories/postgres/postgresLicenseRepository.js
// Postgres/Prisma-Implementierung des LicenseRepository-Interfaces.
// Gleiche Funktionssignaturen wie repositories/json/jsonLicenseRepository.js,
// damit services/licenseService.js beliebig zwischen den Treibern wechseln kann.
'use strict';

const crypto = require('crypto');
const { getPrismaClient } = require('../../db/prisma');

// Gleiches Key-Format wie in der JSON-Variante (Kompatibilität für bestehende
// Lizenzen, falls von JSON nach Postgres migriert wird).
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

function toLegacyShape(row){
  if(!row) return null;
  // Bildet dieselbe flache Struktur wie die JSON-Variante ab, damit
  // services/routes nicht wissen müssen, welcher Treiber aktiv ist.
  return {
    key: row.key,
    productId: row.productId,
    ownerEmail: row.ownerEmail,
    orderId: row.orderId,
    status: row.status.toLowerCase(),
    createdAt: row.createdAt.toISOString(),
    expiresAt: row.expiresAt ? row.expiresAt.toISOString() : null
  };
}

async function create({ email, productId, orderId }){
  const prisma = getPrismaClient();
  const row = await prisma.license.create({
    data: {
      key: generateKey(),
      productId,
      ownerEmail: email,
      orderId: orderId || null,
      status: 'ACTIVE'
    }
  });
  return toLegacyShape(row);
}

async function findByEmail(email){
  const prisma = getPrismaClient();
  const rows = await prisma.license.findMany({ where: { ownerEmail: email } });
  return rows.map(toLegacyShape);
}

async function findActiveByKey(key){
  const prisma = getPrismaClient();
  const row = await prisma.license.findFirst({ where: { key, status: 'ACTIVE' } });
  return toLegacyShape(row);
}

async function findByKey(key){
  const prisma = getPrismaClient();
  const row = await prisma.license.findUnique({ where: { key } });
  return toLegacyShape(row);
}

async function listAll(){
  const prisma = getPrismaClient();
  const rows = await prisma.license.findMany();
  return rows.map(toLegacyShape);
}

module.exports = {
  create,
  findByEmail,
  findActiveByKey,
  findByKey,
  listAll,
  generateKey
};
