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
      info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>'
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
