/* =============================================
   AFROTHENTIC DJ — IMMERSIVE JS
   ============================================= */

/* ---- CUSTOM CURSOR ---- */
const cursor      = document.getElementById('cursor');
const cursorTrail = document.getElementById('cursorTrail');
let mouseX = 0, mouseY = 0;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursor.style.left = mouseX + 'px';
  cursor.style.top  = mouseY + 'px';
  // trail follows slightly behind
  setTimeout(() => {
    cursorTrail.style.left = mouseX + 'px';
    cursorTrail.style.top  = mouseY + 'px';
  }, 80);
});

// expand cursor on hover
document.querySelectorAll('a, button, .mix-row, .gig-item, .gallery-strip__item, .gallery-arrow, .lightbox__close').forEach(el => {
  el.addEventListener('mouseenter', () => cursor.classList.add('expanded'));
  el.addEventListener('mouseleave', () => cursor.classList.remove('expanded'));
});

/* ---- NAV SCROLL ---- */
const nav = document.getElementById('nav');
const scrollHint = document.getElementById('scrollHint');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 80);
  if (scrollHint) scrollHint.classList.toggle('hidden', window.scrollY > 200);
});

/* ---- BURGER / DRAWER ---- */
const burger = document.getElementById('burger');
const drawer = document.getElementById('drawer');
let drawerOpen = false;

function toggleDrawer() {
  drawerOpen = !drawerOpen;
  drawer.classList.toggle('open', drawerOpen);
  burger.classList.toggle('open', drawerOpen);
  document.body.style.overflow = drawerOpen ? 'hidden' : '';
}

burger.addEventListener('click', toggleDrawer);
document.querySelectorAll('.drawer__link').forEach(l => l.addEventListener('click', () => {
  if (drawerOpen) toggleDrawer();
}));
document.addEventListener('keydown', e => { if (e.key === 'Escape' && drawerOpen) toggleDrawer(); });

