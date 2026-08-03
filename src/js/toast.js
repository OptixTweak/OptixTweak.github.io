// toast.js
// Lightweight accessible toast notifications with optional action buttons.
// Exposes window.showToast({ message, actions: [{label, callback}], duration })

(function(){
  function createContainer(){
    let c = document.getElementById('toast-container');
    if(c) return c;
    c = document.createElement('div');
    c.id = 'toast-container';
    c.setAttribute('aria-live','polite');
    c.style.position = 'fixed';
    c.style.right = '18px';
    c.style.bottom = '18px';
    c.style.zIndex = 99999;
    c.style.display = 'flex';
    c.style.flexDirection = 'column';
    c.style.gap = '8px';
    document.body.appendChild(c);
    return c;
  }

  function makeToast(opts){
    const { message, actions = [], duration = 4000 } = opts || {};
    const container = createContainer();
    const t = document.createElement('div');
    t.className = 'toast';
    t.style.minWidth = '220px';
    t.style.maxWidth = '360px';
    t.style.background = 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))';
    t.style.color = '#fff';
    t.style.padding = '12px';
    t.style.borderRadius = '10px';
    t.style.boxShadow = '0 8px 24px rgba(2,2,3,0.6)';
    t.style.border = '1px solid rgba(255,255,255,0.04)';
    t.style.display = 'flex';
    t.style.flexDirection = 'column';
    t.style.gap = '8px';
    t.tabIndex = 0; // make focusable

    const msg = document.createElement('div');
    msg.textContent = message || 'Done';
    msg.style.fontSize = '0.95rem';

    const actionsWrap = document.createElement('div');
    actionsWrap.style.display = 'flex';
    actionsWrap.style.gap = '8px';

    actions.forEach((a, idx)=>{
      const btn = document.createElement('button');
      btn.textContent = a.label || 'Action';
      btn.style.padding = '6px 10px';
      btn.style.borderRadius = '8px';
      btn.style.border = 'none';
      btn.style.cursor = 'pointer';
      btn.style.background = idx===0 ? 'linear-gradient(180deg,#8a5cff,#6f3df0)' : 'transparent';
      btn.style.color = idx===0 ? '#fff' : '#cfcfe0';
      btn.addEventListener('click', ()=>{
        try{ a.callback && a.callback(); }catch(e){ /* ignore callback errors */ }
        remove();
      });
      actionsWrap.appendChild(btn);
    });

    const close = document.createElement('button');
    close.textContent = '✕';
    close.style.position = 'absolute';
    close.style.right = '6px';
    close.style.top = '6px';
    close.style.background = 'transparent';
    close.style.border = 'none';
    close.style.color = '#bdbdd6';
    close.style.cursor = 'pointer';
    close.addEventListener('click', remove);

    t.appendChild(msg);
    if(actions.length) t.appendChild(actionsWrap);
    t.appendChild(close);

    function remove(){
      if(t.parentNode) t.parentNode.removeChild(t);
      clearTimeout(timer);
    }

    container.appendChild(t);
    t.focus();
    const timer = setTimeout(()=>{ remove(); }, duration);

    return { remove };
  }

  window.showToast = function(opts){ return makeToast(opts); };

})();
