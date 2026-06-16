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

      // Scripts inserted via innerHTML usually do not execute.
      // This re-creates them so burger/scroll logic inside menu.html works.
      var scripts = mount.querySelectorAll('script');

      scripts.forEach(function (oldScript) {
        var newScript = document.createElement('script');

        Array.prototype.slice.call(oldScript.attributes).forEach(function (attr) {
          newScript.setAttribute(attr.name, attr.value);
        });

        if (oldScript.src) {
          newScript.src = oldScript.src;
        } else {
          newScript.textContent = oldScript.textContent;
        }

        document.body.appendChild(newScript);
        oldScript.remove();
      });
    })
    .catch(function (err) {
      console.error('[shared-menu]', err);
    });
})();
