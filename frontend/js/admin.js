/* ============================================================
   ADMIN.JS — Admin panel: users, jobs, proposals management
   ============================================================ */

if (!requireAdmin()) throw new Error('Admin required');

let allUsers     = [];
let allJobs      = [];
let allProposals = [];

// ── INIT ──
(async function init() {
  renderNavbar('admin');
  await loadAll();
})();

// ── LOAD ALL DATA ──
async function loadAll() {
  try {
    [allUsers, allJobs, allProposals] = await Promise.all([
      UsersAPI.getAll(),
      JobsAPI.getAll(),
      ProposalsAPI.getAll(),
    ]);
    renderStats();
    renderOverviewTables();
    renderUsers(allUsers);
    renderJobs(allJobs);
    renderProposals(allProposals);
  } catch (err) {
    showToast('Failed to load data: ' + getErrorMessage(err), 'error');
    document.getElementById('adminStats').innerHTML =
      `<p class="text-muted">Could not load stats. Make sure the backend is running.</p>`;
  }
}

// ── SECTION SWITCH ──
function showSection(name, btn) {
  document.querySelectorAll('.admin-section').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.admin-sidebar-link').forEach(el => el.classList.remove('active'));
  document.getElementById(`section-${name}`)?.classList.add('active');
  if (btn) btn.classList.add('active');
}

// ── STATS ──
function renderStats() {
  const openJobs      = allJobs.filter(j => j.status === 'OPEN').length;
  const clients       = allUsers.filter(u => u.role === 'CLIENT').length;
  const freelancers   = allUsers.filter(u => u.role === 'FREELANCER').length;
  const pendingProps  = allProposals.filter(p => p.status === 'PENDING').length;

  document.getElementById('adminStats').innerHTML = `
    <div class="admin-stat-card">
      <div class="admin-stat-icon">👥</div>
      <div class="admin-stat-number">${allUsers.length}</div>
      <div class="admin-stat-label">Total Users</div>
    </div>
    <div class="admin-stat-card blue">
      <div class="admin-stat-icon">💼</div>
      <div class="admin-stat-number">${allJobs.length}</div>
      <div class="admin-stat-label">Total Jobs</div>
    </div>
    <div class="admin-stat-card orange">
      <div class="admin-stat-icon">📄</div>
      <div class="admin-stat-number">${allProposals.length}</div>
      <div class="admin-stat-label">Total Proposals</div>
    </div>
    <div class="admin-stat-card green">
      <div class="admin-stat-icon">🟢</div>
      <div class="admin-stat-number">${openJobs}</div>
      <div class="admin-stat-label">Open Jobs</div>
    </div>
    <div class="admin-stat-card">
      <div class="admin-stat-icon">🏢</div>
      <div class="admin-stat-number">${clients}</div>
      <div class="admin-stat-label">Clients</div>
    </div>
    <div class="admin-stat-card blue">
      <div class="admin-stat-icon">🧑‍💻</div>
      <div class="admin-stat-number">${freelancers}</div>
      <div class="admin-stat-label">Freelancers</div>
    </div>
    <div class="admin-stat-card orange">
      <div class="admin-stat-icon">⏳</div>
      <div class="admin-stat-number">${pendingProps}</div>
      <div class="admin-stat-label">Pending Proposals</div>
    </div>
    <div class="admin-stat-card green">
      <div class="admin-stat-icon">✅</div>
      <div class="admin-stat-number">${allProposals.filter(p => p.status === 'ACCEPTED').length}</div>
      <div class="admin-stat-label">Accepted</div>
    </div>
  `;
}

