/* ============================================================
   JOBS.JS — Jobs listing page logic
   ============================================================ */

let allJobs = [];
let currentJobId = null;

// ── INIT ──
(async function init() {
  renderNavbar('jobs');

  const role = Auth.getRole();
  if (role === 'CLIENT') document.getElementById('clientCreateBtn').style.display = 'block';

  await loadJobs();

  // URL params (from landing page search)
  const params = new URLSearchParams(window.location.search);
  if (params.get('q'))        { document.getElementById('searchQ').value = params.get('q'); }
  if (params.get('category')) { document.getElementById('searchQ').value = params.get('category'); }
  if (params.get('q') || params.get('category')) applyFilters();
})();

// ── LOAD ALL JOBS ──
async function loadJobs() {
  try {
    allJobs = await JobsAPI.getAll();
    renderJobs(allJobs);
  } catch (err) {
    document.getElementById('jobsContainer').innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">⚠️</div>
        <h3>Failed to load jobs</h3>
        <p>${escHtml(getErrorMessage(err))}</p>
        <button class="btn btn-outline" onclick="loadJobs()">Try Again</button>
      </div>
    `;
  }
}

// ── RENDER JOBS ──
function renderJobs(jobs) {
  const container = document.getElementById('jobsContainer');
  const count = document.getElementById('resultsCount');
  count.textContent = `${jobs.length} job${jobs.length !== 1 ? 's' : ''} found`;

  if (jobs.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔍</div>
        <h3>No jobs found</h3>
        <p>Try adjusting your search filters or check back later.</p>
        ${Auth.isClient() ? `<button class="btn btn-primary" onclick="openModal('createJobModal')">Post a Job</button>` : ''}
      </div>
    `;
    return;
  }

  container.innerHTML = `<div class="jobs-grid">${jobs.map(jobCard).join('')}</div>`;
}

// ── JOB CARD HTML ──
function jobCard(job) {
  const skills = Array.isArray(job.skills) ? job.skills : (job.skills || '').split(',');
  const skillsHtml = skills.slice(0, 5).map(s => `<span class="tag">${escHtml(s.trim())}</span>`).join('');
  const moreSkills = skills.length > 5 ? `<span class="tag">+${skills.length - 5}</span>` : '';

  return `
    <div class="card card-interactive job-card job-card-full">
      <div class="job-card-top">
        <div style="flex:1;min-width:0">
          <div class="job-category">${escHtml(job.category || 'General')}</div>
          <div class="job-title">${escHtml(job.title)}</div>
        </div>
        <div style="flex-shrink:0">${statusBadge(job.status)}</div>
      </div>

      ${job.description
        ? `<p class="job-desc" style="-webkit-line-clamp:2;display:-webkit-box;-webkit-box-orient:vertical;overflow:hidden">${escHtml(job.description)}</p>`
        : ''}

      <div class="job-skills">${skillsHtml}${moreSkills}</div>

      <div class="job-meta">
        <div>
          <span class="job-price">$${Number(job.price).toLocaleString()}</span>
          <span class="job-price-type"> / ${job.paymentType === 'HOURLY' ? 'hr' : 'fixed'}</span>
        </div>
        <span class="job-date">${timeAgo(job.createdAt)}</span>
      </div>

      <div class="apply-actions mt-8">
        <button class="btn btn-outline btn-sm" onclick="viewJobDetail(${job.id})">View Details</button>
        ${renderJobActions(job)}
      </div>
    </div>
  `;
}

function renderJobActions(job) {
  const role = Auth.getRole();
  if (!Auth.isLoggedIn()) {
    return job.status === 'OPEN'
      ? `<a href="login.html" class="btn btn-primary btn-sm">Apply Now</a>`
      : '';
  }
  if (role === 'FREELANCER' && job.status === 'OPEN') {
    return `<button class="btn btn-primary btn-sm" onclick="openApplyModal(${job.id}, '${escHtml(job.title)}')">Apply Now</button>`;
  }
  if (role === 'CLIENT') {
    return `
      <button class="btn btn-ghost btn-sm" onclick="openEditJobModal(${job.id})">Edit</button>
      <button class="btn btn-ghost btn-sm" onclick="deleteJob(${job.id})">Delete</button>
    `;
  }
  if (role === 'ADMIN') {
    return `<button class="btn btn-danger btn-sm" onclick="adminDeleteJob(${job.id})">Delete</button>`;
  }
  return '';
}

