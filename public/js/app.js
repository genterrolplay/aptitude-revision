// ========== STATE ==========
let currentUser = null;
let currentPage = 'dashboard';
let currentCategory = null;
let currentDifficulty = 3;
let currentQuestion = null;
let sessionQuestions = 0;
let sessionCorrect = 0;
let sessionStartTime = null;
let questionStartTime = null;
let timerInterval = null;
let dailyChart = null;
let categoryChart = null;

// ========== API HELPERS ==========
async function api(url, options = {}, retries = 2) {
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const res = await fetch(url, {
                headers: { 'Content-Type': 'application/json' },
                ...options,
                body: options.body ? JSON.stringify(options.body) : undefined
            });
            
            // Handle session expiry
            if (res.status === 401 && !url.includes('/login') && !url.includes('/me')) {
                showToast('Session expirée, reconnexion...', 'error');
                setTimeout(() => location.reload(), 1500);
                throw new Error('Session expirée');
            }
            
            let data;
            try {
                data = await res.json();
            } catch {
                throw new Error('Erreur de communication avec le serveur');
            }
            
            if (!res.ok) throw new Error(data.error || 'Erreur serveur');
            return data;
        } catch (err) {
            if (attempt < retries && !err.message.includes('Session expirée')) {
                await new Promise(r => setTimeout(r, 500 * (attempt + 1)));
                continue;
            }
            throw err;
        }
    }
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}

// ========== AUTH ==========
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorEl = document.getElementById('login-error');
    errorEl.classList.remove('visible');

    try {
        const user = await api('/api/auth/login', {
            method: 'POST',
            body: {
                username: document.getElementById('login-username').value,
                password: document.getElementById('login-password').value
            }
        });
        currentUser = user;
        onLoginSuccess();
    } catch (err) {
        errorEl.textContent = err.message;
        errorEl.classList.add('visible');
    }
});

async function checkAuth() {
    try {
        const user = await api('/api/auth/me');
        currentUser = user;
        onLoginSuccess();
    } catch {
        // Not logged in, show login page
    }
}

function onLoginSuccess() {
    document.getElementById('login-page').classList.add('hidden');
    document.getElementById('navbar').classList.remove('hidden');
    document.getElementById('mobile-nav').classList.remove('hidden');
    document.getElementById('main-content').classList.remove('hidden');

    document.getElementById('nav-username').textContent = currentUser.display_name;
    document.getElementById('nav-avatar').textContent = currentUser.display_name.charAt(0).toUpperCase();
    document.getElementById('greeting-name').textContent = currentUser.display_name.split(' ')[0];

    if (currentUser.is_admin) {
        document.getElementById('nav-admin-link').style.display = '';
        document.getElementById('mobile-admin-link').style.display = '';
    }

    // Calculate countdown
    const testDate = new Date('2026-04-17');
    const today = new Date();
    const diffTime = testDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const countdownEl = document.getElementById('countdown-days');
    if (diffDays > 0) {
        countdownEl.textContent = `${diffDays} jours`;
    } else if (diffDays === 0) {
        countdownEl.textContent = "aujourd'hui !";
    } else {
        countdownEl.textContent = "passé";
    }

    showPage('dashboard');
}

async function logout() {
    await api('/api/auth/logout', { method: 'POST' });
    currentUser = null;
    document.getElementById('login-page').classList.remove('hidden');
    document.getElementById('navbar').classList.add('hidden');
    document.getElementById('mobile-nav').classList.add('hidden');
    document.getElementById('main-content').classList.add('hidden');
    document.getElementById('login-username').value = '';
    document.getElementById('login-password').value = '';
}

// ========== NAVIGATION ==========
function showPage(page) {
    currentPage = page;

    document.querySelectorAll('[id^="page-"]').forEach(el => el.classList.add('hidden'));
    document.getElementById(`page-${page}`).classList.remove('hidden');

    document.querySelectorAll('.nav-link').forEach(el => {
        el.classList.toggle('active', el.dataset.page === page);
    });
    document.querySelectorAll('.mobile-nav-link').forEach(el => {
        el.classList.toggle('active', el.dataset.page === page);
    });

    if (page === 'dashboard') loadDashboard();
    if (page === 'exercise') { showExerciseSelection(); loadCategories('exercise-categories'); }
    if (page === 'admin') loadUsers();
}

