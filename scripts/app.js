// ================================================================
// app.js - App entry point, toast notifications, global wiring
// Fitent
// ================================================================

window.FitentIcons = window.FitentIcons || {
  svg(name, className = "app-icon") {
    const paths = {
      sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
      moon: '<path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5 7 7 0 1 0 20.5 14.5Z"/>',
      help: '<circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 1 1 5.2 2c-.9.8-1.3 1.2-1.3 2.2"/><path d="M12 17h.01"/>',
      success: '<path d="m20 6-11 11-5-5"/>',
      error: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
      warning: '<path d="M12 3 2 20h20L12 3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
      info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
      shield: '<path d="M20 13c0 5-3.5 7.5-7.66 9.7a1 1 0 0 1-.68 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 .76-.97l7-2a1 1 0 0 1 .48 0l7 2A1 1 0 0 1 20 6z"/>',
      barChart: '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
      bot: '<rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8.01" y2="16"/><line x1="16" y1="16" x2="16.01" y2="16"/>',
      sparkles: '<path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>',
      sunrise: '<path d="M12 2v8M5.22 10.22l1.42 1.42M17.36 11.64l1.42-1.42M22 22H2M16 22a4 4 0 0 0-8 0"/>',
      heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
      calendar: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
      target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
      droplet: '<path d="M12 22a7 7 0 0 0 7-7c0-4.3-7-13-7-13S5 10.7 5 15a7 7 0 0 0 7 7z"/>',
      trophy: '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34M12 2a5 5 0 0 1 5 5v5a5 5 0 0 1-10 0V7a5 5 0 0 1 5-5z"/>',
      zap: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
      messageSquare: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
      trash: '<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>',
      fileText: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>',
      download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
      upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
      folder: '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>',
      mic: '<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v1a7 7 0 0 1-14 0v-1"/><line x1="12" y1="19" x2="12" y2="22"/>',
      camera: '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>',
      flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
      arrowLeft: '<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>',
      arrowRight: '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>'
    };
    return `<svg class="${className}" viewBox="0 0 24 24" aria-hidden="true">${paths[name] || paths.info}</svg>`;
  }
};

function setIconButton(button, iconName) {
  if (!button || !window.FitentIcons) return;
  button.innerHTML = window.FitentIcons.svg(iconName);
}

window.Toast = (() => {
  function show(message, type = "info", duration = 3500) {
    let container = document.getElementById("toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "toast-container";
      document.body.appendChild(container);
    }

    const icons = { success: "success", error: "error", warning: "warning", info: "info" };
    const toast = document.createElement("div");
    toast.className = `app-toast toast-${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${window.FitentIcons.svg(icons[type] || icons.info)}</span>
      <span class="toast-msg"></span>
      <button class="toast-close" type="button" aria-label="Dismiss">&times;</button>`;
    toast.querySelector(".toast-msg").textContent = message;
    toast.querySelector(".toast-close").addEventListener("click", () => dismiss(toast));
    container.appendChild(toast);
    setTimeout(() => dismiss(toast), duration);
    return toast;
  }

  function dismiss(toast) {
    if (!toast || toast.classList.contains("toast-leaving")) return;
    toast.classList.add("toast-leaving");
    toast.addEventListener("animationend", () => toast.remove(), { once: true });
  }

  return { show };
})();

window.App = (() => {
  function refresh() {
    Dashboard.refresh();
  }

  async function init() {
    if (window.Storage && window.Storage.initDB) {
      await window.Storage.initDB();
    }

    const authenticated = window.Session
      ? window.Session.isAuthenticated()
      : (window.Auth && window.Auth.isAuthenticated());

    if (authenticated && window.Storage && window.Storage.sync) {
      await window.Storage.sync();
    } else if (!authenticated && window.Storage && window.Storage.sync) {
      await window.Storage.sync();
    }

    await Tracker.init();
    Hydration.init();
    AI.init();
    Dashboard.initProfilePanel();
    if (window.WeeklyReport) window.WeeklyReport.init();
    if (window.Onboarding) window.Onboarding.init();

    refresh();

    document.querySelectorAll("[data-nav]").forEach(link => {
      link.addEventListener("click", e => {
        const target = link.dataset.nav;
        const section = document.getElementById(target);
        if (section) {
          e.preventDefault();
          section.scrollIntoView({ behavior: "smooth" });
        }
      });
    });
  }

  return { init, refresh };
})();

window.addEventListener("pageLoaded", async (e) => {
  const page = e.detail.page;

  if (window.Auth) window.Auth.renderAuthWidgets();

  if (page === "dashboard") {
    if (window.Storage && window.Storage.initDB) {
      await window.Storage.initDB();
    }

    if (window.Storage && window.Storage.sync) {
      await window.Storage.sync();
    }

    await Tracker.init();
    Hydration.init();
    Dashboard.initProfilePanel();
    if (window.WeeklyReport) window.WeeklyReport.init();
    if (window.Onboarding) window.Onboarding.init();

    App.refresh();
  } else if (page === "ai-helper") {
    if (window.AI) AI.initMainChat();
  } else if (page === "grocery") {
    if (window.Grocery) window.Grocery.init();
  } else if (page === "reminders") {
    if (window.Reminders) window.Reminders.init();
  }

  const themeBtns = document.querySelectorAll(".theme-btn, #theme-toggle");
  themeBtns.forEach(themeBtn => {
    if (!themeBtn.dataset.initialized) {
      themeBtn.dataset.initialized = "true";
      themeBtn.addEventListener("click", () => {
        const newTheme = window.ThemeService.toggleTheme();
        document.querySelectorAll(".theme-btn, #theme-toggle").forEach(btn => {
          setIconButton(btn, newTheme === "light" ? "moon" : "sun");
        });
      });
    }
    setIconButton(themeBtn, window.ThemeService.getTheme() === "light" ? "moon" : "sun");
  });

  const tourBtn = document.getElementById("btn-replay-tour");
  setIconButton(tourBtn, "help");
});

let deferredPrompt;

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js")
      .then((registration) => {
        console.log("ServiceWorker registration successful with scope: ", registration.scope);
      })
      .catch((err) => {
        console.error("ServiceWorker registration failed: ", err);
      });
  });
}

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;

  const installPanel = document.getElementById("pwa-install-panel");
  if (installPanel) {
    installPanel.classList.remove("hidden");
  }
});

document.addEventListener("click", async (e) => {
  if (e.target && e.target.id === "btn-install-pwa") {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    deferredPrompt = null;

    const installPanel = document.getElementById("pwa-install-panel");
    if (installPanel) installPanel.classList.add("hidden");
  }
});

window.addEventListener("appinstalled", () => {
  console.log("Fitent was installed securely.");
  const installPanel = document.getElementById("pwa-install-panel");
  if (installPanel) installPanel.classList.add("hidden");
});
