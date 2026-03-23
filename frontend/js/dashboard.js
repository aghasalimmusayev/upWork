// ===== DASHBOARD LOGIC =====
if (!requireAuth()) throw new Error('Not authenticated');
if (Auth.isAdmin()) { window.location.href = 'admin.html'; throw new Error('Admin redirect'); }

const user = Auth.getUser();
const role = Auth.getRole();

// Render navbar & sidebar
renderNavbar('dashboard');
renderSidebar();

let myJobs = [];
let myProposals = [];
let incomingProposals = [];

function renderSidebar() {
  document.getElementById('sideAvatar').textContent = getInitials(user?.name, user?.surname);
  document.getElementById('sideUserName').textContent = (user?.name || '') + ' ' + (user?.surname || '');
  document.getElementById('sideUserRole').innerHTML = `<span class="${badgeForStatus(role)}">${role}</span>`;

  const links = role === 'CLIENT' ? [
    { icon: '🏠', label: 'Ana Səhifə', tab: 'overview' },
    { icon: '💼', label: 'İşlərim', tab: 'myjobs' },
    { icon: '📄', label: 'Gələn Müraciətlər', tab: 'incoming' },
    { icon: '👤', label: 'Profilim', href: 'profile.html' },
  ] : [
    { icon: '🏠', label: 'Ana Səhifə', tab: 'overview' },
    { icon: '🔍', label: 'İşlər Axtar', href: 'jobs.html' },
    { icon: '📄', label: 'Müraciətlərim', tab: 'proposals' },
    { icon: '👤', label: 'Profilim', href: 'profile.html' },
  ];

  document.getElementById('sidebarNav').innerHTML = links.map(l => l.href
    ? `<a href="${l.href}" class="sidebar-link"><span class="icon">${l.icon}</span>${l.label}</a>`
    : `<button class="sidebar-link" onclick="switchTab('${l.tab}')"><span class="icon">${l.icon}</span>${l.label}</button>`
  ).join('');
}

async function loadDashboard() {
  if (role === 'CLIENT') {
    await loadClientDashboard();
  } else {
    await loadFreelancerDashboard();
  }
}

// ===== CLIENT =====
async function loadClientDashboard() {
  try {
    [myJobs, incomingProposals] = await Promise.all([
      JobsAPI.getAll().then(jobs => jobs.filter(j => {
        // We can't directly know which jobs belong to this user without owner info
        // So we load all and show manage options
        return true;
      })),
      ProposalsAPI.getAll()
    ]);
    // Filter my jobs: get from proposals job.user
    myJobs = await JobsAPI.getAll();
  } catch {}

  // Stats
  const openJobs = myJobs.filter ? myJobs.filter(j => j.status === 'OPEN').length : 0;
  document.getElementById('statsGrid').style.display = 'grid';
  document.getElementById('statsGrid').innerHTML = `
    <div class="stat-card"><div class="stat-number">${myJobs.length || 0}</div><div class="stat-label">Ümumi İşlər</div></div>
    <div class="stat-card"><div class="stat-number">${openJobs}</div><div class="stat-label">Açıq İşlər</div></div>
    <div class="stat-card"><div class="stat-number">${incomingProposals.length || 0}</div><div class="stat-label">Gələn Müraciətlər</div></div>
    <div class="stat-card"><div class="stat-number">${incomingProposals.filter ? incomingProposals.filter(p => p.status === 'PENDING').length : 0}</div><div class="stat-label">Gözləyən Müraciətlər</div></div>
  `;

  // Tabs
  document.getElementById('mainTabs').style.display = 'flex';
  document.getElementById('mainTabs').innerHTML = `
    <button class="tab-btn active" onclick="switchTabEl(this, 'overview')">🏠 İcmal</button>
    <button class="tab-btn" onclick="switchTabEl(this, 'myjobs')">💼 İşlərim</button>
    <button class="tab-btn" onclick="switchTabEl(this, 'incoming')">📄 Müraciətlər</button>
  `;

  document.getElementById('tabContents').innerHTML = `
    <div class="tab-content active" id="tab-overview">${renderClientOverview()}</div>
    <div class="tab-content" id="tab-myjobs">${renderMyJobs()}</div>
    <div class="tab-content" id="tab-incoming">${renderIncomingProposals()}</div>
  `;
}

function renderClientOverview() {
  const recent = (incomingProposals || []).slice(0, 5);
  return `
    <div class="card mb-16">
      <div class="card-header">
        <h3>👋 Xoş Gəldiniz, ${escHtml(user?.name)}!</h3>
        <button class="btn btn-primary btn-sm" onclick="openCreateJob()">+ Yeni İş</button>
      </div>
      <div class="card-body">
        <p>Siz <strong>CLIENT</strong> olaraq iş elanları yerləşdirə, freelancer-lərin müraciətlərini idarə edə bilərsiniz.</p>
      </div>
    </div>
    <h3 class="mb-16">Son Müraciətlər</h3>
    ${recent.length === 0
      ? `<div class="empty-state"><div class="icon">📭</div><p>Hələ müraciət yoxdur</p></div>`
      : recent.map(p => renderProposalCard(p, true)).join('')}
  `;
}

