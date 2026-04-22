/* ============================================================
   MAIN.JS — Navbar, Toast, Modal, Shared Utilities
   ============================================================ */

/* ── ERROR MESSAGE EXTRACTOR ── */
function getErrorMessage(err) {
  if (!err) return 'Something went wrong';
  if (typeof err === 'string') return err;
  if (Array.isArray(err.message)) return err.message.join('. ');
  if (err.message) return err.message;
  return 'Something went wrong';
}

/* ── HTML ESCAPE ── */
function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ── DATE FORMAT ── */
function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const day = Math.floor(h / 24);
  if (day < 30) return `${day}d ago`;
  return formatDate(dateStr);
}

/* ── BADGE HELPER ── */
function statusBadge(status) {
  const map = {
    OPEN:      'badge-green',
    CLOSED:    'badge-gray',
    PENDING:   'badge-yellow',
    ACCEPTED:  'badge-green',
    REJECTED:  'badge-red',
    WITHDRAWN: 'badge-gray',
    CLIENT:    'badge-blue',
    FREELANCER:'badge-dark',
    ADMIN:     'badge-red',
  };
  const icons = {
    OPEN: '🟢', CLOSED: '🔒',
    PENDING: '⏳', ACCEPTED: '✅', REJECTED: '❌', WITHDRAWN: '↩️',
    CLIENT: '🏢', FREELANCER: '💼', ADMIN: '🛡️',
  };
  const cls = map[status] || 'badge-gray';
  return `<span class="badge ${cls}">${icons[status] || ''} ${status}</span>`;
}

/* ── TOAST SYSTEM ── */
let _toastContainer;
function _getToastContainer() {
  if (!_toastContainer) {
    _toastContainer = document.createElement('div');
    _toastContainer.className = 'toast-container';
    document.body.appendChild(_toastContainer);
  }
  return _toastContainer;
}

function showToast(message, type = 'info', duration = 4000) {
  const container = _getToastContainer();
  const icons = { success: '✓', error: '✕', info: 'ℹ' };
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || icons.info}</span>
    <span class="toast-body">${escHtml(message)}</span>
    <button class="toast-close" onclick="this.closest('.toast').remove()">✕</button>
  `;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), duration);
}

/* ── MODAL SYSTEM ── */
function openModal(id) {
  const el = document.getElementById(id);
  if (el) { el.classList.add('open'); document.body.style.overflow = 'hidden'; }
}
function closeModal(id) {
  const el = document.getElementById(id);
  if (el) { el.classList.remove('open'); document.body.style.overflow = ''; }
}

// Close modal on overlay click
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('open');
    document.body.style.overflow = '';
  }
});
// Close modal on X button
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-close') || e.target.closest('.modal-close')) {
    const overlay = e.target.closest('.modal-overlay');
    if (overlay) { overlay.classList.remove('open'); document.body.style.overflow = ''; }
  }
});

/* ── CONFIRM DIALOG ── */
function showConfirm({ title = 'Are you sure?', message = '', confirmText = 'Delete', onConfirm, dangerous = true }) {
  // Remove existing
  document.getElementById('_confirmModal')?.remove();

  const modal = document.createElement('div');
  modal.className = 'modal-overlay open';
  modal.id = '_confirmModal';
  modal.innerHTML = `
    <div class="modal" style="max-width:400px">
      <div class="modal-header">
        <h3>${escHtml(title)}</h3>
        <button class="modal-close">✕</button>
      </div>
      <div class="modal-body">
        <p class="confirm-text">${message}</p>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" id="_confirmCancel">Cancel</button>
        <button class="btn ${dangerous ? 'btn-danger' : 'btn-primary'}" id="_confirmOk">${escHtml(confirmText)}</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';

  const remove = () => { modal.remove(); document.body.style.overflow = ''; };
  modal.querySelector('#_confirmCancel').addEventListener('click', remove);
  modal.querySelector('.modal-close').addEventListener('click', remove);
  modal.addEventListener('click', e => { if (e.target === modal) remove(); });
  modal.querySelector('#_confirmOk').addEventListener('click', () => {
    remove();
    if (onConfirm) onConfirm();
  });
}

/* ── SET BUTTON LOADING STATE ── */
function setBtnLoading(btn, loading, text = '') {
  if (!btn) return;
  if (loading) {
    btn._origText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner spinner-sm"></span>${text ? ' ' + text : ''}`;
  } else {
    btn.disabled = false;
    btn.innerHTML = btn._origText || text;
  }
}

/* ── SHOW / HIDE ALERT ── */
function showAlert(elId, message, type = 'danger') {
  const el = document.getElementById(elId);
  if (!el) return;
  el.className = `alert alert-${type}`;
  el.innerHTML = message;
  el.classList.remove('hidden');
}
function hideAlert(elId) {
  const el = document.getElementById(elId);
  if (el) el.classList.add('hidden');
}

