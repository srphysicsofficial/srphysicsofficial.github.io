/* ============================================
   LOADER SEQUENCE
============================================ */
(function initLoader(){
  const statusEl = document.getElementById('loaderStatus');
  const fillEl = document.getElementById('loaderBarFill');
  const percentEl = document.getElementById('loaderPercent');
  const loaderEl = document.getElementById('loader');
  const particlesWrap = document.getElementById('loaderParticles');
  const logoFillEl = document.getElementById('logoMaskFill');
  const logoWrapEl = document.getElementById('loaderLogoFill');

  // spawn floating particles
  for(let i=0;i<26;i++){
    const p = document.createElement('span');
    p.style.left = Math.random()*100 + '%';
    p.style.bottom = (Math.random()*20) + 'px';
    p.style.animationDuration = (3 + Math.random()*4) + 's';
    p.style.animationDelay = (Math.random()*4) + 's';
    particlesWrap.appendChild(p);
  }

  const messages = [
    { at: 0, text: 'Initializing...' },
    { at: 20, text: 'Loading Assets' },
    { at: 50, text: 'Loading 3D Scene' },
    { at: 80, text: 'Almost There' },
    { at: 100, text: 'Website Opens' }
  ];

  let progress = 0;
  let msgIndex = 0;
  const duration = 2200; // ms
  const start = performance.now();

  function tick(now){
    const elapsed = now - start;
    progress = Math.min(100, Math.round((elapsed/duration)*100));

    if(msgIndex < messages.length-1 && progress >= messages[msgIndex+1].at){
      msgIndex++;
      statusEl.textContent = messages[msgIndex].text;
    }
    fillEl.style.width = progress + '%';
    percentEl.textContent = progress + '%';
    if(logoFillEl){ logoFillEl.style.clipPath = 'inset(' + (100 - progress) + '% 0 0 0)'; }

    if(progress < 100){
      requestAnimationFrame(tick);
    } else {
      if(logoWrapEl){ logoWrapEl.classList.add('done'); }
      setTimeout(()=>{
        loaderEl.classList.add('hide');
        document.body.style.overflow = '';
        revealHero();
        
        // Refresh ScrollTrigger after loader finishes
        setTimeout(() => {
          if(typeof buildEduScroll === 'function') buildEduScroll();
          if(window.ScrollTrigger) ScrollTrigger.refresh();
        }, 400);

        setTimeout(()=> loaderEl.remove(), 900);
      }, 250);
    }
  }
  document.body.style.overflow = 'hidden';
  requestAnimationFrame(tick);
})();

function revealHero(){
  if(window.gsap){
    gsap.fromTo('.hero-badges, .hero-eyebrow, .hero-title, .hero-roles, .hero-tagline, .hero-cta',
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.9, stagger: 0.08, ease: 'power3.out' }
    );
    gsap.fromTo('.portrait-wrap, .float-badge', { scale: 0.85, opacity: 0 }, { scale: 1, opacity: 1, duration: 1, stagger: 0.05, ease: 'back.out(1.6)', delay: 0.2 });
  }
}

/* ============================================
   LENIS SMOOTH SCROLL
============================================ */
let lenis;
try{
  lenis = new Lenis({ duration: 1.1, easing: (t)=> 1 - Math.pow(1-t, 3), smoothWheel: true });
  function raf(time){ lenis.raf(time); requestAnimationFrame(raf); }
  requestAnimationFrame(raf);
  if(window.ScrollTrigger){
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time)=>{ lenis.raf(time*1000); });
    gsap.ticker.lagSmoothing(0);
  }
}catch(e){ console.warn('Lenis unavailable, falling back to native scroll.'); }

/* anchor links -> lenis scrollTo */
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click', (e)=>{
    const id = a.getAttribute('href');
    if(id.length > 1){
      const target = document.querySelector(id);
      if(target){
        e.preventDefault();
        if(lenis){ lenis.scrollTo(target, { offset: -80 }); }
        else { target.scrollIntoView({behavior:'smooth'}); }
        document.getElementById('navLinks').classList.remove('open');
      }
    }
  });
});