// ========== DASHBOARD ==========
async function loadDashboard() {
    try {
        const [summary, daily, categories] = await Promise.all([
            api('/api/progress/summary'),
            api('/api/progress/daily'),
            api('/api/progress/categories')
        ]);

        // Today stats
        document.getElementById('today-questions').textContent = summary.today.total_questions;
        document.getElementById('today-rate').textContent = summary.today.success_rate + '%';
        document.getElementById('today-time').textContent = formatTime(summary.today.time_seconds);

        // Global stats
        document.getElementById('total-questions').textContent = summary.total_questions;
        document.getElementById('total-rate').textContent = summary.success_rate + '%';
        document.getElementById('current-streak').textContent = summary.current_streak;
        document.getElementById('longest-streak').textContent = summary.longest_streak;
        document.getElementById('days-active').textContent = summary.days_active;
        document.getElementById('nav-streak-count').textContent = summary.current_streak;

        // Charts
        renderDailyChart(daily);
        renderCategoryChart(categories);

        // Categories grid
        loadCategories('dashboard-categories');
    } catch (err) {
        console.error('Dashboard error:', err);
    }
}

function renderDailyChart(data) {
    const ctx = document.getElementById('daily-chart');
    if (dailyChart) dailyChart.destroy();

    const reversed = [...data].reverse();
    const labels = reversed.map(d => {
        const date = new Date(d.date);
        return date.toLocaleDateString('fr-CH', { day: 'numeric', month: 'short' });
    });

    dailyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [
                {
                    label: 'Correctes',
                    data: reversed.map(d => d.correct_answers),
                    backgroundColor: 'rgba(6, 214, 160, 0.7)',
                    borderRadius: 4,
                    barPercentage: 0.6,
                },
                {
                    label: 'Incorrectes',
                    data: reversed.map(d => d.total_questions - d.correct_answers),
                    backgroundColor: 'rgba(239, 68, 68, 0.5)',
                    borderRadius: 4,
                    barPercentage: 0.6,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: '#8888aa', font: { family: 'Inter' } } }
            },
            scales: {
                x: {
                    stacked: true,
                    ticks: { color: '#555577', font: { family: 'Inter', size: 11 } },
                    grid: { color: 'rgba(255,255,255,0.03)' }
                },
                y: {
                    stacked: true,
                    ticks: { color: '#555577', font: { family: 'Inter', size: 11 } },
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    beginAtZero: true
                }
            }
        }
    });
}

function renderCategoryChart(data) {
    const ctx = document.getElementById('category-chart');
    if (categoryChart) categoryChart.destroy();

    if (data.length === 0) {
        categoryChart = new Chart(ctx, {
            type: 'doughnut',
            data: { labels: ['Aucune donnée'], datasets: [{ data: [1], backgroundColor: ['rgba(255,255,255,0.05)'] }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#555577' } } } }
        });
        return;
    }

    const colors = ['#4f6eff', '#8b5cf6', '#06d6a0', '#ff6b35', '#ec4899', '#f59e0b'];

    categoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: data.map(d => d.label),
            datasets: [{
                data: data.map(d => d.total_questions),
                backgroundColor: colors.slice(0, data.length),
                borderColor: 'rgba(10, 10, 26, 0.8)',
                borderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '65%',
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: '#8888aa',
                        font: { family: 'Inter', size: 12 },
                        padding: 16,
                        usePointStyle: true,
                        pointStyleWidth: 12
                    }
                },
                tooltip: {
                    callbacks: {
                        afterLabel: function(ctx) {
                            const cat = data[ctx.dataIndex];
                            return `Taux: ${cat.success_rate}%`;
                        }
                    }
                }
            }
        }
    });
}

