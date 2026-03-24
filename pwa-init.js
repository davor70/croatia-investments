// Croatia Investments — PWA Init
// Include this script in every HTML page (before </body>)
(function () {
  // Register Service Worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('/sw.js')
        .then(function (reg) {
          console.log('[PWA] Service Worker registered:', reg.scope);

          // Check for updates every time the page loads
          reg.addEventListener('updatefound', function () {
            const newWorker = reg.installing;
            newWorker.addEventListener('statechange', function () {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New content available — optionally notify user
                console.log('[PWA] New version available. Refresh to update.');
              }
            });
          });
        })
        .catch(function (err) {
          console.warn('[PWA] Service Worker registration failed:', err);
        });
    });
  }

  // ── Install prompt (A2HS) ──────────────────────────────────────────────────
  // Shows a subtle "Add to Home Screen" banner after 30 seconds on site
  let deferredPrompt = null;

  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferredPrompt = e;

    // Show banner after 30s if user hasn't dismissed
    if (!sessionStorage.getItem('pwa-prompt-shown')) {
      setTimeout(showInstallBanner, 30000);
    }
  });

  function showInstallBanner() {
    if (!deferredPrompt) return;
    sessionStorage.setItem('pwa-prompt-shown', '1');

    const banner = document.createElement('div');
    banner.id = 'pwa-install-banner';
    banner.innerHTML = `
      <style>
        #pwa-install-banner {
          position: fixed;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          background: #162032;
          border: 1px solid rgba(201,168,76,0.4);
          color: #f8f5ef;
          padding: 14px 20px;
          display: flex;
          align-items: center;
          gap: 14px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.82rem;
          z-index: 9999;
          box-shadow: 0 8px 32px rgba(0,0,0,0.4);
          max-width: 90vw;
          animation: pwa-slide-up 0.4s ease;
        }
        @keyframes pwa-slide-up {
          from { opacity: 0; transform: translateX(-50%) translateY(20px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        #pwa-install-banner span { flex: 1; }
        #pwa-install-btn {
          background: #c9a84c;
          color: #0d1b2a;
          border: none;
          padding: 8px 18px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.75rem;
          font-weight: 500;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          cursor: pointer;
          white-space: nowrap;
        }
        #pwa-dismiss-btn {
          background: none;
          border: none;
          color: rgba(255,255,255,0.4);
          font-size: 1.1rem;
          cursor: pointer;
          line-height: 1;
          padding: 0 4px;
        }
      </style>
      <span>📲 Add Croatia Investments to your home screen</span>
      <button id="pwa-install-btn">Install</button>
      <button id="pwa-dismiss-btn">✕</button>
    `;
    document.body.appendChild(banner);

    document.getElementById('pwa-install-btn').addEventListener('click', function () {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(function (choice) {
        console.log('[PWA] Install choice:', choice.outcome);
        deferredPrompt = null;
        banner.remove();
      });
    });

    document.getElementById('pwa-dismiss-btn').addEventListener('click', function () {
      banner.remove();
    });
  }
})();
