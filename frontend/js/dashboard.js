/* ============================================================
   DASHBOARD.JS — Role-based dashboard logic
   ============================================================ */

if (!requireAuth()) throw new Error('Auth required');

let myJobs       = [];
let myProposals  = [];
let activeTab    = 'overview';
const role       = Auth.getRole();
const user       = Auth.getUser();

// ── INIT ──
(async function init() {
  renderNavbar('dashboard');

  // Greeting
  document.getElementById('greetingName').textContent =
    user ? (user.name ? `${user.name} ${user.surname || ''}`.trim() : user.email) : '';

  // Show role-specific sidebar links
  if (role === 'CLIENT') {
    document.getElementById('sidebarClientLinks').style.display = 'block';
    document.getElementById('clientPostJobBtn').style.display   = 'block';
  } else if (role === 'FREELANCER') {
    document.getElementById('sidebarFreelancerLinks').style.display = 'block';
  } else if (role === 'ADMIN') {
    window.location.href = 'admin.html';
    return;
  }

  await loadAll();
})();

// ── LOAD DATA ──
async function loadAll() {
  try {
    if (role === 'CLIENT') {
      [myJobs, myProposals] = await Promise.all([
        JobsAPI.getAll().then(jobs => jobs.filter(j => {
          // Filter by current user (getAll returns all — we need to compare)
          return true; // all jobs; CLIENT sees their own via findJob(:id)
        })),
        ProposalsAPI.getAll()
      ]);
      // Note: getAll() returns all open jobs. Proposals for client = received proposals on their jobs.
      renderOverview();
      renderMyJobs(myJobs);
      renderReceivedProposals(myProposals);
    } else if (role === 'FREELANCER') {
      myProposals = await ProposalsAPI.getAll();
      renderOverview();
      renderMyProposals(myProposals);
    }
  } catch (err) {
    showToast('Failed to load data: ' + getErrorMessage(err), 'error');
    document.getElementById('statsGrid').innerHTML = `<p class="text-muted">Could not load stats.</p>`;
  }
}

// ── OVERVIEW ──
function renderOverview() {
  const statsGrid = document.getElementById('statsGrid');

  if (role === 'CLIENT') {
    const open   = myJobs.filter(j => j.status === 'OPEN').length;
    const closed = myJobs.filter(j => j.status === 'CLOSED').length;
    const pending = myProposals.filter(p => p.status === 'PENDING').length;
    const accepted = myProposals.filter(p => p.status === 'ACCEPTED').length;

    statsGrid.innerHTML = `
      <div class="stat-card"><div class="stat-icon">💼</div><div class="stat-number">${myJobs.length}</div><div class="stat-label">Total Jobs</div></div>
      <div class="stat-card"><div class="stat-icon">🟢</div><div class="stat-number">${open}</div><div class="stat-label">Open Jobs</div></div>
      <div class="stat-card"><div class="stat-icon">📬</div><div class="stat-number">${myProposals.length}</div><div class="stat-label">Proposals Received</div></div>
      <div class="stat-card"><div class="stat-icon">✅</div><div class="stat-number">${accepted}</div><div class="stat-label">Accepted</div></div>
    `;

    document.getElementById('overviewContent').innerHTML = `
      <div class="card">
        <div class="card-header">
          <h4>Recent Activity</h4>
        </div>
        <div class="card-body">
          ${myProposals.length === 0
            ? `<p class="text-muted">No proposals received yet. Post jobs to start receiving applications.</p>`
            : myProposals.slice(0, 5).map(proposalRowClient).join('')
          }
        </div>
      </div>
    `;
  } else if (role === 'FREELANCER') {
    const pending   = myProposals.filter(p => p.status === 'PENDING').length;
    const accepted  = myProposals.filter(p => p.status === 'ACCEPTED').length;
    const rejected  = myProposals.filter(p => p.status === 'REJECTED').length;
    const withdrawn = myProposals.filter(p => p.status === 'WITHDRAWN').length;

    statsGrid.innerHTML = `
      <div class="stat-card"><div class="stat-icon">📄</div><div class="stat-number">${myProposals.length}</div><div class="stat-label">Total Proposals</div></div>
      <div class="stat-card"><div class="stat-icon">⏳</div><div class="stat-number">${pending}</div><div class="stat-label">Pending</div></div>
      <div class="stat-card"><div class="stat-icon">✅</div><div class="stat-number">${accepted}</div><div class="stat-label">Accepted</div></div>
      <div class="stat-card"><div class="stat-icon">❌</div><div class="stat-number">${rejected}</div><div class="stat-label">Rejected</div></div>
    `;

    document.getElementById('overviewContent').innerHTML = `
      <div class="card mt-16">
        <div class="card-header"><h4>Recent Proposals</h4></div>
        <div class="card-body">
          ${myProposals.length === 0
            ? `<p class="text-muted">No proposals yet. <a href="jobs.html" style="color:var(--primary)">Browse open jobs</a> to apply.</p>`
            : myProposals.slice(0, 4).map(proposalCardFreelancer).join('')
          }
        </div>
      </div>
    `;
  }
}

