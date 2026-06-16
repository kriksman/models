(function () {
  const header   = document.getElementById('siteHeader');
  const burger   = document.getElementById('navBurger');
  const drawer   = document.getElementById('navDrawer');
  const progress = document.getElementById('navProgress');

  if (!header || !burger || !drawer) {
    console.warn('[menu-init] Missing required elements');
    return;
  }

  let prevY = window.scrollY || 0;
  let ticking = false;

  // ── Auto-hide on scroll ──────────────────────────────
  function handleScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      const y = window.scrollY || 0;

      // Progress bar
      if (progress) {
        const docH = document.documentElement.scrollHeight - window.innerHeight;
        progress.style.width = docH > 0 ? (y / docH * 100) + '%' : '0%';
      }

      // Show/hide header
      if (y <= 0) {
        header.classList.remove('hidden');
      } else if (y > prevY + 4) {
        header.classList.add('hidden');
        closeDrawer();
      } else if (y < prevY - 4) {
        header.classList.remove('hidden');
      }
      prevY = y;
      ticking = false;
    });
  }

  window.addEventListener('scroll', handleScroll, { passive: true });

  // ── Burger toggle ────────────────────────────────────
  function openDrawer() {
    drawer.classList.add('open');
    burger.classList.add('open');
    burger.setAttribute('aria-expanded', 'true');
    drawer.setAttribute('aria-hidden', 'false');
  }

  function closeDrawer() {
    drawer.classList.remove('open');
    burger.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    drawer.setAttribute('aria-hidden', 'true');
  }

  burger.addEventListener('click', function () {
    drawer.classList.contains('open') ? closeDrawer() : openDrawer();
  });

  // Close drawer when clicking a link inside it
  drawer.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', closeDrawer);
  });

  // Close on Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeDrawer();
  });
})();
