(function () {
  if (window.__iycHeaderScrollSimple) return;
  window.__iycHeaderScrollSimple = true;

  var lastScroll = getScrollY();
  var hiddenAfter = 150;
  var ticking = false;

  function getHeader() {
    return document.getElementById('siteHeader');
  }

  function getScrollY() {
    return Math.max(
      0,
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0
    );
  }

  function hideHeader(header) {
    header.classList.add('header--hidden', 'hidden', 'nav-hidden');
    header.style.setProperty('transform', 'translateY(-100%)', 'important');
  }

  function showHeader(header) {
    header.classList.remove('header--hidden', 'hidden', 'nav-hidden');
    header.style.setProperty('transform', 'translateY(0)', 'important');
  }

  function updateHeader() {
    var header = getHeader();
    if (!header) return;

    var currentScroll = getScrollY();
    if (currentScroll > lastScroll && currentScroll > hiddenAfter) {
      hideHeader(header);
    } else if (currentScroll < lastScroll || currentScroll <= hiddenAfter) {
      showHeader(header);
    }

    lastScroll = currentScroll;
  }

  function requestUpdate() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      updateHeader();
      ticking = false;
    });
  }

  window.addEventListener('scroll', requestUpdate, { passive: true, capture: true });
  window.addEventListener('wheel', function (event) {
    var header = getHeader();
    if (!header) return;
    if (event.deltaY > 0 && getScrollY() > hiddenAfter) hideHeader(header);
    if (event.deltaY < 0) showHeader(header);
  }, { passive: true, capture: true });

  window.addEventListener('touchmove', requestUpdate, { passive: true, capture: true });
  window.setInterval(updateHeader, 250);
  window.setTimeout(updateHeader, 300);
})();
