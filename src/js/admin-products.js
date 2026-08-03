// admin-products.js (updated with markdown preview and validations)
// Minimal in-browser product editor with:
// - Markdown preview for description
// - Basic validations (id pattern, required fields, non-negative price)
// - Save draft / Export / Create PR scaffold as before

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

  // Simple markdown renderer (very small subset)
  function renderMarkdown(md){
    if(!md) return '';
    // Escape first
    let out = md;
    // Code blocks ```lang\n...``` -> <pre><code>
    out = out.replace(/```([\s\S]*?)```/g, function(m, p1){ return '<pre><code>' + escapeHtml(p1) + '</code></pre>'; });
    // Headings
    out = out.replace(/^###### (.*$)/gim, '<h6>$1</h6>');
    out = out.replace(/^##### (.*$)/gim, '<h5>$1</h5>');
    out = out.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
    out = out.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    out = out.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    out = out.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    // Bold **text**
    out = out.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
    // Italic *text*
    out = out.replace(/\*(.*?)\*/gim, '<em>$1</em>');
    // Inline code `x`
    out = out.replace(/`([^`]+)`/gim, '<code>$1</code>');
    // Links [text](url)
    out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    // Paragraphs: split by double newline
    out = out.split(/\n\n+/).map(para=>{
      if(/^<(h[1-6]|pre|ul|ol)/i.test(para)) return para; // already a block
      return '<p>' + para.replace(/\n/g, '<br>') + '</p>';
    }).join('\n');
    return out;
  }

  function openEditor(id){
    const editor = document.getElementById('editor-content');
    const p = products.find(x=>x.id===id) || { id: '', name:'', short:'', description:'', price:0, category:'ui', images:[], features:[], system:[], rating:0, reviews:0, faq:[] };
    editor.innerHTML = `
      <div id="editor-errors" style="color:#f88;margin-bottom:8px"></div>
      <label>ID<input id="e-id" class="input" value="${escapeHtml(p.id)}"></label>
      <label>Name<input id="e-name" class="input" value="${escapeHtml(p.name)}"></label>
      <label>Short<textarea id="e-short">${escapeHtml(p.short)}</textarea></label>
      <label>Description (Markdown)<textarea id="e-desc">${escapeHtml(p.description)}</textarea></label>
      <div style="display:flex;gap:8px;margin-top:6px"><button id="preview-md" class="ghost">Preview</button><button id="clear-preview" class="ghost">Close Preview</button></div>
      <div id="md-preview" style="margin-top:8px;display:none;padding:10px;border-radius:8px;background:rgba(255,255,255,0.02);max-height:240px;overflow:auto"></div>
      <label>Price<input id="e-price" type="number" class="input" value="${p.price}"></label>
      <label>Images (comma separated)<input id="e-images" class="input" value="${(p.images||[]).join(',')}"></label>
      <div class="actions"><button id="save-prod" class="btn-primary">Save</button> <button id="cancel-prod" class="ghost">Cancel</button></div>
    `;
    editor.querySelector('#save-prod').addEventListener('click', ()=> saveFromEditor(p.id));
    editor.querySelector('#cancel-prod').addEventListener('click', ()=> { document.getElementById('editor-content').textContent = 'Wähle ein Produkt, um zu bearbeiten.'; });
    editor.querySelector('#preview-md').addEventListener('click', ()=> {
      const md = document.getElementById('e-desc').value || '';
      const preview = document.getElementById('md-preview');
      preview.innerHTML = renderMarkdown(md);
      preview.style.display = 'block';
      preview.focus();
    });
    editor.querySelector('#clear-preview').addEventListener('click', ()=>{
      const preview = document.getElementById('md-preview'); preview.innerHTML=''; preview.style.display='none';
    });
  }

  function validateId(id){ return /^[a-zA-Z0-9-_]+$/.test(id); }

  function saveFromEditor(oldId){
    const errEl = document.getElementById('editor-errors'); if(errEl) errEl.textContent = '';
    const id = document.getElementById('e-id').value.trim();
    const name = document.getElementById('e-name').value.trim();
    const short = document.getElementById('e-short').value.trim();
    const desc = document.getElementById('e-desc').value.trim();
    const price = parseFloat(document.getElementById('e-price').value) || 0;
    const images = document.getElementById('e-images').value.split(',').map(s=>s.trim()).filter(Boolean);
    const errors = [];
    if(!id) errors.push('ID ist erforderlich');
    else if(!validateId(id)) errors.push('ID darf nur Buchstaben, Zahlen, - und _ enthalten');
    if(!name) errors.push('Name ist erforderlich');
    if(price < 0) errors.push('Preis darf nicht negativ sein');
    if(errors.length){ if(errEl) errEl.textContent = errors.join(' • '); return; }

    const existing = products.find(p=>p.id===oldId);
    const item = { id, name, short, description: desc, price, images, features: existing ? existing.features : [], system: existing ? existing.system : [], rating: existing ? existing.rating : 0, reviews: existing ? existing.reviews : 0, faq: existing ? existing.faq : [] };
    if(oldId){ products = products.map(p=> p.id===oldId ? item : p ); }
    else { products.push(item); }
    renderList(products);
    alert('Product saved to draft in editor. Click "Save draft (Local)" to persist.');
  }

  function deleteProduct(id){ products = products.filter(p=>p.id!==id); renderList(products); }

  function newProduct(){ openEditor(''); }

  function saveLocal(){ saveDraft(products); alert('Draft saved locally.'); }

  function exportJson(){ download('products-draft.json', JSON.stringify(products, null, 2)); }

  async function createPR(){
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
    const refreshBtn = document.getElementById('refresh'); if(refreshBtn) refreshBtn.addEventListener('click', ()=> load());
    const newBtn = document.getElementById('new'); if(newBtn) newBtn.addEventListener('click', ()=> newProduct());
    const saveBtn = document.getElementById('save-local'); if(saveBtn) saveBtn.addEventListener('click', ()=> saveLocal());
    const exportBtn = document.getElementById('export-json'); if(exportBtn) exportBtn.addEventListener('click', ()=> exportJson());
    const prBtn = document.getElementById('create-pr'); if(prBtn) prBtn.addEventListener('click', ()=> createPR());

    load();
  });

})();
