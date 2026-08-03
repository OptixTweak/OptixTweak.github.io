// checkout.js — simulated payment flow + Stripe (test mode) example
(function(){
  function getCart(){ try{ return JSON.parse(localStorage.getItem('optix-cart') || '[]'); }catch(e){ return []; } }
  function getSession(){ try{ return JSON.parse(localStorage.getItem('optix-session') || 'null'); }catch(e){ return null; } }

  function calcTotal(cart){ return cart.reduce((s,i)=> s + (i.price * (i.qty||1)), 0); }

  function renderSummary(){
    const el = document.getElementById('summary');
    const cart = getCart();
    if(!el) return;
    if(cart.length===0){ el.textContent='Warenkorb ist leer.'; return; }
    el.innerHTML = `
      <div><strong>Artikel:</strong> ${cart.length}</div>
      <div>${cart.map(i=>`<div>${i.name} x${i.qty} — €${(i.price*i.qty).toFixed(2)}</div>`).join('')}</div>
      <div class="row"><div>Total</div><div><strong>€${calcTotal(cart).toFixed(2)}</strong></div></div>
    `;
  }

  // Simulate payment success: store order in localStorage
  function placeOrderSimulated(){
    const cart = getCart(); if(cart.length===0) return alert('Cart empty');
    const session = getSession(); if(!session) return alert('Please login to checkout.');
    const orders = JSON.parse(localStorage.getItem('optix-orders') || '[]');
    const id = 'ORD-' + Math.random().toString(36).slice(2,9).toUpperCase();
    const order = { id, email: session.email, items: cart, total: calcTotal(cart), createdAt: Date.now() };
    orders.push(order); localStorage.setItem('optix-orders', JSON.stringify(orders));
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

    if (publishableKey === 'pk_test_YOUR_PUBLISHABLE_KEY') {
      console.warn('Stripe publishable key not set in meta[name="stripe-pk"]. Using placeholder. Update the page to set your publishable key.');
    }

    if (typeof Stripe !== 'function') {
      alert('Stripe.js not loaded. Please include <script src="https://js.stripe.com/v3/"></script> on the page.');
      return;
    }

    try{
      const cart = getCart(); if(cart.length===0) return alert('Cart empty');

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
      alert('Stripe checkout not configured on this demo. See docs/checkout-notes.md for setup instructions.');
      console.warn(err);
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
