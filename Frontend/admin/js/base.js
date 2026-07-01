document.addEventListener('DOMContentLoaded', async () => {
    // Proteksi halaman admin: periksa ketersediaan token
    if (!window.location.pathname.includes('login.html')) {
        const token = localStorage.getItem('token_admin');
        if (!token) {
            window.location.href = 'login.html';
            return;
        }
        // Validasi keaslian token ke server via route /auth/check
        try {
            const res = await apiFetch('/auth/check');
            if (!res.ok) throw new Error();
        } catch {
            localStorage.removeItem('token_admin');
            window.location.href = 'login.html';
        }
    }
    
    setupLogout();
});

function setupLogout() {
    const logoutBtn = document.getElementById('action-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            if (confirm('Yakin ingin keluar dari dashboard admin?')) {
                try {
                    await apiFetch('/logout', { method: 'POST' });
                } catch (err) { console.log(err); }
                localStorage.removeItem('token_admin');
                window.location.href = 'login.html';
            }
        });
    }
}