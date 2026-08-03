// server/services/licenseService.js
// Business-Logik für Lizenzen. Kennt nur das Repository-Interface, nie den
// konkreten Speicher (JSON-Datei oder Postgres) — der wird per DB_DRIVER
// in repositories/licenseRepository.js ausgewählt.
'use strict';

const licenseRepository = require('../repositories/licenseRepository');

/**
 * Erzeugt eine einzelne Lizenz.
 * @param {{email: string, productId: string, orderId?: string}} opts
 */
async function createLicense({ email, productId, orderId }){
  return licenseRepository.create({ email, productId, orderId });
}

/**
 * Erfüllt eine Bestellung: legt für jeden Artikel (qty-fach) eine Lizenz an.
 * @param {{id: string, email: string, items: Array<{id: string, qty?: number}>}} order
 * @returns {Promise<object[]>} erzeugte Lizenzen
 */
async function fulfillOrder(order){
  const created = [];
  for(const item of order.items || []){
    const qty = Math.max(1, parseInt(item.qty || 1, 10));
    for(let i = 0; i < qty; i++){
      // eslint-disable-next-line no-await-in-loop
      created.push(await createLicense({ email: order.email, productId: item.id, orderId: order.id }));
    }
  }
  return created;
}

async function getLicensesByEmail(email){
  return licenseRepository.findByEmail(email);
}

async function validateLicense(key){
  return licenseRepository.findActiveByKey(key);
}

function generateKey(){
  return licenseRepository.generateKey();
}

module.exports = {
  createLicense,
  fulfillOrder,
  getLicensesByEmail,
  validateLicense,
  generateKey
};
