const BACKEND_URL = `${window.location.origin}/api`;

document.addEventListener('DOMContentLoaded', () => {
    fetchPublicData();
    setupContactForm();
});

async function fetchPublicData() {
    try {
        const response = await fetch(`${BACKEND_URL}/utama`);
        const resData = await response.json();
        
        if (resData.success) {
            const data = resData.data;

            // 0. Render Profil Publik
            const profile = data.profile || {};
            const publicFoto = document.getElementById('public-foto');
            if (publicFoto) {
                publicFoto.src = profile.foto_url || publicFoto.src;
            }
            const publicNama = document.getElementById('public-nama');
            if (publicNama) {
                publicNama.textContent = profile.nama_lengkap || publicNama.textContent;
            }
            const publicBio = document.getElementById('public-bio');
            if (publicBio) {
                publicBio.textContent = profile.alamat ? `Berasal dari ${profile.alamat}` : publicBio.textContent;
            }
            const pubUniv = document.getElementById('pub-univ');
            if (pubUniv) {
                pubUniv.textContent = profile.universitas || pubUniv.textContent;
            }
            const pubProdi = document.getElementById('pub-prodi');
            if (pubProdi) {
                pubProdi.textContent = profile.prodi || pubProdi.textContent;
            }
            const pubEmail = document.getElementById('pub-email');
            if (pubEmail) {
                pubEmail.textContent = profile.email || pubEmail.textContent;
            }

            // 1. Render Skills (Sesuai kolom database ERD: nama_skill, icon_class)
            const skillsContainer = document.getElementById('public-skills-container');
            if (skillsContainer && data.skills) {
                skillsContainer.innerHTML = data.skills.map(s => `
                    <div class="skill-badge-editorial">
                        <i class="${s.icon_class || 'fa-solid fa-code'}"></i>
                        <span>${s.nama_skill}</span>
                    </div>
                `).join('');
            }

        
            const projectsGrid = document.getElementById('public-projects-grid');
            if (projectsGrid && data.projects) {
                projectsGrid.innerHTML = data.projects.map(p => `
                    <div class="project-card-editorial">
                        <div class="proj-img-wrap">
                            <img src="${p.gambar_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600'}" alt="Project Banner">
                        </div>
                        <h3 class="proj-title">${p.judul || 'Tanpa Judul'}</h3>
                        <p class="proj-desc">${p.deskripsi || 'Tidak ada deskripsi.'}</p>
                        ${p.link_project ? `<a href="${p.link_project}" target="_blank" class="proj-link">Lihat Demo →</a>` : ''}
                    </div>
                `).join('');
            }

            const expContainer = document.getElementById('public-experience-container');
            if (expContainer && data.experience) {
                expContainer.innerHTML = data.experience.map(e => `
                    <div class="timeline-block experience-card-editorial">
                        <h3 class="exp-position">${e.posisi}</h3>
                        <h4 class="exp-company">${e.perusahaan}</h4>
                        <span class="exp-duration">${e.durasi}</span>
                        <p class="exp-desc">${e.deskripsi || ''}</p>
                    </div>
                `).join('');
            }
        }
    } catch (err) {
        console.error('Error fetching data dari API utama:', err);
    }
}

function setupContactForm() {
    const form = document.getElementById('public-contact-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            try {
                const response = await fetch(`${BACKEND_URL}/kirim-pesan`, {
                    method: 'POST',
                    body: formData
                });
                const result = await response.json();
                if (result.status === 'success' || response.ok) {
                    alert('Terima kasih! Pesan sukses terkirim.');
                    form.reset();
                } else {
                    alert('Gagal mengirim pesan: ' + (result.message || 'Error tidak diketahui'));
                }
            } catch (err) {
                console.error('Network error:', err);
                alert('Kesalahan jaringan dengan API server backend.');
            }
        });
    }
}