// ── FILTERS ──
function applyFilters() {
  const q       = document.getElementById('searchQ').value.toLowerCase();
  const status  = document.getElementById('filterStatus').value;
  const payment = document.getElementById('filterPayment').value;

  const filtered = allJobs.filter(j => {
    const skills = Array.isArray(j.skills) ? j.skills.join(' ') : (j.skills || '');
    const matchQ = !q || [j.title, j.description, j.category, skills]
      .some(s => (s || '').toLowerCase().includes(q));
    const matchStatus  = !status  || j.status      === status;
    const matchPayment = !payment || j.paymentType  === payment;
    return matchQ && matchStatus && matchPayment;
  });

  renderJobs(filtered);
}

function clearFilters() {
  document.getElementById('searchQ').value = '';
  document.getElementById('filterStatus').value = '';
  document.getElementById('filterPayment').value = '';
  applyFilters();
}

// ── VIEW JOB DETAIL ──
function viewJobDetail(id) {
  const job = allJobs.find(j => j.id === id);
  if (!job) return;

  const skills = Array.isArray(job.skills) ? job.skills : (job.skills || '').split(',');
  const skillsHtml = skills.map(s => `<span class="tag">${escHtml(s.trim())}</span>`).join('');

  document.getElementById('detailTitle').textContent = job.title;
  document.getElementById('jobDetailBody').innerHTML = `
    <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:16px">
      ${statusBadge(job.status)}
      <span class="badge badge-blue">${job.paymentType}</span>
      <span style="font-size:.82rem;color:var(--gray-500)">${formatDate(job.createdAt)}</span>
    </div>
    <div style="font-size:.78rem;font-weight:700;color:var(--primary);margin-bottom:6px">${escHtml(job.category)}</div>
    <h3 style="margin-bottom:12px">${escHtml(job.title)}</h3>
    ${job.description ? `<p style="margin-bottom:16px;line-height:1.7">${escHtml(job.description)}</p>` : ''}
    <div class="divider"></div>
    <div style="display:flex;gap:24px;flex-wrap:wrap;margin-bottom:16px">
      <div>
        <div style="font-size:.75rem;color:var(--gray-500);font-weight:600">BUDGET</div>
        <div style="font-size:1.3rem;font-weight:800;color:var(--primary)">$${Number(job.price).toLocaleString()}</div>
        <div style="font-size:.75rem;color:var(--gray-400)">${job.paymentType === 'HOURLY' ? 'per hour' : 'fixed price'}</div>
      </div>
    </div>
    <div style="font-size:.82rem;font-weight:700;color:var(--gray-600);margin-bottom:8px">REQUIRED SKILLS</div>
    <div style="display:flex;flex-wrap:wrap;gap:6px">${skillsHtml}</div>
  `;

  const footer = document.getElementById('jobDetailFooter');
  const role = Auth.getRole();
  let footerHtml = `<button class="btn btn-ghost" onclick="closeModal('jobDetailModal')">Close</button>`;

  if (!Auth.isLoggedIn() && job.status === 'OPEN') {
    footerHtml += `<a href="login.html" class="btn btn-primary">Apply Now</a>`;
  } else if (role === 'FREELANCER' && job.status === 'OPEN') {
    footerHtml += `<button class="btn btn-primary" onclick="closeModal('jobDetailModal'); openApplyModal(${job.id}, '${escHtml(job.title)}')">Apply Now</button>`;
  }
  footer.innerHTML = footerHtml;

  openModal('jobDetailModal');
}

// ── APPLY MODAL ──
function openApplyModal(jobId, jobTitle) {
  if (!Auth.isLoggedIn()) { window.location.href = 'login.html'; return; }
  if (!Auth.isFreelancer()) { showToast('Only freelancers can apply to jobs.', 'error'); return; }

  document.getElementById('applyJobId').value = jobId;
  document.getElementById('applyJobTitle').textContent = jobTitle;
  document.getElementById('applyLetter').value = '';
  document.getElementById('applyAmount').value = '';
  document.getElementById('applyDays').value = '';
  hideAlert('applyAlert');
  openModal('applyModal');
}

