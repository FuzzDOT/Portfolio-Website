// ========================================================
// APPLE-STYLE SCROLL ANIMATION ENGINE
// ========================================================

(function () {
  'use strict';

  // ── Utility ────────────────────────────────────────────
  const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  const easeInOut = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  // ── Scroll progress helper ─────────────────────────────
  function getProgress(el, start = 0, end = 1) {
    const rect = el.getBoundingClientRect();
    const wh = window.innerHeight;
    const total = rect.height + wh;
    const passed = wh - rect.top;
    const raw = passed / total;
    return clamp((raw - start) / (end - start), 0, 1);
  }

  // ── Sticky scroll container ────────────────────────────
  class StickyScroller {
    constructor(wrapper, onProgress) {
      this.wrapper = wrapper;
      this.onProgress = onProgress;
      this.ticking = false;
      this._tick = this._tick.bind(this);
    }
    mount() {
      window.addEventListener('scroll', () => {
        if (!this.ticking) {
          requestAnimationFrame(this._tick);
          this.ticking = true;
        }
      }, { passive: true });
      this._tick();
    }
    _tick() {
      this.ticking = false;
      const rect = this.wrapper.getBoundingClientRect();
      const wh = window.innerHeight;
      const total = this.wrapper.offsetHeight - wh;
      const scrolled = Math.max(0, -rect.top);
      const progress = total > 0 ? clamp(scrolled / total, 0, 1) : 0;
      this.onProgress(progress);
    }
  }

  // ── Intersection Observer with fade-in ────────────────
  function observeFadeIn(selector, options = {}) {
    const els = document.querySelectorAll(selector);
    if (!els.length) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          if (!options.repeat) io.unobserve(entry.target);
        } else if (options.repeat) {
          entry.target.classList.remove('is-visible');
        }
      });
    }, { threshold: options.threshold || 0.15, rootMargin: options.rootMargin || '0px' });
    els.forEach(el => io.observe(el));
  }

  // ── Projects Scroll Sequence (Apple-style) ─────────────
  function initProjectsScroll() {
    const section = document.querySelector('.projects-sequence');
    if (!section) return;

    const slides = section.querySelectorAll('.proj-slide');
    const totalSlides = slides.length;
    if (!totalSlides) return;

    const scroller = new StickyScroller(section, (progress) => {
      const slideSpan = 1 / totalSlides;

      slides.forEach((slide, i) => {
        const slideStart = i / totalSlides;
        const slideEnd = (i + 1) / totalSlides;
        const localProgress = clamp((progress - slideStart) / slideSpan, 0, 1);

        // Each slide has its own animation type
        const anim = slide.dataset.anim || 'fade';

        if (anim === 'fade') {
          // Fade in on enter, hold, fade out on exit
          let opacity = 0;
          if (localProgress < 0.2) opacity = easeOut(localProgress / 0.2);
          else if (localProgress < 0.8) opacity = 1;
          else opacity = 1 - easeInOut((localProgress - 0.8) / 0.2);
          slide.style.opacity = opacity;
          slide.style.transform = `translateY(${lerp(40, 0, easeOut(Math.min(localProgress / 0.3, 1)))}px)`;

        } else if (anim === 'zoom') {
          let opacity = 0;
          if (localProgress < 0.2) opacity = easeOut(localProgress / 0.2);
          else if (localProgress < 0.8) opacity = 1;
          else opacity = 1 - easeInOut((localProgress - 0.8) / 0.2);
          const scale = lerp(0.88, 1, easeOut(Math.min(localProgress / 0.35, 1)));
          slide.style.opacity = opacity;
          slide.style.transform = `scale(${scale})`;

        } else if (anim === 'slide-left') {
          let opacity = 0;
          if (localProgress < 0.25) opacity = easeOut(localProgress / 0.25);
          else if (localProgress < 0.75) opacity = 1;
          else opacity = 1 - easeInOut((localProgress - 0.75) / 0.25);
          const tx = lerp(-60, 0, easeOut(Math.min(localProgress / 0.3, 1)));
          slide.style.opacity = opacity;
          slide.style.transform = `translateX(${tx}px)`;

        } else if (anim === 'slide-right') {
          let opacity = 0;
          if (localProgress < 0.25) opacity = easeOut(localProgress / 0.25);
          else if (localProgress < 0.75) opacity = 1;
          else opacity = 1 - easeInOut((localProgress - 0.75) / 0.25);
          const tx = lerp(60, 0, easeOut(Math.min(localProgress / 0.3, 1)));
          slide.style.opacity = opacity;
          slide.style.transform = `translateX(${tx}px)`;

        } else if (anim === 'rotate3d') {
          let opacity = 0;
          if (localProgress < 0.2) opacity = easeOut(localProgress / 0.2);
          else if (localProgress < 0.8) opacity = 1;
          else opacity = 1 - easeInOut((localProgress - 0.8) / 0.2);
          const rotX = lerp(12, 0, easeOut(Math.min(localProgress / 0.35, 1)));
          slide.style.opacity = opacity;
          slide.style.transform = `perspective(1200px) rotateX(${rotX}deg) translateY(${lerp(30, 0, easeOut(Math.min(localProgress / 0.35, 1)))}px)`;

        } else if (anim === 'parallax-up') {
          let opacity = 0;
          if (localProgress < 0.2) opacity = easeOut(localProgress / 0.2);
          else if (localProgress < 0.8) opacity = 1;
          else opacity = 1 - easeInOut((localProgress - 0.8) / 0.2);
          const ty = lerp(80, 0, easeOut(Math.min(localProgress / 0.4, 1)));
          slide.style.opacity = opacity;
          slide.style.transform = `translateY(${ty}px)`;
        }

        // Visibility
        if (progress >= slideStart - 0.05 && progress <= slideEnd + 0.05) {
          slide.style.pointerEvents = 'auto';
          slide.style.visibility = 'visible';
        } else {
          slide.style.pointerEvents = 'none';
          if (Math.abs(i - progress * totalSlides) > 1.5) {
            slide.style.visibility = 'hidden';
          }
        }
      });

      // Progress dots
      const dots = section.querySelectorAll('.proj-dot');
      const activeIdx = Math.round(progress * (totalSlides - 1));
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === activeIdx);
      });

      // Section number
      const numEl = section.querySelector('.proj-current-num');
      if (numEl) {
        numEl.textContent = String(Math.round(progress * (totalSlides - 1)) + 1).padStart(2, '0');
      }
    });

    scroller.mount();
  }

  // ── Hero Parallax ─────────────────────────────────────
  function initHeroParallax() {
    const hero = document.querySelector('.seq-hero');
    if (!hero) return;

    window.addEventListener('scroll', () => {
      const p = clamp(-hero.getBoundingClientRect().top / window.innerHeight, 0, 1);
      const title = hero.querySelector('.seq-hero-title');
      const sub = hero.querySelector('.seq-hero-sub');
      if (title) title.style.transform = `translateY(${p * 60}px)`;
      if (sub) sub.style.opacity = 1 - p * 2;
    }, { passive: true });
  }

  // ── Stagger reveal ─────────────────────────────────────
  function initStaggerReveal() {
    const groups = document.querySelectorAll('[data-stagger]');
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const children = entry.target.children;
          Array.from(children).forEach((child, i) => {
            child.style.transitionDelay = `${i * 80}ms`;
            child.classList.add('stagger-in');
          });
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    groups.forEach(g => io.observe(g));
  }

  // ── Text scramble on hover ──────────────────────────────
  function initTextScramble() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    document.querySelectorAll('[data-scramble]').forEach(el => {
      const original = el.textContent;
      let interval = null;
      el.addEventListener('mouseenter', () => {
        let iter = 0;
        clearInterval(interval);
        interval = setInterval(() => {
          el.textContent = original.split('').map((char, i) => {
            if (i < iter) return original[i];
            return chars[Math.floor(Math.random() * chars.length)];
          }).join('');
          if (iter >= original.length) clearInterval(interval);
          iter += 1 / 3;
        }, 30);
      });
    });
  }

  // ── Mobile project card scroll ─────────────────────────
  function initMobileProjectCards() {
    const track = document.querySelector('.m-proj-track');
    if (!track) return;

    const cards = track.querySelectorAll('.m-proj-card');
    const dots = document.querySelectorAll('.m-proj-dot');

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const idx = Array.from(cards).indexOf(entry.target);
          dots.forEach((dot, i) => dot.classList.toggle('active', i === idx));
        }
      });
    }, { threshold: 0.6, root: track.parentElement });

    cards.forEach(card => io.observe(card));
  }

  // ── 3D tilt on project cards ───────────────────────────
  function init3DTilt() {
    document.querySelectorAll('[data-tilt]').forEach(el => {
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        el.style.transform = `perspective(800px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) scale(1.02)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = '';
      });
    });
  }

  // ── Init all ─────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    // Check reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    initProjectsScroll();
    initHeroParallax();
    initStaggerReveal();
    initTextScramble();
    initMobileProjectCards();
    init3DTilt();

    // Generic fade-in observers
    observeFadeIn('.reveal', { threshold: 0.12 });
    observeFadeIn('.reveal-up', { threshold: 0.1 });
  });

})();