/* ── NAVBAR RENDERER ── */
function renderNavbar(activePage) {
  const user = Auth.getUser();
  const loggedIn = Auth.isLoggedIn();
  const role = Auth.getRole();

  const links = [];
  if (!loggedIn) {
    links.push({ href: 'index.html',  label: 'Home',  id: 'home' });
    links.push({ href: 'jobs.html',   label: 'Browse Jobs', id: 'jobs' });
  } else if (role === 'CLIENT') {
    links.push({ href: 'jobs.html',      label: 'Browse Jobs', id: 'jobs' });
    links.push({ href: 'dashboard.html', label: 'Dashboard',   id: 'dashboard' });
  } else if (role === 'FREELANCER') {
    links.push({ href: 'jobs.html',      label: 'Find Jobs',   id: 'jobs' });
    links.push({ href: 'dashboard.html', label: 'My Proposals',id: 'dashboard' });
  } else if (role === 'ADMIN') {
    links.push({ href: 'jobs.html', label: 'Jobs', id: 'jobs' });
    links.push({ href: 'admin.html', label: 'Admin Panel', id: 'admin' });
  }

  const linksHtml = links.map(l =>
    `<a href="${l.href}" class="nav-link${activePage === l.id ? ' active' : ''}">${l.label}</a>`
  ).join('');

  const mobileLinksHtml = links.map(l =>
    `<a href="${l.href}" class="nav-link${activePage === l.id ? ' active' : ''}">${l.label}</a>`
  ).join('');

  let actionsHtml;
  if (!loggedIn) {
    actionsHtml = `
      <a href="login.html"    class="btn btn-ghost btn-sm">Sign In</a>
      <a href="register.html" class="btn btn-primary btn-sm">Get Started</a>
    `;
  } else {
    const initials = Auth.initials();
    const name     = Auth.displayName();
    actionsHtml = `
      <div class="user-menu" id="userMenu">
        <button class="user-btn" id="userMenuBtn" onclick="_toggleUserMenu()">
          <div class="user-avatar">${escHtml(initials)}</div>
          <span class="user-name">${escHtml(name)}</span>
          <span style="color:var(--gray-400);font-size:.7rem">▼</span>
        </button>
        <div class="dropdown-menu" id="userDropdown">
          <a class="dropdown-item" href="profile.html">
            <span class="icon">👤</span> My Profile
          </a>
          ${role === 'ADMIN'
            ? `<a class="dropdown-item" href="admin.html"><span class="icon">⚙️</span> Admin Panel</a>`
            : `<a class="dropdown-item" href="dashboard.html"><span class="icon">📊</span> Dashboard</a>`
          }
          <div class="dropdown-divider"></div>
          <button class="dropdown-item danger" onclick="_doLogout()">
            <span class="icon">🚪</span> Sign Out
          </button>
        </div>
      </div>
    `;
  }

  const html = `
    <nav class="navbar">
      <div class="container">
        <a href="index.html" class="nav-brand">Work<span>Hub</span></a>
        <div class="nav-links">${linksHtml}</div>
        <div class="nav-actions">
          <div class="nav-desktop-only" style="display:flex;gap:8px;align-items:center">${actionsHtml}</div>
          <button class="hamburger" id="hamburgerBtn" onclick="_toggleMobileNav()" aria-label="Menu">
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
    </nav>
    <div class="mobile-nav" id="mobileNav">
      ${mobileLinksHtml}
      <div class="divider"></div>
      ${!loggedIn
        ? `<a href="login.html" class="nav-link">Sign In</a>
           <a href="register.html" class="nav-link" style="color:var(--primary)">Get Started</a>`
        : `<a href="profile.html" class="nav-link">👤 My Profile</a>
           ${role === 'ADMIN' ? `<a href="admin.html" class="nav-link">⚙️ Admin Panel</a>` : `<a href="dashboard.html" class="nav-link">📊 Dashboard</a>`}
           <button class="nav-link" style="color:var(--danger);text-align:left;width:100%" onclick="_doLogout()">🚪 Sign Out</button>`
      }
    </div>
  `;

  const navbarEl = document.getElementById('navbar');
  if (navbarEl) navbarEl.outerHTML = html;
  else {
    const div = document.createElement('div');
    div.innerHTML = html;
    document.body.prepend(div.firstElementChild);
  }

  // Ensure .nav-desktop-only is visible on desktop
  const desktopOnly = document.querySelector('.nav-desktop-only');
  if (desktopOnly) desktopOnly.style.display = window.innerWidth > 768 ? 'flex' : 'none';
}

/* ── MOBILE NAV TOGGLE ── */
function _toggleMobileNav() {
  const nav = document.getElementById('mobileNav');
  if (nav) nav.classList.toggle('open');
}

/* ── USER MENU TOGGLE ── */
function _toggleUserMenu() {
  const menu = document.getElementById('userDropdown');
  if (menu) menu.classList.toggle('open');
}
// Close dropdown on outside click
document.addEventListener('click', (e) => {
  if (!e.target.closest('#userMenu')) {
    document.getElementById('userDropdown')?.classList.remove('open');
  }
});

/* ── LOGOUT ── */
async function _doLogout() {
  try { await AuthAPI.logout(); } catch (_) {}
  Auth.clear();
  window.location.href = 'index.html';
}

/* ── REQUIRE AUTH GUARDS ── */
function requireAuth() {
  if (!Auth.isLoggedIn()) { window.location.href = 'login.html'; return false; }
  return true;
}
function requireAdmin() {
  if (!Auth.isLoggedIn() || !Auth.isAdmin()) { window.location.href = 'login.html'; return false; }
  return true;
}
function requireClient() {
  if (!Auth.isLoggedIn() || !Auth.isClient()) { window.location.href = 'login.html'; return false; }
  return true;
}
function redirectIfLoggedIn() {
  if (Auth.isLoggedIn()) {
    const role = Auth.getRole();
    if (role === 'ADMIN') { window.location.href = 'admin.html'; return true; }
    window.location.href = 'dashboard.html';
    return true;
  }
  return false;
}

/* ── HANDLE WINDOW RESIZE ── */
window.addEventListener('resize', () => {
  const desktopOnly = document.querySelector('.nav-desktop-only');
  if (desktopOnly) desktopOnly.style.display = window.innerWidth > 768 ? 'flex' : 'none';
});
