const API_BASE_URL = `${window.location.origin}/api`;

// Helper global terpusat untuk fetch data otomatis menyertakan JWT Token
async function apiFetch(endpoint, options = {}) {
    const token = localStorage.getItem('token'); // Disamakan menjadi 'token'
    
    options.headers = options.headers || {};
    if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    
    if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = 'login.html';
        throw new Error('Sesi kedaluwarsa. Silakan login kembali.');
    }
    
    return response;
}