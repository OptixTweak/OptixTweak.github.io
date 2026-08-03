// cart.js — simple cart stored in localStorage
(function(){
  const key = 'optix-cart';
  function getCart(){ try{ return JSON.parse(localStorage.getItem(key) || '[]'); }catch(e){ return []; } }
  function saveCart(c){ localStorage.setItem(key, JSON.stringify(c)); }

  function renderCart(el){
    const cart = getCart();
    if(cart.length===0){ el.innerHTML='Warenkorb ist leer.'; return; }
    el.innerHTML = cart.map(item=>`
      <div class="cart-item">
        <div style="display:flex;gap:12px;align-items:center">
          <img src="${item.image||'/assets/images/placeholder.svg'}" alt="" style="width:64px;height:48px;object-fit:cover;border-radius:6px">
          <div>
            <div><strong>${item.name}</strong></div>
            <div class="small">€${item.price.toFixed(2)}</div>
          </div>
        </div>
        <div style="display:flex;gap:8px;align-items:center">
          <input aria-label="Quantity" type="number" min="1" value="${item.qty}" data-id="${item.id}" style="width:64px;padding:6px;border-radius:6px;border:1px solid rgba(255,255,255,0.04)">
          <button class="ghost" data-remove="${item.id}">Remove</button>
        </div>
      </div>
    `).join('');

    // attach handlers
    el.querySelectorAll('input[type="number"]').forEach(inp=>{
      inp.addEventListener('change', (e)=>{
        const id = inp.dataset.id; const val = Math.max(1, Number(inp.value));
        const cart = getCart(); const it = cart.find(i=>i.id===id); if(it) it.qty = val; saveCart(cart); renderCart(el);
      });
    });
    el.querySelectorAll('[data-remove]').forEach(btn=> btn.addEventListener('click', ()=>{
      const id = btn.getAttribute('data-remove'); const cart = getCart(); localStorage.setItem(key, JSON.stringify(cart.filter(i=>i.id!==id))); renderCart(el);
    }));
  }

  // Public API: add product
  window.OptixCart = {
    add(product){
      const cart = getCart();
      const exists = cart.find(i=>i.id===product.id);
      if(exists){ exists.qty += 1; } else { cart.push(Object.assign({qty:1}, product)); }
      saveCart(cart);
      return cart;
    },
    get(){ return getCart(); },
    clear(){ saveCart([]); }
  };

  // auto render on cart page
  document.addEventListener('DOMContentLoaded', ()=>{
    const el = document.getElementById('cart');
    if(el) renderCart(el);
  });
})();
