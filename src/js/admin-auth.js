// admin-auth.js
// Demo admin auth supporting two modes:
// - Simple token/password in-browser (A)
// - GitHub OAuth placeholder simulation (B)

(function(){
  const sessionKey = 'optix-admin-session';
  const demoToken = 'admindemo'; // demo token for simple auth (change if you like)

  function saveSession(obj){ localStorage.setItem(sessionKey, JSON.stringify(obj)); }
  function getSession(){ try{ return JSON.parse(localStorage.getItem(sessionKey) || 'null'); }catch(e){ return null; } }
  function clearSession(){ localStorage.removeItem(sessionKey); }

  function oauthSimulateGitHub(){
    const w = window.open('', 'oauth_github', 'width=500,height=600');
    if(!w) return alert('Popup blocked');
    w.document.body.innerHTML = '<p style="font-family:sans-serif;padding:20px">Simulating GitHub OAuth...<br><small>This is a demo placeholder.</small></p>';
    setTimeout(()=>{
      const adminEmail = 'admin@demo.local';
      saveSession({ provider: 'github', email: adminEmail, role: 'admin' });
      w.close();
      window.location = '/demo/admin/products.html';
    }, 800);
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    const loginForm = document.getElementById('admin-login');
    const tokenInput = document.getElementById('token');
    const oauthBtn = document.getElementById('oauth-github');
    const status = document.getElementById('admin-status');
    const signout = document.getElementById('signout');

    function updateStatus(){
      const s = getSession();
      if(s) status.textContent = 'Signed in as ' + (s.email || 'admin') + ' (' + (s.provider || 'token') + ')';
      else status.textContent = 'Not signed in';
    }

    if(loginForm){
      loginForm.addEventListener('submit', (e)=>{
        e.preventDefault();
        const token = tokenInput.value.trim();
        if(!token) return alert('Token required');
        if(token === demoToken){ saveSession({ provider: 'token', email: 'admin@demo.local', role: 'admin' }); window.location = '/demo/admin/products.html'; }
        else{ alert('Invalid token'); }
      });
    }

    if(oauthBtn) oauthBtn.addEventListener('click', ()=> oauthSimulateGitHub());
    if(signout) signout.addEventListener('click', ()=>{ clearSession(); updateStatus(); window.location = '/'; });
    updateStatus();
  });

  // Expose session helper for other admin scripts
  window.AdminSession = {
    get: getSession,
    save: saveSession,
    clear: clearSession
  };
})();
