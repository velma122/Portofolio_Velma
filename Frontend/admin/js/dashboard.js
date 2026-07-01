document.addEventListener('DOMContentLoaded', () => {
    loadDashboardStats();
    loadRecentActivities();
});

async function loadDashboardStats() {
    try {
        const response = await apiFetch('/dashboard/stats');
        const result = await response.json();
        if (result.success) {
            animateNumber('stat-exp', result.data.experiences_count);
            animateNumber('stat-proj', result.data.projects_count);
            animateNumber('stat-skills', result.data.skills_count);
            document.getElementById('welcome-text').innerText = `Selamat Datang, ${result.data.admin_name}`;
        }
    } catch (err) { console.error(err); }
}

async function loadRecentActivities() {
    try {
        const response = await apiFetch('/dashboard/recent');
        const result = await response.json();
        if (result.success) {
            const listContainer = document.getElementById('activity-log-list');
            if (result.data.length === 0) {
                listContainer.innerHTML = `<li style="color:#aaa;">Belum ada aktivitas terbaru terdata.</li>`;
                return;
            }
            listContainer.innerHTML = result.data.map(act => {
                const title = act.type === 'project' ? act.judul : act.posisi;
                const subtitle = act.type === 'project' ? act.deskripsi : act.perusahaan;
                return `
                    <li>
                        <div>
                            <strong>${title}</strong> <span style="color:#888;">- ${subtitle}</span>
                        </div>
                        <span class="badge-type ${act.type}">${act.type}</span>
                    </li>
                `;
            }).join('');
        }
    } catch (err) { console.error(err); }
}

function animateNumber(elementId, targetValue) {
    const el = document.getElementById(elementId);
    let current = 0;
    const duration = 500;
    const stepTime = Math.abs(Math.floor(duration / targetValue)) || 50;
    
    if(targetValue === 0) { el.innerText = "0"; return; }
    
    const timer = setInterval(() => {
        current += 1;
        el.innerText = current;
        if (current >= targetValue) clearInterval(timer);
    }, stepTime);
}