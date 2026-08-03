// seed.js — Einmalige Demo-Daten (Owner-Account + Lizenzen) für den LocalStorage.
//
// Sicherheit:
//  - Das Owner-Passwort wird bei der Erstausführung ZUFÄLLIG generiert.
//  - Gespeichert wird ausschließlich der SHA-256-Hash (localStorage 'optix-users').
//  - Das Klartext-Passwort wird einmalig in der Browser-Konsole ausgegeben.
//  - Kein Klartext-Passwort im Quellcode/Repo.
//
// Hinweis: Produkte werden NICHT mehr in den LocalStorage geseedet — die
// zentrale Produktquelle ist /data/products.json (eine Quelle für alle Seiten).
(async function(){
  'use strict';

  const USERS_KEY = 'optix-users';      // kompatibel mit src/js/auth.js
  const LICENSES_KEY = 'optix:licenses'; // Demo-Lizenzen
  const SEED_FLAG = 'optix:seeded:v2';  // Marker für dieses Seed-Verhalten

  function exists(key){ return localStorage.getItem(key) !== null; }

  // SHA-256 als Hex-String
  async function sha256(text){
    const data = new TextEncoder().encode(text);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  function getUsers(){ try{ return JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); }catch(e){ return []; } }
  function saveUsers(users){ localStorage.setItem(USERS_KEY, JSON.stringify(users)); }
  function getLicenses(){ try{ return JSON.parse(localStorage.getItem(LICENSES_KEY) || '[]'); }catch(e){ return []; } }
  function saveLicenses(licenses){ localStorage.setItem(LICENSES_KEY, JSON.stringify(licenses)); }

  // Zufälliges Passwort: mind. 1 Zeichen aus jeder Klasse + Shuffle (Fisher-Yates)
  function generatePassword(length){
    const sets = ['abcdefghijklmnopqrstuvwxyz','ABCDEFGHIJKLMNOPQRSTUVWXYZ','0123456789','!@#$%^&*()_+-=[]{}|;:,.<>?'];
    const all = sets.join('');
    const oneOf = (s) => s[Math.floor(Math.random() * s.length)];
    let pw = sets.map(oneOf).join('');
    while(pw.length < length) pw += oneOf(all);
    const arr = pw.split('');
    for(let i = arr.length - 1; i > 0; i--){
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.join('');
  }

  if(!exists(SEED_FLAG)){
    const rawPassword = generatePassword(16);
    const owner = {
      id: 'user_owner_1',
      email: 'owner@optixtweak.local',
      username: 'Optix HANS',
      passwordHash: await sha256(rawPassword),
      role: 'owner',
      createdAt: Date.now()
    };

    // Owner an die von auth.js genutzte User-Struktur anhängen (nicht doppelt)
    const users = getUsers();
    if(!users.some(u => u.email === owner.email)){
      users.push(owner);
      saveUsers(users);
    }

    // Demo-Lizenz für den Owner (Premium Bundle → gewährt alle Produkte)
    const licenses = getLicenses();
    if(!licenses.some(l => l.ownerEmail === owner.email)){
      licenses.push({ key:'DEMO-OWNER-KEY-0001', productId:'premium_bundle', ownerId: owner.id, ownerEmail: owner.email, status:'active', createdAt: Date.now() });
      saveLicenses(licenses);
    }

    localStorage.setItem(SEED_FLAG, '1');

    console.info('[Optix seed] Owner-Account angelegt.');
    console.info('[Optix seed] Benutzer:', owner.username, '| E-Mail:', owner.email);
    console.info('%c[Optix seed] Passwort (einmalig — sicher speichern): ' + rawPassword, 'color:#8a5cff;font-weight:700');
    console.info('[Optix seed] Login: /demo/account/login.html');
  }
})();