// ========== CATEGORIES ==========
async function loadCategories(containerId) {
    try {
        const categories = await api('/api/exercises/categories');
        const container = document.getElementById(containerId);
        
        // Add mixed option
        let html = `
            <div class="category-card" onclick="startExercise('mixed')">
                <div class="category-icon">🎲</div>
                <div class="category-name">Mode mixte</div>
                <div class="category-desc">Questions aléatoires de toutes les catégories</div>
            </div>
        `;

        html += categories.map(cat => `
            <div class="category-card" onclick="startExercise('${cat.id}')">
                <div class="category-icon">${cat.icon}</div>
                <div class="category-name">${cat.label}</div>
                <div class="category-desc">${cat.description}</div>
            </div>
        `).join('');

        container.innerHTML = html;
    } catch (err) {
        console.error('Categories error:', err);
    }
}

// ========== EXERCISES ==========
function setDifficulty(level) {
    currentDifficulty = level;
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.classList.toggle('active', parseInt(btn.dataset.diff) === level);
    });
}

function showExerciseSelection() {
    document.getElementById('exercise-selection').classList.remove('hidden');
    document.getElementById('exercise-active').classList.add('hidden');
    document.getElementById('exercise-summary').classList.add('hidden');
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
}

async function startExercise(category) {
    currentCategory = category;
    sessionQuestions = 0;
    sessionCorrect = 0;
    sessionStartTime = Date.now();

    document.getElementById('exercise-selection').classList.add('hidden');
    document.getElementById('exercise-active').classList.remove('hidden');
    document.getElementById('exercise-summary').classList.add('hidden');

    // Start timer
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(updateTimer, 1000);

    await loadQuestion();
}

function updateTimer() {
    const elapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
    const mins = Math.floor(elapsed / 60).toString().padStart(2, '0');
    const secs = (elapsed % 60).toString().padStart(2, '0');
    document.getElementById('exercise-timer').textContent = `⏱ ${mins}:${secs}`;
}

async function loadQuestion() {
    const maxRetries = 3;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const url = currentCategory === 'mixed'
                ? `/api/exercises/question?difficulty=${currentDifficulty}`
                : `/api/exercises/question/${currentCategory}?difficulty=${currentDifficulty}`;

            currentQuestion = await api(url, {}, 1);
            questionStartTime = Date.now();

            // Update UI
            sessionQuestions++;
            document.getElementById('exercise-counter').textContent = `Question ${sessionQuestions}`;
            document.getElementById('exercise-progress-bar').style.width = '0%';
            document.getElementById('question-badge').textContent = `${getCategoryIcon(currentQuestion.category)} ${currentQuestion.categoryLabel}`;
            document.getElementById('question-text').textContent = currentQuestion.question;

            // Reset state
            document.getElementById('hint-content').classList.remove('visible');
            document.getElementById('hint-content').textContent = currentQuestion.hint;
            document.getElementById('result-feedback').classList.remove('visible', 'correct', 'incorrect');
            document.getElementById('next-question-btn').classList.add('hidden');
            document.getElementById('hint-btn').disabled = false;

            if (currentQuestion.type === 'multiple_choice') {
                document.getElementById('answer-typed').classList.add('hidden');
                const choicesEl = document.getElementById('answer-choices');
                choicesEl.classList.remove('hidden');
                choicesEl.innerHTML = currentQuestion.options.map(opt => `
                    <button class="option-btn" onclick="selectOption(this, '${opt.replace(/'/g, "\\'")}')">${opt}</button>
                `).join('');
            } else {
                document.getElementById('answer-choices').classList.add('hidden');
                document.getElementById('answer-typed').classList.remove('hidden');
                const input = document.getElementById('answer-input');
                input.value = '';
                input.className = 'answer-input';
                input.disabled = false;
                input.focus();
                document.getElementById('submit-answer-btn').classList.remove('hidden');
            }
            return;
        } catch (err) {
            console.error(`Question error (attempt ${attempt}/${maxRetries}):`, err);
            if (attempt < maxRetries) {
                await new Promise(r => setTimeout(r, 1000 * attempt));
            } else {
                showToast('Erreur de chargement — clique sur "Question suivante" pour réessayer', 'error');
                document.getElementById('next-question-btn').classList.remove('hidden');
                sessionQuestions--;
            }
        }
    }
}