/* ============================================
   GSAP REGISTER + SCROLL REVEALS
============================================ */
if(window.gsap && window.ScrollTrigger){
  gsap.registerPlugin(ScrollTrigger);

  gsap.utils.toArray('[data-reveal]').forEach((el)=>{
    gsap.fromTo(el, { y: 46, opacity: 0 }, {
      y: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%' }
    });
  });

  /* stat counters */
  gsap.utils.toArray('.stat-num[data-count]').forEach((el)=>{
    const target = parseInt(el.getAttribute('data-count'), 10);
    const obj = { val: 0 };
    ScrollTrigger.create({
      trigger: el, start: 'top 90%', once: true,
      onEnter: ()=>{
        gsap.to(obj, {
          val: target, duration: 1.6, ease:'power2.out',
          onUpdate: ()=>{ el.textContent = Math.round(obj.val); }
        });
      }
    });
  });

  /* Nav background on scroll */
  ScrollTrigger.create({
    start: 'top -60',
    end: 99999,
    toggleClass: { targets: '.nav', className: 'scrolled' }
  });

  /* section active-link tracking */
  const sections = ['home','about','education','skills','projects','blog','contact'];
  sections.forEach(id=>{
    const sec = document.getElementById(id);
    if(!sec) return;
    ScrollTrigger.create({
      trigger: sec, start: 'top 50%', end: 'bottom 50%',
      onEnter: ()=> setActiveLink(id),
      onEnterBack: ()=> setActiveLink(id)
    });
  });
  function setActiveLink(id){
    document.querySelectorAll('.nav-link').forEach(l=>{
      l.classList.toggle('active', l.getAttribute('href') === '#'+id);
    });
  }

 /* ---- Result horizontal scroll ---- */
const resultTrack = document.getElementById('resultTrack');
function buildResultScroll(){
  if(!resultTrack) return;
  ScrollTrigger.getAll().filter(t=>t.vars.id==='resultPin').forEach(t=>t.kill());
  const scrollLength = resultTrack.scrollWidth - window.innerWidth + 120;
  if(scrollLength > 0){
    gsap.to(resultTrack, {
      x: -scrollLength,
      ease: 'none',
      scrollTrigger: {
        id: 'resultPin',
        trigger: '#results',
        start: 'top top',
        end: '+=' + (scrollLength + window.innerHeight*0.5),
        scrub: 0.6,
        pin: true,
        invalidateOnRefresh: true
      }
    });
  }
}

buildResultScroll();
window.addEventListener('resize', ()=>{ 
  clearTimeout(window._resultResize); 
  window._resultResize = setTimeout(buildResultScroll, 300); 
});
  /* ---- Stacked case-study cards ---- */
  const stackCards = gsap.utils.toArray('.stack-card');
  stackCards.forEach((card, i)=>{
    if(i === stackCards.length - 1) return;
    const nextSlot = card.closest('.stack-slot').nextElementSibling;
    gsap.to(card, {
      scale: 0.92, opacity: 0.55, filter: 'blur(2px)',
      ease: 'none',
      scrollTrigger: {
        trigger: nextSlot,
        start: 'top bottom',
        end: 'top top',
        scrub: true
      }
    });
  });

  /* ---- Section huge-bg-text parallax on education ---- */
  gsap.to('.edu-bg-text', {
    x: -80, ease:'none',
    scrollTrigger: { trigger: '.education', start:'top bottom', end:'bottom top', scrub: true }
  });
}

/* ============================================
   NAV TOGGLE (mobile)
============================================ */
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
navToggle.addEventListener('click', ()=> navLinks.classList.toggle('open'));