function renderMyJobs() {
  return `
    <div class="section-header">
      <h3>💼 Bütün İşlər</h3>
      <button class="btn btn-primary" onclick="openCreateJob()">+ Yeni İş Yarat</button>
    </div>
    <div id="myJobsList">
      ${myJobs.length === 0
        ? `<div class="empty-state"><div class="icon">💼</div><p>Hələ iş elanınız yoxdur</p><button class="btn btn-primary" onclick="openCreateJob()">İlk işinizi yaradın</button></div>`
        : myJobs.map(j => renderJobRow(j)).join('')
      }
    </div>
  `;
}

function renderJobRow(j) {
  return `
    <div class="job-card mb-16" style="cursor:default">
      <div class="job-card-header">
        <div>
          <div class="job-card-title">${escHtml(j.title)}</div>
          <div class="job-card-meta">
            <span>💰 $${j.price}</span>
            <span>📂 ${escHtml(j.category)}</span>
            <span>📅 ${formatDate(j.createdAt)}</span>
          </div>
        </div>
        <span class="${badgeForStatus(j.status)}">${j.status === 'OPEN' ? 'Açıq' : 'Bağlı'}</span>
      </div>
      <div class="d-flex gap-8 flex-wrap mt-8">
        <button class="btn btn-sm btn-outline" onclick="openEditJob(${j.id})">✏️ Düzəliş</button>
        <button class="btn btn-sm btn-ghost" onclick="openStatusChange(${j.id}, '${j.status}')">🔄 Status</button>
        <button class="btn btn-sm btn-danger" onclick="deleteJob(${j.id})">🗑️ Sil</button>
      </div>
    </div>`;
}

function renderIncomingProposals() {
  if (!incomingProposals || incomingProposals.length === 0)
    return `<div class="empty-state"><div class="icon">📭</div><p>Hələ müraciət yoxdur</p></div>`;
  return incomingProposals.map(p => renderProposalCard(p, true)).join('');
}

// ===== FREELANCER =====
async function loadFreelancerDashboard() {
  try {
    myProposals = await ProposalsAPI.getAll();
  } catch { myProposals = []; }

  const pending = myProposals.filter(p => p.status === 'PENDING').length;
  const accepted = myProposals.filter(p => p.status === 'ACCEPTED').length;

  document.getElementById('statsGrid').style.display = 'grid';
  document.getElementById('statsGrid').innerHTML = `
    <div class="stat-card"><div class="stat-number">${myProposals.length}</div><div class="stat-label">Ümumi Müraciətlər</div></div>
    <div class="stat-card"><div class="stat-number">${pending}</div><div class="stat-label">Gözləyən</div></div>
    <div class="stat-card"><div class="stat-number">${accepted}</div><div class="stat-label">Qəbul Edilmiş</div></div>
    <div class="stat-card"><div class="stat-number">${myProposals.filter(p=>p.status==='REJECTED').length}</div><div class="stat-label">Rədd Edilmiş</div></div>
  `;

  document.getElementById('mainTabs').style.display = 'flex';
  document.getElementById('mainTabs').innerHTML = `
    <button class="tab-btn active" onclick="switchTabEl(this, 'overview')">🏠 İcmal</button>
    <button class="tab-btn" onclick="switchTabEl(this, 'proposals')">📄 Müraciətlərim</button>
  `;

  document.getElementById('tabContents').innerHTML = `
    <div class="tab-content active" id="tab-overview">${renderFreelancerOverview()}</div>
    <div class="tab-content" id="tab-proposals">${renderMyProposals()}</div>
  `;
}

function renderFreelancerOverview() {
  const recent = myProposals.slice(0, 5);
  return `
    <div class="card mb-16">
      <div class="card-header">
        <h3>👋 Xoş Gəldiniz, ${escHtml(user?.name)}!</h3>
        <a href="/jobs.html" class="btn btn-primary btn-sm">🔍 İş Axtar</a>
      </div>
      <div class="card-body">
        <p>Siz <strong>FREELANCER</strong> olaraq iş elanlarına müraciət edə, müraciətlərinizi izləyə bilərsiniz.</p>
      </div>
    </div>
    <h3 class="mb-16">Son Müraciətlər</h3>
    ${recent.length === 0
      ? `<div class="empty-state"><div class="icon">📄</div><p>Hələ müraciətiniz yoxdur</p><a href="/jobs.html" class="btn btn-outline">İşlərə Bax</a></div>`
      : recent.map(p => renderProposalCard(p, false)).join('')}
  `;
}

