// buy-wiring.js
// Attach "add to cart" behavior to product pages and buttons.
// Works in two modes:
// - product page with ?id=PRODUCT_ID -> fetches /data/products.json and wires the main "Kaufen" button
// - buttons with data-product="product-id" -> fetches product by id and adds to cart

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
      // use minimal product shape expected by OptixCart
      const item = { id: prod.id, name: prod.name, price: Number(prod.price), image: (prod.images && prod.images[0]) ? (prod.images[0]+'-480.webp') : '/assets/images/placeholder.svg' };
      if(window.OptixCart && typeof window.OptixCart.add === 'function'){
        window.OptixCart.add(item);
        goToCart();
      }else{
        alert('Cart not available');
      }
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
        const item = { id: prod.id, name: prod.name, price: Number(prod.price), image: (prod.images && prod.images[0]) ? (prod.images[0]+'-480.webp') : '/assets/images/placeholder.svg' };
        if(window.OptixCart && typeof window.OptixCart.add === 'function'){
          window.OptixCart.add(item);
          goToCart();
        }else{
          alert('Cart not available');
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    wireProductPage();
    wireDataProductButtons();
  });
})();