// ── TAB SWITCH ──
function showTab(name, btn) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.sidebar-link').forEach(el => el.classList.remove('active'));
  document.getElementById(`tab-${name}`)?.classList.add('active');
  if (btn) btn.classList.add('active');
  activeTab = name;
}

// ── CLIENT: MY JOBS ──
function renderMyJobs(jobs) {
  const container = document.getElementById('myJobsList');
  if (jobs.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">💼</div>
        <h3>No jobs posted yet</h3>
        <p>Post your first job and start receiving proposals.</p>
        <button class="btn btn-primary" onclick="openModal('jobModal')">＋ Post a Job</button>
      </div>
    `;
    return;
  }
  container.innerHTML = jobs.map(jobRowClient).join('');
}

function jobRowClient(job) {
  const skills = Array.isArray(job.skills) ? job.skills : (job.skills || '').split(',');
  const skillsHtml = skills.slice(0, 4).map(s => `<span class="tag">${escHtml(s.trim())}</span>`).join('');

  return `
    <div class="card proposal-card mb-12">
      <div class="proposal-card-header">
        <div>
          <div style="font-size:.75rem;color:var(--primary);font-weight:700">${escHtml(job.category)}</div>
          <div class="proposal-job-title">${escHtml(job.title)}</div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px">${skillsHtml}</div>
        </div>
        <div style="text-align:right;flex-shrink:0">
          ${statusBadge(job.status)}
          <div class="proposal-amount mt-4">$${Number(job.price).toLocaleString()}</div>
          <div style="font-size:.72rem;color:var(--gray-400)">${job.paymentType}</div>
        </div>
      </div>
      <div class="proposal-meta">
        <span>📅 ${formatDate(job.createdAt)}</span>
      </div>
      <div class="proposal-actions">
        <button class="btn btn-outline btn-sm" onclick="openEditJobModal(${job.id})">✏️ Edit</button>
        <button class="btn btn-ghost btn-sm" onclick="openJobStatusModal(${job.id}, '${job.status}')">🔄 Change Status</button>
        <button class="btn btn-danger btn-sm" onclick="deleteJob(${job.id})">🗑 Delete</button>
      </div>
    </div>
  `;
}

// ── CLIENT: RECEIVED PROPOSALS ──
function renderReceivedProposals(proposals) {
  const container = document.getElementById('receivedProposalsList');
  if (proposals.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📬</div>
        <h3>No proposals received yet</h3>
        <p>Keep your jobs open to receive proposals from freelancers.</p>
      </div>
    `;
    return;
  }
  container.innerHTML = proposals.map(proposalRowClient).join('');
}

function proposalRowClient(p) {
  const canDecide = p.status === 'PENDING';
  return `
    <div class="card proposal-card mb-12">
      <div class="proposal-card-header">
        <div>
          <div style="font-size:.75rem;color:var(--gray-500);margin-bottom:2px">
            Job: <strong style="color:var(--gray-800)">${escHtml(p.job?.title || 'N/A')}</strong>
          </div>
          <div class="proposal-amount">$${Number(p.amount).toLocaleString()}</div>
          <div class="proposal-meta mt-4">
            <span>⏱ ${p.estimatedDays} days</span>
            <span>📅 ${formatDate(p.createdAt)}</span>
          </div>
        </div>
        <div>${statusBadge(p.status)}</div>
      </div>
      <div class="proposal-cover">${escHtml(p.coverLetter || '')}</div>
      <div class="proposal-actions">
        ${canDecide
          ? `<button class="btn btn-primary btn-sm" onclick="openPropStatusModal(${p.id})">Review</button>`
          : `<span style="font-size:.82rem;color:var(--gray-500)">Decision made</span>`
        }
      </div>
    </div>
  `;
}

