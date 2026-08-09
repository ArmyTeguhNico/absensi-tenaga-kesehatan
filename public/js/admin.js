// Admin dashboard logic

document.addEventListener('DOMContentLoaded', () => {
  requireAdmin();
  initAdminDashboard();
});

function initAdminDashboard() {
  const user = getUserData();
  document.getElementById('userName').textContent = user.name;
  
  // Setup navigation
  setupAdminNavigation();
  
  // Setup logout
  document.getElementById('logoutBtn').addEventListener('click', logout);
  
  // Load initial data
  loadAdminDashboard();
  
  // Setup modals
  setupModals();
  
  // Setup filters
  setupFilters();
}

// Setup navigation
function setupAdminNavigation() {
  document.querySelectorAll('.sidebar-menu a').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const page = link.getAttribute('data-page');
      showContentSection(page);
      
      // Update active menu
      document.querySelectorAll('.sidebar-menu a').forEach(a => a.classList.remove('active'));
      link.classList.add('active');
      
      // Load data for specific pages
      if (page === 'allAttendance') {
        loadAllAttendance();
      } else if (page === 'manageUsers') {
        loadUsers();
      } else if (page === 'manageLeaves') {
        loadAllLeaves();
      } else if (page === 'reports') {
        setupReports();
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

// Load admin dashboard
async function loadAdminDashboard() {
  try {
    const today = formatDateForInput(new Date());
    
    // Load stats
    const statsData = await apiCall(API_ENDPOINTS.ATTENDANCE_STATS);
    updateAdminStats(statsData.data);
    
    // Load recent attendance
    const attendanceData = await apiCall(`${API_ENDPOINTS.ALL_ATTENDANCE}?date=${today}&limit=10`);
    updateRecentAttendance(attendanceData.data);
  } catch (error) {
    console.error('Error loading admin dashboard:', error);
  }
}

// Update admin stats
function updateAdminStats(data) {
  document.getElementById('totalUsers').textContent = data.totalUsers || 0;
  
  const stats = data.stats || [];
  const hadir = stats.find(s => s.status === 'hadir')?.count || 0;
  const telat = 0; // Can be calculated based on time
  const absent = data.totalUsers - hadir;
  
  document.getElementById('todayPresent').textContent = hadir;
  document.getElementById('todayLate').textContent = telat;
  document.getElementById('todayAbsent').textContent = absent;
}

// Update recent attendance
function updateRecentAttendance(data) {
  const tbody = document.getElementById('recentAttendance');
  
  if (data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center">Tidak ada data</td></tr>';
    return;
  }
  
  tbody.innerHTML = data.map(item => `
    <tr>
      <td>${item.nip}</td>
      <td>${item.name}</td>
      <td>${item.department_name || '-'}</td>
      <td>${formatTime(item.check_in)}</td>
      <td>${formatTime(item.check_out)}</td>
      <td><span class="badge ${getStatusBadgeClass(item.status)}">${getStatusText(item.status)}</span></td>
    </tr>
  `).join('');
}

// Load all attendance
async function loadAllAttendance(filters = {}) {
  try {
    let url = API_ENDPOINTS.ALL_ATTENDANCE;
    const params = new URLSearchParams();
    
    if (filters.date) params.append('date', filters.date);
    if (filters.department_id) params.append('department_id', filters.department_id);
    
    if (params.toString()) {
      url += '?' + params.toString();
    }
    
    const data = await apiCall(url);
    const tbody = document.getElementById('allAttendanceTable');
    
    if (data.data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center">Tidak ada data</td></tr>';
      return;
    }
    
    tbody.innerHTML = data.data.map(item => `
      <tr>
        <td>${formatDate(item.date)}</td>
        <td>${item.nip}</td>
        <td>${item.name}</td>
        <td>${item.department_name || '-'}</td>
        <td>${formatTime(item.check_in)}</td>
        <td>${formatTime(item.check_out)}</td>
        <td><span class="badge ${getStatusBadgeClass(item.status)}">${getStatusText(item.status)}</span></td>
      </tr>
    `).join('');
  } catch (error) {
    console.error('Error loading attendance:', error);
  }
}

// Load users
async function loadUsers() {
  try {
    const data = await apiCall(`${API_ENDPOINTS.USERS}?limit=100`);
    const tbody = document.getElementById('usersTable');
    
    if (data.data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center">Tidak ada data</td></tr>';
      return;
    }
    
    tbody.innerHTML = data.data.map(item => `
      <tr>
        <td>${item.nip}</td>
        <td>${item.name}</td>
        <td>${item.email}</td>
        <td>${item.department_name || '-'}</td>
        <td>${item.position_name || '-'}</td>
        <td><span class="badge ${getStatusBadgeClass(item.status)}">${getStatusText(item.status)}</span></td>
        <td>
          <button class="btn btn-sm btn-primary" onclick="editUser(${item.id})">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-sm btn-danger" onclick="deleteUser(${item.id})">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    `).join('');
    
    // Load departments and positions for form
    await loadDepartmentsAndPositions();
  } catch (error) {
    console.error('Error loading users:', error);
  }
}

// Load departments and positions
async function loadDepartmentsAndPositions() {
  try {
    const [deptData, posData] = await Promise.all([
      apiCall(API_ENDPOINTS.DEPARTMENTS),
      apiCall(API_ENDPOINTS.POSITIONS)
    ]);
    
    // Populate department selects
    const deptSelects = [
      document.getElementById('userDepartment'),
      document.getElementById('filterDepartment')
    ];
    
    deptSelects.forEach(select => {
      if (select) {
        const currentValue = select.value;
        select.innerHTML = '<option value="">Pilih Departemen</option>' +
          deptData.data.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
        if (currentValue) select.value = currentValue;
      }
    });
    
    // Populate position select
    const posSelect = document.getElementById('userPosition');
    if (posSelect) {
      const currentValue = posSelect.value;
      posSelect.innerHTML = '<option value="">Pilih Jabatan</option>' +
        posData.data.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
      if (currentValue) posSelect.value = currentValue;
    }
  } catch (error) {
    console.error('Error loading departments/positions:', error);
  }
}

// Setup modals
function setupModals() {
  const userModal = document.getElementById('userModal');
  const btnAddUser = document.getElementById('btnAddUser');
  const userForm = document.getElementById('userForm');
  
  // Add user button
  btnAddUser.addEventListener('click', () => {
    document.getElementById('userModalTitle').textContent = 'Tambah Pegawai';
    userForm.reset();
    document.getElementById('userId').value = '';
    document.getElementById('userPassword').required = true;
    userModal.classList.add('show');
  });
  
  // Close modal
  document.querySelectorAll('.close, .close-modal').forEach(btn => {
    btn.addEventListener('click', () => {
      userModal.classList.remove('show');
    });
  });
  
  // Submit form
  userForm.addEventListener('submit', handleUserSubmit);
}

// Handle user submit
async function handleUserSubmit(e) {
  e.preventDefault();
  
  const userId = document.getElementById('userId').value;
  const formData = {
    nip: document.getElementById('userNip').value,
    name: document.getElementById('userNama').value,
    email: document.getElementById('userEmail').value,
    phone: document.getElementById('userPhone').value,
    address: document.getElementById('userAddress').value,
    department_id: document.getElementById('userDepartment').value,
    position_id: document.getElementById('userPosition').value,
    role: document.getElementById('userRole').value,
    status: document.getElementById('userStatus').value
  };
  
  const password = document.getElementById('userPassword').value;
  if (password) {
    formData.password = password;
  }
  
  try {
    if (userId) {
      // Update
      await apiCall(API_ENDPOINTS.USER_DETAIL(userId), 'PUT', formData);
      showNotification('User berhasil diperbarui!', 'success');
    } else {
      // Create
      await apiCall(API_ENDPOINTS.USERS, 'POST', formData);
      showNotification('User berhasil ditambahkan!', 'success');
    }
    
    document.getElementById('userModal').classList.remove('show');
    loadUsers();
  } catch (error) {
    showNotification(error.message, 'error');
  }
}

// Edit user
async function editUser(id) {
  try {
    const data = await apiCall(API_ENDPOINTS.USER_DETAIL(id));
    const user = data.data;
    
    document.getElementById('userModalTitle').textContent = 'Edit Pegawai';
    document.getElementById('userId').value = user.id;
    document.getElementById('userNip').value = user.nip;
    document.getElementById('userNama').value = user.name;
    document.getElementById('userEmail').value = user.email;
    document.getElementById('userPhone').value = user.phone || '';
    document.getElementById('userAddress').value = user.address || '';
    document.getElementById('userDepartment').value = user.department_id || '';
    document.getElementById('userPosition').value = user.position_id || '';
    document.getElementById('userRole').value = user.role;
    document.getElementById('userStatus').value = user.status;
    document.getElementById('userPassword').required = false;
    
    document.getElementById('userModal').classList.add('show');
  } catch (error) {
    showNotification(error.message, 'error');
  }
}

// Delete user
async function deleteUser(id) {
  if (!confirm('Apakah Anda yakin ingin menghapus user ini?')) return;
  
  try {
    await apiCall(API_ENDPOINTS.USER_DETAIL(id), 'DELETE');
    showNotification('User berhasil dihapus!', 'success');
    loadUsers();
  } catch (error) {
    showNotification(error.message, 'error');
  }
}

// Load all leaves
async function loadAllLeaves() {
  try {
    const data = await apiCall(API_ENDPOINTS.ALL_LEAVES);
    const container = document.getElementById('leavesTable');
    
    if (data.data.length === 0) {
      container.innerHTML = '<p class="text-center">Tidak ada pengajuan izin</p>';
      return;
    }
    
    container.innerHTML = data.data.map(item => `
      <div class="leave-card">
        <div class="leave-card-header">
          <div>
            <strong>${item.name}</strong> (${item.nip})
            <br><small>${item.department_name || '-'}</small>
          </div>
          <span class="badge ${getStatusBadgeClass(item.status)}">${getStatusText(item.status)}</span>
        </div>
        <div class="leave-card-body">
          <p><strong>Jenis:</strong> ${getStatusText(item.leave_type)}</p>
          <p><strong>Periode:</strong> ${formatDate(item.start_date)} - ${formatDate(item.end_date)}</p>
          <p><strong>Alasan:</strong> ${item.reason}</p>
          ${item.status === 'pending' ? `
            <div style="margin-top: 10px;">
              <button class="btn btn-sm btn-success" onclick="processLeave(${item.id}, 'approved')">
                <i class="fas fa-check"></i> Setujui
              </button>
              <button class="btn btn-sm btn-danger" onclick="processLeave(${item.id}, 'rejected')">
                <i class="fas fa-times"></i> Tolak
              </button>
            </div>
          ` : ''}
          ${item.notes ? `<p style="margin-top: 10px;"><strong>Catatan:</strong> ${item.notes}</p>` : ''}
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading leaves:', error);
  }
}

// Process leave
async function processLeave(id, status) {
  const notes = status === 'rejected' ? prompt('Catatan (opsional):') : '';
  
  try {
    await apiCall(API_ENDPOINTS.PROCESS_LEAVE(id), 'PUT', { status, notes });
    showNotification(`Pengajuan berhasil di${status === 'approved' ? 'setujui' : 'tolak'}!`, 'success');
    loadAllLeaves();
  } catch (error) {
    showNotification(error.message, 'error');
  }
}

// Setup filters
function setupFilters() {
  const btnFilter = document.getElementById('btnFilterAttendance');
  if (btnFilter) {
    btnFilter.addEventListener('click', () => {
      const filters = {
        date: document.getElementById('filterDate').value,
        department_id: document.getElementById('filterDepartment').value
      };
      loadAllAttendance(filters);
    });
  }
}

// Setup reports
function setupReports() {
  // Populate month select
  const monthSelect = document.getElementById('reportMonth');
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  monthSelect.innerHTML = months.map((m, i) => `<option value="${i + 1}">${m}</option>`).join('');
  monthSelect.value = new Date().getMonth() + 1;
  
  // Populate year select
  const yearSelect = document.getElementById('reportYear');
  const currentYear = new Date().getFullYear();
  yearSelect.innerHTML = Array.from({length: 5}, (_, i) => currentYear - i)
    .map(y => `<option value="${y}">${y}</option>`).join('');
  
  // Generate button
  document.getElementById('btnGenerateReport').addEventListener('click', generateReport);
}

// Generate report
async function generateReport() {
  const month = document.getElementById('reportMonth').value;
  const year = document.getElementById('reportYear').value;
  
  try {
    const data = await apiCall(`${API_ENDPOINTS.ATTENDANCE_STATS}?month=${month}&year=${year}`);
    const container = document.getElementById('reportContent');
    
    const stats = data.data.stats || [];
    const total = stats.reduce((sum, s) => sum + s.count, 0);
    
    container.innerHTML = `
      <h4>Laporan Bulan ${month}/${year}</h4>
      <div class="stats-grid">
        ${stats.map(s => `
          <div class="stat-card">
            <div class="stat-icon bg-${s.status === 'hadir' ? 'success' : s.status === 'alpha' ? 'danger' : 'warning'}">
              <i class="fas fa-${s.status === 'hadir' ? 'check' : s.status === 'alpha' ? 'times' : 'clock'}"></i>
            </div>
            <div class="stat-info">
              <h3>${s.count}</h3>
              <p>${getStatusText(s.status)}</p>
            </div>
          </div>
        `).join('')}
        <div class="stat-card">
          <div class="stat-icon bg-primary">
            <i class="fas fa-list"></i>
          </div>
          <div class="stat-info">
            <h3>${total}</h3>
            <p>Total</p>
          </div>
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Error generating report:', error);
  }
}
