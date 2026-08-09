// RFID & Face Registration Logic

let selectedUserId = null;
let capturedPhotos = [];
let videoStream = null;

document.addEventListener('DOMContentLoaded', () => {
  requireAdmin();
  
  const user = getUserData();
  document.getElementById('userName').textContent = user.name;
  
  // Setup
  document.getElementById('logoutBtn').addEventListener('click', logout);
  loadUsers();
  setupSearchUser();
  setupRFIDHandlers();
  setupFaceHandlers();
});

// Load all users
async function loadUsers() {
  try {
    const data = await apiCall(`${API_ENDPOINTS.USERS}?limit=100&status=active`);
    displayUsers(data.data);
  } catch (error) {
    console.error('Error loading users:', error);
    document.getElementById('usersList').innerHTML = '<p class="text-center">Error loading users</p>';
  }
}

// Display users grid
function displayUsers(users) {
  const container = document.getElementById('usersList');
  
  if (users.length === 0) {
    container.innerHTML = '<p class="text-center">Tidak ada pegawai</p>';
    return;
  }
  
  container.innerHTML = users.map(user => `
    <div class="user-card" onclick="selectUser(${user.id})">
      <div class="user-card-avatar">
        <i class="fas fa-user-circle"></i>
      </div>
      <div class="user-card-info">
        <h4>${user.name}</h4>
        <p class="user-nip">${user.nip}</p>
        <p class="user-dept">${user.department_name || '-'}</p>
      </div>
      <div class="user-card-badges">
        ${user.rfid_uid ? '<span class="mini-badge badge-success"><i class="fas fa-id-card"></i></span>' : ''}
        ${user.face_data ? '<span class="mini-badge badge-info"><i class="fas fa-face-smile"></i></span>' : ''}
      </div>
    </div>
  `).join('');
}

