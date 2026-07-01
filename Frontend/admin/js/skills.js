document.addEventListener('DOMContentLoaded', () => {
    loadSkillsTable();
    setupIconLivePreview();
});

async function loadSkillsTable() {
    try {
        const response = await apiFetch('/skills');
        const result = await response.json();
        if (result.success) {
            const tbody = document.getElementById('skills-table-body');
            tbody.innerHTML = result.data.map(s => `
                <tr>
                    <td><span style="font-size:20px; color:#b87d60;"><i class="${s.icon_class || 'fa-solid fa-code'}"></i></span></td>
                    <td><strong>${s.nama_skill}</strong></td>
                    <td><code>${s.icon_class || ''}</code></td>
                    <td class="table-actions">
                        <button class="btn-edit-table" onclick="editSkill(${s.id}, '${s.nama_skill}', '${s.icon_class}')">Ubah</button>
                        <button class="btn-delete-table" onclick="deleteSkill(${s.id})">Hapus</button>
                    </td>
                </tr>
            `).join('');
        }
    } catch (err) { console.error(err); }
}

function setupIconLivePreview() {
    const inp = document.getElementById('sk-icon');
    const preview = document.getElementById('sk-icon-preview');
    inp.addEventListener('input', () => {
        preview.innerHTML = `<i class="${inp.value || 'fa-solid fa-question'}"></i>`;
    });
}

function openSkillModal() {
    document.getElementById('form-skill-crud').reset();
    document.getElementById('skill-id').value = '';
    document.getElementById('modal-skill-title').innerText = 'Tambah Keahlian Baru';
    document.getElementById('sk-icon-preview').innerHTML = `<i class="fa-solid fa-question"></i>`;
    document.getElementById('skill-modal').style.display = 'flex';
}

function closeSkillModal() { document.getElementById('skill-modal').style.display = 'none'; }

function editSkill(id, nama, icon) {
    document.getElementById('skill-id').value = id;
    document.getElementById('sk-nama').value = nama;
    document.getElementById('sk-icon').value = icon;
    document.getElementById('sk-icon-preview').innerHTML = `<i class="${icon}"></i>`;
    document.getElementById('modal-skill-title').innerText = 'Ubah Keahlian';
    document.getElementById('skill-modal').style.display = 'flex';
}

document.getElementById('form-skill-crud').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('skill-id').value;
    const payload = {
        nama_skill: document.getElementById('sk-nama').value,
        icon_class: document.getElementById('sk-icon').value
    };

    const endpoint = id ? `/skills/${id}` : '/skills';
    const method = id ? 'PUT' : 'POST';

    try {
        const response = await apiFetch(endpoint, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (response.ok) { closeSkillModal(); loadSkillsTable(); }
    } catch (err) { alert('Gagal mengeksekusi perintah skill.'); }
});

async function deleteSkill(id) {
    if (confirm('Hapus skill ini dari database?')) {
        try {
            const response = await apiFetch(`/skills/${id}`, { method: 'DELETE' });
            if (response.ok) loadSkillsTable();
        } catch (err) { alert('Gagal menghapus.'); }
    }
}