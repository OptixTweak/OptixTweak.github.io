// dashboard.js — Dashboard-Logik: Orders, Lizenzen & Downloads (Demo)
// Zeigt die Bestellungen, Lizenzen (Key-Gate) und Download-Aktionen des eingeloggten Users.
// Lizenzen kommen in der Demo primär aus localStorage ('optix-licenses'); optional kann eine
// Server-API (`/licenses`) eingebunden werden (siehe server/server.js + server/lib/licenses.js).

(function(){
  'use strict';

  const esc = (window.OptixEscape && window.OptixEscape.escapeHtml) ? window.OptixEscape.escapeHtml : function(s){ return String(s==null?'':s); };

  function getSession(){
    if(window.OptixAuth && window.OptixAuth.getSession) return window.OptixAuth.getSession();
    try{ return JSON.parse(localStorage.getItem('optix-session') || 'null'); }catch(e){ return null; }
  }

  function getOrders(email){
    try{ return JSON.parse(localStorage.getItem('optix-orders') || '[]').filter(o=>o.email===email); }catch(e){ return []; }
  }

// Lokale Lizenzen (Demo): werden von checkout.js bei simulierten Bestellungen erzeugt
  function getLocalLicenses(email){
    // checkout.js speichert unter 'optix:licenses'; auch 'optix-licenses' als Fallback lesen
    try{
      const a = JSON.parse(localStorage.getItem('optix:licenses') || '[]');
      const b = JSON.parse(localStorage.getItem('optix-licenses') || '[]');
      const all = a.concat(b);
      return all.filter(l=>l.ownerEmail===email && l.status==='active');
    }catch(e){ return []; }
  }

  // Produkt-Titel für Anzeige
  async function getProductMap(){
    try{
      const res = await fetch('/data/products.json');
      const products = await res.json();
      const map = {};
      products.forEach(p=> map[p.id] = p);
      return map;
    }catch(e){ return {}; }
  }

  // --- Render-Funktionen ---

  function renderOrders(list, el, productMap){
    if(!el) return;
    if(list.length===0){ el.innerHTML = '<p class="text-muted">Keine Bestellungen.</p>'; return; }
    el.innerHTML = list.map(o=>`
      <div class="order">
        <div><strong>Bestellung ${esc(o.id)}</strong> — ${new Date(o.createdAt).toLocaleString()}</div>
        <div class="small">${(o.items||[]).map(i=>esc((productMap[i.id]||{}).name || i.name)+' x'+Number(i.qty||1)).join(', ')}</div>
        <div><strong>Total: €${Number(o.total||0).toFixed(2)}</strong></div>
      </div>
    `).join('');
  }

  function renderLicenses(list, el){
    if(!el) return;
    if(list.length===0){ el.innerHTML = '<p class="text-muted">Keine Lizenzen vorhanden.</p>'; return; }
    el.innerHTML = list.map(l=>`
      <div class="license">
        <div class="license-key"><code>${esc(l.key)}</code></div>
        <div class="small">${esc(l.productId)} — Status: <span class="badge">${esc(l.status)}</span></div>
        <div class="small">Erstellt: ${new Date(l.createdAt).toLocaleDateString()}</div>
      </div>
    `).join('');
  }

  function renderDownloads(licenses, productMap, el){
    if(!el) return;
    if(licenses.length===0){ el.innerHTML = '<p class="text-muted">Noch keine Downloads verfügbar. Erwerben Sie zuerst ein Produkt.</p>'; return; }

    // Je Lizenz einen Download-Button (verlinkt auf die Produkt-Detailseite als Demo-Download)
    el.innerHTML = licenses.map(l=>{
      const p = productMap[l.id] || productMap[l.productId] || {};
      const name = p.name || l.productId;
      return `
        <div class="download-item">
          <div>
            <strong>${esc(name)}</strong>
            <div class="small">Lizenz: <code>${esc(l.key)}</code></div>
          </div>
          <a class="btn-primary btn-sm download-btn" href="/demo/public/product.html?id=${encodeURIComponent(l.productId || l.id)}" target="_blank" rel="noopener"
             data-key="${esc(l.key)}">Herunterladen</a>
        </div>
      `;
    }).join('');

    // Klick: Demo-Hinweis + key in Clipboard (simuliert "Download freigeschaltet")
    el.querySelectorAll('.download-btn').forEach(btn=>{
      btn.addEventListener('click', (e)=>{
        e.preventDefault();
        const key = btn.getAttribute('data-key') || '';
        if(navigator.clipboard && key){ navigator.clipboard.writeText(key).catch(()=>{}); }
        if(window.showToast){
          window.showToast({ message: 'Download freigeschaltet (Demo). Lizenz-Key kopiert.', duration: 4000 });
        } else {
          alert('Download freigeschaltet (Demo). Lizenz-Key: ' + key);
        }
      });
    });
  }

  async function init(){
    const userEmailEl = document.getElementById('user-email');
    const ordersEl = document.getElementById('orders');
    const licensesEl = document.getElementById('licenses');
    const downloadsEl = document.getElementById('downloads');
    if(!userEmailEl && !ordersEl && !licensesEl && !downloadsEl) return;

    const session = getSession();
    if(!session){
      if(userEmailEl) window.location = '/demo/account/login.html';
      return;
    }

    if(userEmailEl) userEmailEl.textContent = session.email || '';

    const email = session.email || '';
    const productMap = await getProductMap();

    if(ordersEl) renderOrders(getOrders(email), ordersEl, productMap);
    if(licensesEl) renderLicenses(getLocalLicenses(email), licensesEl);

    const licenses = getLocalLicenses(email);
    if(downloadsEl) renderDownloads(licenses, productMap, downloadsEl);
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

