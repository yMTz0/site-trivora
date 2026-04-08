// Configuração da API
const API_URL = 'http://localhost:3000/api';
let authToken = localStorage.getItem('token');

// Verificar autenticação
function checkAuth() {
    if (!authToken) {
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

// Headers para requisições
function getHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
    };
}

// Logout
function logout() {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
}

// ========== NAVEGAÇÃO ENTRE SEÇÕES ==========
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Remove active de todos
        document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
        document.querySelectorAll('.content-section').forEach(section => section.classList.remove('active'));
        
        // Adiciona active no clicado
        item.classList.add('active');
        const sectionId = item.dataset.section + '-section';
        document.getElementById(sectionId).classList.add('active');
        
        // Carregar dados da seção
        loadSectionData(item.dataset.section);
    });
});

// Carregar dados conforme a seção
function loadSectionData(section) {
    switch(section) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'users':
            loadUsers();
            break;
        case 'materials':
            loadMaterials();
            break;
        case 'analytics':
            loadAnalytics();
            break;
    }
}

// ========== DASHBOARD ==========
let userGrowthChart, subjectChart;

async function loadDashboard() {
    try {
        // Carregar estatísticas
        const statsRes = await fetch(`${API_URL}/admin/analytics/dashboard`, {
            headers: getHeaders()
        });
        const stats = await statsRes.json();
        
        // Atualizar cards
        document.getElementById('total-users').textContent = stats.users.total;
        document.getElementById('premium-users').textContent = stats.users.premium;
        document.getElementById('total-materials').textContent = stats.materials.total;
        document.getElementById('conversion-value').textContent = stats.users.conversionRate + '%';
        document.getElementById('new-users').textContent = `+${stats.users.new} novos (30 dias)`;
        document.getElementById('conversion-rate').textContent = `${stats.users.conversionRate}% de conversão`;
        document.getElementById('premium-materials').textContent = `${stats.materials.premium} premium`;
        
        // Carregar gráficos
        await loadUserGrowthChart();
        await loadSubjectChart();
        await loadRecentActivity();
        
    } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
    }
}

