// Modal focus-trap and accessible open/close
(function(){
  const modalBackdrop = document.getElementById('modal');
  if(!modalBackdrop) return;
  const modal = modalBackdrop.querySelector('.modal');
  const openers = Array.from(document.querySelectorAll('[data-product]'));
  const closer = modal.querySelector('#close');
  const cancel = modal.querySelector('#cancel');
  const previouslyFocused = { el: null };

  const focusableSelectors = 'a[href], area[href], input:not([disabled]):not([type=hidden]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex], [contenteditable]';

  function getFocusable(container){
    return Array.from(container.querySelectorAll(focusableSelectors)).filter(el=>el.tabIndex!==-1);
  }

  function openModal(){
    previouslyFocused.el = document.activeElement;
    modalBackdrop.classList.add('show');
    modal.setAttribute('aria-hidden','false');
    modal.setAttribute('tabindex','-1');
    // hide main content from assistive tech
    const main = document.querySelector('main') || document.querySelector('.container');
    if(main) main.setAttribute('aria-hidden','true');
    document.body.style.overflow = 'hidden';

    const focusable = getFocusable(modal);
    if(focusable.length){ focusable[0].focus(); } else { modal.focus(); }

    document.addEventListener('keydown', handleKeyDown);
    modalBackdrop.addEventListener('click', onBackdropClick);
  }

  function closeModal(){
    modalBackdrop.classList.remove('show');
    modal.setAttribute('aria-hidden','true');
    const main = document.querySelector('main') || document.querySelector('.container');
    if(main) main.removeAttribute('aria-hidden');
    document.body.style.overflow = '';
    document.removeEventListener('keydown', handleKeyDown);
    modalBackdrop.removeEventListener('click', onBackdropClick);
    // restore focus
    if(previouslyFocused.el && previouslyFocused.el.focus) previouslyFocused.el.focus();
  }

  function handleKeyDown(e){
    if(e.key === 'Escape') { closeModal(); return; }
    if(e.key === 'Tab'){
      const focusable = getFocusable(modal);
      if(focusable.length === 0){ e.preventDefault(); return; }
      const first = focusable[0];
      const last = focusable[focusable.length-1];
      if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
      else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
    }
  }

  function onBackdropClick(e){
    if(e.target === modalBackdrop){ closeModal(); }
  }

  openers.forEach(btn => btn.addEventListener('click', openModal));
  if(closer) closer.addEventListener('click', closeModal);
  if(cancel) cancel.addEventListener('click', closeModal);
})();
