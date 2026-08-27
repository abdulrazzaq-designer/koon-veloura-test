/* ================================
   Veloura Loader Screen
   path: src/assets/js/partials/veloura-loader.js
================================ */

(function () {
  function initVelouraLoader() {
    const loader = document.getElementById('veloura-loader-2026');
    if (!loader) return;

    let duration = parseInt(loader.getAttribute('data-duration') || '1200', 10);
    let fade = parseInt(loader.getAttribute('data-fade') || '450', 10);

    if (Number.isNaN(duration)) duration = 1200;
    if (Number.isNaN(fade)) fade = 450;

    duration = Math.max(300, Math.min(duration, 5000));
    fade = Math.max(100, Math.min(fade, 1500));

    loader.style.setProperty('--vl-fade-time', `${fade}ms`);

    function hideLoader() {
      if (!loader || loader.classList.contains('is-hiding')) return;

      loader.classList.add('is-hiding');

      window.setTimeout(() => {
        if (loader && loader.parentNode) {
          loader.parentNode.removeChild(loader);
        }
      }, fade + 120);
    }

    window.addEventListener('load', () => {
      window.setTimeout(hideLoader, duration);
    });

    window.setTimeout(hideLoader, duration + 4000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVelouraLoader);
  } else {
    initVelouraLoader();
  }
})();
