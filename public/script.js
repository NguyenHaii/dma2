async function getProtectedData() {
  let accessToken = localStorage.getItem('accessToken');

  let res = await fetch('/api/protected', {
    headers: { 'Authorization': 'Bearer ' + accessToken }
  });

  if (res.status === 403 || res.status === 401) {
    const refreshToken = localStorage.getItem('refreshToken');
    const refreshRes = await fetch('/api/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });

    if (refreshRes.ok) {
      const data = await refreshRes.json();
      localStorage.setItem('accessToken', data.accessToken);
      return getProtectedData(); 
    } else {
      alert('Session expired. Please login again.');
      location.href = '/login.html';
    }
  } else if (res.ok) {
    const data = await res.json();
    document.getElementById('content').innerText = data.message;
  } else {
    alert('Unauthorized. Redirecting to login.');
    location.href = '/login.html';
  }
}

window.onload = () => {
  const accessToken = localStorage.getItem('accessToken');
  if (!accessToken) {
    location.href = '/login.html';
  } else {
    getProtectedData();
  }
};
