// server/db/prisma.js
// Lazy Prisma-Client-Singleton.
//
// Wichtig: Das @prisma/client-Paket wird erst beim ersten Zugriff geladen,
// damit der Server auch dann startet, wenn `npx prisma generate` noch nicht
// gelaufen ist und DB_DRIVER=json (Standard) verwendet wird. So bleibt die
// bestehende JSON-Demo ohne jedes zusätzliche Setup lauffähig.
'use strict';

const { config } = require('../config/env');

let client = null;

/**
 * Liefert den Prisma-Client (Singleton). Wirft einen sprechenden Fehler,
 * falls DB_DRIVER nicht auf 'postgres' steht oder der Client noch nicht
 * generiert wurde (`npm run db:generate` im server/-Ordner).
 * @returns {import('@prisma/client').PrismaClient}
 */
function getPrismaClient(){
  if(config.dbDriver !== 'postgres'){
    throw new Error("getPrismaClient() aufgerufen, aber DB_DRIVER ist nicht 'postgres'.");
  }

  if(!client){
    let PrismaClient;
    try{
      ({ PrismaClient } = require('@prisma/client'));
    }catch(err){
      throw new Error(
        '@prisma/client ist nicht verfügbar. Bitte im server/-Ordner ausführen: ' +
        'npm install && npm run db:generate. Original-Fehler: ' + err.message
      );
    }
    client = new PrismaClient({
      datasources: { db: { url: config.databaseUrl } }
    });
  }

  return client;
}

/** Schließt die Datenbankverbindung sauber (z.B. beim Server-Shutdown). */
async function disconnectPrisma(){
  if(client){
    await client.$disconnect();
    client = null;
  }
}

module.exports = { getPrismaClient, disconnectPrisma };
