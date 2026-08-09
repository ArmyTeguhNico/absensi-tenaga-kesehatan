// Main application logic for user dashboard

document.addEventListener('DOMContentLoaded', () => {
  // Initialize app
  initApp();
});

function initApp() {
  const loginForm = document.getElementById('loginForm');
  const logoutBtn = document.getElementById('logoutBtn');
  
  // Login form handler
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
  
  // Logout button handler
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }
  
  // If on app page, initialize
  const appPage = document.getElementById('appPage');
  if (appPage && appPage.classList.contains('active')) {
    initUserDashboard();
  }
}

// Handle login
async function handleLogin(e) {
  e.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const errorDiv = document.getElementById('loginError');
  
  try {
    const user = await login(email, password);
    
    // Redirect based on role
    if (user.role === 'admin') {
      window.location.href = '/admin.html';
    } else {
      showPage('appPage');
      initUserDashboard();
    }
  } catch (error) {
    errorDiv.textContent = error.message;
    errorDiv.style.display = 'block';
  }
}

// Initialize user dashboard
function initUserDashboard() {
  const user = getUserData();
  
  // Set user name
  document.getElementById('userName').textContent = user.name;
  
  // Build menu
  buildUserMenu();
  
  // Load dashboard data
  loadDashboardData();
  
  // Set up navigation
  setupNavigation();
  
  // Set up absensi page
  setupAbsensiPage();
  
  // Set up leave form
  setupLeaveForm();
  
  // Start clock
  updateClock();
  setInterval(updateClock, 1000);
}

// Build user menu
function buildUserMenu() {
  const menu = document.getElementById('sidebarMenu');
  const menuItems = [
    { page: 'dashboardUser', icon: 'home', text: 'Dashboard' },
    { page: 'absensiPage', icon: 'fingerprint', text: 'Absensi' },
    { page: 'riwayatPage', icon: 'history', text: 'Riwayat' },
    { page: 'izinPage', icon: 'file-alt', text: 'Izin/Cuti' },
    { page: 'profilePage', icon: 'user', text: 'Profile' }
  ];
  
  menu.innerHTML = menuItems.map(item => `
    <li>
      <a href="#" data-page="${item.page}" class="${item.page === 'dashboardUser' ? 'active' : ''}">
        <i class="fas fa-${item.icon}"></i> ${item.text}
      </a>
    </li>
  `).join('');
}

// Setup navigation
function setupNavigation() {
  document.querySelectorAll('.sidebar-menu a').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const page = link.getAttribute('data-page');
      showContentSection(page);
      
      // Update active menu
      document.querySelectorAll('.sidebar-menu a').forEach(a => a.classList.remove('active'));
      link.classList.add('active');
      
      // Load data for specific pages
      if (page === 'riwayatPage') {
        loadAttendanceHistory();
      } else if (page === 'izinPage') {
        loadLeaveHistory();
      } else if (page === 'profilePage') {
        loadProfile();
      }
    });
  });
}

// Show content section
function showContentSection(sectionId) {
  document.querySelectorAll('.content-section').forEach(section => {
    section.classList.remove('active');
  });
  document.getElementById(sectionId).classList.add('active');
}