async function submitProposal() {
  const jobId  = document.getElementById('applyJobId').value;
  const letter = document.getElementById('applyLetter').value.trim();
  const amount = document.getElementById('applyAmount').value;
  const days   = document.getElementById('applyDays').value;
  const btn    = document.getElementById('applySubmitBtn');

  hideAlert('applyAlert');

  if (!letter)       { showAlert('applyAlert', 'Please write a cover letter.'); return; }
  if (!amount || +amount < 1) { showAlert('applyAlert', 'Please enter a valid bid amount.'); return; }
  if (!days   || +days   < 1) { showAlert('applyAlert', 'Please enter estimated days.'); return; }

  setBtnLoading(btn, true, 'Submitting...');
  try {
    await ProposalsAPI.create(jobId, {
      coverLetter:   letter,
      amount:        Number(amount),
      estimatedDays: Number(days),
    });
    closeModal('applyModal');
    showToast('Proposal submitted! The client has been notified by email.', 'success');
  } catch (err) {
    showAlert('applyAlert', getErrorMessage(err));
    setBtnLoading(btn, false);
  }
}

// ── CREATE / EDIT JOB (CLIENT) ──
function openCreateJobModal() {
  document.getElementById('jobModalTitle').textContent = 'Post a New Job';
  document.getElementById('editJobId').value = '';
  document.getElementById('jobTitle').value = '';
  document.getElementById('jobDesc').value = '';
  document.getElementById('jobPayment').value = 'FIXED';
  document.getElementById('jobPrice').value = '';
  document.getElementById('jobCategory').value = '';
  document.getElementById('jobSkills').value = '';
  hideAlert('jobFormAlert');
  openModal('createJobModal');
}

async function openEditJobModal(id) {
  const job = allJobs.find(j => j.id === id);
  if (!job) return;

  document.getElementById('jobModalTitle').textContent = 'Edit Job';
  document.getElementById('editJobId').value  = job.id;
  document.getElementById('jobTitle').value   = job.title || '';
  document.getElementById('jobDesc').value    = job.description || '';
  document.getElementById('jobPayment').value = job.paymentType || 'FIXED';
  document.getElementById('jobPrice').value   = job.price || '';
  document.getElementById('jobCategory').value = job.category || '';
  const skills = Array.isArray(job.skills) ? job.skills.join(', ') : (job.skills || '');
  document.getElementById('jobSkills').value  = skills;
  hideAlert('jobFormAlert');
  openModal('createJobModal');
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
    title,
    description: desc,
    paymentType: payment,
    price: Number(price),
    category,
    skills: skills.split(',').map(s => s.trim()).filter(Boolean),
  };

  setBtnLoading(btn, true, 'Saving...');
  try {
    if (id) {
      await JobsAPI.update(id, data);
      showToast('Job updated successfully.', 'success');
    } else {
      await JobsAPI.create(data);
      showToast('Job posted successfully!', 'success');
    }
    closeModal('createJobModal');
    await loadJobs();
  } catch (err) {
    showAlert('jobFormAlert', getErrorMessage(err));
    setBtnLoading(btn, false);
  }
}

// ── DELETE JOB ──
function deleteJob(id) {
  const job = allJobs.find(j => j.id === id);
  showConfirm({
    title: 'Delete Job',
    message: `Are you sure you want to delete <span class="confirm-name">"${escHtml(job?.title || '')}"</span>? This will also remove all proposals.`,
    confirmText: 'Delete Job',
    onConfirm: async () => {
      try {
        await JobsAPI.remove(id);
        showToast('Job deleted.', 'success');
        await loadJobs();
      } catch (err) {
        showToast(getErrorMessage(err), 'error');
      }
    }
  });
}

async function adminDeleteJob(id) {
  const job = allJobs.find(j => j.id === id);
  showConfirm({
    title: 'Admin: Delete Job',
    message: `Delete <span class="confirm-name">"${escHtml(job?.title || '')}"</span> as admin?`,
    confirmText: 'Delete',
    onConfirm: async () => {
      try {
        await JobsAPI.adminDelete(id);
        showToast('Job deleted by admin.', 'success');
        await loadJobs();
      } catch (err) {
        showToast(getErrorMessage(err), 'error');
      }
    }
  });
}
