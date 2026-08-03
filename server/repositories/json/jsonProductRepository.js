// server/repositories/json/jsonProductRepository.js
// JSON-Datei-Implementierung des ProductRepository-Interfaces.
// Liest weiterhin aus data/products.json — das ist auch die Quelle, die die
// statische Website direkt einbindet, deshalb bleibt sie in Phase 1 die
// Standard-Quelle für den Server (unverändertes Verhalten).
'use strict';

const path = require('path');

let cache = null;

function readAll(){
  if(cache) return cache;
  try{
    // eslint-disable-next-line global-require
    cache = require(path.join('..', '..', '..', 'data', 'products.json'));
  }catch(e){
    console.warn('Could not load products.json');
    cache = [];
  }
  return cache;
}

async function findById(id){
  return readAll().find(p => p.id === id) || null;
}

async function listAll(){
  return readAll();
}

module.exports = { findById, listAll };
