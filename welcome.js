const authModal = document.getElementById('authModal');
const authForm = document.getElementById('authForm');
const authTitle = document.getElementById('authTitle');
const authCopy = document.getElementById('authCopy');
const authSubmit = document.getElementById('authSubmit');
const authSuccess = document.getElementById('authSuccess');
const nameField = authForm.querySelector('label:first-child');
const usersStorageKey = 'investUsers';
const currentUserStorageKey = 'investCurrentUser';

function getUsers() {
    try {
        const users = JSON.parse(localStorage.getItem(usersStorageKey) || '[]');
        return Array.isArray(users) ? users : [];
    } catch {
        return [];
    }
}

function saveUsers(users) {
    localStorage.setItem(usersStorageKey, JSON.stringify(users));
}

function showAuthError(message) {
    authSuccess.textContent = message;
    authSuccess.style.color = '#bd5f55';
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

function setAuthMode(mode) {
    const isLogin = mode === 'login';
    authTitle.textContent = isLogin ? 'Welcome back.' : 'Start with a clearer view.';
    authCopy.textContent = isLogin ? 'Log in to pick up where you left off.' : 'Create your free account and see your financial picture in one place.';
    authSubmit.innerHTML = isLogin ? 'Log in <i class="uil uil-arrow-right"></i>' : 'Create free account <i class="uil uil-arrow-right"></i>';
    nameField.style.display = isLogin ? 'none' : 'block';
    nameField.querySelector('input').required = !isLogin;
    document.querySelectorAll('.auth-tab').forEach((tab) => tab.classList.toggle('is-active', tab.dataset.authTab === mode));
    authSuccess.textContent = '';
    authSuccess.style.color = '';
}

function openAuth(mode) {
    setAuthMode(mode);
    authModal.classList.add('is-open');
    authModal.setAttribute('aria-hidden', 'false');
    authForm.querySelector('input:not([type="hidden"])').focus();
}

function closeAuth() {
    authModal.classList.remove('is-open');
    authModal.setAttribute('aria-hidden', 'true');
}

document.querySelectorAll('[data-auth]').forEach((button) => button.addEventListener('click', () => openAuth(button.dataset.auth)));
document.querySelectorAll('[data-auth-tab]').forEach((button) => button.addEventListener('click', () => setAuthMode(button.dataset.authTab)));
document.querySelectorAll('[data-close-auth]').forEach((button) => button.addEventListener('click', closeAuth));
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeAuth(); });
authForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const isLogin = document.querySelector('.auth-tab.is-active').dataset.authTab === 'login';
    const formData = new FormData(authForm);
    const email = formData.get('email').trim().toLowerCase();
    const password = formData.get('password');
    const users = getUsers();

    if (!isValidEmail(email)) {
        showAuthError('Please enter a valid email address, such as name@gmail.com.');
        return;
    }

    if (isLogin) {
        const user = users.find((account) => account.email === email && account.password === password);
        if (!user) {
            showAuthError('The email or password is incorrect.');
            return;
        }
        localStorage.setItem(currentUserStorageKey, JSON.stringify({ name: user.name, email: user.email }));
        window.location.href = 'investment.html';
        return;
    }

    const name = formData.get('name').trim();
    if (users.some((account) => account.email === email)) {
        showAuthError('An account with this email already exists.');
        return;
    }

    users.push({
        name,
        email,
        password,
        photo: 'invest-asset/profile-1.jpg',
        balance: 0,
        cryptoBalances: { btc: 0, eth: 0, ltc: 0, doge: 0 },
        cards: [],
        investments: [],
        transactions: [],
        requests: [],
        createdAt: new Date().toISOString()
    });
    saveUsers(users);
    localStorage.setItem(currentUserStorageKey, JSON.stringify({ name, email }));
    window.location.href = 'investment.html';
});