/* ---- HERO CANVAS — AMBIENT PARTICLE FIELD ---- */
(function heroCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx    = canvas.getContext('2d');
  let W, H, particles = [], animId;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function createParticles() {
    particles = [];
    const count = Math.floor((W * H) / 14000);
    for (let i = 0; i < count; i++) {
      particles.push({
        x:  Math.random() * W,
        y:  Math.random() * H,
        r:  Math.random() * 1.2 + 0.3,
        dx: (Math.random() - 0.5) * 0.25,
        dy: (Math.random() - 0.5) * 0.25,
        o:  Math.random() * 0.4 + 0.1
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    // Deep radial glow — amber warmth bottom-right
    const grad = ctx.createRadialGradient(W * 0.75, H * 0.6, 0, W * 0.75, H * 0.6, W * 0.7);
    grad.addColorStop(0,   'rgba(232,133,10,0.07)');
    grad.addColorStop(0.5, 'rgba(140,60,0,0.04)');
    grad.addColorStop(1,   'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Particles
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(232,133,10,${p.o})`;
      ctx.fill();
      p.x += p.dx;
      p.y += p.dy;
      if (p.x < 0 || p.x > W) p.dx *= -1;
      if (p.y < 0 || p.y > H) p.dy *= -1;
    });

    // Subtle grid lines (low opacity)
    ctx.strokeStyle = 'rgba(255,255,255,0.015)';
    ctx.lineWidth = 1;
    const spacing = 80;
    for (let x = 0; x < W; x += spacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = 0; y < H; y += spacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    animId = requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => { resize(); createParticles(); });
  resize();
  createParticles();
  draw();
})();

/* ---- SPLIT TEXT ANIMATION (used in non-hero sections) ---- */
function splitAndAnimate() {
  const els = document.querySelectorAll('.split-text');
  els.forEach(el => {
    const delay = parseInt(el.dataset.delay || 0);
    if (el.querySelector('span')) {
      el.querySelectorAll('span').forEach((span, si) => {
        const inner = span.textContent;
        span.innerHTML = [...inner].map((ch, i) =>
          ch === ' ' ? ' ' : `<span class="char" style="transition-delay:${delay + si*100 + i*35}ms">${ch}</span>`
        ).join('');
      });
    } else {
      el.innerHTML = [...el.textContent].map((ch, i) =>
        ch === ' ' ? ' ' : `<span class="char" style="transition-delay:${delay + i*40}ms">${ch}</span>`
      ).join('');
    }
    setTimeout(() => el.classList.add('animated'), 100);
  });
}
// Only run split-text on about/mixes headings, not hero (hero uses CSS keyframe animations)
document.querySelectorAll('.about .split-text, .mixes .split-text').forEach(el => {
  const delay = parseInt(el.dataset.delay || 0);
  el.innerHTML = [...el.textContent].map((ch, i) =>
    ch === ' ' ? ' ' : `<span class="char" style="transition-delay:${delay + i*40}ms">${ch}</span>`
  ).join('');
  setTimeout(() => el.classList.add('animated'), 100);
});

/* ---- INTERSECTION OBSERVER: reveal ---- */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ---- GIG ITEMS staggered reveal ---- */
const gigObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const idx = parseInt(e.target.dataset.index || 0);
      setTimeout(() => e.target.classList.add('visible'), idx * 80);
      gigObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.05 });

document.querySelectorAll('.gig-item').forEach(el => gigObserver.observe(el));

/* ---- COUNTER ANIMATION ---- */
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const el     = e.target;
      const target = parseInt(el.dataset.target);
      const duration = 1800;
      const start  = performance.now();
      function tick(now) {
        const t = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - t, 4);
        el.textContent = Math.round(ease * target);
        if (t < 1) requestAnimationFrame(tick);
        else el.textContent = target;
      }
      requestAnimationFrame(tick);
      counterObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.counter').forEach(el => counterObserver.observe(el));

/* ---- GIGS TABS ---- */
document.querySelectorAll('.gigs__tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.gigs__tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.gigs__panel').forEach(p => p.classList.add('gigs__panel--hidden'));
    tab.classList.add('active');
    const panel = document.getElementById(`tab-${tab.dataset.tab}`);
    if (panel) panel.classList.remove('gigs__panel--hidden');
  });
});

/* ---- MAGNETIC BUTTONS ---- */
document.querySelectorAll('.magnetic').forEach(el => {
  el.addEventListener('mousemove', e => {
    const rect = el.getBoundingClientRect();
    const cx   = rect.left + rect.width  / 2;
    const cy   = rect.top  + rect.height / 2;
    const dx   = (e.clientX - cx) * 0.35;
    const dy   = (e.clientY - cy) * 0.35;
    el.style.transform = `translate(${dx}px, ${dy}px)`;
  });
  el.addEventListener('mouseleave', () => {
    el.style.transform = '';
  });
});

/* ---- 3D TILT CARDS ---- */
document.querySelectorAll('.tilt-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const cx   = rect.left + rect.width  / 2;
    const cy   = rect.top  + rect.height / 2;
    const rx   = ((e.clientY - cy) / (rect.height / 2)) * -8;
    const ry   = ((e.clientX - cx) / (rect.width  / 2)) *  8;
    card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.02,1.02,1.02)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

/* ---- DRAGGABLE GALLERY STRIP ---- */
(function dragGallery() {
  const strip = document.getElementById('galleryStrip');
  if (!strip) return;

  let isDown = false, startX = 0, scrollLeft = 0, didDrag = false;

  strip.addEventListener('mousedown', e => {
    isDown   = true;
    didDrag  = false;
    startX   = e.pageX - strip.offsetLeft;
    scrollLeft = strip.scrollLeft;
  });
  strip.addEventListener('mouseleave', () => { isDown = false; });
  strip.addEventListener('mouseup',    () => { isDown = false; });
  strip.addEventListener('mousemove', e => {
    if (!isDown) return;
    e.preventDefault();
    const x    = e.pageX - strip.offsetLeft;
    const walk = (x - startX) * 1.6;
    if (Math.abs(walk) > 4) didDrag = true;
    strip.scrollLeft = scrollLeft - walk;
  });

  let touchStartX = 0, touchScrollLeft = 0;
  strip.addEventListener('touchstart', e => {
    touchStartX    = e.touches[0].pageX;
    touchScrollLeft = strip.scrollLeft;
  }, { passive: true });
  strip.addEventListener('touchmove', e => {
    const dx = touchStartX - e.touches[0].pageX;
    strip.scrollLeft = touchScrollLeft + dx;
  }, { passive: true });

  // Expose drag state so lightbox click handler can check it
  strip._didDrag = () => didDrag;
})();

/* ---- GALLERY ARROWS ---- */
(function galleryArrows() {
  const strip   = document.getElementById('galleryStrip');
  const prevBtn = document.getElementById('galleryPrev');
  const nextBtn = document.getElementById('galleryNext');
  if (!strip || !prevBtn || !nextBtn) return;
  const STEP = 220;
  prevBtn.addEventListener('click', () => strip.scrollBy({ left: -STEP, behavior: 'smooth' }));
  nextBtn.addEventListener('click', () => strip.scrollBy({ left:  STEP, behavior: 'smooth' }));
})();

/* ---- GALLERY LIGHTBOX ---- */
(function galleryLightbox() {
  const lightbox        = document.getElementById('lightbox');
  const lightboxImg     = document.getElementById('lightboxImg');
  const lightboxClose   = document.getElementById('lightboxClose');
  const lightboxOverlay = document.getElementById('lightboxOverlay');
  const strip           = document.getElementById('galleryStrip');
  if (!lightbox || !lightboxImg) return;

  function open(src) {
    lightboxImg.src = src;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => { lightboxImg.src = ''; }, 350);
  }

  document.querySelectorAll('.gallery-strip__item').forEach(item => {
    item.addEventListener('click', () => {
      if (strip && strip._didDrag && strip._didDrag()) return;
      const src = item.dataset.src;
      if (src) open(src);
    });
  });

  if (lightboxClose)   lightboxClose.addEventListener('click', close);
  if (lightboxOverlay) lightboxOverlay.addEventListener('click', close);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && lightbox.classList.contains('open')) close();
  });
})();

/* ---- HERO PARALLAX ---- */
const heroPhoto = document.getElementById('heroPhoto');
window.addEventListener('scroll', () => {
  if (!heroPhoto) return;
  const y = window.scrollY;
  heroPhoto.style.transform = `translateY(${y * 0.25}px)`;
}, { passive: true });

/* ---- PROMOTER KIT TABS ---- */
(function pkTabs() {
  document.querySelectorAll('.pk-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.pk-tab').forEach(t => t.classList.remove('pk-tab--active'));
      document.querySelectorAll('.pk-panel').forEach(p => p.classList.remove('pk-panel--active'));
      tab.classList.add('pk-tab--active');
      const panel = document.getElementById('pk-' + tab.dataset.pkTab);
      if (panel) panel.classList.add('pk-panel--active');
    });
  });
})();

/* ---- PROMOTER GATE ---- */
(function promoterGate() {
  // ← Change this to your private access code and share only with promoters
  const ACCESS_CODE = 'AFROTHENTIC';

  const gate      = document.getElementById('pkGate');
  const input     = document.getElementById('pkInput');
  const unlockBtn = document.getElementById('pkUnlock');
  const errorEl   = document.getElementById('pkError');
  const downloads = document.getElementById('pkDownloads');
  const lockBtn   = document.getElementById('pkLock');
  if (!gate || !input || !unlockBtn) return;

  function tryUnlock() {
    if (input.value.trim().toUpperCase() === ACCESS_CODE) {
      gate.classList.add('pk-gate--unlocked');
      errorEl.textContent = '';
      setTimeout(() => {
        gate.hidden      = true;
        downloads.hidden = false;
      }, 350);
    } else {
      input.classList.remove('pk-gate__input--error');
      void input.offsetWidth; // retrigger animation
      input.classList.add('pk-gate__input--error');
      errorEl.textContent = 'Incorrect code. Contact DJ Afrothentic to request access.';
      input.value = '';
      input.focus();
    }
  }

  function relock() {
    downloads.hidden = true;
    gate.hidden      = false;
    gate.classList.remove('pk-gate--unlocked');
    input.value      = '';
    errorEl.textContent = '';
  }

  unlockBtn.addEventListener('click', tryUnlock);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') tryUnlock(); });
  if (lockBtn) lockBtn.addEventListener('click', relock);
})();

/* ---- ACTIVE NAV HIGHLIGHT ---- */
const sections  = document.querySelectorAll('section[id]');
const navLinks2 = document.querySelectorAll('.nav__link');
const sObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      navLinks2.forEach(l => l.style.color = '');
      const match = document.querySelector(`.nav__link[href="#${e.target.id}"]`);
      if (match) match.style.color = 'var(--white)';
    }
  });
}, { threshold: 0.45 });
sections.forEach(s => sObs.observe(s));

/* ---- PREVENT RIGHT-CLICK ON IMAGES ---- */
document.querySelectorAll('img').forEach(img => img.addEventListener('contextmenu', e => e.preventDefault()));