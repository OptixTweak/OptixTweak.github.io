// admin-products.js
// Minimal in-browser product editor.
// Features:
// - Load /data/products.json (repo copy) and merge with local draft
// - Create / Edit / Delete products
// - Save draft to localStorage and Export JSON
// - Create PR scaffold: POST JSON to /create-pr (server required) with payload { title, body, files }

(function(){
  const repoUrl = '/data/products.json';
  const draftKey = 'optix-admin-products-draft';

  async function fetchRepoProducts(){
    try{ const r = await fetch(repoUrl); if(!r.ok) throw new Error('Not found'); return await r.json(); }catch(e){ console.warn(e); return []; }
  }

  function getDraft(){ try{ return JSON.parse(localStorage.getItem(draftKey) || 'null'); }catch(e){ return null; } }
  function saveDraft(d){ localStorage.setItem(draftKey, JSON.stringify(d)); }
  function clearDraft(){ localStorage.removeItem(draftKey); }

  function download(filename, content){ const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([content],{type:'application/json'})); a.download = filename; a.click(); }

  function renderList(products){
    const list = document.getElementById('product-list');
    if(!list) return;
    list.innerHTML = products.map(p=>`<div class="item"><div><strong>${escapeHtml(p.name)}</strong><div class="small">${escapeHtml(p.short||'')}</div></div><div><button data-id="${p.id}" class="edit ghost">Edit</button> <button data-id="${p.id}" class="del ghost">Delete</button></div></div>`).join('');
    // attach handlers
    list.querySelectorAll('.edit').forEach(b=> b.addEventListener('click', ()=> openEditor(b.getAttribute('data-id'))));
    list.querySelectorAll('.del').forEach(b=> b.addEventListener('click', ()=> { if(confirm('Delete product?')){ deleteProduct(b.getAttribute('data-id')); } }));
  }

  function escapeHtml(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  let products = [];

  async function load(){
    const repo = await fetchRepoProducts();
    const draft = getDraft();
    products = Array.isArray(draft) ? draft : repo;
    renderList(products);
  }

  function openEditor(id){
    const editor = document.getElementById('editor-content');
    const p = products.find(x=>x.id===id) || { id: '', name:'', short:'', description:'', price:0, category:'ui', images:[], features:[], system:[], rating:0, reviews:0, faq:[] };
    editor.innerHTML = `
      <label>ID<input id="e-id" class="input" value="${escapeHtml(p.id)}"></label>
      <label>Name<input id="e-name" class="input" value="${escapeHtml(p.name)}"></label>
      <label>Short<textarea id="e-short">${escapeHtml(p.short)}</textarea></label>
      <label>Description<textarea id="e-desc">${escapeHtml(p.description)}</textarea></label>
      <label>Price<input id="e-price" type="number" class="input" value="${p.price}"></label>
      <label>Images (comma separated)<input id="e-images" class="input" value="${(p.images||[]).join(',')}"></label>
      <div class="actions"><button id="save-prod" class="btn-primary">Save</button> <button id="cancel-prod" class="ghost">Cancel</button></div>
    `;
    editor.querySelector('#save-prod').addEventListener('click', ()=> saveFromEditor(p.id));
    editor.querySelector('#cancel-prod').addEventListener('click', ()=> { document.getElementById('editor-content').textContent = 'Wähle ein Produkt, um zu bearbeiten.'; });
  }

  function saveFromEditor(oldId){
    const id = document.getElementById('e-id').value.trim();
    const name = document.getElementById('e-name').value.trim();
    const short = document.getElementById('e-short').value.trim();
    const desc = document.getElementById('e-desc').value.trim();
    const price = parseFloat(document.getElementById('e-price').value) || 0;
    const images = document.getElementById('e-images').value.split(',').map(s=>s.trim()).filter(Boolean);
    if(!id || !name) return alert('ID and Name required');
    const existing = products.find(p=>p.id===oldId);
    const item = { id, name, short, description: desc, price, images, features: existing ? existing.features : [], system: existing ? existing.system : [], rating: existing ? existing.rating : 0, reviews: existing ? existing.reviews : 0, faq: existing ? existing.faq : [] };
    if(oldId){ products = products.map(p=> p.id===oldId ? item : p ); }
    else { products.push(item); }
    renderList(products);
  }

  function deleteProduct(id){ products = products.filter(p=>p.id!==id); renderList(products); }

  function newProduct(){ openEditor(''); }

  function saveLocal(){ saveDraft(products); alert('Draft saved locally.'); }

  function exportJson(){ download('products-draft.json', JSON.stringify(products, null, 2)); }

  async function createPR(){
    // This expects a server endpoint POST /create-pr that accepts { title, body, files }
    // Files: { path: 'data/products.json', content: '...' }
    const endpoint = '/create-pr';
    const payload = { title: 'chore(admin): update products (editor)', body: 'Updated products via admin editor (demo).', files: [{ path: 'data/products.json', content: JSON.stringify(products, null, 2) }] };
    try{
      const res = await fetch(endpoint, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
      if(!res.ok) throw new Error('No server endpoint');
      const data = await res.json();
      if(data.url) window.open(data.url, '_blank');
      else alert('PR created (server returned no url)');
    }catch(err){
      alert('Create PR failed. See docs for server scaffolding.');
      console.warn(err);
    }
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    document.getElementById('refresh').addEventListener('click', ()=> load());
    document.getElementById('new').addEventListener('click', ()=> newProduct());
    document.getElementById('save-local').addEventListener('click', ()=> saveLocal());
    document.getElementById('export-json').addEventListener('click', ()=> exportJson());
    document.getElementById('create-pr').addEventListener('click', ()=> createPR());

    load();
  });

})();
