document.addEventListener('DOMContentLoaded', () => loadExpTable());

async function loadExpTable() {
    try {
        const response = await apiFetch('/experiences');
        const result = await response.json();
        if (result.success) {
            document.getElementById('exp-table-body').innerHTML = result.data.map(e => `
                <tr>
                    <td><strong>${e.posisi}</strong></td>
                    <td>${e.perusahaan}</td>
                    <td><span class="badge-type experience">${e.durasi}</span></td>
                    <td class="table-actions">
                        <button class="btn-edit-table" onclick="editExp(${e.id}, '${e.posisi}', '${e.perusahaan}', '${e.durasi}', \`${e.deskripsi || ''}\`)">Ubah</button>
                        <button class="btn-delete-table" onclick="deleteExp(${e.id})">Hapus</button>
                    </td>
                </tr>
            `).join('');
        }
    } catch (err) { console.error(err); }
}

function openExpModal() {
    document.getElementById('form-exp-crud').reset();
    document.getElementById('exp-id').value = '';
    document.getElementById('modal-exp-title').innerText = 'Tambah Pengalaman Baru';
    document.getElementById('exp-modal').style.display = 'flex';
}
function closeExpModal() { document.getElementById('exp-modal').style.display = 'none'; }

function editExp(id, posisi, perusahaan, durasi, deskripsi) {
    document.getElementById('exp-id').value = id;
    document.getElementById('ex-posisi').value = posisi;
    document.getElementById('ex-perusahaan').value = perusahaan;
    document.getElementById('ex-durasi').value = durasi;
    document.getElementById('ex-deskripsi').value = deskripsi;
    document.getElementById('modal-exp-title').innerText = 'Ubah Pengalaman';
    document.getElementById('exp-modal').style.display = 'flex';
}

document.getElementById('form-exp-crud').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('exp-id').value;
    const payload = {
        posisi: document.getElementById('ex-posisi').value,
        perusahaan: document.getElementById('ex-perusahaan').value,
        durasi: document.getElementById('ex-durasi').value,
        deskripsi: document.getElementById('ex-deskripsi').value
    };

    const endpoint = id ? `/experiences/${id}` : '/experiences';
    const method = id ? 'PUT' : 'POST';

    try {
        const response = await apiFetch(endpoint, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (response.ok) { closeExpModal(); loadExpTable(); }
    } catch (err) { alert('Gagal memproses data.'); }
});

async function deleteExp(id) {
    if (confirm('Hapus riwayat kerja ini?')) {
        try {
            const response = await apiFetch(`/experiences/${id}`, { method: 'DELETE' });
            if (response.ok) loadExpTable();
        } catch (err) { alert('Hapus gagal.'); }
    }
}