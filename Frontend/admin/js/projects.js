document.addEventListener('DOMContentLoaded', () => {
    loadProjectsGrid();
    setupCloudinaryUpload();
});

async function loadProjectsGrid() {
    try {
        const response = await apiFetch('/projects');
        const result = await response.json();
        if (result.success) {
            const grid = document.getElementById('projects-admin-grid');
            if(result.data.length === 0) {
                grid.innerHTML = `<p style="color:#888;">Belum ada repositori projek buatan.</p>`;
                return;
            }
            grid.innerHTML = result.data.map(p => `
                <div class="admin-proj-card">
                    <img class="apc-img" src="${p.gambar_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400'}" alt="Project">
                    <div class="apc-body">
                        <h3>${p.judul}</h3>
                        <p>${p.deskripsi}</p>
                        <div class="apc-foot">
                            <button class="btn-edit-table" onclick="editProj(${p.id}, '${p.judul}', '${p.link_project || ''}', \`${p.deskripsi}\`, '${p.gambar_url || ''}')">Ubah</button>
                            <button class="btn-delete-table" onclick="deleteProj(${p.id})">Hapus</button>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    } catch (err) { console.error(err); }
}

function openProjModal() {
    document.getElementById('form-proj-crud').reset();
    document.getElementById('proj-id').value = '';
    document.getElementById('pj-gambar-url').value = '';
    document.getElementById('pj-gambar-link').value = '';
    document.getElementById('upload-status-label').innerText = 'Klik untuk mengunggah berkas gambar projek';
    document.getElementById('modal-proj-title').innerText = 'Tambah Karya Projek Baru';
    document.getElementById('proj-modal').style.display = 'flex';
}
function closeProjModal() { document.getElementById('proj-modal').style.display = 'none'; }

function editProj(id, judul, link, deskripsi, gambarUrl) {
    document.getElementById('proj-id').value = id;
    document.getElementById('pj-judul').value = judul;
    document.getElementById('pj-link').value = link;
    document.getElementById('pj-deskripsi').value = deskripsi;
    document.getElementById('pj-gambar-url').value = gambarUrl;
    document.getElementById('pj-gambar-link').value = gambarUrl || '';
    document.getElementById('upload-status-label').innerText = gambarUrl ? 'Gambar Terunggah ✔ (Klik ganti)' : 'Klik untuk mengunggah berkas gambar projek';
    document.getElementById('modal-proj-title').innerText = 'Ubah Detail Projek';
    document.getElementById('proj-modal').style.display = 'flex';
}

function setupCloudinaryUpload() {
    const fileInp = document.getElementById('pj-file-file');
    const imageLinkInput = document.getElementById('pj-gambar-link');

    const previewImg = document.getElementById('pj-gambar-preview');

    imageLinkInput.addEventListener('input', () => {
        const url = imageLinkInput.value.trim();
        document.getElementById('pj-gambar-url').value = url;
        if (url) {
            previewImg.src = url;
            previewImg.style.display = 'block';
        } else {
            previewImg.src = '';
            previewImg.style.display = 'none';
        }
    });

    fileInp.addEventListener('change', async () => {
        if (!fileInp.files.length) return;
        document.getElementById('upload-status-label').innerText = "Sedang mengunggah berkas...";
        const formData = new FormData();
        formData.append('file', fileInp.files[0]);

        try {
            const response = await apiFetch('/upload/image', { method: 'POST', body: formData });
            const data = await response.json();
            if (data.success) {
                document.getElementById('pj-gambar-url').value = data.url;
                document.getElementById('pj-gambar-link').value = data.url;
                previewImg.src = data.url;
                previewImg.style.display = 'block';
                document.getElementById('upload-status-label').innerText = "Gambar Berhasil Terunggah ✔";
            } else {
                document.getElementById('upload-status-label').innerText = data.error || "Gagal mengunggah berkas.";
                previewImg.src = '';
                previewImg.style.display = 'none';
            }
        } catch (err) {
            document.getElementById('upload-status-label').innerText = 'Kesalahan server Cloudinary API.';
            previewImg.src = '';
            previewImg.style.display = 'none';
            console.error(err);
        }
    });
}

document.getElementById('form-proj-crud').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('proj-id').value;
    const directImageUrl = document.getElementById('pj-gambar-link').value.trim();
    if (directImageUrl) {
        document.getElementById('pj-gambar-url').value = directImageUrl;
    }

    const payload = {
        judul: document.getElementById('pj-judul').value,
        link_project: document.getElementById('pj-link').value,
        deskripsi: document.getElementById('pj-deskripsi').value,
        gambar_url: document.getElementById('pj-gambar-url').value
    };

    const endpoint = id ? `/projects/${id}` : '/projects';
    const method = id ? 'PUT' : 'POST';

    try {
        const response = await apiFetch(endpoint, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (response.ok) { closeProjModal(); loadProjectsGrid(); }
    } catch (err) { alert('Sistem gagal menyimpan projek.'); }
});

async function deleteProj(id) {
    if(confirm('Hapus projek ini secara permanen?')) {
        try {
            const response = await apiFetch(`/projects/${id}`, { method: 'DELETE' });
            if (response.ok) loadProjectsGrid();
        } catch (err) { alert('Gagal memproses hapus.'); }
    }
}