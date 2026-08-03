// server/repositories/licenseRepository.js
// Repository-Factory: wählt anhand von config.dbDriver die passende
// Implementierung (JSON-Datei oder Postgres/Prisma). Der Rest der Anwendung
// (services/licenseService.js) kennt nur dieses Interface, nie die konkrete
// Speicherart:
//
//   create({ email, productId, orderId }) -> Promise<License>
//   findByEmail(email)                    -> Promise<License[]>
//   findActiveByKey(key)                  -> Promise<License|null>
//   findByKey(key)                        -> Promise<License|null>
//   listAll()                             -> Promise<License[]>
//   generateKey()                         -> string
'use strict';

const { config } = require('../config/env');

function loadRepository(){
  if(config.dbDriver === 'postgres'){
    return require('./postgres/postgresLicenseRepository');
  }
  return require('./json/jsonLicenseRepository');
}

module.exports = loadRepository();
