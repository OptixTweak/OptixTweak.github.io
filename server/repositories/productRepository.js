// server/repositories/productRepository.js
// Repository-Factory für Produkte, analog zu licenseRepository.js.
//   findById(id) -> Promise<Product|null>
//   listAll()    -> Promise<Product[]>
'use strict';

const { config } = require('../config/env');

function loadRepository(){
  if(config.dbDriver === 'postgres'){
    return require('./postgres/postgresProductRepository');
  }
  return require('./json/jsonProductRepository');
}

module.exports = loadRepository();
