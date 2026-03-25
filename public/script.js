/* ═══════════════════════════════════════════════════════
   ROHIT — Portfolio Script
   Canvas Animation | Smooth Scroll | Contact Form
   ═══════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ─── Custom Cursor ─────────────────────────────────────
  const cursorDot = document.getElementById('cursorDot');
  const cursorRing = document.getElementById('cursorRing');
  let mouseX = 0, mouseY = 0;
  let ringX = 0, ringY = 0;

  if (window.matchMedia('(pointer: fine)').matches) {
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.left = mouseX + 'px';
      cursorDot.style.top = mouseY + 'px';
    });

    function animateCursorRing() {
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      cursorRing.style.left = ringX + 'px';
      cursorRing.style.top = ringY + 'px';
      requestAnimationFrame(animateCursorRing);
    }
    animateCursorRing();

    // Hover effect on interactive elements
    const interactiveEls = document.querySelectorAll('a, button, input, textarea, .project-card, .skill-category, .stat-card');
    interactiveEls.forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursorDot.classList.add('hover');
        cursorRing.classList.add('hover');
      });
      el.addEventListener('mouseleave', () => {
        cursorDot.classList.remove('hover');
        cursorRing.classList.remove('hover');
      });
    });
  } else {
    // Hide cursor elements on touch devices
    if (cursorDot) cursorDot.style.display = 'none';
    if (cursorRing) cursorRing.style.display = 'none';
  }

  // ─── Canvas Animation (Particle Network) ──────────────
  const canvas = document.getElementById('heroCanvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let animFrameId;
  const PARTICLE_COUNT = 80;
  const CONNECTION_DISTANCE = 150;
  const PARTICLE_SIZE = 2;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.6;
      this.vy = (Math.random() - 0.5) * 0.6;
      this.radius = Math.random() * PARTICLE_SIZE + 0.5;
      this.opacity = Math.random() * 0.4 + 0.1;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
      if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(108, 99, 255, ${this.opacity})`;
      ctx.fill();
    }
  }

  function initParticles() {
    particles = [];
    const count = window.innerWidth < 768 ? PARTICLE_COUNT / 2 : PARTICLE_COUNT;
    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }
  }

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONNECTION_DISTANCE) {
          const opacity = (1 - dist / CONNECTION_DISTANCE) * 0.12;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(108, 99, 255, ${opacity})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function animateCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    drawConnections();
    animFrameId = requestAnimationFrame(animateCanvas);
  }

  // Mouse interaction with particles
  let canvasMouseX = 0, canvasMouseY = 0;
  canvas.addEventListener('mousemove', (e) => {
    canvasMouseX = e.clientX;
    canvasMouseY = e.clientY;

    particles.forEach(p => {
      const dx = p.x - canvasMouseX;
      const dy = p.y - canvasMouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        const force = (120 - dist) / 120 * 0.5;
        p.vx += (dx / dist) * force;
        p.vy += (dy / dist) * force;
        // Dampen velocity
        p.vx *= 0.98;
        p.vy *= 0.98;
      }
    });
  });

  // Initialize canvas
  resizeCanvas();
  initParticles();
  animateCanvas();

  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      resizeCanvas();
      initParticles();
    }, 200);
  });

  // ─── Frame Sequence Animation (if frames exist) ───────
  const FRAME_COUNT = 120;
  const FRAME_PATH = 'assets/frames/frame_';
  let frames = [];
  let framesLoaded = 0;
  let frameSequenceReady = false;

  function preloadFrames() {
    for (let i = 1; i <= FRAME_COUNT; i++) {
      const img = new Image();
      const num = String(i).padStart(4, '0');
      img.src = `${FRAME_PATH}${num}.png`;
      img.onload = () => {
        framesLoaded++;
        if (framesLoaded === FRAME_COUNT) {
          frameSequenceReady = true;
          // If frames are available, switch to frame-based animation
          cancelAnimationFrame(animFrameId);
          renderFrameSequence();
        }
      };
      img.onerror = () => {
        // Frame not found — stick with particle animation (graceful fallback)
      };
      frames.push(img);
    }
  }

  function renderFrameSequence() {
    let scrollFraction = window.scrollY / (document.body.scrollHeight - window.innerHeight);
    scrollFraction = Math.max(0, Math.min(scrollFraction, 1));
    const frameIndex = Math.min(FRAME_COUNT - 1, Math.floor(scrollFraction * FRAME_COUNT));

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const img = frames[frameIndex];
    if (img && img.complete) {
      // Draw frame centered and cover
      const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      const x = (canvas.width - w) / 2;
      const y = (canvas.height - h) / 2;
      ctx.drawImage(img, x, y, w, h);
    }

    requestAnimationFrame(renderFrameSequence);
  }

  // Attempt to preload frames (silently falls back to particles if not found)
  preloadFrames();

  // ─── Navbar ────────────────────────────────────────────
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');

  // Scroll effect
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Mobile menu toggle
  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
  });

  // Close mobile menu on link click
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('active');
      navMenu.classList.remove('active');
    });
  });

  // Active section highlighting
  const sections = document.querySelectorAll('.section');

  function updateActiveLink() {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.dataset.section === current) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', updateActiveLink);

  // ─── Scroll Reveal Animations ──────────────────────────
  const revealElements = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -60px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // ─── Counter Animation ─────────────────────────────────
  const statNumbers = document.querySelectorAll('.stat-number[data-count]');

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10);
        animateCounter(el, target);
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  statNumbers.forEach(el => counterObserver.observe(el));

  function animateCounter(el, target) {
    let current = 0;
    const duration = 2000;
    const step = target / (duration / 16);

    function tick() {
      current += step;
      if (current >= target) {
        el.textContent = target;
        return;
      }
      el.textContent = Math.floor(current);
      requestAnimationFrame(tick);
    }
    tick();
  }

  // ─── Contact Form ──────────────────────────────────────
  const contactForm = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');
  const submitBtn = document.getElementById('submitBtn');

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();

    // Client-side validation
    if (!name || !email || !message) {
      showStatus('Please fill in all fields.', 'error');
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      showStatus('Please enter a valid email address.', 'error');
      return;
    }

    // Disable button during submission
    submitBtn.disabled = true;
    submitBtn.querySelector('span').textContent = 'Sending...';

    try {
      const response = await fetch('/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message })
      });

      const data = await response.json();

      if (data.success) {
        showStatus(data.message, 'success');
        contactForm.reset();
      } else {
        showStatus(data.error || 'Something went wrong.', 'error');
      }
    } catch (err) {
      showStatus('Network error. Please try again later.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.querySelector('span').textContent = 'Send Message';
    }
  });

  function showStatus(msg, type) {
    formStatus.textContent = msg;
    formStatus.className = 'form-status ' + type;

    setTimeout(() => {
      formStatus.textContent = '';
      formStatus.className = 'form-status';
    }, 5000);
  }

  // ─── Smooth Scroll for Anchor Links ────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        const offsetTop = target.offsetTop - 80;
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
      }
    });
  });

})();
