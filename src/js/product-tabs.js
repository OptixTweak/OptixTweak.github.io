// Accessible tabs with deep linking for product.html
(function(){
  function initTabs(root){
    const tabs = Array.from(root.querySelectorAll('[role="tab"]'));
    const panels = tabs.map(t=>document.getElementById(t.getAttribute('aria-controls')));
    tabs.forEach((tab,i)=>{
      tab.addEventListener('click', ()=>{
        select(i);
        history.replaceState(null,'',`#${tab.id}`);
      });
      tab.addEventListener('keydown', (e)=>{
        if(e.key==='ArrowRight') { select((i+1)%tabs.length); tabs[(i+1)%tabs.length].focus(); }
        if(e.key==='ArrowLeft') { select((i-1+tabs.length)%tabs.length); tabs[(i-1+tabs.length)%tabs.length].focus(); }
      });
    });
    function select(idx){
      tabs.forEach((t,j)=>{
        const sel = j===idx;
        t.setAttribute('aria-selected', String(sel));
        const panel = document.getElementById(t.getAttribute('aria-controls'));
        if(panel) panel.hidden = !sel;
      });
    }
    // deep link
    const hash = location.hash.replace('#','');
    const start = tabs.findIndex(t=>t.id===hash);
    select(start>=0?start:0);
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    const root = document.getElementById('product-article') || document;
    initTabs(root);
  });
})();
