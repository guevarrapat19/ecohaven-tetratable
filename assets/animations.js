/**
 * EcoHaven Furniture — Interactive Animation Controller
 * Handles tactile button ripples, scroll reveal triggers, and badge pop feedback.
 */

(function() {
  'use strict';

  // 1. TACTILE BUTTON RIPPLE EFFECT
  function createRipple(event) {
    const button = event.currentTarget;
    if (!button || button.disabled) return;

    // Check if button has overflow hidden or position relative
    const style = window.getComputedStyle(button);
    if (style.position === 'static') {
      button.style.position = 'relative';
    }
    if (style.overflow !== 'hidden' && !button.classList.contains('overflow-hidden')) {
      button.style.overflow = 'hidden';
    }

    const circle = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    const rect = button.getBoundingClientRect();
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - rect.left - radius}px`;
    circle.style.top = `${event.clientY - rect.top - radius}px`;

    // Determine ripple color (light for dark buttons, warm brown for light buttons)
    const isDarkBg = button.classList.contains('bg-primary') ||
                     button.classList.contains('bg-primary-container') ||
                     button.classList.contains('bg-tertiary') ||
                     button.classList.contains('bg-inverse-surface') ||
                     style.backgroundColor.includes('rgb(134') ||
                     style.backgroundColor.includes('rgb(65');

    circle.className = isDarkBg ? 'eco-ripple' : 'eco-ripple eco-ripple-dark';

    // Remove existing ripple if any
    const existing = button.querySelector('.eco-ripple');
    if (existing) existing.remove();

    button.appendChild(circle);
    setTimeout(() => {
      circle.remove();
    }, 600);
  }

  function attachButtonRipples() {
    const clickableElements = document.querySelectorAll(
      'button, a[role="button"], .btn-action, input[type="submit"]'
    );
    clickableElements.forEach(el => {
      if (!el.dataset.ecoRippleAttached) {
        el.addEventListener('pointerdown', createRipple);
        el.dataset.ecoRippleAttached = 'true';
      }
    });
  }

  // 2. SCROLL REVEAL OBSERVER
  function initScrollReveal() {
    if (!('IntersectionObserver' in window)) return;

    const targets = document.querySelectorAll(
      'section, main > div, .product-card, .collection-card, #inventory, #kanbanCol1, #kanbanCol2, #kanbanCol3, #kanbanCol4'
    );

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('eco-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.08
    });

    targets.forEach(el => {
      // Don't add to fixed headers or modals
      if (el.closest('header') || el.closest('.fixed') || el.classList.contains('fixed')) return;
      el.classList.add('eco-reveal');
      observer.observe(el);
    });
  }

  // 3. BADGE POP TRIGGER
  function pulseBadge(selector) {
    const el = document.querySelector(selector);
    if (!el) return;
    el.style.animation = 'none';
    el.offsetHeight; // force reflow
    el.style.animation = 'ecoBadgePop 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
  }

  // 4. LISTEN FOR BADGE UPDATES
  window.addEventListener('ecohaven_cart_updated', () => {
    pulseBadge('#cartBadge');
  });

  window.addEventListener('ecohaven_orders_updated', () => {
    pulseBadge('#headerOrdersBadge');
    // Re-attach ripples to any newly rendered buttons
    setTimeout(attachButtonRipples, 100);
  });

  window.addEventListener('ecohaven_inventory_updated', () => {
    setTimeout(attachButtonRipples, 100);
  });

  // 5. SMOOTH PAGE EXIT TRANSITION FOR INTERNAL LINKS
  function initPageTransitions() {
    const links = document.querySelectorAll('a[href]:not([target="_blank"]):not([href^="#"]):not([href^="javascript"])');
    links.forEach(a => {
      a.addEventListener('click', (e) => {
        const href = a.getAttribute('href');
        if (!href || href.startsWith('mailto:') || href.startsWith('tel:') || e.metaKey || e.ctrlKey) return;
        
        // Gentle quick fade
        const main = document.querySelector('main');
        if (main) {
          main.style.transition = 'opacity 0.15s ease-out, transform 0.15s ease-out';
          main.style.opacity = '0.7';
          main.style.transform = 'translateY(-4px)';
        }
      });
    });
  }

  // INITIALIZE ON LOAD & DOM READY
  function init() {
    attachButtonRipples();
    initScrollReveal();
    initPageTransitions();

    // Observe dynamically added nodes
    const mutationObserver = new MutationObserver((mutations) => {
      let shouldAttach = false;
      mutations.forEach(m => {
        if (m.addedNodes.length > 0) shouldAttach = true;
      });
      if (shouldAttach) {
        attachButtonRipples();
      }
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.ecoHavenAnimations = {
    attachButtonRipples,
    pulseBadge
  };
})();
