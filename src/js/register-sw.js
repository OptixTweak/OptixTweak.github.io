// register-sw.js — Registriert den Service Worker (nur bei HTTPS oder localhost).
(function(){
  if(!('serviceWorker' in navigator)) return;
  if(location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') return;
  window.addEventListener('load', ()=>{
    navigator.serviceWorker.register('/sw.js').catch(err=>{
      console.warn('Service Worker registration failed', err);
    });
  });
})();
