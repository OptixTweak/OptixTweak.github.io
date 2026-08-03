// buy-wiring.js (updated)
// Attach "add to cart" behavior to product pages and buttons.
// Now shows a small accessible toast confirmation with actions instead of immediate redirect.

(function(){
  async function fetchProducts(){
    try{
      const res = await fetch('/data/products.json');
      if(!res.ok) throw new Error('Products not found');
      return await res.json();
    }catch(e){ console.warn('fetchProducts failed', e); return []; }
  }

  async function findProductById(id){
    const products = await fetchProducts();
    return products.find(p=>p.id===id);
  }

  function goToCart(){ window.location = '/demo/checkout/cart.html'; }
  function continueShopping(){ /* no-op: user stays on page */ }

  async function addAndNotify(prod){
    const item = { id: prod.id, name: prod.name, price: Number(prod.price), image: (prod.images && prod.images[0]) ? (prod.images[0]+'-480.webp') : '/assets/images/placeholder.svg' };
    if(window.OptixCart && typeof window.OptixCart.add === 'function'){
      window.OptixCart.add(item);
      if(window.showToast){
        window.showToast({
          message: `${prod.name} wurde zum Warenkorb hinzugefügt`,
          actions: [
            { label: 'Zum Warenkorb', callback: goToCart },
            { label: 'Weiter einkaufen', callback: continueShopping }
          ],
          duration: 5000
        });
      } else {
        // fallback: simple alert + redirect option
        if(confirm(prod.name + ' wurde zum Warenkorb hinzugefügt. Zum Warenkorb?')) goToCart();
      }
    }else{
      alert('Cart not available');
    }
  }

  async function wireProductPage(){
    const params = new URLSearchParams(location.search);
    const id = params.get('id');
    if(!id) return;
    const buyBtn = document.querySelector('.btn-primary');
    if(!buyBtn) return;
    buyBtn.addEventListener('click', async function(e){
      e.preventDefault();
      const prod = await findProductById(id);
      if(!prod){ alert('Produkt nicht gefunden'); return; }
      addAndNotify(prod);
    });
  }

  async function wireDataProductButtons(){
    const buttons = Array.from(document.querySelectorAll('[data-product]'));
    if(buttons.length===0) return;
    const products = await fetchProducts();
    buttons.forEach(btn => {
      btn.addEventListener('click', async (e)=>{
        e.preventDefault();
        const id = btn.getAttribute('data-product');
        const prod = products.find(p=>p.id===id);
        if(!prod){ alert('Produkt nicht gefunden'); return; }
        addAndNotify(prod);
      });
    });
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    wireProductPage();
    wireDataProductButtons();
  });
})();
