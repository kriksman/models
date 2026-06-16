(function () {
  var mount = document.getElementById('shared-menu');

  if (!mount) {
    console.warn('[menu-loader] Mount element #shared-menu not found');
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
      // Inject the HTML
      mount.innerHTML = html;

      // The embedded script in menu.html will execute automatically
      // Just ensure it's available
      console.log('[menu-loader] Menu loaded successfully');
    })
    .catch(function (err) {
      console.error('[menu-loader]', err);
    });
})();
