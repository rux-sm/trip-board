// ======================================================
// AUTH — Supabase session gate
// Runs before app.js boot. Resolves _authGate when the
// user has a valid session, blocking API calls until then.
// ======================================================

window._authGate = (async () => {
  const overlay  = document.getElementById("loginOverlay");
  const form     = document.getElementById("loginForm");
  const emailEl  = document.getElementById("loginEmail");
  const passEl   = document.getElementById("loginPassword");
  const errorEl  = document.getElementById("loginError");
  const btn      = document.getElementById("loginBtn");

  // If there's already a valid session, skip the login screen.
  const { data: { session } } = await _sb.auth.getSession();
  if (session) {
    if (overlay) overlay.style.display = "none";
    return;
  }

  // Session exists — start real-time immediately
  if (session) {
    if (overlay) overlay.style.display = "none";
    if (typeof initRealtime === "function") initRealtime();
    return;
  }

  // No session — show the login overlay.
  if (overlay) overlay.style.display = "flex";

  // Return a promise that resolves only after successful login.
  return new Promise((resolve) => {
    function showError(msg) {
      if (!errorEl) return;
      errorEl.textContent = msg;
      errorEl.style.display = "block";
    }

    function clearError() {
      if (errorEl) errorEl.style.display = "none";
    }

    form?.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearError();
      if (btn) { btn.disabled = true; btn.textContent = "Signing in…"; }

      const email    = emailEl?.value?.trim() || "";
      const password = passEl?.value || "";

      const { error } = await _sb.auth.signInWithPassword({ email, password });

      if (error) {
        showError(error.message || "Sign in failed. Check your email and password.");
        if (btn) { btn.disabled = false; btn.textContent = "Sign in"; }
        return;
      }

      // Success — hide overlay, start real-time, let the app boot.
      if (overlay) overlay.style.display = "none";
      if (typeof initRealtime === "function") initRealtime();
      resolve();
    });
  });
})();

// ── Logout helper — call signOut() from Settings menu ────────────────────────
async function authSignOut() {
  await _sb.auth.signOut();
  window.location.reload();
}
