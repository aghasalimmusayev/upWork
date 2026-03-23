// ===== API CONFIG =====
const BASE_URL = 'http://localhost:3014';

// ===== TOKEN HELPERS =====
const Auth = {
  getToken: () => localStorage.getItem('accessToken'),
  getUser: () => {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  },
  getRole: () => localStorage.getItem('role'),
  setSession: (user, token) => {
    localStorage.setItem('accessToken', token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('role', user.role);
  },
  clear: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
  },
  isLoggedIn: () => !!localStorage.getItem('accessToken'),
  isAdmin: () => localStorage.getItem('role') === 'ADMIN',
  isClient: () => localStorage.getItem('role') === 'CLIENT',
  isFreelancer: () => localStorage.getItem('role') === 'FREELANCER',
};

// ===== FETCH WRAPPER =====
async function apiFetch(path, options = {}) {
  const token = Auth.getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (res.status === 401) {
    // Try refresh
    try {
      const refreshed = await refreshToken();
      if (refreshed) {
        headers['Authorization'] = `Bearer ${Auth.getToken()}`;
        const retryRes = await fetch(`${BASE_URL}${path}`, { ...options, headers, credentials: 'include' });
        if (!retryRes.ok) throw await retryRes.json();
        return retryRes.status === 204 ? null : retryRes.json();
      }
    } catch {}
    Auth.clear();
    window.location.href = 'login.html';
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Something went wrong' }));
    throw err;
  }
  if (res.status === 204) return null;
  return res.json();
}

async function refreshToken() {
  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!res.ok) return false;
  const data = await res.json();
  if (data.accessToken) {
    localStorage.setItem('accessToken', data.accessToken);
    return true;
  }
  return false;
}

// ===== AUTH API =====
const AuthAPI = {
  register: (data) => apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  logout: () => apiFetch('/auth/logout', { method: 'POST' }),
  logoutAll: () => apiFetch('/auth/logoutall', { method: 'POST' }),
  profile: () => apiFetch('/auth/profile'),
};