function renderMyProposals() {
  if (myProposals.length === 0)
    return `<div class="empty-state"><div class="icon">📄</div><p>Hələ müraciətiniz yoxdur</p><a href="/jobs.html" class="btn btn-primary">İş Axtar</a></div>`;
  return `
    <div class="section-header"><h3>📄 Müraciətlərim</h3></div>
    ${myProposals.map(p => renderProposalCard(p, false)).join('')}
  `;
}

function renderProposalCard(p, isClient) {
  const statusLabels = { PENDING: 'Gözləyir', ACCEPTED: 'Qəbul edildi', REJECTED: 'Rədd edildi', WITHDRAWN: 'Geri çəkildi' };
  return `
    <div class="proposal-card">
      <div class="proposal-header">
        <div>
          <div style="font-weight:700">${p.job ? escHtml(p.job.title) : 'İş'}</div>
          <div class="proposal-meta">
            <span>💰 $${p.amount}</span>
            <span>📅 ${p.estimatedDays} gün</span>
            <span>🗓 ${formatDate(p.createdAt)}</span>
          </div>
        </div>
        <span class="${badgeForStatus(p.status)}">${statusLabels[p.status] || p.status}</span>
      </div>
      ${p.coverLetter ? `<p style="font-size:.875rem;color:var(--gray-700);margin:8px 0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${escHtml(p.coverLetter)}</p>` : ''}
      <div class="proposal-actions">
        ${isClient && p.status === 'PENDING'
          ? `<button class="btn btn-sm btn-primary" onclick="openPropStatusModal(${p.id})">📝 Status Dəyiş</button>`
          : ''}
        ${!isClient && p.status === 'PENDING'
          ? `
            <button class="btn btn-sm btn-outline" onclick="openEditProposal(${p.id})">✏️ Düzəliş</button>
            <button class="btn btn-sm btn-warning" onclick="withdrawProposal(${p.id})">↩️ Geri çək</button>
            <button class="btn btn-sm btn-danger" onclick="deleteProposal(${p.id})">🗑️ Sil</button>
          ` : ''}
      </div>
    </div>`;
}

// ===== TAB SWITCH =====
function switchTab(tabName) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  const tabEl = document.getElementById(`tab-${tabName}`);
  if (tabEl) tabEl.classList.add('active');
  const btn = document.querySelector(`.tab-btn[onclick*="${tabName}"]`);
  if (btn) btn.classList.add('active');
}

function switchTabEl(btn, tabName) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  const tabEl = document.getElementById(`tab-${tabName}`);
  if (tabEl) tabEl.classList.add('active');
}

// ===== JOB CRUD =====
function openCreateJob() {
  document.getElementById('jobModalTitle').textContent = 'Yeni İş Yarat';
  document.getElementById('editJobId').value = '';
  document.getElementById('jobForm').reset();
  document.getElementById('jobErr').classList.remove('show');
  openModal('jobModal');
}

async function openEditJob(id) {
  const job = myJobs.find(j => j.id === id);
  if (!job) return;
  document.getElementById('jobModalTitle').textContent = 'İşi Düzəliş Et';
  document.getElementById('editJobId').value = id;
  document.getElementById('jobTitle').value = job.title || '';
  document.getElementById('jobDesc').value = job.description || '';
  document.getElementById('jobPayment').value = job.paymentType || 'FIXED';
  document.getElementById('jobPrice').value = job.price || '';
  document.getElementById('jobCategory').value = job.category || '';
  document.getElementById('jobSkills').value = (job.skills || []).join(', ');
  document.getElementById('jobErr').classList.remove('show');
  openModal('jobModal');
}

async function saveJob() {
  const id = document.getElementById('editJobId').value;
  const title = document.getElementById('jobTitle').value.trim();
  const description = document.getElementById('jobDesc').value.trim();
  const paymentType = document.getElementById('jobPayment').value;
  const price = parseFloat(document.getElementById('jobPrice').value);
  const category = document.getElementById('jobCategory').value.trim();
  const skillsStr = document.getElementById('jobSkills').value.trim();
  const skills = skillsStr.split(',').map(s => s.trim()).filter(Boolean);

  if (!title || !price || !category || skills.length === 0) {
    document.getElementById('jobErrMsg').textContent = 'Bütün məcburi sahələri doldurun';
    document.getElementById('jobErr').classList.add('show');
    return;
  }

  const btn = document.getElementById('saveJobBtn');
  btn.classList.add('btn-loading'); btn.disabled = true;
  document.getElementById('jobErr').classList.remove('show');

  try {
    const data = { title, paymentType, price, category, skills };
    if (description) data.description = description;

    if (id) {
      await JobsAPI.update(parseInt(id), data);
      showToast('İş uğurla yeniləndi ✅', 'success');
    } else {
      await JobsAPI.create(data);
      showToast('İş uğurla yaradıldı 🎉', 'success');
    }
    closeModal('jobModal');
    await loadClientDashboard();
  } catch (err) {
    document.getElementById('jobErrMsg').textContent = getErrorMessage(err);
    document.getElementById('jobErr').classList.add('show');
  } finally {
    btn.classList.remove('btn-loading'); btn.disabled = false;
  }
}

function openStatusChange(id, current) {
  document.getElementById('statusJobId').value = id;
  document.getElementById('newJobStatus').value = current;
  openModal('statusModal');
}

async function saveJobStatus() {
  const id = parseInt(document.getElementById('statusJobId').value);
  const status = document.getElementById('newJobStatus').value;
  try {
    await JobsAPI.updateStatus(id, status);
    closeModal('statusModal');
    showToast('Status yeniləndi ✅', 'success');
    await loadClientDashboard();
  } catch (err) {
    showToast(getErrorMessage(err), 'error');
  }
}

async function deleteJob(id) {
  const ok = await confirmDialog('Bu işi silmək istədiyinizə əminsinizmi? Bütün müraciətlər də silinəcək.');
  if (!ok) return;
  try {
    await JobsAPI.delete(id);
    showToast('İş silindi ✅', 'success');
    await loadClientDashboard();
  } catch (err) {
    showToast(getErrorMessage(err), 'error');
  }
}

// ===== PROPOSAL ACTIONS =====
function openPropStatusModal(id) {
  document.getElementById('propStatusId').value = id;
  document.getElementById('newPropStatus').value = 'ACCEPTED';
  openModal('propStatusModal');
}

async function savePropStatus() {
  const id = parseInt(document.getElementById('propStatusId').value);
  const status = document.getElementById('newPropStatus').value;
  try {
    await ProposalsAPI.updateStatus(id, status);
    closeModal('propStatusModal');
    showToast('Müraciət statusu yeniləndi ✅', 'success');
    await loadClientDashboard();
  } catch (err) {
    showToast(getErrorMessage(err), 'error');
  }
}

function openEditProposal(id) {
  const p = myProposals.find(pr => pr.id === id);
  if (!p) return;
  document.getElementById('editPropId').value = id;
  document.getElementById('editPropCover').value = p.coverLetter || '';
  document.getElementById('editPropAmount').value = p.amount || '';
  document.getElementById('editPropDays').value = p.estimatedDays || '';
  document.getElementById('editPropErr').classList.remove('show');
  openModal('editPropModal');
}

async function saveEditProposal() {
  const id = parseInt(document.getElementById('editPropId').value);
  const coverLetter = document.getElementById('editPropCover').value.trim();
  const amount = parseFloat(document.getElementById('editPropAmount').value);
  const estimatedDays = parseInt(document.getElementById('editPropDays').value);

  const btn = document.getElementById('saveEditPropBtn');
  btn.classList.add('btn-loading'); btn.disabled = true;
  document.getElementById('editPropErr').classList.remove('show');

  try {
    const data = {};
    if (coverLetter) data.coverLetter = coverLetter;
    if (amount) data.amount = amount;
    if (estimatedDays) data.estimatedDays = estimatedDays;
    await ProposalsAPI.update(id, data);
    closeModal('editPropModal');
    showToast('Müraciət yeniləndi ✅', 'success');
    await loadFreelancerDashboard();
  } catch (err) {
    document.getElementById('editPropErrMsg').textContent = getErrorMessage(err);
    document.getElementById('editPropErr').classList.add('show');
  } finally {
    btn.classList.remove('btn-loading'); btn.disabled = false;
  }
}

async function withdrawProposal(id) {
  const ok = await confirmDialog('Bu müraciəti geri çəkmək istədiyinizə əminsinizmi?');
  if (!ok) return;
  try {
    await ProposalsAPI.updateStatus(id, 'WITHDRAWN');
    showToast('Müraciət geri çəkildi', 'info');
    await loadFreelancerDashboard();
  } catch (err) {
    showToast(getErrorMessage(err), 'error');
  }
}

async function deleteProposal(id) {
  const ok = await confirmDialog('Bu müraciəti silmək istədiyinizə əminsinizmi?');
  if (!ok) return;
  try {
    await ProposalsAPI.delete(id);
    showToast('Müraciət silindi ✅', 'success');
    await loadFreelancerDashboard();
  } catch (err) {
    showToast(getErrorMessage(err), 'error');
  }
}

function escHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// Init
loadDashboard();
