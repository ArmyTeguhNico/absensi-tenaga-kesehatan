// Check authentication
function isAuthenticated() {
  return localStorage.getItem('token') !== null;
}

// Get user data
function getUserData() {
  const userData = localStorage.getItem('userData');
  return userData ? JSON.parse(userData) : null;
}

// Check if user is admin
function isAdmin() {
  const user = getUserData();
  return user && user.role === 'admin';
}

// Redirect if not authenticated
function requireAuth() {
  if (!isAuthenticated()) {
    window.location.href = '/';
  }
}

// Redirect if not admin
function requireAdmin() {
  requireAuth();
  if (!isAdmin()) {
    window.location.href = '/';
  }
}

// Login function
async function login(email, password) {
  try {
    const response = await fetch(API_ENDPOINTS.LOGIN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Login gagal');
    }
    
    // Save token and user data
    localStorage.setItem('token', data.data.token);
    localStorage.setItem('userData', JSON.stringify(data.data.user));
    
    return data.data.user;
  } catch (error) {
    throw error;
  }
}

// Logout function
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('userData');
  window.location.href = '/';
}

// Check if on correct page based on role
function checkPageAccess() {
  const currentPage = window.location.pathname;
  const user = getUserData();
  
  if (!user) return;
  
  // If admin but on index.html, redirect to admin.html
  if (user.role === 'admin' && currentPage.includes('index.html')) {
    window.location.href = '/admin.html';
  }
  
  // If user but on admin.html, redirect to index.html
  if (user.role === 'user' && currentPage.includes('admin.html')) {
    window.location.href = '/';
  }
}

// Initialize auth check on page load
document.addEventListener('DOMContentLoaded', () => {
  // Skip auth check for login page
  const loginPage = document.getElementById('loginPage');
  if (loginPage && loginPage.classList.contains('active')) {
    // If already logged in, redirect to appropriate page
    if (isAuthenticated()) {
      const user = getUserData();
      if (user.role === 'admin') {
        window.location.href = '/admin.html';
      } else {
        showPage('appPage');
      }
    }
  } else {
    // Require auth for app pages
    requireAuth();
    checkPageAccess();
  }
});

// Show/hide pages
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });
  document.getElementById(pageId).classList.add('active');
}

// ============= API HELPER FUNCTIONS =============

// Generic API call with authentication
async function apiCall(url, method = 'GET', body = null) {
  const token = localStorage.getItem('token');
  
  const options = {
    method: method,
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }
  
  if (body && method !== 'GET') {
    options.body = JSON.stringify(body);
  }
  
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    
    if (!response.ok) {
      // Check if token expired
      if (response.status === 401) {
        logout();
        throw new Error('Session expired. Please login again.');
      }
      throw new Error(data.message || `HTTP Error ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error('API Call Error:', error);
    throw error;
  }
}

// Show notification/toast
function showNotification(message, type = 'info') {
  // Remove existing notification
  const existing = document.querySelector('.notification-toast');
  if (existing) {
    existing.remove();
  }
  
  // Create notification
  const notification = document.createElement('div');
  notification.className = `notification-toast notification-${type}`;
  
  const icon = {
    success: 'fa-check-circle',
    error: 'fa-exclamation-circle',
    warning: 'fa-exclamation-triangle',
    info: 'fa-info-circle'
  }[type] || 'fa-info-circle';
  
  notification.innerHTML = `
    <i class="fas ${icon}"></i>
    <span>${message}</span>
  `;
  
  document.body.appendChild(notification);
  
  // Animate in
  setTimeout(() => notification.classList.add('show'), 10);
  
  // Auto remove after 4 seconds
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 4000);
}

// Format date
function formatDate(dateString) {
  if (!dateString) return '-';
  
  const date = new Date(dateString);
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  return date.toLocaleDateString('id-ID', options);
}

// Format date only
function formatDateOnly(dateString) {
  if (!dateString) return '-';
  
  const date = new Date(dateString);
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric'
  };
  
  return date.toLocaleDateString('id-ID', options);
}

// Format time
function formatTime(timeString) {
  if (!timeString) return '-';
  return timeString.substring(0, 5); // HH:MM
}
