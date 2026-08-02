// hero.js — Parallax & lightweight particle background (mobile friendly)
(function(){
  const canvasContainer = document.getElementById('hero-canvas');
  if(!canvasContainer) return;

  // create canvas
  const canvas = document.createElement('canvas');
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvasContainer.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  let particles = [];
  function resize(){
    canvas.width = canvas.offsetWidth * devicePixelRatio;
    canvas.height = canvas.offsetHeight * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);
  }
  resize();
  window.addEventListener('resize', () => { resize(); });

  function rand(min,max){return Math.random()*(max-min)+min}

  function createParticles(count){
    particles = [];
    for(let i=0;i<count;i++){
      particles.push({
        x: rand(0, canvas.offsetWidth),
        y: rand(0, canvas.offsetHeight),
        r: rand(0.6, 2.5),
        vx: rand(-0.05, 0.05),
        vy: rand(-0.02, 0.02),
        alpha: rand(0.06,0.2)
      });
    }
  }

  // density reduced on small screens
  const isMobile = window.matchMedia('(max-width:600px)').matches;
  createParticles(isMobile?30:90);

  function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.globalCompositeOperation='lighter';
    particles.forEach(p=>{
      ctx.beginPath();
      ctx.fillStyle = `rgba(138,66,255,${p.alpha})`;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fill();

      p.x += p.vx;
      p.y += p.vy;

      if(p.x < -10) p.x = canvas.offsetWidth + 10;
      if(p.x > canvas.offsetWidth + 10) p.x = -10;
      if(p.y < -10) p.y = canvas.offsetHeight + 10;
      if(p.y > canvas.offsetHeight + 10) p.y = -10;
    });

    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);

  // simple parallax on mousemove
  window.addEventListener('mousemove', (e)=>{
    const cx = canvas.offsetWidth/2;
    const cy = canvas.offsetHeight/2;
    const dx = (e.clientX - cx)/cx;
    const dy = (e.clientY - cy)/cy;
    particles.forEach(p=>{
      p.x += dx*0.2;
      p.y += dy*0.2;
    });
  });
})();
