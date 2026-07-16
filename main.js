/* ============================================================
   ARJUN BAHERA — Interactive JS
   Terminal typing, metric counters, scroll reveals, redaction
   bars, and reduced motion respect.
   ============================================================ */

(function () {
  'use strict';

  // --- Config ---
  const TERMINAL_PHRASES = [
    'cat /var/log/breach_prevention.log',
    'grep -r "vulnerability" --include=*.go .',
    'python3 triage_agent.py --pipeline ci-cd',
    'nmap -sV --script=vuln target.example.com',
    'openssl s_client -connect api:443 -tls1_3',
    'aws iam simulate-principal-policy --policy-source-arn arn',
    'docker scan --json app:latest | jq ".vulnerabilities"',
    'semgrep --config=auto --sarif --output findings.sarif .'
  ];

  const TERMINAL_SPEED = 45;   // ms per character
  const TERMINAL_PAUSE = 2000; // ms between phrases
  const COUNT_DURATION = 800;  // ms for counter animation

  // --- Elements ---
  const terminalOutput = document.getElementById('terminal-output');
  const currentYearEl = document.getElementById('current-year');

  // --- Init ---
  document.addEventListener('DOMContentLoaded', function () {
    setCurrentYear();
    initTerminalEffect();
    initScrollReveal();
    initCounters();
  });

  // --- Set current year ---
  function setCurrentYear() {
    if (currentYearEl) {
      currentYearEl.textContent = new Date().getFullYear();
    }
  }

  // --- Terminal typing effect ---
  function initTerminalEffect() {
    if (!terminalOutput) return;

    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let timeoutId;

    function type() {
      const currentPhrase = TERMINAL_PHRASES[phraseIndex];

      if (!isDeleting) {
        // Typing forward
        terminalOutput.textContent = currentPhrase.substring(0, charIndex + 1);
        charIndex++;

        if (charIndex === currentPhrase.length) {
          // Finished typing, pause then delete
          isDeleting = true;
          timeoutId = setTimeout(type, TERMINAL_PAUSE);
          return;
        }
        timeoutId = setTimeout(type, TERMINAL_SPEED + Math.random() * 30);
      } else {
        // Deleting
        terminalOutput.textContent = currentPhrase.substring(0, charIndex - 1);
        charIndex--;

        if (charIndex === 0) {
          isDeleting = false;
          phraseIndex = (phraseIndex + 1) % TERMINAL_PHRASES.length;
          timeoutId = setTimeout(type, TERMINAL_SPEED * 3);
          return;
        }
        timeoutId = setTimeout(type, TERMINAL_SPEED * 0.5);
      }
    }

    // Start typing after a short delay
    timeoutId = setTimeout(type, 600);

    // Clean up on page unload (good practice)
    window.addEventListener('beforeunload', function () {
      clearTimeout(timeoutId);
    });
  }

  // --- Counter animation ---
  function initCounters() {
    const counters = document.querySelectorAll('.cred-number[data-count]');
    if (!counters.length) return;

    const animated = new Set();

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && !animated.has(entry.target)) {
            animated.add(entry.target);
            animateCounter(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach(function (counter) {
      observer.observe(counter);
    });
  }

  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-count'), 10);
    const suffix = el.getAttribute('data-suffix') || '';
    if (isNaN(target)) return;

    const startTime = performance.now();
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      el.textContent = target + suffix;
      return;
    }

    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / COUNT_DURATION, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);
      el.textContent = current + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = target + suffix;
      }
    }

    requestAnimationFrame(update);
  }

  // --- Scroll reveal ---
  function initScrollReveal() {
    const revealTargets = document.querySelectorAll(
      '.service-card, .case-card, .lab-card, .research-block, .how-item, .cred-stat, .skills-block, .tl-card'
    );

    if (!revealTargets.length) return;

    // Assign card indices for stagger effect
    const groups = {};
    revealTargets.forEach(function (el) {
      const cls = el.classList[0]; // first class as group key
      if (!groups[cls]) groups[cls] = 0;
      el.style.setProperty('--card-index', groups[cls]);
      el.classList.add('reveal');
      groups[cls]++;
    });

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    revealTargets.forEach(function (el) {
      observer.observe(el);
    });
  }

  // --- Redaction bars (hover reveal) --- handled in CSS, but add keyboard support ---
  function initRedactionKeyboard() {
    const redactionBars = document.querySelectorAll('.redaction-bar');
    redactionBars.forEach(function (bar) {
      bar.setAttribute('tabindex', '0');
      bar.setAttribute('role', 'button');
      bar.setAttribute('aria-label', 'Reveal client sector');
      bar.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          // Toggle a focus class to simulate hover
          bar.classList.toggle('redaction-revealed');
        }
      });
    });
  }

  // --- Smooth nav highlighting ---
  function initNavHighlight() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a');

    if (!sections.length || !navLinks.length) return;

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            navLinks.forEach(function (link) {
              link.style.color = '';
            });
            const active = document.querySelector(
              '.nav-links a[href="#' + entry.target.id + '"]'
            );
            if (active) {
              active.style.color = 'var(--color-white)';
            }
          }
        });
      },
      { threshold: 0.4, rootMargin: '-80px 0px 0px 0px' }
    );

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  // --- Call remaining inits ---
  document.addEventListener('DOMContentLoaded', function () {
    initWarningDialog();
    initRedactionKeyboard();
    initNavHighlight();
  });


  // --- Warning dialog ---
  function initWarningDialog() {
    var overlay = document.getElementById('warn-dialog');
    var btn = document.getElementById('warn-continue');
    if (!overlay || !btn) return;

    btn.addEventListener('click', function () {
      overlay.classList.add('hidden');
    });

    // Prevent background scroll while dialog is open
    document.body.style.overflow = 'hidden';

    // Restore scroll after dismiss
    var observer = new MutationObserver(function () {
      if (overlay.classList.contains('hidden')) {
        document.body.style.overflow = '';
        observer.disconnect();
      }
    });
    observer.observe(overlay, { attributes: true, attributeFilter: ['class'] });
  }

})();
