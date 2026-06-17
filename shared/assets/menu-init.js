(function () {
  var header   = document.getElementById('siteHeader');
  var burger   = document.getElementById('navBurger');
  var drawer   = document.getElementById('navDrawer');
  var progress = document.getElementById('navProgress');
  var toggle   = document.getElementById('navToggle');

  if (!header || !burger || !drawer || header.dataset.menuInit === 'done') return;
  header.dataset.menuInit = 'done';

  var hideAfter = 90;
  var revealDelta = 10;
  var scrollSources = [];
  var activeScrollSource = window;
  var prevY = getScrollTop(activeScrollSource);
  var gestureOffset = prevY;
  var touchY = null;
  var ticking = false;

  function showHeader() {
    header.classList.remove('hidden', 'nav-hidden');
  }

  function hideHeader() {
    header.classList.add('hidden', 'nav-hidden');
  }

  function getScrollTop(source) {
    if (
      source &&
      source !== window &&
      source !== document &&
      source !== document.documentElement &&
      source !== document.body &&
      source.scrollTop !== undefined
    ) {
      return Math.max(0, source.scrollTop || 0);
    }

    return Math.max(
      0,
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0
    );
  }

  function getScrollableHeight(source) {
    if (
      source &&
      source !== window &&
      source !== document &&
      source !== document.documentElement &&
      source !== document.body &&
      source.scrollHeight !== undefined
    ) {
      return Math.max(0, source.scrollHeight - source.clientHeight);
    }

    return Math.max(
      0,
      document.documentElement.scrollHeight,
      document.body.scrollHeight
    ) - window.innerHeight;
  }

  function handleScroll(e) {
    activeScrollSource = e && e.currentTarget ? e.currentTarget : activeScrollSource;
    if (ticking) return;
    ticking = true;

    requestAnimationFrame(function () {
      var y = getScrollTop(activeScrollSource);
      var delta = y - prevY;
      var scrollableHeight = getScrollableHeight(activeScrollSource);

      if (progress) {
        progress.style.width = scrollableHeight > 0 ? (y / scrollableHeight * 100) + '%' : '0%';
      }

      if (y <= hideAfter) {
        showHeader();
        gestureOffset = y;
      } else if (delta > revealDelta) {
        hideHeader();
        closeDrawer();
      } else if (delta < -revealDelta) {
        showHeader();
      }

      prevY = y;
      ticking = false;
    });
  }

  function applyGestureDirection(delta) {
    var y = getScrollTop(activeScrollSource);

    if (delta > revealDelta) {
      gestureOffset += delta;
      if (y > hideAfter || gestureOffset > hideAfter) {
        hideHeader();
        closeDrawer();
      }
    } else if (delta < -revealDelta) {
      gestureOffset = Math.max(0, gestureOffset + delta);
      showHeader();
    }
  }

  function hasScrollSource(source) {
    return scrollSources.indexOf(source) !== -1;
  }

  function addScrollSource(source) {
    if (!source || hasScrollSource(source)) return;
    scrollSources.push(source);
    source.addEventListener('scroll', handleScroll, { passive: true });
  }

  function bindScrollSources() {
    addScrollSource(window);
    addScrollSource(document);
    addScrollSource(document.documentElement);
    addScrollSource(document.body);

    Array.prototype.forEach.call(document.querySelectorAll('*'), function (el) {
      var style = window.getComputedStyle(el);
      var canScrollY = /(auto|scroll|overlay)/.test(style.overflowY);
      if (canScrollY && el.scrollHeight > el.clientHeight + 10) addScrollSource(el);
    });
  }

  function openDrawer() {
    drawer.classList.add('open');
    burger.classList.add('open');
    if (toggle) toggle.checked = true;
    burger.setAttribute('aria-expanded', 'true');
    drawer.setAttribute('aria-hidden', 'false');
  }

  function closeDrawer() {
    drawer.classList.remove('open');
    burger.classList.remove('open');
    if (toggle) toggle.checked = false;
    burger.setAttribute('aria-expanded', 'false');
    drawer.setAttribute('aria-hidden', 'true');
  }

  bindScrollSources();
  document.addEventListener('DOMContentLoaded', bindScrollSources, { once: true });
  window.addEventListener('load', bindScrollSources, { once: true });
  window.setTimeout(bindScrollSources, 800);

  window.addEventListener('wheel', function (e) {
    applyGestureDirection(e.deltaY || 0);
  }, { passive: true });

  window.addEventListener('touchstart', function (e) {
    touchY = e.touches && e.touches.length ? e.touches[0].clientY : null;
  }, { passive: true });

  window.addEventListener('touchmove', function (e) {
    if (!e.touches || !e.touches.length || touchY === null) return;
    var nextTouchY = e.touches[0].clientY;
    applyGestureDirection(touchY - nextTouchY);
    touchY = nextTouchY;
  }, { passive: true });

  if (toggle) {
    toggle.addEventListener('change', function () {
      toggle.checked ? openDrawer() : closeDrawer();
    });
  } else {
    burger.addEventListener('click', function () {
      drawer.classList.contains('open') ? closeDrawer() : openDrawer();
    });
  }

  burger.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (toggle) {
        toggle.checked = !toggle.checked;
        toggle.dispatchEvent(new Event('change'));
      } else {
        drawer.classList.contains('open') ? closeDrawer() : openDrawer();
      }
    }
  });

  Array.prototype.forEach.call(drawer.querySelectorAll('a'), function (a) {
    a.addEventListener('click', closeDrawer);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeDrawer();
  });
})();
