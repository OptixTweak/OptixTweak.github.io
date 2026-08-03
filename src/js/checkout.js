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

  // Stripe testmode handler (requires backend endpoint to create session)
  async function payWithStripe(){
    const publishableKey = 'pk_test_YOUR_PUBLISHABLE_KEY'; // replace with your key in production
    // This demo does not include server side keys. For Stripe Checkout you need a server endpoint that calls stripe.checkout.sessions.create
    // Example flow (server): POST /create-checkout-session with cart items -> returns session.id
    // Client: const stripe = Stripe(publishableKey); stripe.redirectToCheckout({ sessionId });

    // We'll attempt to call /create-checkout-session relative to site. If absent, show instructions.
    try{
      const cart = getCart(); if(cart.length===0) return alert('Cart empty');
      const res = await fetch('/create-checkout-session', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ cart }) });
      if(!res.ok) throw new Error('No backend endpoint found');
      const data = await res.json();
      if(!data.sessionId) throw new Error('Invalid response');
      const stripe = Stripe(publishableKey);
      await stripe.redirectToCheckout({ sessionId: data.sessionId });
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
