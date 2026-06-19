/**
 * PocketPetal shared frontend — layout, auth, formatting
 */
(function () {
  const TOKEN_KEY = 'pocketpetal_token';
  const REFRESH_TOKEN_KEY = 'pocketpetal_refresh_token';
  const USER_KEY = 'pocketpetal_user';
  const PROFILE_KEY = 'pocketpetal_profile';
  const BUDGET_LIMIT = 35000;

  let _isRefreshing = false;
  let _refreshQueue = [];

  /**
   * Wrapper around fetch that automatically injects the auth header
   * and refreshes the token on 401 responses.
   */
  async function authFetch(url, options = {}) {
    const token = localStorage.getItem(TOKEN_KEY);
    const headers = { ...(options.headers || {}) };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(url, { ...options, headers });

    if (res.status === 401) {
      // Try refreshing the token
      const newToken = await tryRefreshToken();
      if (newToken) {
        headers['Authorization'] = `Bearer ${newToken}`;
        return fetch(url, { ...options, headers });
      }
      // Refresh failed — force re-login
      logout();
      return res;
    }
    return res;
  }

  async function tryRefreshToken() {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refreshToken) return null;

    // If already refreshing, wait for that to finish
    if (_isRefreshing) {
      return new Promise((resolve) => _refreshQueue.push(resolve));
    }

    _isRefreshing = true;
    try {
      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem(TOKEN_KEY, data.data.accessToken);
        if (data.data.refreshToken) {
          localStorage.setItem(REFRESH_TOKEN_KEY, data.data.refreshToken);
        }
        // Resolve all queued requests
        _refreshQueue.forEach((cb) => cb(data.data.accessToken));
        _refreshQueue = [];
        return data.data.accessToken;
      }
      return null;
    } catch {
      return null;
    } finally {
      _isRefreshing = false;
    }
  }

  const NAV = [
    { page: 'dashboard', href: '/index.html', emoji: '🏠', label: 'Dashboard' },
    { page: 'upload', href: '/upload.html', emoji: '📸', label: 'Upload Expenses' },
    { page: 'manual', href: '/manual.html', emoji: '✍️', label: 'Manual Entry' },
    { page: 'categories', href: '/categories.html', emoji: '🏷', label: 'Categories' },
  ];

  const NUDGES = [
    'Every rupee you log is a quiet act of self-care.',
    'Small petals, steady roots — your garden grows.',
    'Tracking today plants tomorrow\'s peace of mind.',
    'Your spending story deserves gentle attention.',
  ];

  const CATEGORY_EMOJI = {
    food: '🍜', groceries: '🛒', 'dining out': '🍽', shopping: '🛍',
    health: '💊', wellness: '🧘', bills: '📄', transport: '🚕',
    entertainment: '🎬', creativity: '🎨', savings: '🌷', essential: '🍵',
  };

  function getDisplayName() {
    const user = getUser();
    if (!user.email) return 'Friend';
    const raw = user.email.split('@')[0];
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  }

  function getUser() {
    try { return JSON.parse(localStorage.getItem(USER_KEY) || '{}'); }
    catch { return {}; }
  }

  function getProfile() {
    try { return JSON.parse(localStorage.getItem(PROFILE_KEY) || '{"theme":"Matcha Strawberry"}'); }
    catch { return { theme: 'Matcha Strawberry' }; }
  }

  function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }

  function formatDate() {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric',
    });
  }

  function formatMoney(amount) {
    const n = Number(amount) || 0;
    return '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 0 });
  }

  function formatMoneyFull(amount) {
    const n = Number(amount) || 0;
    return '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  }

  function categoryEmoji(name) {
    const key = (name || '').toLowerCase();
    for (const [k, emoji] of Object.entries(CATEGORY_EMOJI)) {
      if (key.includes(k)) return emoji;
    }
    return '🌸';
  }

  function renderSidebar(activePage) {
    const name = getDisplayName();
    const initial = name.charAt(0).toUpperCase();
    const nudge = NUDGES[new Date().getDate() % NUDGES.length];

    const navHtml = NAV.map((item) => `
      <a href="${item.href}" class="pp-nav-item${item.page === activePage ? ' active' : ''}">
        <span class="pp-nav-emoji">${item.emoji}</span>
        <span>${item.label}</span>
      </a>
    `).join('');

    return `
      <aside class="pp-sidebar" id="pp-sidebar">
        <div class="pp-brand">
          <span class="pp-brand-icon">🍓</span>
          <div>
            <h1 class="pp-brand-title">PocketPetal</h1>
            <p class="pp-brand-sub">little finance journal</p>
          </div>
        </div>
        <div class="pp-nav-label">Workspace</div>
        <nav class="pp-nav">${navHtml}</nav>
        <div class="pp-nudge">
          <div class="pp-nudge-label">daily nudge</div>
          <p class="pp-nudge-text">"${nudge}"</p>
        </div>
        <div class="pp-user-card">
          <div class="pp-avatar">${initial}</div>
          <div>
            <p class="pp-user-name">${name}</p>
            <p class="pp-user-plan">free plan · ✨</p>
          </div>
        </div>
        <button class="pp-logout-btn" type="button" id="pp-logout-btn">Log out</button>
      </aside>
    `;
  }

  function renderShell(activePage, pageTitle) {
    const contentEl = document.getElementById('pp-page-content');
    if (!contentEl) return;

    const app = document.createElement('div');
    app.className = 'pp-app';
    app.innerHTML = `
      ${renderSidebar(activePage)}
      <div class="pp-overlay" id="pp-overlay"></div>
      <main class="pp-main">
        <header class="pp-topbar">
          <button class="pp-mobile-toggle" id="pp-mobile-toggle" type="button" aria-label="Toggle menu">☰</button>
          <span style="font-weight:700;color:var(--pp-text-muted);font-size:0.85rem">${pageTitle || ''}</span>
          <span style="font-size:0.8rem;color:var(--pp-text-muted)">${formatDate()}</span>
        </header>
        <div class="pp-content" id="pp-content-mount"></div>
      </main>
    `;

    document.body.insertBefore(app, contentEl);
    app.querySelector('#pp-content-mount').appendChild(contentEl);
    contentEl.style.display = 'block';

    document.getElementById('pp-logout-btn')?.addEventListener('click', logout);

    const toggle = document.getElementById('pp-mobile-toggle');
    const sidebar = document.getElementById('pp-sidebar');
    const overlay = document.getElementById('pp-overlay');
    const close = () => {
      sidebar?.classList.remove('open');
      overlay?.classList.remove('open');
    };
    toggle?.addEventListener('click', () => {
      sidebar?.classList.toggle('open');
      overlay?.classList.toggle('open');
    });
    overlay?.addEventListener('click', close);
  }

  function requireAuth() {
    if (!localStorage.getItem(TOKEN_KEY)) {
      window.location.href = '/login.html';
      return false;
    }
    return true;
  }

  function logout() {
    localStorage.clear();
    window.location.href = '/login.html';
  }

  function populateHero() {
    const greetingEl = document.getElementById('pp-greeting');
    const dateEl = document.getElementById('pp-date');
    const name = getDisplayName();
    if (greetingEl) {
      greetingEl.innerHTML = `${getGreeting()}, <span class="pp-serif">${name}</span> 🌸`;
    }
    if (dateEl) dateEl.textContent = formatDate();
  }

  async function setTheme(themeName) {
    if (!localStorage.getItem(TOKEN_KEY)) return;
    try {
      const res = await authFetch('/api/auth/profile/theme', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: themeName }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem(PROFILE_KEY, JSON.stringify(data.data));
      }
    } catch (e) { console.error(e); }
  }

  function init() {
    const authRequired = document.body.dataset.authRequired === 'true';
    if (authRequired && !requireAuth()) return;

    const activePage = document.body.dataset.page || 'dashboard';
    const pageTitle = document.body.dataset.pageTitle || '';
    if (document.getElementById('pp-page-content')) {
      renderShell(activePage, pageTitle);
    }
    populateHero();
  }

  window.PocketPetal = {
    getToken: () => localStorage.getItem(TOKEN_KEY),
    getUser, getProfile, getDisplayName, getGreeting, formatDate,
    formatMoney, formatMoneyFull, categoryEmoji,
    requireAuth, logout, setTheme, populateHero, init, authFetch,
    BUDGET_LIMIT, NAV, CATEGORY_EMOJI,
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