/* ============================================
   SCROLL PROGRESS BAR
============================================ */
const progressBar = document.getElementById('scrollProgress');
const backToTop = document.getElementById('backToTop');
function updateProgress(){
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docHeight > 0 ? (scrollTop/docHeight)*100 : 0;
  progressBar.style.width = pct + '%';
  backToTop.classList.toggle('show', scrollTop > 600);
}
window.addEventListener('scroll', updateProgress, { passive:true });
updateProgress();
backToTop.addEventListener('click', ()=>{
  if(lenis){ lenis.scrollTo(0); } else { window.scrollTo({top:0, behavior:'smooth'}); }
});

/* ============================================
   CUSTOM CURSOR
============================================ */
const cursorGlow = document.getElementById('cursorGlow');
const cursorRing = document.getElementById('cursorRing');
const cursorDot  = document.getElementById('cursorDot');

let mouseX = window.innerWidth/2, mouseY = window.innerHeight/2;
let ringX = mouseX, ringY = mouseY;
let glowX = mouseX, glowY = mouseY;

window.addEventListener('mousemove', (e)=>{
  mouseX = e.clientX; mouseY = e.clientY;
  if(cursorDot){
    cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
  }
});

function animateCursor(){
  ringX += (mouseX - ringX) * 0.28;
  ringY += (mouseY - ringY) * 0.28;
  if(cursorRing){
    cursorRing.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
  }

  glowX += (mouseX - glowX) * 0.12;
  glowY += (mouseY - glowY) * 0.12;
  if(cursorGlow){
    cursorGlow.style.transform = `translate(${glowX}px, ${glowY}px) translate(-50%, -50%)`;
  }

  requestAnimationFrame(animateCursor);
}
requestAnimationFrame(animateCursor);

const cursorHoverTargets = 'a, button, input, textarea, .btn, .filter-btn, .social-glass, .tool-icon, .nav-link, .project-card, .partner-card, .cred-card, .float-badge';
document.querySelectorAll(cursorHoverTargets).forEach(el=>{
  el.addEventListener('mouseenter', ()=> cursorRing && cursorRing.classList.add('hover'));
  el.addEventListener('mouseleave', ()=> cursorRing && cursorRing.classList.remove('hover'));
});

/* ============================================
   HERO PARALLAX
============================================ */
const heroRight = document.getElementById('heroRight');
const portraitWrap = document.getElementById('portraitWrap');
if(heroRight){
  heroRight.addEventListener('mousemove', (e)=>{
    const rect = heroRight.getBoundingClientRect();
    const relX = (e.clientX - rect.left - rect.width/2) / (rect.width/2);
    const relY = (e.clientY - rect.top - rect.height/2) / (rect.height/2);
    if(portraitWrap){
      portraitWrap.style.transform = `rotateY(${relX*5}deg) rotateX(${-relY*5}deg)`;
    }
    document.querySelectorAll('.float-badge').forEach(badge=>{
      const depth = parseFloat(badge.getAttribute('data-depth')) || 0.5;
      badge.style.transform = `translate(${relX*0*depth}px, ${relY*0*depth}px)`;
    });
  });
  heroRight.addEventListener('mouseleave', ()=>{
    if(portraitWrap) portraitWrap.style.transform = '';
    document.querySelectorAll('.float-badge').forEach(b=> b.style.transform = '');
  });
}
if(portraitWrap){ portraitWrap.style.transformStyle = 'preserve-3d'; }