// Search users
function setupSearchUser() {
  const searchInput = document.getElementById('searchUser');
  searchInput.addEventListener('input', async (e) => {
    const searchTerm = e.target.value;
    if (searchTerm.length < 2) {
      loadUsers();
      return;
    }
    
    try {
      const data = await apiCall(`${API_ENDPOINTS.USERS}?search=${searchTerm}&limit=50`);
      displayUsers(data.data);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  });
}

// Select user
async function selectUser(userId) {
  selectedUserId = userId;
  
  try {
    // Get user details
    const userData = await apiCall(API_ENDPOINTS.USER_DETAIL(userId));
    const user = userData.data;
    
    // Display user info
    document.getElementById('selectedUserName').textContent = user.name;
    document.getElementById('selectedUserNip').textContent = user.nip;
    document.getElementById('selectedUserEmail').textContent = user.email;
    
    // Show registration panel
    document.getElementById('registrationPanel').style.display = 'block';
    
    // Load RFID & Face status
    await loadRFIDFaceStatus(userId);
    
    // Scroll to panel
    document.getElementById('registrationPanel').scrollIntoView({ behavior: 'smooth' });
  } catch (error) {
    console.error('Error selecting user:', error);
    showNotification('Error loading user data', 'error');
  }
}

// Clear selection
function clearSelection() {
  selectedUserId = null;
  capturedPhotos = [];
  document.getElementById('registrationPanel').style.display = 'none';
  stopCamera();
}

// Load RFID & Face status
async function loadRFIDFaceStatus(userId) {
  try {
    const response = await apiCall(`${API_BASE_URL}/rfid-face/status/${userId}`);
    const status = response.data;
    
    // RFID Status
    if (status.rfid.registered) {
      document.getElementById('rfidStatus').className = 'badge badge-success';
      document.getElementById('rfidStatus').innerHTML = '<i class="fas fa-check"></i> Terdaftar';
      document.getElementById('rfidUid').value = status.rfid.uid;
      document.getElementById('currentRfid').style.display = 'block';
      document.getElementById('currentRfidUid').textContent = status.rfid.uid;
      document.getElementById('currentRfidDate').textContent = `Terdaftar: ${formatDate(status.rfid.registered_at)}`;
      document.getElementById('btnDeleteRfid').style.display = 'inline-flex';
    } else {
      document.getElementById('rfidStatus').className = 'badge badge-secondary';
      document.getElementById('rfidStatus').innerHTML = '<i class="fas fa-times"></i> Belum Terdaftar';
      document.getElementById('currentRfid').style.display = 'none';
      document.getElementById('btnDeleteRfid').style.display = 'none';
    }
    
    // Face Status
    if (status.face.registered) {
      document.getElementById('faceStatus').className = 'badge badge-success';
      document.getElementById('faceStatus').innerHTML = `<i class="fas fa-check"></i> ${status.face.photos_count} Foto Terdaftar`;
      document.getElementById('btnDeleteFace').style.display = 'inline-flex';
    } else {
      document.getElementById('faceStatus').className = 'badge badge-secondary';
      document.getElementById('faceStatus').innerHTML = '<i class="fas fa-times"></i> Belum Terdaftar';
      document.getElementById('btnDeleteFace').style.display = 'none';
    }
  } catch (error) {
    console.error('Error loading status:', error);
  }
}

// ============= RFID HANDLERS =============

function setupRFIDHandlers() {
  document.getElementById('btnRegisterRfid').addEventListener('click', registerRFID);
  document.getElementById('btnTestRfid').addEventListener('click', testRFID);
  document.getElementById('btnDeleteRfid').addEventListener('click', deleteRFID);
  
  // Auto-format RFID input
  document.getElementById('rfidUid').addEventListener('input', (e) => {
    let value = e.target.value.replace(/[^0-9A-Fa-f]/g, '');
    e.target.value = value.toUpperCase();
  });
}

// Register RFID
async function registerRFID() {
  if (!selectedUserId) {
    showNotification('Pilih pegawai terlebih dahulu', 'error');
    return;
  }
  
  const rfidUid = document.getElementById('rfidUid').value.trim();
  if (!rfidUid) {
    showNotification('Masukkan UID RFID', 'error');
    return;
  }
  
  if (rfidUid.length < 8) {
    showNotification('UID RFID minimal 8 karakter', 'error');
    return;
  }
  
  showLoading('Mendaftarkan RFID...');
  
  try {
    await apiCall(`${API_BASE_URL}/rfid-face/rfid/register`, 'POST', {
      userId: selectedUserId,
      rfidUid: rfidUid
    });
    
    showNotification('RFID Card berhasil didaftarkan!', 'success');
    await loadRFIDFaceStatus(selectedUserId);
  } catch (error) {
    showNotification(error.message || 'Gagal mendaftarkan RFID', 'error');
  } finally {
    hideLoading();
  }
}

// Test RFID
async function testRFID() {
  const rfidUid = document.getElementById('rfidUid').value.trim();
  if (!rfidUid) {
    showNotification('Masukkan UID RFID untuk di-test', 'error');
    return;
  }
  
  showLoading('Testing RFID...');
  
  try {
    const response = await apiCall(`${API_BASE_URL}/rfid-face/rfid/verify`, 'POST', {
      rfidUid: rfidUid
    });
    
    showNotification(`RFID terverifikasi untuk: ${response.data.name}`, 'success');
  } catch (error) {
    showNotification(error.message || 'RFID tidak terdaftar', 'error');
  } finally {
    hideLoading();
  }
}

// Delete RFID
async function deleteRFID() {
  if (!selectedUserId) return;
  
  if (!confirm('Hapus registrasi RFID Card?')) return;
  
  showLoading('Menghapus RFID...');
  
  try {
    await apiCall(`${API_BASE_URL}/rfid-face/rfid/${selectedUserId}`, 'DELETE');
    showNotification('RFID Card berhasil dihapus', 'success');
    document.getElementById('rfidUid').value = '';
    await loadRFIDFaceStatus(selectedUserId);
  } catch (error) {
    showNotification(error.message || 'Gagal menghapus RFID', 'error');
  } finally {
    hideLoading();
  }
}

// ============= FACE RECOGNITION HANDLERS =============

function setupFaceHandlers() {
  document.getElementById('btnStartCamera').addEventListener('click', startCamera);
  document.getElementById('btnCapturePhoto').addEventListener('click', capturePhoto);
  document.getElementById('btnSaveFace').addEventListener('click', saveFaceData);
  document.getElementById('btnDeleteFace').addEventListener('click', deleteFaceData);
}

// Start camera
async function startCamera() {
  try {
    videoStream = await navigator.mediaDevices.getUserMedia({ 
      video: { 
        width: 640, 
        height: 480,
        facingMode: 'user'
      } 
    });
    
    const video = document.getElementById('videoPreview');
    video.srcObject = videoStream;
    
    document.getElementById('btnStartCamera').disabled = true;
    document.getElementById('btnCapturePhoto').disabled = false;
    
    showNotification('Kamera aktif! Posisikan wajah di dalam frame', 'success');
  } catch (error) {
    console.error('Error starting camera:', error);
    showNotification('Gagal mengaktifkan kamera. Periksa permission browser.', 'error');
  }
}

// Stop camera
function stopCamera() {
  if (videoStream) {
    videoStream.getTracks().forEach(track => track.stop());
    videoStream = null;
    document.getElementById('videoPreview').srcObject = null;
    document.getElementById('btnStartCamera').disabled = false;
    document.getElementById('btnCapturePhoto').disabled = true;
  }
}

// Capture photo
function capturePhoto() {
  if (capturedPhotos.length >= 5) {
    showNotification('Maksimal 5 foto sudah tercapai', 'warning');
    return;
  }
  
  const video = document.getElementById('videoPreview');
  const canvas = document.getElementById('canvasCapture');
  const ctx = canvas.getContext('2d');
  
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  
  const photoDataUrl = canvas.toDataURL('image/jpeg', 0.9);
  capturedPhotos.push(photoDataUrl);
  
  displayCapturedPhotos();
  updatePhotoProgress();
  
  if (capturedPhotos.length >= 3) {
    document.getElementById('btnSaveFace').disabled = false;
  }
  
  showNotification(`Foto ${capturedPhotos.length} berhasil diambil`, 'success');
}

// Display captured photos
function displayCapturedPhotos() {
  const container = document.getElementById('capturedPhotos');
  container.innerHTML = capturedPhotos.map((photo, index) => `
    <div class="captured-photo">
      <img src="${photo}" alt="Foto ${index + 1}">
      <button class="delete-photo-btn" onclick="deletePhoto(${index})">
        <i class="fas fa-times"></i>
      </button>
      <span class="photo-number">${index + 1}</span>
    </div>
  `).join('');
}

// Delete photo
function deletePhoto(index) {
  capturedPhotos.splice(index, 1);
  displayCapturedPhotos();
  updatePhotoProgress();
  
  if (capturedPhotos.length < 3) {
    document.getElementById('btnSaveFace').disabled = true;
  }
}

// Update photo progress
function updatePhotoProgress() {
  const count = capturedPhotos.length;
  document.getElementById('photoCount').textContent = count;
  document.getElementById('photoProgress').style.width = `${(count / 5) * 100}%`;
}

// Save face data
async function saveFaceData() {
  if (!selectedUserId) {
    showNotification('Pilih pegawai terlebih dahulu', 'error');
    return;
  }
  
  if (capturedPhotos.length < 3) {
    showNotification('Minimal 3 foto diperlukan', 'error');
    return;
  }
  
  showLoading('Menyimpan data wajah...');
  
  try {
    // Upload each photo
    for (let i = 0; i < capturedPhotos.length; i++) {
      await apiCall(`${API_BASE_URL}/rfid-face/face/upload/${selectedUserId}`, 'POST', {
        faceData: capturedPhotos[i],
        photoUrl: capturedPhotos[i] // In real app, upload to storage first
      });
    }
    
    showNotification('Data wajah berhasil disimpan!', 'success');
    capturedPhotos = [];
    displayCapturedPhotos();
    updatePhotoProgress();
    stopCamera();
    await loadRFIDFaceStatus(selectedUserId);
    document.getElementById('btnSaveFace').disabled = true;
  } catch (error) {
    showNotification(error.message || 'Gagal menyimpan data wajah', 'error');
  } finally {
    hideLoading();
  }
}

// Delete face data
async function deleteFaceData() {
  if (!selectedUserId) return;
  
  if (!confirm('Hapus semua data wajah yang terdaftar?')) return;
  
  showLoading('Menghapus data wajah...');
  
  try {
    await apiCall(`${API_BASE_URL}/rfid-face/face/${selectedUserId}`, 'DELETE');
    showNotification('Data wajah berhasil dihapus', 'success');
    await loadRFIDFaceStatus(selectedUserId);
  } catch (error) {
    showNotification(error.message || 'Gagal menghapus data wajah', 'error');
  } finally {
    hideLoading();
  }
}

// ============= UI HELPERS =============

function showLoading(text = 'Memproses...') {
  document.getElementById('loadingText').textContent = text;
  document.getElementById('loadingOverlay').style.display = 'flex';
}

function hideLoading() {
  document.getElementById('loadingOverlay').style.display = 'none';
}
