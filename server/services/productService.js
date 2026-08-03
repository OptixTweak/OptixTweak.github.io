// server/services/productService.js
// Business-Logik für Produkte — bisher nur die serverseitige Preis-Lookup,
// die vorher direkt in server.js stand (PRODUCTS / getProductById).
'use strict';

const productRepository = require('../repositories/productRepository');

async function getProductById(id){
  return productRepository.findById(id);
}

async function listProducts(){
  return productRepository.listAll();
}

module.exports = { getProductById, listProducts };
