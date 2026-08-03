// Lightweight particle system (canvas) with mobile fallback and reduced-motion support.
// Unterstützt zwei Ziel-Canvas-IDs:
//   - #particles-canvas (Demo-Hero)
//   - #hero-canvas      (Root-index.html Hero)
(function(){
  const canvas = document.getElementById('particles-canvas') || document.getElementById('hero-canvas');
  if(!canvas) return;
  const isHero = !!document.getElementById('hero-canvas');

  const dpr = Math.max(1, window.devicePixelRatio || 1);
  const ctx = canvas.getContext('2d');
  let width = 0, height = 0;
  let particles = [];
  const maxParticlesDesktop = 60;
  const maxParticlesMobile = 18;
  const isMobile = window.innerWidth <= 600;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const maxParticles = isMobile ? maxParticlesMobile : maxParticlesDesktop;

  function resize(){
    width = canvas.clientWidth || window.innerWidth;
    height = canvas.clientHeight || 220;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.scale(dpr, dpr);
  }

  function createParticle(){
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * (isMobile ? 0.25 : 0.8),
      vy: (Math.random() - 0.5) * (isMobile ? 0.15 : 0.4),
      r: Math.random() * (isMobile?2.5:4) + 1.2,
      alpha: 0.2 + Math.random() * 0.5
    };
  }

  function initParticles(){
    particles = [];
    for(let i=0;i<maxParticles;i++) particles.push(createParticle());
  }

  function tick(){
    if(reduced) return; // no animation if reduced motion
    ctx.clearRect(0,0,width,height);
    particles.forEach(p=>{
      p.x += p.vx;
      p.y += p.vy;
      if(p.x < -10) p.x = width + 10;
      if(p.x > width + 10) p.x = -10;
      if(p.y < -10) p.y = height + 10;
      if(p.y > height + 10) p.y = -10;

      ctx.beginPath();
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r*6);
      g.addColorStop(0, `rgba(138,92,255,${p.alpha * 0.9})`);
      g.addColorStop(1, 'rgba(138,92,255,0)');
      ctx.fillStyle = g;
      ctx.arc(p.x, p.y, p.r*3, 0, Math.PI*2);
      ctx.fill();
    });
    requestAnimationFrame(tick);
  }

  function start(){
    resize();
    initParticles();
    if(!reduced) requestAnimationFrame(tick);
  }

  window.addEventListener('resize', ()=>{
    resize();
  }, { passive:true });

// Position canvas behind hero content
  canvas.style.position = 'absolute';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = isHero ? '100%' : '220px';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '0';
  canvas.style.opacity = '0.85';

  // Start when DOM is ready
  document.addEventListener('DOMContentLoaded', ()=>{
    const hero = document.getElementById('hero');
    if(hero) hero.style.position = 'relative';
    start();

    // Parallax: Partikel leicht der Maus folgen (nur Hero)
    if(isHero && !reduced){
      window.addEventListener('mousemove', (e)=>{
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        const dx = (e.clientX - cx) / cx;
        const dy = (e.clientY - cy) / cy;
        particles.forEach(p=>{
          p.x += dx * 0.15;
          p.y += dy * 0.15;
        });
      }, { passive: true });
    }
  });
})();
