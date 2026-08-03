// Simple accessible mobile nav toggle
(function(){
  const toggle = document.getElementById('nav-toggle');
  const nav = document.querySelector('.site-nav');
  if(!toggle || !nav) return;
  toggle.addEventListener('click', ()=>{
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    nav.classList.toggle('open');
    if(!expanded) { nav.setAttribute('aria-hidden','false'); } else { nav.setAttribute('aria-hidden','true'); }
  });

  // Close nav on outside click (mobile)
  document.addEventListener('click', (e)=>{
    if(!nav.classList.contains('open')) return;
    if(e.target === toggle || nav.contains(e.target)) return;
    toggle.setAttribute('aria-expanded','false');
    nav.classList.remove('open');
    nav.setAttribute('aria-hidden','true');
  });
})();