// Update clock
function updateClock() {
  const now = new Date();
  
  // Update time
  const timeEl = document.getElementById('currentTime');
  if (timeEl) {
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    timeEl.textContent = `${hours}:${minutes}:${seconds}`;
  }
  
  // Update date
  const dateEl = document.getElementById('currentDate');
  if (dateEl) {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    dateEl.textContent = `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
  }
}

// Load dashboard data
async function loadDashboardData() {
  try {
    // Load today's attendance
    const todayData = await apiCall(API_ENDPOINTS.TODAY_ATTENDANCE);
    updateTodayStatus(todayData.data);
    
    // Load statistics (simplified - you can enhance this)
    const historyData = await apiCall(`${API_ENDPOINTS.ATTENDANCE_HISTORY}?limit=100`);
    updateStats(historyData.data);
  } catch (error) {
    console.error('Error loading dashboard:', error);
  }
}

// Update today status
function updateTodayStatus(data) {
  const statusDiv = document.getElementById('todayStatus');
  
  if (!data) {
    statusDiv.innerHTML = '<p class="text-center">Anda belum melakukan absensi hari ini</p>';
    return;
  }
  
  statusDiv.innerHTML = `
    <div class="status-item">
      <div class="icon" style="color: var(--success-color);">
        <i class="fas fa-sign-in-alt"></i>
      </div>
      <div class="time">${formatTime(data.check_in)}</div>
      <div class="label">Jam Masuk</div>
    </div>
    <div class="status-item">
      <div class="icon" style="color: var(--danger-color);">
        <i class="fas fa-sign-out-alt"></i>
      </div>
      <div class="time">${formatTime(data.check_out)}</div>
      <div class="label">Jam Pulang</div>
    </div>
  `;
}

// Update stats
function updateStats(attendanceData) {
  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();
  
  const monthData = attendanceData.filter(a => {
    const date = new Date(a.date);
    return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
  });
  
  const hadir = monthData.filter(a => a.status === 'hadir').length;
  const alpha = monthData.filter(a => a.status === 'alpha').length;
  const izin = monthData.filter(a => ['izin', 'sakit', 'cuti'].includes(a.status)).length;
  
  // Count late (simple check: check_in > 08:15)
  const telat = monthData.filter(a => a.check_in && a.check_in > '08:15:00').length;
  
  document.getElementById('statHadir').textContent = hadir;
  document.getElementById('statTelat').textContent = telat;
  document.getElementById('statAlpha').textContent = alpha;
  document.getElementById('statIzin').textContent = izin;
}

// Setup absensi page
function setupAbsensiPage() {
  const checkInBtn = document.getElementById('checkInBtn');
  const checkOutBtn = document.getElementById('checkOutBtn');
  
  checkInBtn.addEventListener('click', handleCheckIn);
  checkOutBtn.addEventListener('click', handleCheckOut);
  
  // Check today's status to enable/disable buttons
  checkTodayAttendance();
}

// Check today's attendance
async function checkTodayAttendance() {
  try {
    const data = await apiCall(API_ENDPOINTS.TODAY_ATTENDANCE);
    const checkInBtn = document.getElementById('checkInBtn');
    const checkOutBtn = document.getElementById('checkOutBtn');
    
    if (data.data) {
      if (data.data.check_in) {
        checkInBtn.disabled = true;
        checkOutBtn.disabled = false;
      }
      if (data.data.check_out) {
        checkOutBtn.disabled = true;
      }
    }
  } catch (error) {
    console.error('Error checking attendance:', error);
  }
}

// Handle check in
async function handleCheckIn() {
  const notes = document.getElementById('absenNotes').value;
  
  try {
    await apiCall(API_ENDPOINTS.CHECK_IN, 'POST', {
      notes,
      location: 'Browser'
    });
    
    showNotification('Absen masuk berhasil!', 'success');
    document.getElementById('checkInBtn').disabled = true;
    document.getElementById('checkOutBtn').disabled = false;
    loadDashboardData();
  } catch (error) {
    showNotification(error.message, 'error');
  }
}

// Handle check out
async function handleCheckOut() {
  const notes = document.getElementById('absenNotes').value;
  
  try {
    await apiCall(API_ENDPOINTS.CHECK_OUT, 'POST', {
      notes,
      location: 'Browser'
    });
    
    showNotification('Absen pulang berhasil!', 'success');
    document.getElementById('checkOutBtn').disabled = true;
    loadDashboardData();
  } catch (error) {
    showNotification(error.message, 'error');
  }
}

// Load attendance history
async function loadAttendanceHistory() {
  try {
    const data = await apiCall(`${API_ENDPOINTS.ATTENDANCE_HISTORY}?limit=30`);
    const tbody = document.getElementById('riwayatTable');
    
    if (data.data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center">Tidak ada data</td></tr>';
      return;
    }
    
    tbody.innerHTML = data.data.map(item => `
      <tr>
        <td>${formatDate(item.date)}</td>
        <td>${formatTime(item.check_in)}</td>
        <td>${formatTime(item.check_out)}</td>
        <td><span class="badge ${getStatusBadgeClass(item.status)}">${getStatusText(item.status)}</span></td>
        <td>${item.notes || '-'}</td>
      </tr>
    `).join('');
  } catch (error) {
    console.error('Error loading history:', error);
  }
}

// Setup leave form
function setupLeaveForm() {
  const form = document.getElementById('leaveForm');
  form.addEventListener('submit', handleLeaveSubmit);
}

// Handle leave submit
async function handleLeaveSubmit(e) {
  e.preventDefault();
  
  const leaveType = document.getElementById('leaveType').value;
  const startDate = document.getElementById('startDate').value;
  const endDate = document.getElementById('endDate').value;
  const reason = document.getElementById('leaveReason').value;
  
  try {
    await apiCall(API_ENDPOINTS.LEAVES, 'POST', {
      leave_type: leaveType,
      start_date: startDate,
      end_date: endDate,
      reason
    });
    
    showNotification('Pengajuan izin berhasil disubmit!', 'success');
    e.target.reset();
    loadLeaveHistory();
  } catch (error) {
    showNotification(error.message, 'error');
  }
}

// Load leave history
async function loadLeaveHistory() {
  try {
    const data = await apiCall(API_ENDPOINTS.MY_LEAVES);
    const container = document.getElementById('leaveHistory');
    
    if (data.data.length === 0) {
      container.innerHTML = '<p class="text-center">Tidak ada data pengajuan</p>';
      return;
    }
    
    container.innerHTML = data.data.map(item => `
      <div class="leave-card">
        <div class="leave-card-header">
          <span class="leave-card-type">${getStatusText(item.leave_type)}</span>
          <span class="badge ${getStatusBadgeClass(item.status)}">${getStatusText(item.status)}</span>
        </div>
        <div class="leave-card-body">
          <p><strong>Periode:</strong> ${formatDate(item.start_date)} - ${formatDate(item.end_date)}</p>
          <p><strong>Alasan:</strong> ${item.reason}</p>
          ${item.notes ? `<p><strong>Catatan:</strong> ${item.notes}</p>` : ''}
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading leave history:', error);
  }
}

// Load profile
async function loadProfile() {
  try {
    const data = await apiCall(API_ENDPOINTS.PROFILE);
    const container = document.getElementById('profileInfo');
    const user = data.data;
    
    container.innerHTML = `
      <div class="row">
        <div class="col-md-6">
          <table class="table">
            <tr><td><strong>NIP</strong></td><td>${user.nip}</td></tr>
            <tr><td><strong>Nama</strong></td><td>${user.name}</td></tr>
            <tr><td><strong>Email</strong></td><td>${user.email}</td></tr>
            <tr><td><strong>No. Telepon</strong></td><td>${user.phone || '-'}</td></tr>
            <tr><td><strong>Departemen</strong></td><td>${user.department_name || '-'}</td></tr>
            <tr><td><strong>Jabatan</strong></td><td>${user.position_name || '-'}</td></tr>
            <tr><td><strong>Status</strong></td><td><span class="badge ${getStatusBadgeClass(user.status)}">${getStatusText(user.status)}</span></td></tr>
          </table>
        </div>
        <div class="col-md-6">
          <p><strong>Alamat:</strong></p>
          <p>${user.address || '-'}</p>
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Error loading profile:', error);
  }
}
