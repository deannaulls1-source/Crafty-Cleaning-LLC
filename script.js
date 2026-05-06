/* ============================================================
   Crafty Cleaning LLC — Script v2
============================================================ */

// ── Custom cursor ──
const cursorDot  = document.getElementById('cursorDot');
const cursorRing = document.getElementById('cursorRing');
let mouseX = -100, mouseY = -100;
let ringX  = -100, ringY  = -100;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursorDot.style.left = mouseX + 'px';
  cursorDot.style.top  = mouseY + 'px';
  spawnBubble(mouseX, mouseY);
});

// Ring lags behind for a smooth follow
function animateCursorRing() {
  ringX += (mouseX - ringX) * 0.12;
  ringY += (mouseY - ringY) * 0.12;
  cursorRing.style.left = ringX + 'px';
  cursorRing.style.top  = ringY + 'px';
  requestAnimationFrame(animateCursorRing);
}
animateCursorRing();

// Hover state on interactive elements
document.querySelectorAll('a, button, .service-card, .why-card, .pillar-item, .process-step').forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
});

// ── Bubble canvas cursor ──
const canvas = document.getElementById('bubbleCanvas');
const ctx    = canvas.getContext('2d');
canvas.width  = window.innerWidth;
canvas.height = window.innerHeight;
window.addEventListener('resize', () => {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
});

const bubbles = [];
let lastSpawn = 0;

function spawnBubble(x, y) {
  const now = Date.now();
  if (now - lastSpawn < 30) return; // throttle: 1 bubble per 30ms
  lastSpawn = now;

  const size    = 6 + Math.random() * 14;
  const offsetX = (Math.random() - 0.5) * 24;
  const offsetY = (Math.random() - 0.5) * 24;

  // Iridescent shimmer hue cycles
  const hue = (now / 20) % 360;

  bubbles.push({
    x: x + offsetX,
    y: y + offsetY,
    r: size / 2,
    life: 1,
    decay: 0.015 + Math.random() * 0.02,
    vy: -(0.4 + Math.random() * 0.8),
    vx: (Math.random() - 0.5) * 0.6,
    hue,
    shimmerOffset: Math.random() * 360,
  });
}

function drawBubbles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = bubbles.length - 1; i >= 0; i--) {
    const b = bubbles[i];
    b.x    += b.vx;
    b.y    += b.vy;
    b.life -= b.decay;

    if (b.life <= 0 || b.r <= 0) {
      bubbles.splice(i, 1);
      continue;
    }

    const alpha = b.life;
    ctx.save();

    // Outer bubble ring
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.strokeStyle = `hsla(${b.hue}, 80%, 80%, ${alpha * 0.7})`;
    ctx.lineWidth   = 1;
    ctx.stroke();

    // Inner iridescent fill
    const grad = ctx.createRadialGradient(
      b.x - b.r * 0.3, b.y - b.r * 0.3, 0,
      b.x, b.y, b.r
    );
    grad.addColorStop(0, `hsla(${b.hue + 60}, 100%, 95%, ${alpha * 0.45})`);
    grad.addColorStop(0.5, `hsla(${b.hue + 120}, 80%, 80%, ${alpha * 0.2})`);
    grad.addColorStop(1, `hsla(${b.hue + 240}, 70%, 70%, ${alpha * 0.05})`);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fill();

    // Specular highlight
    ctx.beginPath();
    ctx.arc(b.x - b.r * 0.35, b.y - b.r * 0.35, b.r * 0.25, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${alpha * 0.5})`;
    ctx.fill();

    ctx.restore();
  }

  requestAnimationFrame(drawBubbles);
}
drawBubbles();

// ── Navbar scroll ──
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
}, { passive: true });

// ── Mobile hamburger ──
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  const [s1, s2, s3] = hamburger.querySelectorAll('span');
  s1.style.transform = open ? 'rotate(45deg) translate(5px,5px)' : '';
  s2.style.opacity   = open ? '0' : '1';
  s3.style.transform = open ? 'rotate(-45deg) translate(5px,-5px)' : '';
});
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    hamburger.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
  });
});

// ── Scroll reveal ──
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('[data-reveal]').forEach(el => revealObserver.observe(el));

// ── Counter animation ──
const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.querySelectorAll('.trust-number[data-count]').forEach(el => {
      const target = parseInt(el.dataset.count);
      let current  = 0;
      const step   = target / 55;
      const timer  = setInterval(() => {
        current += step;
        if (current >= target) { el.textContent = target; clearInterval(timer); }
        else { el.textContent = Math.floor(current); }
      }, 16);
    });
    counterObserver.unobserve(entry.target);
  });
}, { threshold: 0.5 });

const heroTrust = document.querySelector('.hero-trust');
if (heroTrust) counterObserver.observe(heroTrust);

// ── Contact form → Text or Email ──
const form    = document.getElementById('contactForm');
const success = document.getElementById('formSuccess');

function getFormData() {
  return {
    firstName: (form.querySelector('#firstName').value || '').trim(),
    lastName:  (form.querySelector('#lastName').value  || '').trim(),
    email:     (form.querySelector('#email').value     || '').trim(),
    phone:     (form.querySelector('#phone').value     || '').trim(),
    service:   (form.querySelector('#service').value   || '').trim(),
    message:   (form.querySelector('#message').value   || '').trim(),
  };
}

function buildBody(d) {
  return `Hi Alyssa! I'd like to request a quote from Crafty Cleaning LLC.\n\n` +
    `Name: ${d.firstName} ${d.lastName}\n` +
    (d.email   ? `Email: ${d.email}\n`     : '') +
    (d.phone   ? `Phone: ${d.phone}\n`     : '') +
    (d.service ? `Service: ${d.service}\n` : '') +
    (d.message ? `\nDetails: ${d.message}` : '');
}

function showSuccess() {
  setTimeout(() => {
    form.style.display    = 'none';
    success.style.display = 'block';
  }, 600);
}

document.getElementById('sendViaSms').addEventListener('click', () => {
  const d = getFormData();
  window.location.href = `sms:+19044142494?body=${encodeURIComponent(buildBody(d))}`;
  showSuccess();
});

document.getElementById('sendViaEmail').addEventListener('click', () => {
  const d = getFormData();
  const subject = `Quote Request — ${d.firstName} ${d.lastName}`;
  window.location.href =
    `mailto:Craftycleaner.llc@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(buildBody(d))}`;
  showSuccess();
});

// ── Before/After reveal buttons ──
document.querySelectorAll('.ba-reveal-card').forEach(card => {
  const inner  = card.querySelector('.ba-card-inner');
  const btn    = card.querySelector('.ba-reveal-btn');
  const badge  = card.querySelector('.ba-state-badge');
  const before = card.querySelector('.ba-img-before');
  const after  = card.querySelector('.ba-img-after');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const showing = inner.dataset.showing;
    if (showing === 'before') {
      inner.dataset.showing = 'after';
      before.classList.remove('active');
      after.classList.add('active');
      badge.textContent   = 'AFTER';
      btn.innerHTML       = '← See Before';
    } else {
      inner.dataset.showing = 'before';
      after.classList.remove('active');
      before.classList.add('active');
      badge.textContent   = 'BEFORE';
      btn.innerHTML       = 'See After <span class="ba-btn-arrow">→</span>';
    }
  });
});

// ── Active nav on scroll ──
const sections = document.querySelectorAll('section[id]');
const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
      const active = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
      if (active) active.classList.add('active');
    }
  });
}, { threshold: 0.35 });
sections.forEach(s => sectionObserver.observe(s));
