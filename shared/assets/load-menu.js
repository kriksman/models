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
      mount.innerHTML = html;

      // Extract and re-execute scripts from the injected HTML
      var scripts = mount.querySelectorAll('script');
      scripts.forEach(function (oldScript) {
        var newScript = document.createElement('script');
        
        // Copy all attributes
        Array.prototype.forEach.call(oldScript.attributes, function (attr) {
          newScript.setAttribute(attr.name, attr.value);
        });

        // Copy content or src
        if (oldScript.src) {
          newScript.src = oldScript.src;
        } else {
          newScript.textContent = oldScript.textContent;
        }

        // Replace and execute
        oldScript.parentNode.replaceChild(newScript, oldScript);
      });

      console.log('[menu-loader] Menu loaded and scripts executed');
    })
    .catch(function (err) {
      console.error('[menu-loader]', err);
    });
})();
