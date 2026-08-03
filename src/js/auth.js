// auth.js — demo authentication with Web Crypto hashing and OAuth placeholders
(function(){
  const storageKey = 'optix-users';
  const sessionKey = 'optix-session';

  function getUsers(){
    try{ return JSON.parse(localStorage.getItem(storageKey) || '[]'); }catch(e){ return []; }
  }
  function saveUsers(users){ localStorage.setItem(storageKey, JSON.stringify(users)); }

  async function hashPassword(password){
    const enc = new TextEncoder();
    const data = enc.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2,'0')).join('');
  }

  function findUser(email){
    const users = getUsers();
    return users.find(u => u.email.toLowerCase()===email.toLowerCase());
  }

  async function register(email, password){
    if(findUser(email)) throw new Error('User exists');
    const pwdHash = await hashPassword(password);
    const users = getUsers();
    users.push({ email, passwordHash: pwdHash, createdAt: Date.now() });
    saveUsers(users);
    // auto login
    localStorage.setItem(sessionKey, JSON.stringify({ email, createdAt: Date.now() }));
    return true;
  }

  async function login(email, password){
    const user = findUser(email);
    if(!user) throw new Error('User not found');
    const pwdHash = await hashPassword(password);
    if(pwdHash !== user.passwordHash) throw new Error('Invalid password');
    localStorage.setItem(sessionKey, JSON.stringify({ email, createdAt: Date.now() }));
    return true;
  }

  function logout(){ localStorage.removeItem(sessionKey); }

  function getSession(){
    try{ return JSON.parse(localStorage.getItem(sessionKey) || 'null'); }catch(e){ return null; }
  }

  // OAuth placeholders — simulate redirect flow
  function oauthSimulate(provider){
    // In a real app this would redirect to provider auth endpoint with client_id
    // Here we open a small window and then simulate a callback after 1s
    const w = window.open('', 'oauth_'+provider, 'width=500,height=600');
    if(!w) return alert('Popups blocked');
    w.document.body.innerHTML = `<p style="font-family:sans-serif;padding:20px">Simulating ${provider} OAuth...<br><small>This is a demo placeholder.</small></p>`;
    setTimeout(()=>{
      // simulate returned profile email
      const fakeEmail = provider.toLowerCase() + '.user@demo.local';
      const users = getUsers();
      if(!users.find(u=>u.email===fakeEmail)){
        // auto create account without password
        users.push({ email: fakeEmail, oauth: provider, createdAt: Date.now() });
        saveUsers(users);
      }
      localStorage.setItem(sessionKey, JSON.stringify({ email: fakeEmail, oauth:provider, createdAt: Date.now() }));
      w.close();
      window.location = '/demo/account/dashboard.html';
    }, 900);
  }

  // Attach to forms (if present on page)
  document.addEventListener('DOMContentLoaded', ()=>{
    const regForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');
    const gReg = document.getElementById('oauth-google');
    const gLogin = document.getElementById('oauth-google');
    const ghReg = document.getElementById('oauth-github');
    const ghLogin = document.getElementById('oauth-github');

    if(regForm){
      regForm.addEventListener('submit', async (e)=>{
        e.preventDefault();
        const email = regForm.querySelector('#email').value.trim();
        const pw = regForm.querySelector('#password').value;
        const cf = regForm.querySelector('#confirm').value;
        if(pw !== cf) return alert('Passwords do not match');
        try{ await register(email, pw); window.location = '/demo/account/dashboard.html'; }catch(err){ alert(err.message); }
      });
    }

    if(loginForm){
      loginForm.addEventListener('submit', async (e)=>{
        e.preventDefault();
        const email = loginForm.querySelector('#email').value.trim();
        const pw = loginForm.querySelector('#password').value;
        try{ await login(email, pw); window.location = '/demo/account/dashboard.html'; }catch(err){ alert(err.message); }
      });
    }

    if(gReg) gReg.addEventListener('click', ()=> oauthSimulate('Google'));
    if(ghReg) ghReg.addEventListener('click', ()=> oauthSimulate('GitHub'));

    // Dashboard: show session + orders
    const userEmailEl = document.getElementById('user-email');
    const ordersEl = document.getElementById('orders');
    if(userEmailEl){
      const s = getSession();
      if(!s){ window.location = '/demo/account/login.html'; return; }
      userEmailEl.textContent = s.email;
      // load orders from localStorage keyed by email
      const allOrders = JSON.parse(localStorage.getItem('optix-orders') || '[]');
      const myOrders = allOrders.filter(o=>o.email===s.email);
      if(myOrders.length===0){ ordersEl.textContent = 'Keine Bestellungen.'; }
      else{
        ordersEl.innerHTML = myOrders.map(o=>`<div class="order"><div><strong>Bestellung ${o.id}</strong> — ${new Date(o.createdAt).toLocaleString()}</div><div>${o.items.map(i=>i.name+' x'+i.qty).join(', ')}</div><div>Total: €${o.total.toFixed(2)}</div></div>`).join('');
      }
    }

  });

})();