// ── FREELANCER: MY PROPOSALS ──
function renderMyProposals(proposals) {
  const container = document.getElementById('myProposalsList');
  if (proposals.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📄</div>
        <h3>No proposals yet</h3>
        <p>Browse open jobs and submit your first proposal.</p>
        <a href="jobs.html" class="btn btn-primary">Browse Jobs</a>
      </div>
    `;
    return;
  }
  container.innerHTML = proposals.map(proposalCardFreelancer).join('');
}

function proposalCardFreelancer(p) {
  const isPending = p.status === 'PENDING';
  return `
    <div class="card proposal-card mb-12">
      <div class="proposal-card-header">
        <div style="flex:1;min-width:0">
          <div style="font-size:.75rem;color:var(--gray-500);margin-bottom:2px">
            Applied to: <strong style="color:var(--gray-800)">${escHtml(p.job?.title || 'Job #' + p.id)}</strong>
            ${p.job?.status ? statusBadge(p.job.status) : ''}
          </div>
          <div class="proposal-amount">$${Number(p.amount).toLocaleString()}</div>
        </div>
        <div style="flex-shrink:0">${statusBadge(p.status)}</div>
      </div>
      <div class="proposal-meta">
        <span>⏱ ${p.estimatedDays} days</span>
        <span>📅 ${formatDate(p.createdAt)}</span>
      </div>
      <div class="proposal-cover">${escHtml(p.coverLetter || '')}</div>
      <div class="proposal-actions">
        ${isPending
          ? `<button class="btn btn-outline btn-sm" onclick="openEditProposal(${p.id})">✏️ Edit</button>
             <button class="btn btn-ghost btn-sm" onclick="withdrawProposal(${p.id})">↩️ Withdraw</button>`
          : `<span style="font-size:.82rem;color:var(--gray-500)">Final status</span>`
        }
      </div>
    </div>
  `;
}

// ── JOB CRUD (CLIENT) ──
function openEditJobModal(id) {
  const job = myJobs.find(j => j.id === id);
  if (!job) return;
  document.getElementById('jobModalTitle').textContent = 'Edit Job';
  document.getElementById('editJobId').value   = job.id;
  document.getElementById('jobTitle').value    = job.title || '';
  document.getElementById('jobDesc').value     = job.description || '';
  document.getElementById('jobPayment').value  = job.paymentType || 'FIXED';
  document.getElementById('jobPrice').value    = job.price || '';
  document.getElementById('jobCategory').value = job.category || '';
  const skills = Array.isArray(job.skills) ? job.skills.join(', ') : (job.skills || '');
  document.getElementById('jobSkills').value   = skills;
  hideAlert('jobFormAlert');
  openModal('jobModal');
}

// Called when opening create modal from button
document.addEventListener('click', e => {
  if (e.target.closest('#jobModal') && !e.target.closest('.modal')) return;
});

// Reset form when modal opens for create
const jobModalEl = document.getElementById('jobModal');
if (jobModalEl) {
  jobModalEl.addEventListener('click', () => {});
}

async function saveJob() {
  const id       = document.getElementById('editJobId').value;
  const title    = document.getElementById('jobTitle').value.trim();
  const desc     = document.getElementById('jobDesc').value.trim();
  const payment  = document.getElementById('jobPayment').value;
  const price    = document.getElementById('jobPrice').value;
  const category = document.getElementById('jobCategory').value.trim();
  const skills   = document.getElementById('jobSkills').value.trim();
  const btn      = document.getElementById('saveJobBtn');

  hideAlert('jobFormAlert');
  if (!title || !price || !category || !skills) {
    showAlert('jobFormAlert', 'Please fill in all required fields.');
    return;
  }

  const data = {
    title, description: desc, paymentType: payment,
    price: Number(price), category,
    skills: skills.split(',').map(s => s.trim()).filter(Boolean),
  };

  setBtnLoading(btn, true, 'Saving...');
  try {
    if (id) {
      await JobsAPI.update(id, data);
      showToast('Job updated!', 'success');
    } else {
      await JobsAPI.create(data);
      showToast('Job posted!', 'success');
    }
    closeModal('jobModal');
    await loadAll();
    renderMyJobs(myJobs);
  } catch (err) {
    showAlert('jobFormAlert', getErrorMessage(err));
    setBtnLoading(btn, false);
  }
}

// Reset job modal on open for new job
document.querySelector('[onclick="openModal(\'jobModal\')"]')?.addEventListener('click', () => {
  document.getElementById('jobModalTitle').textContent = 'Post a New Job';
  document.getElementById('editJobId').value  = '';
  document.getElementById('jobTitle').value   = '';
  document.getElementById('jobDesc').value    = '';
  document.getElementById('jobPayment').value = 'FIXED';
  document.getElementById('jobPrice').value   = '';
  document.getElementById('jobCategory').value = '';
  document.getElementById('jobSkills').value  = '';
  hideAlert('jobFormAlert');
});

function openJobStatusModal(id, currentStatus) {
  document.getElementById('statusJobId').value  = id;
  document.getElementById('newJobStatus').value = currentStatus;
  openModal('jobStatusModal');
}

async function saveJobStatus() {
  const id     = document.getElementById('statusJobId').value;
  const status = document.getElementById('newJobStatus').value;
  try {
    await JobsAPI.updateStatus(id, { status });
    closeModal('jobStatusModal');
    showToast('Job status updated.', 'success');
    await loadAll();
    renderMyJobs(myJobs);
  } catch (err) {
    showToast(getErrorMessage(err), 'error');
  }
}

function deleteJob(id) {
  const job = myJobs.find(j => j.id === id);
  showConfirm({
    title: 'Delete Job',
    message: `Delete <span class="confirm-name">"${escHtml(job?.title || '')}"</span>? All proposals will be removed.`,
    confirmText: 'Delete',
    onConfirm: async () => {
      try {
        await JobsAPI.remove(id);
        showToast('Job deleted.', 'success');
        await loadAll();
        renderMyJobs(myJobs);
      } catch (err) {
        showToast(getErrorMessage(err), 'error');
      }
    }
  });
}

// ── PROPOSAL STATUS (CLIENT) ──
function openPropStatusModal(id) {
  document.getElementById('propStatusId').value  = id;
  document.getElementById('newPropStatus').value = 'ACCEPTED';
  openModal('propStatusModal');
}

async function savePropStatus() {
  const id     = document.getElementById('propStatusId').value;
  const status = document.getElementById('newPropStatus').value;
  try {
    await ProposalsAPI.updateStatus(id, { status });
    closeModal('propStatusModal');
    showToast(`Proposal ${status.toLowerCase()}. The freelancer has been notified.`, 'success');
    const data = await ProposalsAPI.getAll();
    myProposals = data;
    renderReceivedProposals(myProposals);
    renderOverview();
  } catch (err) {
    showToast(getErrorMessage(err), 'error');
  }
}

// ── EDIT PROPOSAL (FREELANCER) ──
function openEditProposal(id) {
  const p = myProposals.find(x => x.id === id);
  if (!p) return;
  document.getElementById('editPropId').value     = p.id;
  document.getElementById('editPropLetter').value = p.coverLetter || '';
  document.getElementById('editPropAmount').value  = p.amount || '';
  document.getElementById('editPropDays').value    = p.estimatedDays || '';
  hideAlert('editPropAlert');
  openModal('editProposalModal');
}

async function saveEditProposal() {
  const id     = document.getElementById('editPropId').value;
  const letter = document.getElementById('editPropLetter').value.trim();
  const amount = document.getElementById('editPropAmount').value;
  const days   = document.getElementById('editPropDays').value;
  const btn    = document.getElementById('saveEditPropBtn');

  hideAlert('editPropAlert');
  if (!letter || !amount || !days) {
    showAlert('editPropAlert', 'All fields are required.');
    return;
  }

  setBtnLoading(btn, true, 'Saving...');
  try {
    await ProposalsAPI.update(id, {
      coverLetter: letter,
      amount: Number(amount),
      estimatedDays: Number(days),
    });
    closeModal('editProposalModal');
    showToast('Proposal updated!', 'success');
    myProposals = await ProposalsAPI.getAll();
    renderMyProposals(myProposals);
    renderOverview();
  } catch (err) {
    showAlert('editPropAlert', getErrorMessage(err));
    setBtnLoading(btn, false);
  }
}

// ── WITHDRAW PROPOSAL ──
function withdrawProposal(id) {
  showConfirm({
    title: 'Withdraw Proposal',
    message: 'Are you sure you want to withdraw this proposal? This action cannot be undone.',
    confirmText: 'Withdraw',
    onConfirm: async () => {
      try {
        await ProposalsAPI.updateStatus(id, { status: 'WITHDRAWN' });
        showToast('Proposal withdrawn.', 'info');
        myProposals = await ProposalsAPI.getAll();
        renderMyProposals(myProposals);
        renderOverview();
      } catch (err) {
        showToast(getErrorMessage(err), 'error');
      }
    }
  });
}
