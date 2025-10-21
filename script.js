
const TOKEN_KEY = 'accessToken';
const EXPIRY_KEY = 'tokenExpiry';
const VALID_USER = 'admin';
const VALID_PASS = 'admin123';
const TOKEN_DURATION_MS = 10 * 60 * 1000;

function generateToken() {
  return Math.random().toString(36).substr(2);
}

function storeToken(token) {
  const expiry = Date.now() + TOKEN_DURATION_MS;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(EXPIRY_KEY, expiry);
}

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function isTokenValid() {
  const token = getToken();
  const expiry = localStorage.getItem(EXPIRY_KEY);
  if (!token || !expiry) return false;
  return Date.now() < parseInt(expiry);
}

function redirectIfNotLoggedIn() {
  if (!isTokenValid()) {
    window.location.href = 'login.html';
  }
}

document.addEventListener('DOMContentLoaded', function () {
  const loginForm = document.getElementById('loginForm');
  const getDataBtn = document.getElementById('getDataBtn');

  if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;

      if (username === VALID_USER && password === VALID_PASS) {
        const token = generateToken();
        storeToken(token);
        window.location.href = 'admin.html';
      } else {
        alert('Invalid credentials!');
      }
    });
  }

  if (getDataBtn) {
    redirectIfNotLoggedIn();

    getDataBtn.addEventListener('click', function () {
      if (!isTokenValid()) {
        alert('Session expired. Please login again.');
        window.location.href = 'login.html';
        return;
      }

      const privateData = "🕵️‍♂️ Đây là dữ liệu mật: TOP SECRET CONTENT";
      document.getElementById('privateData').textContent = privateData;
    });
  }
});