/* ============================================
   ABOUT PORTRAIT AUTO-SLIDER
============================================ */
(function portraitSlider(){
  const wrap = document.getElementById('portraitSlider');
  if(!wrap) return;
  const slides = Array.from(wrap.querySelectorAll('.slide'));
  const dots = Array.from(wrap.querySelectorAll('.dot'));
  if(slides.length < 2) return;

  let idx = 0;
  let timer = null;
  const interval = 3500;

  function goTo(next){
    if(next === idx) return;
    slides[idx].classList.remove('active');
    dots[idx] && dots[idx].classList.remove('active');
    idx = next;
    slides[idx].classList.add('active');
    dots[idx] && dots[idx].classList.add('active');
  }

  function next(){ goTo((idx + 1) % slides.length); }

  function start(){
    stop();
    timer = setInterval(next, interval);
  }
  function stop(){
    if(timer){ clearInterval(timer); timer = null; }
  }

  dots.forEach((dot)=>{
    dot.addEventListener('click', ()=>{
      const i = parseInt(dot.getAttribute('data-slide'), 10);
      goTo(i);
      start();
    });
  });

  wrap.addEventListener('mouseenter', stop);
  wrap.addEventListener('mouseleave', start);

  start();
})();

/* ============================================
   HERO ROLE ROTATOR
============================================ */
const roles = ['Electrical and electronic engineer', 'Expierienced physics lecture', 'The leader in delivering Results','Sinhala & English Medium Class'];
const roleEl = document.querySelector('.role-text');
let roleIdx = 0;
function cycleRole(){
  if(!roleEl || !window.gsap){ return; }
  gsap.to(roleEl, {
    y: -20, opacity: 0, duration: 0.4, ease:'power2.in',
    onComplete: ()=>{
      roleIdx = (roleIdx+1) % roles.length;
      roleEl.textContent = roles[roleIdx];
      gsap.fromTo(roleEl, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease:'power2.out' });
    }
  });
}
setInterval(cycleRole, 2600);