function getCategoryIcon(cat) {
    const icons = { operations: '➕', fractions: '🔢', unites: '📏', pourcentages: '💯', geometrie: '📐', francais: '📝' };
    return icons[cat] || '📝';
}

function selectOption(btn, answer) {
    if (btn.disabled) return;

    // Disable all buttons
    document.querySelectorAll('.option-btn').forEach(b => { b.disabled = true; });

    const isCorrect = answer === currentQuestion.answer;
    btn.classList.add(isCorrect ? 'correct' : 'incorrect');

    if (!isCorrect) {
        // Highlight correct answer
        document.querySelectorAll('.option-btn').forEach(b => {
            if (b.textContent === currentQuestion.answer) b.classList.add('correct');
        });
    }

    processAnswer(answer, isCorrect);
}

function submitAnswer() {
    const input = document.getElementById('answer-input');
    const answer = input.value.trim();
    if (!answer) return;

    const isCorrect = checkAnswer(answer, currentQuestion.answer, currentQuestion.type);
    input.disabled = true;
    input.classList.add(isCorrect ? 'correct' : 'incorrect');
    document.getElementById('submit-answer-btn').classList.add('hidden');

    processAnswer(answer, isCorrect);
}

function checkAnswer(userAnswer, correctAnswer, type) {
    const ua = userAnswer.trim().toLowerCase().replace(/\s+/g, '');
    const ca = correctAnswer.trim().toLowerCase().replace(/\s+/g, '');

    if (ua === ca) return true;

    // For numbers, allow some tolerance
    if (type === 'number') {
        const uaNum = parseFloat(ua);
        const caNum = parseFloat(ca);
        if (!isNaN(uaNum) && !isNaN(caNum)) {
            return Math.abs(uaNum - caNum) < 0.02;
        }
    }

    // For fractions, check equivalence
    if (type === 'fraction') {
        const uaParts = ua.split('/');
        const caParts = ca.split('/');
        if (uaParts.length === 2 && caParts.length === 2) {
            const uaVal = parseFloat(uaParts[0]) / parseFloat(uaParts[1]);
            const caVal = parseFloat(caParts[0]) / parseFloat(caParts[1]);
            return Math.abs(uaVal - caVal) < 0.001;
        }
    }

    return false;
}

async function processAnswer(userAnswer, isCorrect) {
    if (isCorrect) sessionCorrect++;

    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);

    // Show feedback
    const feedback = document.getElementById('result-feedback');
    feedback.className = `result-feedback visible ${isCorrect ? 'correct' : 'incorrect'}`;
    feedback.textContent = isCorrect
        ? '✅ Bonne réponse !'
        : `❌ Mauvaise réponse. La bonne réponse était : ${currentQuestion.answer}`;

    // Show next button
    document.getElementById('next-question-btn').classList.remove('hidden');

    // Update progress bar
    document.getElementById('exercise-progress-bar').style.width = '100%';

    // Save to server
    try {
        await api('/api/exercises/submit', {
            method: 'POST',
            body: {
                category: currentQuestion.category,
                question_text: currentQuestion.question,
                user_answer: userAnswer,
                correct_answer: currentQuestion.answer,
                is_correct: isCorrect,
                time_spent: timeSpent
            }
        });
    } catch (err) {
        console.error('Submit error:', err);
    }
}

function showHint() {
    document.getElementById('hint-content').classList.toggle('visible');
}

async function nextQuestion() {
    await loadQuestion();
}

function endExerciseSession() {
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }

    const totalTime = Math.floor((Date.now() - sessionStartTime) / 1000);

    document.getElementById('exercise-active').classList.add('hidden');
    document.getElementById('exercise-summary').classList.remove('hidden');

    document.getElementById('summary-total').textContent = sessionQuestions;
    document.getElementById('summary-correct').textContent = sessionCorrect;
    const rate = sessionQuestions > 0 ? Math.round((sessionCorrect / sessionQuestions) * 100) : 0;
    document.getElementById('summary-rate').textContent = rate + '%';
}

