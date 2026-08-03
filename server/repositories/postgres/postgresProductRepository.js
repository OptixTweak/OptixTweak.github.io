// server/repositories/postgres/postgresProductRepository.js
// Postgres/Prisma-Implementierung des ProductRepository-Interfaces.
'use strict';

const { getPrismaClient } = require('../../db/prisma');

function toLegacyShape(row){
  if(!row) return null;
  return {
    id: row.id,
    sku: row.sku,
    name: row.name,
    short: row.short,
    description: row.description,
    price: Number(row.price),
    category: row.category
  };
}

async function findById(id){
  const prisma = getPrismaClient();
  const row = await prisma.product.findUnique({ where: { id } });
  return toLegacyShape(row);
}

async function listAll(){
  const prisma = getPrismaClient();
  const rows = await prisma.product.findMany({ where: { active: true } });
  return rows.map(toLegacyShape);
}

module.exports = { findById, listAll };
