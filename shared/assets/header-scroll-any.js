(function () {
  var version = '20260617-any-scroll';
  if (window.__iycHeaderScrollSimple === version) return;
  window.__iycHeaderScrollSimple = version;

  var hiddenAfter = 90;
  var revealDelta = 6;
  var ticking = false;
  var touchY = null;
  var gestureY = 0;
  var activeSource = window;
  var boundSources = [];
  var scrollPositions = typeof WeakMap === 'function' ? new WeakMap() : null;

  function getHeader() {
    return document.getElementById('siteHeader');
  }

  function isDrawerOpen() {
    var drawer = document.getElementById('navDrawer');
    var toggle = document.getElementById('navToggle');
    return !!(
      (drawer && drawer.classList.contains('open')) ||
      (toggle && toggle.checked)
    );
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

  function getMaxKnownScrollTop() {
    var y = getScrollTop(window);
    for (var i = 0; i < boundSources.length; i += 1) {
      y = Math.max(y, getScrollTop(boundSources[i]));
    }
    return y;
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

  function setStoredScroll(source, y) {
    if (scrollPositions && source && typeof source === 'object') {
      scrollPositions.set(source, y);
    }
  }

  function getStoredScroll(source) {
    if (scrollPositions && source && typeof source === 'object' && scrollPositions.has(source)) {
      return scrollPositions.get(source);
    }
    return getScrollTop(source);
  }

  function hideHeader(header) {
    if (isDrawerOpen()) {
      showHeader(header);
      return;
    }

    syncHiddenOffset(header);
    header.classList.add('header--hidden', 'hidden', 'nav-hidden');
    header.style.setProperty('transform', 'translate3d(0,var(--nav-hidden-offset),0)', 'important');
  }

  function showHeader(header) {
    header.classList.remove('header--hidden', 'hidden', 'nav-hidden');
    header.style.setProperty('transform', 'translate3d(0,0,0)', 'important');
  }

  function syncHiddenOffset(header) {
    var target = header || getHeader();
    var progress = document.getElementById('navProgress');
    var headerTop;
    var progressHeight;
    var hiddenOffset;
    if (!target) return;
    headerTop = parseFloat(window.getComputedStyle(target).top) || 0;
    progressHeight = progress ? (progress.offsetHeight || 3) : 3;
    hiddenOffset = Math.max(progressHeight, target.offsetHeight + headerTop - progressHeight);
    target.style.setProperty('--nav-hidden-offset', '-' + hiddenOffset + 'px');
  }

  function updateProgress(y, source) {
    var progress = document.getElementById('navProgress');
    var scrollableHeight;
    if (!progress) return;
    scrollableHeight = getScrollableHeight(source || activeSource);
    progress.style.width = scrollableHeight > 0 ? (y / scrollableHeight * 100) + '%' : '0%';
  }

  function applyDirection(delta, y, source) {
    var header = getHeader();
    if (!header) return;

    updateProgress(y, source);

    if (isDrawerOpen()) {
      showHeader(header);
      gestureY = Math.max(0, y);
      return;
    }

    if (y <= hiddenAfter && gestureY <= hiddenAfter) {
      showHeader(header);
      gestureY = y;
      return;
    }

    if (delta > revealDelta) {
      gestureY = Math.max(y, gestureY + delta);
      if (gestureY > hiddenAfter || y > hiddenAfter) hideHeader(header);
    } else if (delta < -revealDelta) {
      gestureY = Math.max(0, Math.min(y, gestureY) + delta);
      showHeader(header);
    }
  }

  function updateFromSource(source) {
    var y = getScrollTop(source);
    var prev = getStoredScroll(source);
    var delta = y - prev;

    activeSource = source || activeSource;
    setStoredScroll(source, y);

    if (Math.abs(delta) > 0) {
      gestureY = Math.max(y, gestureY);
      applyDirection(delta, y, source);
    } else if (getMaxKnownScrollTop() <= hiddenAfter) {
      var header = getHeader();
      if (header) showHeader(header);
    }
  }

  function requestUpdate(source) {
    activeSource = source || activeSource;
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      updateFromSource(activeSource);
      ticking = false;
    });
  }

  function hasSource(source) {
    return boundSources.indexOf(source) !== -1;
  }

  function bindSource(source) {
    if (!source || hasSource(source) || !source.addEventListener) return;
    boundSources.push(source);
    setStoredScroll(source, getScrollTop(source));
    source.addEventListener('scroll', function (event) {
      requestUpdate(event && event.currentTarget ? event.currentTarget : source);
    }, { passive: true, capture: true });
  }

  function bindScrollSources() {
    if (isDrawerOpen()) return;

    bindSource(window);
    bindSource(document);
    bindSource(document.documentElement);
    bindSource(document.body);

    Array.prototype.forEach.call(document.querySelectorAll('*'), function (el) {
      var style = window.getComputedStyle(el);
      var canScrollY = /(auto|scroll|overlay)/.test(style.overflowY);
      if (canScrollY && el.scrollHeight > el.clientHeight + 10) bindSource(el);
    });

    window.__iycHeaderScrollBoundSources = boundSources.length;
  }

  function handleWheel(event) {
    var delta = event.deltaY || 0;
    var y = getMaxKnownScrollTop();
    if (!delta) return;

    if (delta > 0) {
      gestureY = Math.max(gestureY, y) + delta;
      applyDirection(delta, Math.max(y, gestureY), activeSource);
    } else {
      gestureY = Math.max(0, Math.min(gestureY, y) + delta);
      applyDirection(delta, y, activeSource);
    }
  }

  function handleTouchStart(event) {
    if (!event.touches || !event.touches.length) return;
    touchY = event.touches[0].clientY;
  }

  function handleTouchMove(event) {
    var currentY;
    var delta;
    var y;
    if (!event.touches || !event.touches.length || touchY === null) return;

    currentY = event.touches[0].clientY;
    delta = touchY - currentY;
    y = getMaxKnownScrollTop();
    touchY = currentY;

    if (delta > 0) {
      gestureY = Math.max(gestureY, y) + delta;
      applyDirection(delta, Math.max(y, gestureY), activeSource);
    } else if (delta < 0) {
      gestureY = Math.max(0, Math.min(gestureY, y) + delta);
      applyDirection(delta, y, activeSource);
    }
  }

  bindScrollSources();
  syncHiddenOffset();
  gestureY = getMaxKnownScrollTop();

  document.addEventListener('wheel', handleWheel, { passive: true, capture: true });
  document.addEventListener('touchstart', handleTouchStart, { passive: true, capture: true });
  document.addEventListener('touchmove', handleTouchMove, { passive: true, capture: true });
  document.addEventListener('scroll', function () { requestUpdate(activeSource); }, { passive: true, capture: true });
  document.addEventListener('DOMContentLoaded', bindScrollSources, { once: true });
  window.addEventListener('load', bindScrollSources, { once: true });
  window.addEventListener('load', function () { syncHiddenOffset(); }, { once: true });
  window.addEventListener('resize', function () { syncHiddenOffset(); }, { passive: true });

  if (typeof MutationObserver === 'function') {
    new MutationObserver(bindScrollSources).observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  window.setInterval(function () {
    if (isDrawerOpen()) {
      var header = getHeader();
      if (header) showHeader(header);
      return;
    }

    bindScrollSources();
    requestUpdate(activeSource);
  }, 500);
  window.setTimeout(bindScrollSources, 100);
})();