// ===== USERS API =====
const UsersAPI = {
  getAll: () => apiFetch('/users/all'),
  update: (id, data) => apiFetch(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  changePassword: (id, data) => apiFetch(`/users/password/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id) => apiFetch(`/users/${id}`, { method: 'DELETE' }),
};

// ===== JOBS API =====
const JobsAPI = {
  getAll: () => apiFetch('/jobs'),
  getOne: (id) => apiFetch(`/jobs/${id}`),
  create: (data) => apiFetch('/jobs', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiFetch(`/jobs/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  updateStatus: (id, status) => apiFetch(`/jobs/status/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  delete: (id) => apiFetch(`/jobs/${id}`, { method: 'DELETE' }),
  adminDelete: (id) => apiFetch(`/jobs/admin/${id}`, { method: 'DELETE' }),
};

// ===== PROPOSALS API =====
const ProposalsAPI = {
  getAll: () => apiFetch('/proposals'),
  getOne: (id) => apiFetch(`/proposals/${id}`),
  create: (jobId, data) => apiFetch(`/proposals/jobs/${jobId}`, { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiFetch(`/proposals/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  updateStatus: (id, status) => apiFetch(`/proposals/status/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  delete: (id) => apiFetch(`/proposals/${id}`, { method: 'DELETE' }),
  adminDelete: (id) => apiFetch(`/proposals/admin/${id}`, { method: 'DELETE' }),
};

// ===== TOAST =====
function showToast(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span><span>${message}</span>`;
  container.appendChild(toast);
  toast.addEventListener('click', () => toast.remove());
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity .3s'; setTimeout(() => toast.remove(), 300); }, 3500);
}

// ===== MODAL =====
function openModal(id) {
  const m = document.getElementById(id);
  if (m) { m.classList.add('open'); document.body.style.overflow = 'hidden'; }
}
function closeModal(id) {
  const m = document.getElementById(id);
  if (m) { m.classList.remove('open'); document.body.style.overflow = ''; }
}
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('open');
    document.body.style.overflow = '';
  }
  if (e.target.classList.contains('modal-close') || e.target.closest('.modal-close')) {
    const overlay = e.target.closest('.modal-overlay');
    if (overlay) { overlay.classList.remove('open'); document.body.style.overflow = ''; }
  }
});

// ===== CONFIRM DIALOG =====
function confirmDialog(message) {
  return new Promise((resolve) => {
    const overlay = document.getElementById('confirmModal');
    if (!overlay) { resolve(window.confirm(message)); return; }
    document.getElementById('confirmText').textContent = message;
    openModal('confirmModal');
    const yes = document.getElementById('confirmYes');
    const no = document.getElementById('confirmNo');
    const handler = (result) => {
      closeModal('confirmModal');
      yes.removeEventListener('click', yesH);
      no.removeEventListener('click', noH);
      resolve(result);
    };
    const yesH = () => handler(true);
    const noH = () => handler(false);
    yes.addEventListener('click', yesH);
    no.addEventListener('click', noH);
  });
}

// ===== HELPERS =====
function getErrorMessage(err) {
  if (typeof err === 'string') return err;
  if (err?.message) return Array.isArray(err.message) ? err.message.join(', ') : err.message;
  return 'Xəta baş verdi';
}

function formatDate(d) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('az-AZ', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function getInitials(name, surname) {
  return ((name?.[0] || '') + (surname?.[0] || '')).toUpperCase() || '?';
}

function badgeForStatus(status) {
  const map = {
    OPEN: 'badge-success', CLOSED: 'badge-gray',
    PENDING: 'badge-warning', ACCEPTED: 'badge-success',
    REJECTED: 'badge-danger', WITHDRAWN: 'badge-gray',
    CLIENT: 'badge-info', FREELANCER: 'badge-primary', ADMIN: 'badge-danger',
    FIXED: 'badge-info', HOURLY: 'badge-primary',
  };
  return `badge ${map[status] || 'badge-gray'}`;
}

// Guard functions
function requireAuth(redirectTo = 'login.html') {
  if (!Auth.isLoggedIn()) { window.location.href = redirectTo; return false; }
  return true;
}
function requireGuest(redirectTo = 'dashboard.html') {
  if (Auth.isLoggedIn()) {
    if (Auth.isAdmin()) { window.location.href = 'admin.html'; return false; }
    window.location.href = redirectTo;
    return false;
  }
  return true;
}
function requireAdmin() {
  if (!Auth.isLoggedIn()) { window.location.href = 'login.html'; return false; }
  if (!Auth.isAdmin()) { window.location.href = 'dashboard.html'; return false; }
  return true;
}

// Navbar render
function renderNavbar(activePage = '') {
  const user = Auth.getUser();
  const isLoggedIn = Auth.isLoggedIn();
  const navEl = document.getElementById('navbar');
  if (!navEl) return;

  const links = isLoggedIn ? (
    Auth.isAdmin()
      ? `<a href="admin.html" class="${activePage === 'admin' ? 'active' : ''}">⚙️ Admin Panel</a>`
      : `
        <a href="dashboard.html" class="${activePage === 'dashboard' ? 'active' : ''}">🏠 Ana Səhifə</a>
        <a href="jobs.html" class="${activePage === 'jobs' ? 'active' : ''}">💼 İşlər</a>
        ${Auth.isFreelancer() ? `<a href="proposals.html" class="${activePage === 'proposals' ? 'active' : ''}">📄 Müraciətlərim</a>` : ''}
      `
  ) : `
    <a href="jobs.html" class="${activePage === 'jobs' ? 'active' : ''}">💼 İşlər</a>
  `;

  const actions = isLoggedIn ? `
    <div class="dropdown">
      <button class="d-flex align-center gap-8 btn btn-ghost" id="userMenuBtn">
        <div class="avatar" style="width:32px;height:32px;font-size:.85rem">${getInitials(user?.name, user?.surname)}</div>
        <span class="nav-desktop-only" style="font-size:.85rem;font-weight:600">${user?.name || 'İstifadəçi'}</span>
        <span>▾</span>
      </button>
      <div class="dropdown-menu" id="userDropdown">
        <a href="profile.html" class="dropdown-item">👤 Profilim</a>
        ${Auth.isAdmin() ? `<a href="admin.html" class="dropdown-item">⚙️ Admin Panel</a>` : ''}
        <div class="dropdown-divider"></div>
        <button class="dropdown-item danger" id="logoutBtn">🚪 Çıxış</button>
      </div>
    </div>
  ` : `
    <a href="login.html" class="btn btn-ghost nav-desktop-only">Giriş</a>
    <a href="register.html" class="btn btn-primary">Qeydiyyat</a>
  `;

  navEl.innerHTML = `
    <nav class="navbar">
      <div class="container">
        <a href="${isLoggedIn && !Auth.isAdmin() ? 'dashboard.html' : 'index.html'}" class="nav-brand">Free<span>Lance</span></a>
        <div class="nav-links">${links}</div>
        <div class="nav-actions">
          ${actions}
          <button class="hamburger" id="hamburgerBtn">
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
      <div class="mobile-menu" id="mobileMenu">
        ${links.replace(/class="/g, 'class="')}
        ${!isLoggedIn ? `
          <a href="login.html">Giriş</a>
          <a href="register.html">Qeydiyyat</a>
        ` : `
          <a href="profile.html">👤 Profilim</a>
          <a href="#" id="mobileLogout">🚪 Çıxış</a>
        `}
      </div>
    </nav>
  `;

  // Hamburger
  document.getElementById('hamburgerBtn')?.addEventListener('click', () => {
    document.getElementById('mobileMenu')?.classList.toggle('open');
  });

  // Dropdown
  document.getElementById('userMenuBtn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    document.getElementById('userDropdown')?.classList.toggle('open');
  });
  document.addEventListener('click', () => {
    document.getElementById('userDropdown')?.classList.remove('open');
  });

  // Logout
  document.getElementById('logoutBtn')?.addEventListener('click', handleLogout);
  document.getElementById('mobileLogout')?.addEventListener('click', handleLogout);
}

async function handleLogout() {
  try { await AuthAPI.logout(); } catch {}
  Auth.clear();
  window.location.href = 'login.html';
}

// Confirm Modal HTML (append to body)
function appendConfirmModal() {
  const el = document.createElement('div');
  el.innerHTML = `
    <div class="modal-overlay" id="confirmModal">
      <div class="modal" style="max-width:380px">
        <div class="modal-header"><h3>Təsdiqləyin</h3><button class="modal-close">✕</button></div>
        <div class="modal-body"><p class="confirm-dialog-text" id="confirmText"></p></div>
        <div class="modal-footer">
          <button class="btn btn-ghost" id="confirmNo">Xeyr</button>
          <button class="btn btn-danger" id="confirmYes">Bəli, Sil</button>
        </div>
      </div>
    </div>`;
  document.body.appendChild(el.firstElementChild);
}

document.addEventListener('DOMContentLoaded', appendConfirmModal);
