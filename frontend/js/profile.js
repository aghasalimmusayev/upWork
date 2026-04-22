/* ============================================================
   PROFILE.JS — Profile page: view, edit, password, delete
   ============================================================ */

if (!requireAuth()) throw new Error('Auth required');

let currentUser = Auth.getUser();

// ── INIT ──
(async function init() {
  renderNavbar('profile');
  await loadProfile();
})();

// ── LOAD PROFILE ──
async function loadProfile() {
  // 1) İlk öncə localStorage-dakı tam datanı göstər
  //    (login/register zamanı name, surname, phone da saxlanılır)
  const stored = Auth.getUser() || {};
  currentUser = stored;
  fillProfileUI(currentUser);

  // 2) API-dan fresh data al, merge et (profile endpoint yalnız {id,email,role} qaytara bilər)
  try {
    const fresh = await AuthAPI.profile();
    // API-dan gələn field-lar üstünlük qazanır, amma boş/undefined olanları stored ilə doldur
    currentUser = { ...stored, ...fresh };
    localStorage.setItem('user', JSON.stringify(currentUser));
    fillProfileUI(currentUser);
  } catch (err) {
    // Stored data artıq göstərilir, sessiya xətasıdırsa redirect olar
    console.warn('Profile refresh failed:', getErrorMessage(err));
  }
}

function fillProfileUI(user) {
  if (!user) return;

  // Avatar
  const initials = ((user.name?.[0] || '') + (user.surname?.[0] || '')).toUpperCase()
    || user.email[0].toUpperCase();
  document.getElementById('profileAvatar').textContent  = initials;
  document.getElementById('profileFullName').textContent =
    user.name ? `${user.name} ${user.surname || ''}`.trim() : user.email;
  document.getElementById('profileEmail').textContent   = user.email;
  document.getElementById('profileRoleBadge').innerHTML = statusBadge(user.role);

  // Form fields
  document.getElementById('editName').value    = user.name    || '';
  document.getElementById('editSurname').value = user.surname || '';
  document.getElementById('editPhone').value   = user.phone   || '';
  document.getElementById('editEmail').value   = user.email   || ''; // readonly, display only
}

// ── SECTION SWITCH ──
function showSection(name, btn) {
  document.querySelectorAll('.admin-section').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.sidebar-link').forEach(el => el.classList.remove('active'));
  document.getElementById(`section-${name}`)?.classList.add('active');
  if (btn) btn.classList.add('active');
}

// ── SAVE PROFILE ──
async function saveProfile() {
  const name    = document.getElementById('editName').value.trim();
  const surname = document.getElementById('editSurname').value.trim();
  const phone   = document.getElementById('editPhone').value.trim();
  const btn     = document.getElementById('saveInfoBtn');

  hideAlert('infoAlert');
  hideAlert('infoSuccess');

  // UpdateUserDto: name, surname, role, phone — email YOXdur!
  // forbidNonWhitelisted:true olduğu üçün email göndərsək 400 alırıq
  const data = {};
  if (name)    data.name    = name;
  if (surname) data.surname = surname;
  if (phone)   data.phone   = phone;

  setBtnLoading(btn, true, 'Saving...');
  try {
    const updated = await UsersAPI.update(currentUser.id, data);
    // Stored data ilə merge et — backend bütün field-ları qaytarmaya bilər
    currentUser = { ...currentUser, ...updated };
    localStorage.setItem('user', JSON.stringify(currentUser));
    fillProfileUI(currentUser);
    showAlert('infoSuccess', '✅ Profile updated successfully!', 'success');
    showToast('Profile saved!', 'success');
  } catch (err) {
    showAlert('infoAlert', getErrorMessage(err));
  } finally {
    setBtnLoading(btn, false);
  }
}

// ── CHANGE PASSWORD ──
async function changePassword() {
  const oldPwd  = document.getElementById('oldPassword').value;
  const newPwd  = document.getElementById('newPassword').value;
  const confirm = document.getElementById('confirmPassword').value;
  const btn     = document.getElementById('savePwdBtn');

  hideAlert('pwdAlert');
  hideAlert('pwdSuccess');

  if (!oldPwd || !newPwd || !confirm) {
    showAlert('pwdAlert', 'All password fields are required.');
    return;
  }
  if (newPwd.length < 6) {
    showAlert('pwdAlert', 'New password must be at least 6 characters.');
    return;
  }
  if (newPwd !== confirm) {
    showAlert('pwdAlert', 'New passwords do not match.');
    return;
  }
  if (oldPwd === newPwd) {
    showAlert('pwdAlert', 'New password must be different from the current password.');
    return;
  }

  setBtnLoading(btn, true, 'Updating...');
  try {
    await UsersAPI.changePassword(currentUser.id, {
      oldPassword: oldPwd,
      password:    newPwd,
    });

    showAlert('pwdSuccess', '✅ Password updated. Please sign in again.', 'success');
    document.getElementById('oldPassword').value    = '';
    document.getElementById('newPassword').value    = '';
    document.getElementById('confirmPassword').value = '';

    showToast('Password changed. Signing you out...', 'success');
    setTimeout(async () => {
      Auth.clear();
      window.location.href = 'login.html';
    }, 2000);
  } catch (err) {
    // Backend errors: "Your current password is wrong", "You can not use the same password"
    showAlert('pwdAlert', getErrorMessage(err));
    setBtnLoading(btn, false);
  }
}

// ── LOGOUT ALL ──
async function logoutAll() {
  showConfirm({
    title: 'Sign Out All Devices',
    message: 'This will revoke all active sessions. You will need to sign in again on all devices.',
    confirmText: 'Sign Out All',
    onConfirm: async () => {
      try {
        await AuthAPI.logoutAll();
        Auth.clear();
        showToast('Signed out from all devices.', 'info');
        setTimeout(() => window.location.href = 'login.html', 800);
      } catch (err) {
        showToast(getErrorMessage(err), 'error');
      }
    }
  });
}

// ── DELETE ACCOUNT ──
function confirmDelete() {
  showConfirm({
    title: 'Delete Account',
    message: `
      <p class="confirm-text">This will permanently delete your account and all associated data. 
      <strong>This action cannot be undone.</strong></p>
    `,
    confirmText: 'Delete My Account',
    dangerous: true,
    onConfirm: async () => {
      try {
        await UsersAPI.remove(currentUser.id);
        Auth.clear();
        showToast('Account deleted. Goodbye!', 'info');
        setTimeout(() => window.location.href = 'index.html', 1000);
      } catch (err) {
        showToast(getErrorMessage(err), 'error');
      }
    }
  });
}