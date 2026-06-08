// ======================================================
// 1) THEME
// ======================================================
function initThemeSystem() {
  const html = document.documentElement;
  const toggles = [
    document.getElementById("themeToggle"),
    document.getElementById("themeToggle2"),
  ].filter(Boolean);

  const savedTheme = localStorage.getItem("theme") || "dark";
  html.setAttribute("data-theme", savedTheme);

  const updateIcons = (theme) => {
    const iconName = theme === "light" ? "dark_mode" : "light_mode";
    toggles.forEach((btn) => {
      const span = btn.querySelector("span");
      if (span) span.textContent = iconName;
    });
  };

  updateIcons(savedTheme);

  const switchTheme = () => {
    const currentTheme = html.getAttribute("data-theme");
    const newTheme = currentTheme === "light" ? "dark" : "light";

    html.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);

    updateIcons(newTheme);
  };

  toggles.forEach((btn) => {
    if (btn) btn.addEventListener("click", switchTheme);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initThemeSystem);
} else {
  initThemeSystem();
}

// ── Debug surface outlines ────────────────────────────────────────────────
(function initDebugSurfaces() {
  const STORAGE_KEY = "debugSurfaces";

  function syncButton(enabled) {
    const btn = document.getElementById("profileDebugSurfacesToggle");
    if (!btn) return;

    btn.setAttribute("aria-pressed", String(enabled));
    const icon = btn.querySelector(".material-symbols-outlined");
    if (icon) icon.textContent = enabled ? "border_outer" : "border_clear";
  }

  function setDebugSurfaces(enabled, persist = true) {
    document.body.classList.toggle("debug-surfaces", enabled);
    syncButton(enabled);

    if (!persist) return;
    try {
      localStorage.setItem(STORAGE_KEY, enabled ? "1" : "0");
    } catch { }
  }

  function toggleDebugSurfaces() {
    setDebugSurfaces(!document.body.classList.contains("debug-surfaces"));
  }

  window.setDebugSurfaces = setDebugSurfaces;
  window.syncDebugSurfacesToggle = () =>
    syncButton(document.body.classList.contains("debug-surfaces"));

  const init = () => {
    let enabled = false;
    try {
      enabled = localStorage.getItem(STORAGE_KEY) === "1";
    } catch { }

    setDebugSurfaces(enabled, false);
    document
      .getElementById("profileDebugSurfacesToggle")
      ?.addEventListener("click", toggleDebugSurfaces);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

// ── Empty-field class toggle (date/time inputs + default selects) ────
(function initEmptyFieldTracking() {
  const DATE_TIME = 'input[type="date"], input[type="time"]';
  const PLACEHOLDER_SELECTS = "#tripColor";
  const ALL = DATE_TIME + ", " + PLACEHOLDER_SELECTS;

  function sync(el) {
    el.classList.toggle("is-empty", !el.value);
  }
  function syncAll() {
    document.querySelectorAll(ALL).forEach(sync);
  }
  document.addEventListener("change", (e) => {
    if (e.target.matches(ALL)) sync(e.target);
  });
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", syncAll);
  } else {
    syncAll();
  }
  document.addEventListener("reset", () => requestAnimationFrame(syncAll));
  window.syncEmptyFields = syncAll;
})();

// ======================================================
// 2) CONFIG
// ======================================================
const CONFIG = {
  APP_NAME: "ETB Schedule",
  APP_VERSION: "",
  SUPABASE_URL: "https://rux-supabase-etb.rux-smercado.workers.dev",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5ZGVqZHN5eXV5enJ1dmRiZXlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5NzU0MjEsImV4cCI6MjA5NDU1MTQyMX0.LmjLOYZkwkc9vv72HS91UaJ8JgPHPznmUwwpL0cvyos",
  ENDPOINT:
    "https://script.google.com/macros/s/AKfycbzSsVByHnMuzdmaITv2Ht-q1hUQ0y5cVVIEzV6E-h7-1EhnVWJDYlhj5K4RhY0wldBk/exec",
  BUS_LANES: ["218", "763", "470", "133", "506", "746", "607", "897", "898", "474"],
  MONTHS: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  JSONP_TIMEOUT: 20000,

  WEEK_CACHE_MAX_AGE_MS: 5 * 60 * 1000,
  CONFLICT_DEFER_BARS_THRESHOLD: 70,
  CACHE_TTL_DRIVERS: 60 * 60 * 1000,
  CACHE_TTL_BUSES:   60 * 60 * 1000,
  AUTO_REFRESH_INTERVAL: 5 * 60 * 1000,
};

function getVersionLabel() {
  const version = String(CONFIG.APP_VERSION || "").trim();
  if (!version) return "";
  return `v${version}`;
}

function initAppVersionDisplay() {
  const versionLabel = getVersionLabel();
  const fullTitle = versionLabel ? `${CONFIG.APP_NAME} ${versionLabel}` : `${CONFIG.APP_NAME}`;

  document.title = fullTitle;

  const headerBadge = document.getElementById("appVersionBadge");
  if (headerBadge) {
    headerBadge.textContent = versionLabel;
    headerBadge.classList.toggle("u-hidden", !versionLabel);
  }

  const menuItem = document.getElementById("appVersionMenuItem");
  if (menuItem) {
    menuItem.textContent = versionLabel ? `Version ${versionLabel}` : "Version";
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAppVersionDisplay);
} else {
  initAppVersionDisplay();
}

const CACHE = {
  get(key) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (Date.now() > data.expiry) {
        localStorage.removeItem(key);
        return null;
      }
      return data.value;
    } catch {
      return null;
    }
  },
  set(key, value, ttlMs) {
    try {
      const payload = {
        value,
        expiry: Date.now() + ttlMs,
      };
      localStorage.setItem(key, JSON.stringify(payload));
    } catch { }
  },
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch { }
  },
  clearAll() {
    try {
      Object.keys(localStorage).forEach((k) => {
        if (k.startsWith("cache_") || k.startsWith("week_")) {
          localStorage.removeItem(k);
        }
      });
    } catch { }
  },
};
