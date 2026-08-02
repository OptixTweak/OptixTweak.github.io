// seed.js — Phase 0: seed LocalStorage with Owner account, demo products and licenses
// This script runs once and creates demo data for the static client-side demo.
(async function(){
  'use strict';
  const OWNER_USERNAME = 'Optix HANS';
  const OWNER_PLAINTEXT = 'kqLsKR8O047qiBk';

  // helper: SHA-256 hash as hex
  async function hash(text){
    const enc = new TextEncoder();
    const data = enc.encode(text);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(digest)).map(b=>b.toString(16).padStart(2,'0')).join('');
  }

  function exists(key){return localStorage.getItem(key)!==null}

  if(!exists('optix:seeded')){
    const owner = {
      id: 'user_owner_1',
      username: OWNER_USERNAME,
      passwordHash: await hash(OWNER_PLAINTEXT),
      role: 'owner',
      createdAt: new Date().toISOString()
    };

    // demo products list (Phase 0 minimal fields)
    const products = [
      {id:'full_tweak', title:'Full Tweak', price:30, desc:'Komplette Optimierung für Windows. FPS, Registry, Netzwerk, Timer, Input, CPU, RAM.'},
      {id:'fortnite_tweak', title:'Fortnite Tweak', price:20, desc:'Für maximale FPS und weniger Delay.'},
      {id:'fivem_tweak', title:'FiveM Tweak', price:20, desc:'Optimiert FiveM für höchste Performance.'},
      {id:'wasd_tweak', title:'WASD Tweak', price:15, desc:'Verbessert Tastatur-Reaktionszeit.'},
      {id:'hitreg_tweak', title:'HitReg Tweak', price:15, desc:'Verbessert Hit Registration.'},
      {id:'fps_tweak', title:'FPS Tweak', price:15, desc:'Maximale FPS Optimierung.'},
      {id:'windows_tweak', title:'Windows Tweak', price:15, desc:'Windows komplett optimieren.'},
      {id:'fivem_pack', title:'FiveM Tweak Pack', price:50, desc:'Enthält FiveM Tweak, HitReg, FPS, WASD.'},
      {id:'premium_bundle', title:'Premium Bundle', price:70, desc:'Enthält ALLE Produkte.'}
    ];

    // demo licenses
    const licenses = [
      {key:'DEMO-OWNER-KEY-0001', productId:'premium_bundle', ownerId:owner.id, status:'active', createdAt:new Date().toISOString()},
    ];

    localStorage.setItem('optix:users', JSON.stringify([owner]));
    localStorage.setItem('optix:products', JSON.stringify(products));
    localStorage.setItem('optix:licenses', JSON.stringify(licenses));
    localStorage.setItem('optix:seeded', '1');

    console.log('Optix seed complete — Owner account created:', OWNER_USERNAME);
  }

  // Populate some UI placeholders (product grid) if present
  try{
    const grid = document.getElementById('product-grid');
    if(grid){
      const products = JSON.parse(localStorage.getItem('optix:products') || '[]');
      products.slice(0,6).forEach(p=>{
        const card = document.createElement('article');
        card.className = 'product-card';
        card.innerHTML = `<h3>${p.title}</h3><p class="text-muted">${p.desc}</p><div class="product-actions"><a class="btn btn-primary" href="/products/${p.id}.html">Details</a><a class="btn btn-ghost" href="#">Kaufen — ${p.price} €</a></div>`;
        grid.appendChild(card);
      });
    }
  }catch(e){console.error(e)}
})();