function restartExercise() {
    startExercise(currentCategory);
}

// Enter key to submit
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && currentPage === 'exercise') {
        const input = document.getElementById('answer-input');
        if (!input.disabled && document.activeElement === input) {
            submitAnswer();
        } else if (!document.getElementById('next-question-btn').classList.contains('hidden')) {
            nextQuestion();
        }
    }
});

// ========== ADMIN ==========
async function loadUsers() {
    try {
        const users = await api('/api/admin/users');
        const tbody = document.getElementById('users-table-body');

        if (users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color: var(--text-muted);">Aucun utilisateur</td></tr>';
            return;
        }

        tbody.innerHTML = users.map(user => `
            <tr>
                <td><strong>${user.display_name}</strong></td>
                <td style="color: var(--text-secondary);">${user.username}</td>
                <td><span class="badge ${user.is_admin ? 'badge-admin' : 'badge-user'}">${user.is_admin ? 'Admin' : 'Utilisateur'}</span></td>
                <td style="color: var(--text-muted); font-size: 13px;">${new Date(user.created_at).toLocaleDateString('fr-CH')}</td>
                <td>
                    <div class="user-actions">
                        <button class="btn btn-sm btn-secondary" onclick="openResetPasswordModal(${user.id})" title="Réinitialiser le mot de passe">🔑</button>
                        ${user.id !== currentUser.id ? `<button class="btn btn-sm btn-danger" onclick="deleteUser(${user.id}, '${user.display_name.replace(/'/g, "\\'")}')" title="Supprimer">🗑️</button>` : ''}
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Users error:', err);
        showToast('Erreur lors du chargement des utilisateurs', 'error');
    }
}

function openCreateUserModal() {
    document.getElementById('create-user-form').reset();
    document.getElementById('create-user-error').classList.remove('visible');
    document.getElementById('create-user-modal').classList.add('visible');
}

async function createUser(e) {
    e.preventDefault();
    const errorEl = document.getElementById('create-user-error');
    errorEl.classList.remove('visible');

    try {
        await api('/api/admin/users', {
            method: 'POST',
            body: {
                display_name: document.getElementById('new-display-name').value,
                username: document.getElementById('new-username').value,
                password: document.getElementById('new-password').value,
                is_admin: document.getElementById('new-is-admin').checked
            }
        });
        closeModal('create-user-modal');
        showToast('Compte créé avec succès !');
        loadUsers();
    } catch (err) {
        errorEl.textContent = err.message;
        errorEl.classList.add('visible');
    }
}

async function deleteUser(userId, name) {
    if (!confirm(`Supprimer le compte de "${name}" ? Cette action est irréversible.`)) return;

    try {
        await api(`/api/admin/users/${userId}`, { method: 'DELETE' });
        showToast('Compte supprimé');
        loadUsers();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

function openResetPasswordModal(userId) {
    document.getElementById('reset-password-user-id').value = userId;
    document.getElementById('reset-password-input').value = '';
    document.getElementById('reset-password-error').classList.remove('visible');
    document.getElementById('reset-password-modal').classList.add('visible');
}

async function resetPassword(e) {
    e.preventDefault();
    const errorEl = document.getElementById('reset-password-error');
    errorEl.classList.remove('visible');
    const userId = document.getElementById('reset-password-user-id').value;

    try {
        await api(`/api/admin/users/${userId}/reset-password`, {
            method: 'PUT',
            body: { password: document.getElementById('reset-password-input').value }
        });
        closeModal('reset-password-modal');
        showToast('Mot de passe réinitialisé');
    } catch (err) {
        errorEl.textContent = err.message;
        errorEl.classList.add('visible');
    }
}

// ========== MODALS ==========
function closeModal(id) {
    document.getElementById(id).classList.remove('visible');
}

// Close on overlay click
document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.classList.remove('visible');
    });
});

// ========== UTILS ==========
function formatTime(seconds) {
    if (!seconds || seconds === 0) return '0 min';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0) return `${hrs}h ${mins}min`;
    return `${mins} min`;
}

// ========== INIT ==========
checkAuth();