/* ============================================
   HERO CANVAS PARTICLES
============================================ */
(function heroParticles(){
  const canvas = document.getElementById('heroCanvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, particles;

  function resize(){
    w = canvas.width = canvas.offsetWidth;
    h = canvas.height = canvas.offsetHeight;
  }
  function makeParticles(){
    const count = Math.min(70, Math.floor(w*h/18000));
    particles = Array.from({length: count}, ()=>({
      x: Math.random()*w, y: Math.random()*h,
      r: Math.random()*1.6 + 0.4,
      vx: (Math.random()-0.5)*0.25,
      vy: (Math.random()-0.5)*0.25,
      hue: Math.random() > 0.5 ? '184,134,11' : '156,107,18'
    }));
  }
  function draw(){
    ctx.clearRect(0,0,w,h);
    particles.forEach(p=>{
      p.x += p.vx; p.y += p.vy;
      if(p.x < 0) p.x = w; if(p.x > w) p.x = 0;
      if(p.y < 0) p.y = h; if(p.y > h) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fillStyle = `rgba(${p.hue},0.6)`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  resize(); makeParticles(); draw();
  window.addEventListener('resize', ()=>{ resize(); makeParticles(); });
})();

/* ============================================
   CONTACT PARTICLES
============================================ */
(function contactParticles(){
  const wrap = document.getElementById('contactParticles');
  if(!wrap) return;
  for(let i=0;i<24;i++){
    const dot = document.createElement('span');
    dot.style.position='absolute';
    dot.style.width = dot.style.height = (Math.random()*3+1)+'px';
    dot.style.borderRadius='50%';
    dot.style.left = Math.random()*100+'%';
    dot.style.top = Math.random()*100+'%';
    dot.style.background = Math.random()>0.5 ? 'rgba(184,134,11,0.55)' : 'rgba(156,107,18,0.45)';
    dot.style.animation = `floatUp ${4+Math.random()*5}s linear infinite`;
    dot.style.animationDelay = (Math.random()*5)+'s';
    wrap.appendChild(dot);
  }
})();

/* ============================================
   PROJECT FILTER
============================================ */
const filterRow = document.getElementById('filterRow');
if(filterRow){
  filterRow.addEventListener('click', (e)=>{
    const btn = e.target.closest('.filter-btn');
    if(!btn) return;
    filterRow.querySelectorAll('.filter-btn').forEach(b=> b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.getAttribute('data-filter');
    document.querySelectorAll('#projectGrid .project-card').forEach(card=>{
      const match = filter === 'all' || card.getAttribute('data-cat') === filter;
      card.classList.toggle('hidden-card', !match);
      if(window.gsap && match){ gsap.fromTo(card, {opacity:0, y:14}, {opacity:1, y:0, duration:0.5}); }
    });
  });
}

/* ============================================
   BLOG FILTER
============================================ */
const blogFilterRow = document.querySelector('.blog-filter-row');
if(blogFilterRow){
  blogFilterRow.addEventListener('click', (e)=>{
    const btn = e.target.closest('.filter-btn');
    if(!btn) return;
    blogFilterRow.querySelectorAll('.filter-btn').forEach(b=> b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.getAttribute('data-bfilter');
    document.querySelectorAll('.blog-card, .blog-featured').forEach(card=>{
      const match = filter === 'all' || card.getAttribute('data-bcat') === filter;
      card.classList.toggle('hidden-card', !match);
    });
  });
}

/* ============================================
   GALLERY SLIDESHOW
============================================ */
(function gallerySlideshow(){
  const root = document.getElementById('gallerySlideshow');
  if(!root) return;

  const track = document.getElementById('galleryTrack');
  const slides = Array.from(track.querySelectorAll('.gallery-slide'));
  const prevBtn = document.getElementById('galleryPrev');
  const nextBtn = document.getElementById('galleryNext');
  const counter = document.getElementById('galleryCounter');
  const progressFill = document.getElementById('galleryProgressFill');
  const playToggle = document.getElementById('galleryPlayToggle');
  if(!slides.length) return;

  let idx = slides.findIndex(s => s.classList.contains('active'));
  if(idx < 0) idx = 0;
  let timer = null;
  let playing = true;
  const interval = 4200;

  function pad(n){ return String(n + 1).padStart(2, '0'); }

  function updateCounter(){
    if(counter) counter.textContent = `${pad(idx)} / ${pad(slides.length - 1)}`;
  }

  function restartProgress(){
    if(!progressFill) return;
    progressFill.classList.remove('animating');
    void progressFill.offsetWidth; // force reflow to restart animation
    if(playing) progressFill.classList.add('animating');
  }

  function goTo(next){
    slides[idx].classList.remove('active');
    idx = (next + slides.length) % slides.length;
    slides[idx].classList.add('active');
    updateCounter();
    restartProgress();
  }

  function next(){ goTo(idx + 1); }
  function prev(){ goTo(idx - 1); }

  function start(){
    stop();
    timer = setInterval(next, interval);
    playing = true;
    if(playToggle) playToggle.textContent = '⏸';
    restartProgress();
  }

  function stop(){
    if(timer){ clearInterval(timer); timer = null; }
    playing = false;
    if(playToggle) playToggle.textContent = '▶';
    if(progressFill) progressFill.classList.remove('animating');
  }

  if(nextBtn) nextBtn.addEventListener('click', ()=>{ next(); if(playing) start(); });
  if(prevBtn) prevBtn.addEventListener('click', ()=>{ prev(); if(playing) start(); });
  if(playToggle) playToggle.addEventListener('click', ()=>{ playing ? stop() : start(); });

  root.addEventListener('mouseenter', ()=>{ if(playing && timer) clearInterval(timer); });
  root.addEventListener('mouseleave', ()=>{ if(playing) timer = setInterval(next, interval); });

  updateCounter();
  start();
})();

/* ============================================
   CONTACT FORM
============================================ */
const contactForm = document.getElementById('contactForm');
if(contactForm){
  contactForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    const btn = document.getElementById('submitBtn');
    const note = document.getElementById('formNote');
    const original = btn.textContent;
    btn.textContent = 'Casting...';
    setTimeout(()=>{
      btn.textContent = 'Spell Cast ✔';
      note.textContent = "Thanks — I'll get back to you soon.";
      contactForm.reset();
      setTimeout(()=> btn.textContent = original, 2400);
    }, 900);
  });
}