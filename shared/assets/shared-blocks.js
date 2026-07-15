(function () {
  var cssHref = "/shared/assets/import-shared-blocks.css?v=20260715-featured-discovery";
  var selector = "[data-iyc-shared-block]";

  function ensureCss() {
    if (document.querySelector('link[href="' + cssHref + '"]')) return;
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssHref;
    document.head.appendChild(link);
  }

  function runScripts(scope) {
    scope.querySelectorAll("script").forEach(function (oldScript) {
      var newScript = document.createElement("script");
      Array.prototype.slice.call(oldScript.attributes).forEach(function (attr) {
        newScript.setAttribute(attr.name, attr.value);
      });
      newScript.textContent = oldScript.textContent;
      document.body.appendChild(newScript);
      oldScript.remove();
    });
  }

  function revealInjected(scope) {
    scope.querySelectorAll("section, .reveal").forEach(function (el) {
      el.classList.add("in-view");
    });
  }

  function loadBlock(mount) {
    var url = mount.getAttribute("data-iyc-shared-block");
    if (!url || mount.getAttribute("data-iyc-loaded") === "true") return Promise.resolve();

    return fetch(url, { cache: "no-cache" })
      .then(function (res) {
        if (!res.ok) throw new Error("Shared block load failed: " + url + " HTTP " + res.status);
        return res.text();
      })
      .then(function (html) {
        mount.innerHTML = html;
        mount.setAttribute("data-iyc-loaded", "true");
        runScripts(mount);
        revealInjected(mount);
      })
      .catch(function (err) {
        console.error("[shared-blocks]", err);
      });
  }

  function init() {
    var mounts = Array.prototype.slice.call(document.querySelectorAll(selector));
    if (!mounts.length) return;
    ensureCss();
    Promise.all(mounts.map(loadBlock)).then(function () {
      document.dispatchEvent(new CustomEvent("iyc:shared-blocks-loaded"));
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
