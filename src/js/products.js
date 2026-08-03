// Client-side products rendering, filter & search (lightweight)
(function(){
  const grid = document.getElementById('products-grid');
  const searchInput = document.getElementById('search');
  const categorySelect = document.getElementById('category');
  const sortSelect = document.getElementById('sort');
  let products = [];

  // XSS-Schutz über zentrale Utility (src/js/escape.js) mit Fallback.
  const _e = (typeof window.OptixEscape !== 'undefined') ? window.OptixEscape.escapeHtml
    : function(s){ return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'<','>':'>','"':'"',"'":'&#39;'}[c])); };
  const _u = (typeof window.OptixEscape !== 'undefined') ? window.OptixEscape.escapeUrl
    : function(s){ return String(s); };
  function escapeHtml(s){ return _e(s); }

  function pictureMarkup(basePath, alt){
    const b = _u(basePath);
    const src480 = (b || '') + '-480.webp';
    const src768 = (b || '') + '-768.webp';
    const src1200 = (b || '') + '-1200.webp';
    const fallback = (b || '') + '.svg';
    return `
      <picture>
        <source type="image/webp" srcset="${src480} 480w, ${src768} 768w, ${src1200} 1200w" sizes="(max-width:600px) 100vw, 33vw">
        <img src="${fallback}" alt="${escapeHtml(alt)}" loading="lazy" style="width:100%;height:140px;object-fit:cover;border-radius:8px">
      </picture>
    `;
  }

  function attachEvents(){
    if(!grid) return;
    grid.querySelectorAll('.add-to-cart').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const product = products.find(item => item.id === btn.dataset.id);
        if(!product) return;
        if(window.OptixCart){
          window.OptixCart.add(product);
          btn.textContent = 'Hinzugefügt';
          btn.disabled = true;
          setTimeout(()=>{ btn.textContent = 'In den Warenkorb'; btn.disabled = false; }, 1200);
        } else {
          alert('Warenkorb konnte nicht geladen werden.');
        }
      });
    });
  }

  function render(items){
    if(!grid) return;
    grid.innerHTML = items.map(p=>`
      <div class="card product-card">
        <div class="thumb">${pictureMarkup(p.images && p.images[0], p.name)}</div>
        <div class="meta"><div class="title">${escapeHtml(p.name)}</div><span class="badge">${escapeHtml(p.category)}</span></div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px">
          <div class="price">€${Number(p.price||0).toFixed(2)}</div>
          <div class="quick-actions">
            <a class="btn-primary btn-sm" href="product.html?id=${_u(p.id)}">Details</a>
            <button class="btn-ghost btn-sm add-to-cart" data-id="${_u(p.id)}">In den Warenkorb</button>
          </div>
        </div>
      </div>
    `).join('');
    attachEvents();
  }

  function normalize(str){ return (str||'').toString().toLowerCase(); }
  function matches(p, q){
    q = normalize(q);
    if(!q) return true;
    return normalize(p.name).includes(q) || normalize(p.short).includes(q) || normalize(p.description).includes(q);
  }

  function applyFilters(){
    const q = searchInput ? searchInput.value.trim() : '';
    const cat = categorySelect ? categorySelect.value : '';
    let items = products.slice();
    if(cat) items = items.filter(i=>i.category===cat);
    if(q) items = items.filter(i=>matches(i,q));
    const sort = sortSelect ? sortSelect.value : '';
    if(sort==='price-asc') items.sort((a,b)=>a.price-b.price);
    if(sort==='price-desc') items.sort((a,b)=>b.price-a.price);
    render(items);
  }

  function debounce(fn, wait=200){ let t; return (...args)=>{ clearTimeout(t); t=setTimeout(()=>fn(...args), wait); }; }

  async function init(){
    try{
      const res = await fetch('/data/products.json');
      products = await res.json();
      render(products);
      if(searchInput) searchInput.addEventListener('input', debounce(applyFilters, 180));
      if(categorySelect) categorySelect.addEventListener('change', applyFilters);
      if(sortSelect) sortSelect.addEventListener('change', applyFilters);
    }catch(e){ console.error('Failed to load products', e); if(grid) grid.textContent='Fehler beim Laden der Produkte.' }
  }
  init();
})();