async function loadUserGrowthChart() {
    const res = await fetch(`${API_URL}/admin/analytics/user-growth`, {
        headers: getHeaders()
    });
    const data = await res.json();
    
    const ctx = document.getElementById('userGrowthChart');
    
    if (userGrowthChart) {
        userGrowthChart.destroy();
    }
    
    userGrowthChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(d => d.month),
            datasets: [{
                label: 'Novos Usuários',
                data: data.map(d => d.users),
                borderColor: '#3a86ff',
                backgroundColor: 'rgba(58, 134, 255, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

async function loadSubjectChart() {
    const res = await fetch(`${API_URL}/admin/analytics/materials-by-subject`, {
        headers: getHeaders()
    });
    const data = await res.json();
    
    const ctx = document.getElementById('subjectChart');
    
    if (subjectChart) {
        subjectChart.destroy();
    }
    
    const colors = [
        '#3a86ff', '#7209b7', '#06d6a0', '#ffd60a', 
        '#ef476f', '#ff6b6b', '#4ecdc4', '#95e1d3'
    ];
    
    subjectChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: data.map(d => d.subject),
            datasets: [{
                data: data.map(d => d.count),
                backgroundColor: colors.slice(0, data.length)
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
}

async function loadRecentActivity() {
    const res = await fetch(`${API_URL}/admin/analytics/recent-activity`, {
        headers: getHeaders()
    });
    const data = await res.json();
    
    // Usuários recentes
    const usersList = document.getElementById('recent-users-list');
    usersList.innerHTML = data.users.map(user => `
        <div class="activity-item">
            <div class="activity-item-name">${user.name}</div>
            <div class="activity-item-detail">
                ${user.email} • ${user.subscriptionType === 'premium' ? '👑 Premium' : 'Free'}
                • ${new Date(user.createdAt).toLocaleDateString('pt-BR')}
            </div>
        </div>
    `).join('');
    
    // Materiais recentes
    const materialsList = document.getElementById('recent-materials-list');
    materialsList.innerHTML = data.materials.map(mat => `
        <div class="activity-item">
            <div class="activity-item-name">${mat.title}</div>
            <div class="activity-item-detail">
                ${mat.subject || 'N/A'} • ${mat.isPremium ? '👑 Premium' : 'Free'}
                • por ${mat.author.name}
            </div>
        </div>
    `).join('');
}

// ========== USUÁRIOS ==========
let currentPage = 1;

async function loadUsers(page = 1) {
    const search = document.getElementById('user-search')?.value || '';
    const role = document.getElementById('role-filter')?.value || '';
    const subscription = document.getElementById('subscription-filter')?.value || '';
    
    try {
        const res = await fetch(
            `${API_URL}/admin/users?page=${page}&search=${search}&role=${role}&subscription=${subscription}`,
            { headers: getHeaders() }
        );
        const data = await res.json();
        
        const tbody = document.getElementById('users-table-body');
        tbody.innerHTML = data.users.map(user => `
            <tr>
                <td><strong>${user.name}</strong></td>
                <td>${user.email}</td>
                <td><span class="badge ${user.role}">${user.role === 'admin' ? 'Admin' : 'Usuário'}</span></td>
                <td><span class="badge ${user.subscriptionType}">${user.subscriptionType === 'premium' ? 'Premium' : 'Free'}</span></td>
                <td>${new Date(user.createdAt).toLocaleDateString('pt-BR')}</td>
                <td>
                    <div class="action-buttons">
                        ${user.subscriptionType === 'free' ? 
                            `<button class="btn-action" onclick="upgradeUser('${user._id}')" title="Promover para Premium">
                                <i data-lucide="crown"></i>
                            </button>` : 
                            `<button class="btn-action" onclick="downgradeUser('${user._id}')" title="Rebaixar para Free">
                                <i data-lucide="arrow-down"></i>
                            </button>`
                        }
                        ${user.role === 'user' ? 
                            `<button class="btn-action" onclick="promoteToAdmin('${user._id}')" title="Tornar Admin">
                                <i data-lucide="shield"></i>
                            </button>` : 
                            `<button class="btn-action" onclick="demoteToUser('${user._id}')" title="Remover Admin">
                                <i data-lucide="user"></i>
                            </button>`
                        }
                        <button class="btn-action danger" onclick="deleteUser('${user._id}')" title="Deletar">
                            <i data-lucide="trash-2"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
        
        lucide.createIcons();
        
        // Paginação
        renderPagination(data.currentPage, data.totalPages);
        
    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
    }
}

function renderPagination(current, total) {
    const pagination = document.getElementById('users-pagination');
    let html = '';
    
    for (let i = 1; i <= total; i++) {
        html += `<button class="page-btn ${i === current ? 'active' : ''}" onclick="loadUsers(${i})">${i}</button>`;
    }
    
    pagination.innerHTML = html;
}

// Ações de usuário
async function upgradeUser(id) {
    if (confirm('Promover este usuário para Premium?')) {
        try {
            await fetch(`${API_URL}/admin/users/${id}/upgrade-premium`, {
                method: 'PATCH',
                headers: getHeaders()
            });
            loadUsers(currentPage);
            alert('Usuário promovido para Premium!');
        } catch (error) {
            alert('Erro ao promover usuário');
        }
    }
}

async function downgradeUser(id) {
    if (confirm('Rebaixar este usuário para Free?')) {
        try {
            await fetch(`${API_URL}/admin/users/${id}/downgrade-free`, {
                method: 'PATCH',
                headers: getHeaders()
            });
            loadUsers(currentPage);
            alert('Usuário rebaixado para Free');
        } catch (error) {
            alert('Erro ao rebaixar usuário');
        }
    }
}

async function promoteToAdmin(id) {
    if (confirm('Tornar este usuário um Administrador?')) {
        try {
            await fetch(`${API_URL}/admin/users/${id}/promote-admin`, {
                method: 'PATCH',
                headers: getHeaders()
            });
            loadUsers(currentPage);
            alert('Usuário promovido a Admin!');
        } catch (error) {
            alert('Erro ao promover usuário');
        }
    }
}

async function demoteToUser(id) {
    if (confirm('Remover privilégios de Admin deste usuário?')) {
        try {
            await fetch(`${API_URL}/admin/users/${id}/demote-user`, {
                method: 'PATCH',
                headers: getHeaders()
            });
            loadUsers(currentPage);
            alert('Admin removido');
        } catch (error) {
            alert('Erro ao remover admin');
        }
    }
}

async function deleteUser(id) {
    if (confirm('Tem certeza que deseja DELETAR este usuário? Essa ação não pode ser desfeita!')) {
        try {
            await fetch(`${API_URL}/admin/users/${id}`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            loadUsers(currentPage);
            alert('Usuário deletado');
        } catch (error) {
            alert('Erro ao deletar usuário');
        }
    }
}

// Filtros de usuários
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('user-search');
    const roleFilter = document.getElementById('role-filter');
    const subFilter = document.getElementById('subscription-filter');
    
    if (searchInput) {
        searchInput.addEventListener('input', () => loadUsers(1));
    }
    if (roleFilter) {
        roleFilter.addEventListener('change', () => loadUsers(1));
    }
    if (subFilter) {
        subFilter.addEventListener('change', () => loadUsers(1));
    }
});

// ========== MATERIAIS ==========
async function loadMaterials() {
    try {
        const res = await fetch(`${API_URL}/materials`, {
            headers: getHeaders()
        });
        const materials = await res.json();
        
        const grid = document.getElementById('materials-grid');
        grid.innerHTML = materials.map(mat => `
            <div class="material-card">
                <div class="material-header">
                    <h3 class="material-title">${mat.title}</h3>
                    <span class="badge ${mat.isPremium ? 'premium' : 'free'}">
                        ${mat.isPremium ? 'Premium' : 'Free'}
                    </span>
                </div>
                <p class="material-meta">${mat.subject || 'N/A'} • ${mat.gradeLevel || 'N/A'}</p>
                <p class="material-meta">${mat.condition || 'Geral'}</p>
                <p class="material-meta" style="font-size: 0.8rem; margin-top: 0.5rem;">
                    📅 ${new Date(mat.createdAt).toLocaleDateString('pt-BR')}
                </p>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Erro ao carregar materiais:', error);
    }
}

// ========== ANALYTICS ==========
let gradeChart, conditionChart;

async function loadAnalytics() {
    await loadGradeChart();
    await loadConditionChart();
}

async function loadGradeChart() {
    const res = await fetch(`${API_URL}/admin/analytics/materials-by-grade`, {
        headers: getHeaders()
    });
    const data = await res.json();
    
    const ctx = document.getElementById('gradeChart');
    
    if (gradeChart) {
        gradeChart.destroy();
    }
    
    gradeChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(d => d.grade),
            datasets: [{
                label: 'Quantidade',
                data: data.map(d => d.count),
                backgroundColor: '#3a86ff'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            }
        }
    });
}

async function loadConditionChart() {
    const res = await fetch(`${API_URL}/admin/analytics/materials-by-condition`, {
        headers: getHeaders()
    });
    const data = await res.json();
    
    const ctx = document.getElementById('conditionChart');
    
    if (conditionChart) {
        conditionChart.destroy();
    }
    
    const colors = ['#3a86ff', '#7209b7', '#06d6a0', '#ffd60a', '#ef476f'];
    
    conditionChart = new Chart(ctx, {
        type: 'polarArea',
        data: {
            labels: data.map(d => d.condition),
            datasets: [{
                data: data.map(d => d.count),
                backgroundColor: colors.slice(0, data.length)
            }]
        },
        options: {
            responsive: true
        }
    });
}

// ========== EXPORTAÇÕES ==========
function exportData(type) {
    const endpoints = {
        'users-excel': '/admin/export/users/excel',
        'users-csv': '/admin/export/users/csv',
        'materials-excel': '/admin/export/materials/excel',
        'report-pdf': '/admin/export/report/pdf'
    };
    
    const url = `${API_URL}${endpoints[type]}`;
    
    // Criar link temporário para download
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', '');
    
    // Adicionar token no header via fetch
    fetch(url, { headers: getHeaders() })
        .then(res => res.blob())
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            link.href = url;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        })
        .catch(err => alert('Erro ao exportar: ' + err.message));
}

// ========== INICIALIZAÇÃO ==========
if (checkAuth()) {
    lucide.createIcons();
    loadDashboard();
}
