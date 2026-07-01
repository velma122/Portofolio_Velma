document.getElementById('admin-login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('inp-username').value;
    const password = document.getElementById('inp-password').value;

    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token_admin', data.token);
            window.location.href = 'dashboard.html';
        } else {
            alert(data.error || 'Autentikasi gagal.');
        }
    } catch (err) {
        alert('Gagal terhubung dengan server API.');
    }
});