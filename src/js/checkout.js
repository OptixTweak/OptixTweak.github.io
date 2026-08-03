// checkout.js — simulated payment flow + Stripe (test mode) example
/* global Stripe */
(function(){
  const _e = (typeof window.OptixEscape !== 'undefined') ? window.OptixEscape.escapeHtml
    : function(s){ return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'<','>':'>','"':'"',"'":'&#39;'}[c])); };

  function getCart(){ try{ return JSON.parse(localStorage.getItem('optix-cart') || '[]'); }catch(e){ return []; } }
  function getSession(){ try{ return JSON.parse(localStorage.getItem('optix-session') || 'null'); }catch(e){ return null; } }

  function calcTotal(cart){ return cart.reduce((s,i)=> s + (Number(i.price||0) * (i.qty||1)), 0); }

  // Lizenz-Keys deterministisch aus Bestelldaten generieren (Demo).
  // Hinweis: In Produktion serverseitig generieren und persistieren (siehe server/lib/licenses.js).
  function generateLicenseKey(productId, orderId){
    const seedStr = `${productId}:${orderId}`;
    let h = 2166136261;
    for(let i=0;i<seedStr.length;i++){
      h ^= seedStr.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    const hex = (h >>> 0).toString(16).toUpperCase().padStart(8,'0');
    const base = 'OPTIX-' + productId.toUpperCase().replace(/[^A-Z0-9]/g,'') + '-' + hex;
    return (base.length > 28) ? base.slice(0,28) : base;
  }

  function renderSummary(){
    const el = document.getElementById('summary');
    const cart = getCart();
    if(!el) return;
    if(cart.length===0){ el.textContent='Warenkorb ist leer.'; return; }
    el.innerHTML = `
      <div><strong>Artikel:</strong> ${cart.length}</div>
      <div>${cart.map(i=>`<div>${_e(i.name)} x${Number(i.qty||1)} — €${(Number(i.price||0)*Number(i.qty||1)).toFixed(2)}</div>`).join('')}</div>
      <div class="row"><div>Total</div><div><strong>€${calcTotal(cart).toFixed(2)}</strong></div></div>
    `;
  }

  // Lizenzen zu einer Bestellung in localStorage ablegen (Schlüssel 'optix:licenses').
  function storeLicenses(order){
    const licenses = JSON.parse(localStorage.getItem('optix:licenses') || '[]');
    order.items.forEach(item=>{
      const key = generateLicenseKey(item.id, order.id);
      if(!licenses.some(l=>l.key===key)){
        licenses.push({ key, productId:item.id, ownerEmail: order.email, status:'active', createdAt: Date.now() });
      }
    });
    localStorage.setItem('optix:licenses', JSON.stringify(licenses));
  }

  // Simulate payment success: store order + licenses in localStorage
  function placeOrderSimulated(){
    const cart = getCart(); if(cart.length===0) return alert('Cart empty');
    const session = getSession(); if(!session) return alert('Please login to checkout.');
    const orders = JSON.parse(localStorage.getItem('optix-orders') || '[]');
    const id = 'ORD-' + Math.random().toString(36).slice(2,9).toUpperCase();
    const order = { id, email: session.email, items: cart, total: calcTotal(cart), createdAt: Date.now() };
    orders.push(order); localStorage.setItem('optix-orders', JSON.stringify(orders));
    storeLicenses(order);
    // clear cart
    localStorage.setItem('optix-cart', JSON.stringify([]));
    alert('Payment simulated — order placed: ' + id);
    window.location = '/demo/account/dashboard.html';
  }

  // Helper: read meta tag content
  function readMeta(name){
    const m = document.querySelector(`meta[name="${name}"]`);
    return m ? m.getAttribute('content') : null;
  }

  // Stripe testmode handler (requires backend endpoint to create session)
  async function payWithStripe(){
    // publishable key can be provided via a meta tag: <meta name="stripe-pk" content="pk_test_...">
    const publishableKey = readMeta('stripe-pk') || 'pk_test_YOUR_PUBLISHABLE_KEY';
    // backend endpoint can be configured via meta tag: <meta name="stripe-backend" content="http://localhost:4242/create-checkout-session">
    const backend = readMeta('stripe-backend') || '/create-checkout-session';

    const cart = getCart(); if(cart.length===0) return alert('Cart empty');

    if (typeof Stripe !== 'function') {
      alert('Stripe.js not loaded. Please include <script src="https://js.stripe.com/v3/"></script> on the page.');
      return;
    }

    try{
      const res = await fetch(backend, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ cart }) });
      if(!res.ok) throw new Error('Backend endpoint returned ' + res.status);
      const data = await res.json();
      if(!data.sessionId && !data.url) throw new Error('Invalid response from backend');

      const stripe = Stripe(publishableKey);
      // Support both { sessionId } (redirectToCheckout) and { url } (direct redirect)
      if (data.sessionId) {
        await stripe.redirectToCheckout({ sessionId: data.sessionId });
      } else if (data.url) {
        window.location = data.url;
      }
    }catch(err){
      console.warn('Stripe checkout not configured on this demo. See docs/checkout-notes.md for setup instructions.', err);
      alert('Stripe checkout not configured on this demo. See docs/checkout-notes.md for setup instructions.');
    }
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    renderSummary();
    const sim = document.getElementById('pay-sim');
    const stripeBtn = document.getElementById('pay-stripe');
    if(sim) sim.addEventListener('click', placeOrderSimulated);
    if(stripeBtn) stripeBtn.addEventListener('click', payWithStripe);
  });
})();
