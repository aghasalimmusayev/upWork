/* ============================================================
   API.JS — Base URL, Auth helpers, Fetch wrapper, API modules
   ============================================================ */

const BASE_URL = 'http://localhost:3014';

/* ── AUTH HELPERS ── */
const Auth = {
  getToken:   () => localStorage.getItem('accessToken'),
  getUser:    () => { const u = localStorage.getItem('user'); return u ? JSON.parse(u) : null; },
  getRole:    () => localStorage.getItem('role'),
  isLoggedIn: () => !!localStorage.getItem('accessToken'),
  isAdmin:    () => localStorage.getItem('role') === 'ADMIN',
  isClient:   () => localStorage.getItem('role') === 'CLIENT',
  isFreelancer: () => localStorage.getItem('role') === 'FREELANCER',

  setSession(user, accessToken) {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('role', user.role);
  },

  clear() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
  },

  initials() {
    const u = this.getUser();
    if (!u) return '?';
    return ((u.name?.[0] || '') + (u.surname?.[0] || '')).toUpperCase() || u.email[0].toUpperCase();
  },

  displayName() {
    const u = this.getUser();
    if (!u) return '';
    return u.name ? `${u.name} ${u.surname || ''}`.trim() : u.email;
  }
};

/* ── REFRESH TOKEN ── */
async function _doRefresh() {
  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!res.ok) return false;
  const data = await res.json();
  if (data.accessToken) {
    localStorage.setItem('accessToken', data.accessToken);
    const profile = await fetch(`${BASE_URL}/auth/profile`, {
      headers: { 'Authorization': `Bearer ${data.accessToken}` },
      credentials: 'include',
    });
    if (profile.ok) {
      const userData = await profile.json();
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('role', userData.role);
    }
    return true;
  }
  return false;
}

/* ── FETCH WRAPPER ── */
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
    try {
      const refreshed = await _doRefresh();
      if (refreshed) {
        headers['Authorization'] = `Bearer ${Auth.getToken()}`;
        const retry = await fetch(`${BASE_URL}${path}`, { ...options, headers, credentials: 'include' });
        if (!retry.ok) { const e = await retry.json().catch(() => ({ message: 'Something went wrong' })); throw e; }
        return retry.status === 204 ? null : retry.json();
      }
    } catch (_) {}
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

/* ── AUTH API ── */
const AuthAPI = {
  register:   (data) => apiFetch('/auth/register',  { method: 'POST', body: JSON.stringify(data) }),
  login:      (data) => apiFetch('/auth/login',     { method: 'POST', body: JSON.stringify(data) }),
  logout:     ()     => apiFetch('/auth/logout',    { method: 'POST' }),
  logoutAll:  ()     => apiFetch('/auth/logoutall', { method: 'POST' }),
  profile:    ()     => apiFetch('/auth/profile'),
};

/* ── USERS API ── */
const UsersAPI = {
  getAll:          ()          => apiFetch('/users/all'),
  update:          (id, data)  => apiFetch(`/users/${id}`,          { method: 'PATCH', body: JSON.stringify(data) }),
  changePassword:  (id, data)  => apiFetch(`/users/password/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  remove:          (id)        => apiFetch(`/users/${id}`,          { method: 'DELETE' }),
};

/* ── JOBS API ── */
const JobsAPI = {
  create:      (data)      => apiFetch('/jobs',              { method: 'POST',  body: JSON.stringify(data) }),
  getAll:      ()          => apiFetch('/jobs'),
  getOne:      (id)        => apiFetch(`/jobs/${id}`),
  update:      (id, data)  => apiFetch(`/jobs/${id}`,        { method: 'PATCH', body: JSON.stringify(data) }),
  updateStatus:(id, data)  => apiFetch(`/jobs/status/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  remove:      (id)        => apiFetch(`/jobs/${id}`,        { method: 'DELETE' }),
  adminDelete: (id)        => apiFetch(`/jobs/admin/${id}`,  { method: 'DELETE' }),
};

/* ── PROPOSALS API ── */
const ProposalsAPI = {
  create:       (jobId, data) => apiFetch(`/proposals/jobs/${jobId}`, { method: 'POST',  body: JSON.stringify(data) }),
  getAll:       ()            => apiFetch('/proposals'),
  getOne:       (id)          => apiFetch(`/proposals/${id}`),
  update:       (id, data)    => apiFetch(`/proposals/${id}`,          { method: 'PATCH', body: JSON.stringify(data) }),
  updateStatus: (id, data)    => apiFetch(`/proposals/status/${id}`,   { method: 'PATCH', body: JSON.stringify(data) }),
  remove:       (id)          => apiFetch(`/proposals/${id}`,          { method: 'DELETE' }),
  adminDelete:  (id)          => apiFetch(`/proposals/admin/${id}`,    { method: 'DELETE' }),
};
