(function () {
  var mount = document.getElementById('shared-menu');

  if (!mount) {
    console.warn('[shared-menu] Mount element #shared-menu not found');
    return;
  }

  fetch('/shared/menu.html', { cache: 'no-cache' })
    .then(function (res) {
      if (!res.ok) {
        throw new Error('Menu load failed: HTTP ' + res.status);
      }
      return res.text();
    })
    .then(function (html) {
      mount.innerHTML = html;
      initSharedMenu();
    })
    .catch(function (err) {
      console.error('[shared-menu]', err);
    });

  function initSharedMenu() {
    var header = document.getElementById('siteHeader');
    var burger = document.getElementById('navBurger');
    var drawer = document.getElementById('navDrawer');
    var progress = document.getElementById('navProgress');

    if (!header) {
      console.warn('[shared-menu] #siteHeader not found');
      return;
    }

    if (!burger) {
      console.warn('[shared-menu] #navBurger not found');
    }

    if (!drawer) {
      console.warn('[shared-menu] #navDrawer not found');
    }

    function openDrawer() {
      if (!drawer || !burger) return;

      drawer.classList.add('open');
      burger.classList.add('open');
      burger.setAttribute('aria-expanded', 'true');
      drawer.setAttribute('aria-hidden', 'false');
    }

    function closeDrawer() {
      if (!drawer || !burger) return;

      drawer.classList.remove('open');
      burger.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
      drawer.setAttribute('aria-hidden', 'true');
    }

    if (burger && drawer) {
      burger.addEventListener('click', function () {
        if (drawer.classList.contains('open')) {
          closeDrawer();
        } else {
          openDrawer();
        }
      });

      drawer.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', closeDrawer);
      });

      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
          closeDrawer();
        }
      });
    }

    var prevY = window.scrollY || 0;
    var ticking = false;

    function handleScroll() {
      if (ticking) return;

      ticking = true;

      requestAnimationFrame(function () {
        var y = window.scrollY || 0;
        var docH = document.documentElement.scrollHeight - window.innerHeight;

        if (progress) {
          progress.style.width = docH > 0 ? (y / docH * 100) + '%' : '0%';
        }

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
    handleScroll();
  }
})();
