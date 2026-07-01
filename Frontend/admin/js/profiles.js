document.addEventListener('DOMContentLoaded', () => {
    loadProfileData();
    setupAvatarUpload();
    setupProfileSubmit();
});

// 1. FUNGSI MEMUAT DATA DARI BACKEND SAAT HALAMAN DIBUKA
async function loadProfileData() {
    try {
        const response = await apiFetch('/profiles');
        const result = await response.json();
        
        if (result.success && result.data) {
            const d = result.data;
            
            // Masukkan data ke kotak Input Form
            document.getElementById('p-nama').value = d.nama_lengkap || '';
            document.getElementById('p-panggilan').value = d.nama_panggilan || '';
            document.getElementById('p-tempat').value = d.tempat_lahir || '';
            document.getElementById('p-tgl').value = d.tanggal_lahir ? d.tanggal_lahir.split('T')[0] : '';
            document.getElementById('p-email').value = d.email || '';
            document.getElementById('p-telp').value = d.telepon || '';
            document.getElementById('p-univ').value = d.universitas || '';
            document.getElementById('p-fak').value = d.fakultas || '';
            document.getElementById('p-prodi').value = d.prodi || '';
            document.getElementById('p-sem').value = d.semester || '';
            document.getElementById('p-alamat').value = d.alamat || '';
            
            // Perbarui Teks Preview di bagian bawah secara otomatis
            updateLivePreviewComponent(d);

            if (d.foto_url) {
                document.getElementById('avatar-img-view').src = d.foto_url;
                document.getElementById('p-foto-url').value = d.foto_url;
            }
        }
    } catch (err) { 
        console.error("Gagal memuat awal biodata:", err); 
    }
}

// 2. FUNGSI UNTUK PROSES SUBMIT DATA (MENGGUNAKAN POST KE BACKEND)
function setupProfileSubmit() {
    const formElement = document.getElementById('form-profile-admin');
    
    if (!formElement) return;

    formElement.addEventListener('submit', async (e) => {
        // PENTING: Mencegah data dilempar ke URL browser (?nama_lengkap=...)
        e.preventDefault(); 
        
        const payload = {
            nama_lengkap: document.getElementById('p-nama').value,
            nama_panggilan: document.getElementById('p-panggilan').value,
            tempat_lahir: document.getElementById('p-tempat').value,
            tanggal_lahir: document.getElementById('p-tgl').value,
            email: document.getElementById('p-email').value,
            telepon: document.getElementById('p-telp').value,
            universitas: document.getElementById('p-univ').value,
            fakultas: document.getElementById('p-fak').value,
            prodi: document.getElementById('p-prodi').value,
            semester: parseInt(document.getElementById('p-sem').value) || null,
            alamat: document.getElementById('p-alamat').value,
            foto_url: document.getElementById('p-foto-url').value
        };

        try {
            const response = await apiFetch('/profiles', {
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const resData = await response.json();
            
            if (response.ok && resData.success) {
                alert('Konfigurasi profil sukses diperbarui ke database!');
                
                // Langsung ubah teks komponen preview di bawah tanpa perlu reload halaman
                updateLivePreviewComponent(payload);
            } else {
                alert('Gagal memperbarui profil: ' + (resData.message || 'Cek kelengkapan data'));
            }
        } catch (err) { 
            console.error("Error submit profil:", err);
            alert('Gagal memproses simpan profil.'); 
        }
    });
}

// 3. FUNGSI UNTUK PROSES UPLOAD AVATAR FOTO
function setupAvatarUpload() {
    const fileInp = document.getElementById('upload-avatar-file');
    const avatarView = document.getElementById('avatar-img-view');
    const statusEl = document.getElementById('avatar-upload-status');
    
    if (!fileInp || !avatarView) return;
    
    fileInp.addEventListener('change', async () => {
        if (!fileInp.files.length) return;
        
        avatarView.style.opacity = "0.5";
        if (statusEl) statusEl.textContent = 'Mengunggah foto...';
        const formData = new FormData();
        formData.append('file', fileInp.files[0]);

        try {
            const response = await apiFetch('/upload/image', {
                method: 'POST',
                body: formData 
            });
            const resData = await response.json();
            if (resData.success) {
                avatarView.src = resData.url;
                document.getElementById('p-foto-url').value = resData.url;
                if (statusEl) statusEl.textContent = 'Foto berhasil diunggah ke Cloudinary';
            } else {
                if (statusEl) statusEl.textContent = 'Gagal mengunggah foto: ' + (resData.error || resData.message || 'Format tidak didukung');
            }
        } catch (err) { 
            if (statusEl) statusEl.textContent = 'Terjadi kesalahan jaringan unggahan.';
            console.error(err);
        } finally {
            avatarView.style.opacity = "1";
        }
    });
}

// FUNGSI PEMBANTU: Memperbarui tulisan visual pada komponen teks preview
function updateLivePreviewComponent(data) {
    if(document.getElementById('view-nama-lengkap')) {
        document.getElementById('view-nama-lengkap').innerText = data.nama_lengkap || 'Your Full Name';
    }
    if(document.getElementById('view-nama-panggilan')) {
        document.getElementById('view-nama-panggilan').innerText = data.nama_panggilan || 'Your Nickname';
    }
    if(document.getElementById('view-ttl')) {
        const tempat = data.tempat_lahir || 'City';
        const tgl = data.tanggal_lahir ? data.tanggal_lahir.split('T')[0] : '1 Januari 2000';
        document.getElementById('view-ttl').innerText = `${tempat}, ${tgl}`;
    }
    if(document.getElementById('view-email')) {
        document.getElementById('view-email').innerText = data.email || 'your.email@example.com';
    }
    if(document.getElementById('view-telepon')) {
        document.getElementById('view-telepon').innerText = data.telepon || '08123456789';
    }
    if(document.getElementById('view-universitas')) {
        document.getElementById('view-universitas').innerText = data.universitas || 'University Name';
    }
    if(document.getElementById('view-fakultas')) {
        document.getElementById('view-fakultas').innerText = data.fakultas || 'Faculty Name';
    }
    if(document.getElementById('view-prodi')) {
        document.getElementById('view-prodi').innerText = data.prodi || 'Study Program';
    }
    if(document.getElementById('view-semester')) {
        document.getElementById('view-semester').innerText = data.semester ? `Semester ${data.semester}` : 'Semester 5';
    }
    if(document.getElementById('view-alamat')) {
        document.getElementById('view-alamat').innerText = data.alamat || 'Your Address';
    }
}