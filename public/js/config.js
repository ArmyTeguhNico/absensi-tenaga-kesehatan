// API Configuration
// Netlify Functions - API is on same domain
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000/api'
  : '/api';  // Same domain - Netlify Functions

// API Endpoints
const API_ENDPOINTS = {
  // Auth
  LOGIN: `${API_BASE_URL}/auth/login`,
  REGISTER: `${API_BASE_URL}/auth/register`,
  
  // Users
  USERS: `${API_BASE_URL}/users`,
  USER_DETAIL: (id) => `${API_BASE_URL}/users/${id}`,
  USER_STATS: (id) => `${API_BASE_URL}/users/${id}/stats`,
  
  // Attendance
  ATTENDANCE: `${API_BASE_URL}/attendance`,
  ATTENDANCE_CHECKIN: `${API_BASE_URL}/attendance/check-in`,
  ATTENDANCE_CHECKOUT: `${API_BASE_URL}/attendance/check-out`,
  ATTENDANCE_TODAY: (userId) => `${API_BASE_URL}/attendance/today/${userId}`,
  ATTENDANCE_HISTORY: (userId) => `${API_BASE_URL}/attendance/history/${userId}`,
  
  // Leaves
  LEAVES: `${API_BASE_URL}/leaves`,
  LEAVE_DETAIL: (id) => `${API_BASE_URL}/leaves/${id}`,
  LEAVE_APPROVE: (id) => `${API_BASE_URL}/leaves/${id}/approve`,
  LEAVE_REJECT: (id) => `${API_BASE_URL}/leaves/${id}/reject`,
  
  // Departments
  DEPARTMENTS: `${API_BASE_URL}/departments`,
  
  // Positions
  POSITIONS: `${API_BASE_URL}/positions`,
  
  // RFID & Face
  RFID_REGISTER: `${API_BASE_URL}/rfid-face/rfid/register`,
  RFID_VERIFY: `${API_BASE_URL}/rfid-face/rfid/verify`,
  RFID_DELETE: (userId) => `${API_BASE_URL}/rfid-face/rfid/${userId}`,
  FACE_UPLOAD: (userId) => `${API_BASE_URL}/rfid-face/face/upload/${userId}`,
  FACE_EMBEDDINGS: (userId) => `${API_BASE_URL}/rfid-face/face/embeddings/${userId}`,
  FACE_DELETE: (userId) => `${API_BASE_URL}/rfid-face/face/${userId}`,
  RFID_FACE_STATUS: (userId) => `${API_BASE_URL}/rfid-face/status/${userId}`,
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { API_BASE_URL, API_ENDPOINTS };
}