// ── OVERVIEW TABLES ──
function renderOverviewTables() {
  const recent5Users = [...allUsers].reverse().slice(0, 5);
  const recent5Jobs  = [...allJobs].reverse().slice(0, 5);

  document.getElementById('recentUsersTable').innerHTML = `
    <table>
      <thead><tr><th>Name</th><th>Role</th><th>Joined</th></tr></thead>
      <tbody>
        ${recent5Users.map(u => `
          <tr>
            <td>
              <div style="font-weight:600">${escHtml(u.name || '')} ${escHtml(u.surname || '')}</div>
              <div style="font-size:.75rem;color:var(--gray-500)">${escHtml(u.email)}</div>
            </td>
            <td>${statusBadge(u.role)}</td>
            <td style="font-size:.8rem">${formatDate(u.createdAt)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  document.getElementById('recentJobsTable').innerHTML = `
    <table>
      <thead><tr><th>Title</th><th>Budget</th><th>Status</th></tr></thead>
      <tbody>
        ${recent5Jobs.map(j => `
          <tr>
            <td style="font-weight:600;max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escHtml(j.title)}</td>
            <td>$${Number(j.price).toLocaleString()}</td>
            <td>${statusBadge(j.status)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

// ── USERS TABLE ──
function renderUsers(users) {
  const tbody = document.getElementById('usersTableBody');
  const count = document.getElementById('usersCount');
  count.textContent = `${users.length} user${users.length !== 1 ? 's' : ''}`;

  if (users.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted" style="padding:32px">No users found.</td></tr>`;
    return;
  }

  tbody.innerHTML = users.map((u, i) => `
    <tr>
      <td style="color:var(--gray-400);font-size:.8rem">${i + 1}</td>
      <td>
        <div style="display:flex;align-items:center;gap:10px">
          <div class="user-avatar" style="width:32px;height:32px;font-size:.75rem;flex-shrink:0">
            ${((u.name?.[0] || '') + (u.surname?.[0] || '')).toUpperCase() || u.email[0].toUpperCase()}
          </div>
          <div>
            <div style="font-weight:600">${escHtml(u.name || '—')} ${escHtml(u.surname || '')}</div>
          </div>
        </div>
      </td>
      <td style="color:var(--gray-600)">${escHtml(u.email)}</td>
      <td>${statusBadge(u.role)}</td>
      <td style="color:var(--gray-500);font-size:.85rem">${escHtml(u.phone || '—')}</td>
      <td style="font-size:.8rem;color:var(--gray-500)">${formatDate(u.createdAt)}</td>
    </tr>
  `).join('');
}

function filterUsers() {
  const q    = document.getElementById('userSearch').value.toLowerCase();
  const role = document.getElementById('userRoleFilter').value;

  const filtered = allUsers.filter(u => {
    const matchQ = !q || [u.name, u.surname, u.email, u.phone]
      .some(s => (s || '').toLowerCase().includes(q));
    const matchRole = !role || u.role === role;
    return matchQ && matchRole;
  });
  renderUsers(filtered);
}

// ── JOBS TABLE ──
function renderJobs(jobs) {
  const tbody = document.getElementById('jobsTableBody');
  const count = document.getElementById('jobsCount');
  count.textContent = `${jobs.length} job${jobs.length !== 1 ? 's' : ''}`;

  if (jobs.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted" style="padding:32px">No jobs found.</td></tr>`;
    return;
  }

  tbody.innerHTML = jobs.map((j, i) => `
    <tr>
      <td style="color:var(--gray-400);font-size:.8rem">${i + 1}</td>
      <td style="font-weight:600;max-width:200px">
        <div style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${escHtml(j.title)}">
          ${escHtml(j.title)}
        </div>
      </td>
      <td>
        <span style="font-size:.8rem;color:var(--primary);font-weight:600">${escHtml(j.category || '—')}</span>
      </td>
      <td style="font-weight:700;color:var(--primary)">$${Number(j.price).toLocaleString()}</td>
      <td>
        <span class="badge badge-gray" style="font-size:.7rem">${j.paymentType}</span>
      </td>
      <td>${statusBadge(j.status)}</td>
      <td style="font-size:.8rem;color:var(--gray-500)">${formatDate(j.createdAt)}</td>
      <td>
        <button class="btn btn-danger btn-sm" onclick="adminDeleteJob(${j.id})">Delete</button>
      </td>
    </tr>
  `).join('');
}

function filterJobs() {
  const q      = document.getElementById('jobSearch').value.toLowerCase();
  const status = document.getElementById('jobStatusFilter').value;

  const filtered = allJobs.filter(j => {
    const matchQ = !q || [j.title, j.description, j.category]
      .some(s => (s || '').toLowerCase().includes(q));
    const matchStatus = !status || j.status === status;
    return matchQ && matchStatus;
  });
  renderJobs(filtered);
}

// ── PROPOSALS TABLE ──
function renderProposals(proposals) {
  const tbody = document.getElementById('proposalsTableBody');
  const count = document.getElementById('propsCount');
  count.textContent = `${proposals.length} proposal${proposals.length !== 1 ? 's' : ''}`;

  if (proposals.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted" style="padding:32px">No proposals found.</td></tr>`;
    return;
  }

  tbody.innerHTML = proposals.map((p, i) => `
    <tr>
      <td style="color:var(--gray-400);font-size:.8rem">${i + 1}</td>
      <td style="font-weight:600;max-width:200px">
        <div style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${escHtml(p.job?.title || '')}">
          ${escHtml(p.job?.title || `Proposal #${p.id}`)}
        </div>
      </td>
      <td style="font-weight:700;color:var(--primary)">$${Number(p.amount).toLocaleString()}</td>
      <td style="color:var(--gray-600)">${p.estimatedDays} days</td>
      <td>${statusBadge(p.status)}</td>
      <td style="font-size:.8rem;color:var(--gray-500)">${formatDate(p.createdAt)}</td>
      <td>
        <button class="btn btn-danger btn-sm" onclick="adminDeleteProposal(${p.id})">Delete</button>
      </td>
    </tr>
  `).join('');
}

function filterProposals() {
  const status = document.getElementById('propStatusFilter').value;
  const filtered = !status ? allProposals : allProposals.filter(p => p.status === status);
  renderProposals(filtered);
}

// ── ADMIN DELETE JOB ──
function adminDeleteJob(id) {
  const job = allJobs.find(j => j.id === id);
  showConfirm({
    title: 'Admin: Delete Job',
    message: `Permanently delete <span class="confirm-name">"${escHtml(job?.title || '')}"</span>?<br>All associated proposals will also be deleted.`,
    confirmText: 'Delete Job',
    onConfirm: async () => {
      try {
        await JobsAPI.adminDelete(id);
        showToast('Job deleted.', 'success');
        allJobs = allJobs.filter(j => j.id !== id);
        renderStats();
        renderJobs(allJobs);
        renderOverviewTables();
      } catch (err) {
        showToast(getErrorMessage(err), 'error');
      }
    }
  });
}

// ── ADMIN DELETE PROPOSAL ──
function adminDeleteProposal(id) {
  const p = allProposals.find(x => x.id === id);
  showConfirm({
    title: 'Admin: Delete Proposal',
    message: `Permanently delete this proposal for <span class="confirm-name">"${escHtml(p?.job?.title || '')}"</span>?`,
    confirmText: 'Delete Proposal',
    onConfirm: async () => {
      try {
        await ProposalsAPI.adminDelete(id);
        showToast('Proposal deleted.', 'success');
        allProposals = allProposals.filter(x => x.id !== id);
        renderStats();
        renderProposals(allProposals);
      } catch (err) {
        showToast(getErrorMessage(err), 'error');
      }
    }
  });
}
