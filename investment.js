
function readCurrentUser() {
    try {
        const user = JSON.parse(localStorage.getItem('investCurrentUser') || 'null');
        return user && typeof user.email === 'string' ? user : null
    } catch {
        return null;
    }
}

const currentUser = readCurrentUser();
const usersStorageKey = 'investUsers';
const requestsStorageKey = 'investRequests';
const languageStorageKey = 'investLanguage';

const translations = {
    es: { Dashboard: 'Panel', Exchange: 'Intercambio', Wallet: 'Billetera', Transaction: 'Transacción', Analysis: 'Análisis', Message: 'Mensajes', 'Help Center': 'Centro de ayuda', Settings: 'Configuración', Overview: 'Resumen', 'Total asset': 'Activos totales', 'Total Balance': 'Saldo total', 'Today\'s P&L: +0.00%': 'P&L de hoy: +0.00%', 'Available balance': 'Saldo disponible', 'Fast Payment': 'Pago rápido', Investments: 'Inversiones', 'Recent Transactions': 'Transacciones recientes', 'Account Settings': 'Configuración de cuenta', Profile: 'Perfil', Security: 'Seguridad', Interface: 'Interfaz', Language: 'Idioma', 'Save Changes': 'Guardar cambios', Cancel: 'Cancelar' },
    fr: { Dashboard: 'Tableau de bord', Exchange: 'Échange', Wallet: 'Portefeuille', Transaction: 'Transaction', Analysis: 'Analyse', Message: 'Messages', 'Help Center': "Centre d'aide", Settings: 'Paramètres', Overview: 'Vue d’ensemble', 'Total asset': 'Actifs totaux', 'Total Balance': 'Solde total', 'Fast Payment': 'Paiement rapide', Investments: 'Investissements', 'Recent Transactions': 'Transactions récentes', 'Account Settings': 'Paramètres du compte', Profile: 'Profil', Security: 'Sécurité', Interface: 'Interface', Language: 'Langue', 'Save Changes': 'Enregistrer', Cancel: 'Annuler' },
    de: { Dashboard: 'Dashboard', Exchange: 'Austausch', Wallet: 'Wallet', Transaction: 'Transaktion', Analysis: 'Analyse', Message: 'Nachrichten', 'Help Center': 'Hilfezentrum', Settings: 'Einstellungen', Overview: 'Übersicht', 'Total asset': 'Gesamtvermögen', 'Total Balance': 'Gesamtsaldo', 'Fast Payment': 'Schnellzahlung', Investments: 'Investitionen', 'Recent Transactions': 'Letzte Transaktionen', 'Account Settings': 'Kontoeinstellungen', Profile: 'Profil', Security: 'Sicherheit', Interface: 'Oberfläche', Language: 'Sprache', 'Save Changes': 'Änderungen speichern', Cancel: 'Abbrechen' },
    pt: { Dashboard: 'Painel', Exchange: 'Câmbio', Wallet: 'Carteira', Transaction: 'Transação', Analysis: 'Análise', Message: 'Mensagens', 'Help Center': 'Central de ajuda', Settings: 'Configurações', Overview: 'Visão geral', 'Total asset': 'Ativos totais', 'Total Balance': 'Saldo total', 'Fast Payment': 'Pagamento rápido', Investments: 'Investimentos', 'Recent Transactions': 'Transações recentes', 'Account Settings': 'Configurações da conta', Profile: 'Perfil', Security: 'Segurança', Interface: 'Interface', Language: 'Idioma', 'Save Changes': 'Salvar alterações', Cancel: 'Cancelar' },
    zh: { Dashboard: '仪表板', Exchange: '兑换', Wallet: '钱包', Transaction: '交易', Analysis: '分析', Message: '消息', 'Help Center': '帮助中心', Settings: '设置', Overview: '概览', 'Total asset': '总资产', 'Total Balance': '总余额', 'Fast Payment': '快速付款', Investments: '投资', 'Recent Transactions': '最近交易', 'Account Settings': '账户设置', Profile: '个人资料', Security: '安全', Interface: '界面', Language: '语言', 'Save Changes': '保存更改', Cancel: '取消' },
    ar: { Dashboard: 'لوحة التحكم', Exchange: 'تبادل', Wallet: 'المحفظة', Transaction: 'المعاملة', Analysis: 'التحليل', Message: 'الرسائل', 'Help Center': 'مركز المساعدة', Settings: 'الإعدادات', Overview: 'نظرة عامة', 'Total asset': 'إجمالي الأصول', 'Total Balance': 'الرصيد الإجمالي', 'Fast Payment': 'دفع سريع', Investments: 'الاستثمارات', 'Recent Transactions': 'المعاملات الأخيرة', 'Account Settings': 'إعدادات الحساب', Profile: 'الملف الشخصي', Security: 'الأمان', Interface: 'الواجهة', Language: 'اللغة', 'Save Changes': 'حفظ التغييرات', Cancel: 'إلغاء' }
};

function applyLanguage(language = localStorage.getItem(languageStorageKey) || 'en') {
    const dictionary = translations[language] || {};
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);
    textNodes.forEach((node) => {
        const translated = dictionary[node.nodeValue.trim()];
        if (translated) node.nodeValue = node.nodeValue.replace(node.nodeValue.trim(), translated);
    });
    const languageSelect = document.getElementById('languageSelect');
    if (languageSelect) languageSelect.value = language;
}

function setupLanguageSelector() {
    const languageSelect = document.getElementById('languageSelect');
    if (!languageSelect || languageSelect.dataset.ready) return;
    languageSelect.dataset.ready = 'true';
    languageSelect.value = localStorage.getItem(languageStorageKey) || 'en';
    languageSelect.addEventListener('change', () => {
        localStorage.setItem(languageStorageKey, languageSelect.value);
        window.location.reload();
    });
}

const defaultSettings = {
    name: '',
    email: '',
    phone: '',
    twoFactor: true,
    withdrawalWhitelist: false,
    emailAlerts: true,
    tradeNotifications: false,
    promotionalMessages: false,
    theme: 'dark',
    defaultDashboard: 'investment.html'
};

function getAccountSettings(account) {
    return { ...defaultSettings, ...(account?.settings || {}), name: account?.name || '', email: account?.email || '', phone: account?.phone || '' };
}

function showSettingsStatus(message, isError = false) {
    const status = document.getElementById('settingsStatus');
    if (!status) return;
    status.textContent = message;
    status.classList.toggle('settings-status--error', isError);
}

function showInlineNotice(message, isError = false) {
    let notice = document.getElementById('inlineNotice');
    if (!notice) {
        notice = document.createElement('div');
        notice.id = 'inlineNotice';
        notice.className = 'inline-notice';
        notice.setAttribute('role', 'status');
        document.body.appendChild(notice);
    }
    notice.textContent = message;
    notice.classList.toggle('inline-notice--error', isError);
    notice.classList.add('is-visible');
    clearTimeout(notice.dismissTimer);
    notice.dismissTimer = setTimeout(() => notice.classList.remove('is-visible'), 4500);
}

function populateSettings(account) {
    const settings = getAccountSettings(account);
    const savedTheme = localStorage.getItem('currentTheme');
    if (savedTheme === 'dark-theme' || savedTheme === '') {
        settings.theme = savedTheme === 'dark-theme' ? 'dark' : 'light';
    }
    document.querySelectorAll('[data-setting]').forEach((field) => {
        const value = settings[field.dataset.setting];
        if (field.type === 'checkbox') field.checked = Boolean(value);
        else field.value = value;
    });
    setTheme(settings.theme === 'dark');
}

function collectSettings() {
    const settings = {};
    document.querySelectorAll('[data-setting]').forEach((field) => {
        settings[field.dataset.setting] = field.type === 'checkbox' ? field.checked : field.value.trim();
    });
    return settings;
}

function setupSettings() {
    const saveButton = document.getElementById('settingsSave');
    const cancelButton = document.getElementById('settingsCancel');
    const passwordButton = document.getElementById('changePassword');
    if (!saveButton || !cancelButton || !currentUser) return;

    const account = getAccount();
    if (!account) return;
    populateSettings(account);

    document.getElementById('settingsTheme')?.addEventListener('change', (event) => {
        setTheme(event.target.value === 'dark');
    });

    saveButton.addEventListener('click', () => {
        const settings = collectSettings();
        if (!settings.name || !settings.email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(settings.email)) {
            showSettingsStatus('Enter a valid name and email address.', true);
            return;
        }
        const users = getUsers();
        const duplicate = users.some((user) => user.email === settings.email && user.email !== account.email);
        if (duplicate) {
            showSettingsStatus('That email address is already in use.', true);
            return;
        }
        const userIndex = users.findIndex((user) => user.email === account.email);
        account.name = settings.name;
        account.email = settings.email;
        account.phone = settings.phone;
        account.settings = settings;
        users[userIndex] = account;
        localStorage.setItem(usersStorageKey, JSON.stringify(users));
        localStorage.setItem('investCurrentUser', JSON.stringify({ name: account.name, email: account.email }));
        currentUser.name = account.name;
        currentUser.email = account.email;
        renderProfile(account);
        setTheme(settings.theme === 'dark');
        showSettingsStatus('Settings saved.');
    });

    cancelButton.addEventListener('click', () => {
        populateSettings(getAccount());
        showSettingsStatus('Changes discarded.');
    });

    passwordButton?.addEventListener('click', () => {
        let passwordInput = document.getElementById('newPassword');
        if (!passwordInput) {
            passwordInput = document.createElement('input');
            passwordInput.id = 'newPassword';
            passwordInput.type = 'password';
            passwordInput.minLength = 8;
            passwordInput.placeholder = 'New password (8+ characters)';
            passwordInput.className = 'settings-inline-input';
            passwordButton.insertAdjacentElement('afterend', passwordInput);
            passwordInput.focus();
            passwordButton.textContent = 'Save password';
            return;
        }
        const password = passwordInput.value;
        if (password.length < 8) {
            showSettingsStatus('Password must be at least 8 characters.', true);
            return;
        }
        const users = getUsers();
        const user = users.find((item) => item.email === account.email);
        if (!user) return;
        user.password = password;
        localStorage.setItem(usersStorageKey, JSON.stringify(users));
        passwordInput.remove();
        passwordButton.textContent = 'Change password';
        showSettingsStatus('Password changed successfully.');
    });
}

const dashboardDate = document.getElementById('dashboardDate');

function updateDashboardDate() {
    if (!dashboardDate) return;
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    dashboardDate.value = `${now.getFullYear()}-${month}-${day}`;
    dashboardDate.title = `Today: ${now.toLocaleDateString()}`;
}

updateDashboardDate();
setInterval(updateDashboardDate, 60000);
window.addEventListener('pageshow', updateDashboardDate);
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) updateDashboardDate();
});

ensureProfileMenu();

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

function getAccount() {
    const account = getUsers().find((user) => user.email === currentUser?.email);
    if (!account) return null;
    account.cards = Array.isArray(account.cards) ? account.cards : [];
    account.investments ||= [];
    account.transactions ||= [];
    account.requests ||= [];
    account.balance ||= 0;
    account.cryptoBalances = account.cryptoBalances && typeof account.cryptoBalances === 'object'
        ? account.cryptoBalances
        : {};
    ['btc', 'eth', 'ltc', 'doge'].forEach((asset) => {
        const amount = Number(account.cryptoBalances[asset]);
        account.cryptoBalances[asset] = Number.isFinite(amount) && amount >= 0 ? amount : 0;
    });
    return account;
}

function saveAccount(account) {
    const users = getUsers();
    const accountIndex = users.findIndex((user) => user.email === account.email);
    if (accountIndex !== -1) {
        users[accountIndex] = account;
        saveUsers(users);
    }
}

function renderProfile(account) {
    if (!account) return;
    const profileName = account.name || 'Invest user';
    const profilePhoto = account.photo || 'invest-asset/profile-1.jpg';
    document.querySelectorAll('.nav__profile-wrapper > h5, .nav__profile-name, .nav__profile-menu-name, .card__footer-left h5').forEach((element) => {
        element.textContent = profileName;
    });
    document.querySelectorAll('.nav__profile-photo img').forEach((image) => {
        image.src = profilePhoto;
        image.alt = `${profileName} profile photo`;
    });
    document.querySelectorAll('.nav__profile-email').forEach((element) => {
        element.textContent = account.email;
    });
    document.querySelectorAll('input[data-profile-name]').forEach((input) => {
        input.value = profileName;
    });
}

function setupProfilePhotoChange(menu) {
    const changePhotoButton = [...menu.querySelectorAll('.profile-menu__item')]
        .find((button) => button.textContent.trim() === 'Change profile photo');
    if (!changePhotoButton || changePhotoButton.dataset.photoReady) return;

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.hidden = true;
    changePhotoButton.insertAdjacentElement('afterend', fileInput);
    changePhotoButton.dataset.photoReady = 'true';

    changePhotoButton.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', () => {
        const file = fileInput.files?.[0];
        if (!file || !file.type.startsWith('image/')) return;

        const reader = new FileReader();
        reader.addEventListener('load', () => {
            const account = getAccount();
            if (!account || typeof reader.result !== 'string') return;
            account.photo = reader.result;
            saveAccount(account);
            renderProfile(account);
        });
        reader.readAsDataURL(file);
    });
}

function ensureProfileMenu() {
    const profile = document.querySelector('.nav__profile');
    const wrapper = document.querySelector('.nav__profile-wrapper');
    if (!profile || !wrapper) return;

    let trigger = wrapper.querySelector('.nav__profile-toggle');
    if (!trigger) {
        const arrow = wrapper.querySelector('.uil-angle-down');
        if (arrow) {
            trigger = document.createElement('button');
            trigger.type = 'button';
            trigger.className = 'nav__profile-toggle';
            trigger.setAttribute('aria-label', 'Open profile menu');
            arrow.replaceWith(trigger);
            trigger.appendChild(arrow);
        }
    }

    let menu = wrapper.querySelector('.profile-menu');
    if (!menu) {
        menu = document.createElement('div');
        menu.className = 'profile-menu';
        menu.id = 'profileMenu';
        menu.innerHTML = '<div class="profile-menu__header"><span>Current account</span><strong class="nav__profile-menu-name"></strong></div><button type="button" class="profile-menu__item">Change profile photo</button><button type="button" class="profile-menu__item">Switch account</button><button type="button" class="profile-menu__item profile-menu__item--danger">Logout</button>';
        profile.appendChild(menu);
    }

    setupProfilePhotoChange(menu);

    trigger?.addEventListener('click', (event) => {
        event.stopPropagation();
        menu.classList.toggle('show');
    });
}

function setupSiteSearch() {
    const searchInput = document.querySelector('.nav__search input[type="search"]');
    if (!searchInput) return;

    const sitePages = [
        { title: 'Dashboard overview', page: 'investment.html', keywords: 'dashboard overview balance cards fast payment chart' },
        { title: 'Exchange', page: 'invest-Exchange.html', keywords: 'exchange markets trading crypto' },
        { title: 'Wallet', page: 'invest-wallet.html', keywords: 'wallet balance bitcoin ethereum litecoin dogecoin deposit withdraw transfer convert' },
        { title: 'Transactions', page: 'invest-transaction.html', keywords: 'transactions send crypto recipient coin amount history' },
        { title: 'Analysis', page: 'invest-analytics.html', keywords: 'analytics performance charts market analysis' },
        { title: 'Messages', page: 'invest-message.html', keywords: 'messages inbox support' },
        { title: 'Help Center', page: 'invest-helpCenter.html', keywords: 'help support questions faq' },
        { title: 'Settings', page: 'invest-settings.html', keywords: 'settings account profile security notifications preferences' }
    ];
    const results = document.createElement('div');
    results.className = 'site-search-results';
    results.setAttribute('role', 'listbox');
    searchInput.parentElement.appendChild(results);

    function getCurrentSections() {
        return [...document.querySelectorAll('main section, .right > section, .wallet, .transaction-send, .settings')].map((section) => {
            const heading = section.querySelector('h1, h2, h3, h4');
            if (!heading) return null;
            if (!section.id) section.id = `search-${heading.textContent.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
            return { title: heading.textContent.trim(), page: window.location.pathname.split('/').pop(), anchor: section.id, keywords: section.textContent.toLowerCase() };
        }).filter(Boolean);
    }

    function renderResults(query) {
        const normalizedQuery = query.trim().toLowerCase();
        if (!normalizedQuery) {
            results.classList.remove('show');
            results.replaceChildren();
            return;
        }
        const matches = [...getCurrentSections(), ...sitePages]
            .filter((item) => `${item.title} ${item.keywords}`.includes(normalizedQuery))
            .filter((item, index, items) => items.findIndex((candidate) => `${candidate.page}#${candidate.anchor || ''}` === `${item.page}#${item.anchor || ''}`) === index)
            .slice(0, 8);
        results.replaceChildren();
        matches.forEach((match) => {
            const link = document.createElement('a');
            link.href = match.anchor ? `${match.page}#${match.anchor}` : match.page;
            link.setAttribute('role', 'option');
            link.innerHTML = `<strong>${match.title}</strong><small>${match.page}</small>`;
            results.appendChild(link);
        });
        if (!matches.length) {
            const empty = document.createElement('span');
            empty.className = 'site-search-empty';
            empty.textContent = 'No matching section found';
            results.appendChild(empty);
        }
        results.classList.add('show');
    }

    searchInput.addEventListener('input', () => renderResults(searchInput.value));
    searchInput.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter') return;
        const firstResult = results.querySelector('a');
        if (firstResult) {
            event.preventDefault();
            window.location.href = firstResult.href;
        }
    });
    document.addEventListener('click', (event) => {
        if (!searchInput.parentElement.contains(event.target)) results.classList.remove('show');
    });
}
setupSiteSearch();

function requestApproval(type, details = {}) {
    const account = getAccount();
    if (!account) return;
    const alreadyRequested = account.requests.some((request) => request.type === type && request.status === 'pending' && (type !== 'deposit' || request.details.coin === details.coin));
    if (alreadyRequested) return;
    const request = { id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, type, details, status: 'pending', createdAt: new Date().toISOString() };
    account.requests.push(request);
    const requests = JSON.parse(localStorage.getItem(requestsStorageKey) || '[]');
    requests.push({ ...request, userEmail: account.email, userName: account.name });
    localStorage.setItem(requestsStorageKey, JSON.stringify(requests));
    saveAccount(account);
    renderAccount();
}

const cardAssets = [
    { key: 'btc', label: 'BTC' },
    { key: 'eth', label: 'ETH' },
    { key: 'ltc', label: 'LTC' },
    { key: 'doge', label: 'DOGE' }
];
const maxCardsPerUser = 4;

function getFundedCardAssets(account) {
    const existingAssets = new Set((account.cards || []).map((card) => card.asset));
    const pendingAssets = new Set((account.requests || [])
        .filter((request) => request.type === 'card' && request.status === 'pending')
        .map((request) => request.details.asset));
    return cardAssets.filter(({ key }) => Number(account.cryptoBalances[key]) > 0 && !existingAssets.has(key) && !pendingAssets.has(key));
}

function chooseCardAsset() {
    const account = getAccount();
    if (!account) return null;

    const fundedAssets = getFundedCardAssets(account);
    if (!fundedAssets.length) {
        showCardRequestMessage('Make a deposit before requesting a crypto card.');
        return null;
    }
    if (fundedAssets.length === 1) return fundedAssets[0];

    showCardAssetChooser(fundedAssets);
    return null;
}

function showCardRequestMessage(message) {
    const overview = document.getElementById('accountOverview');
    if (!overview) return;
    overview.querySelector('.card-request-message')?.remove();
    overview.insertAdjacentHTML('beforeend', `<p class="card-request-message" role="status">${message}</p>`);
}

function showCardAssetChooser(fundedAssets) {
    const overview = document.getElementById('accountOverview');
    if (!overview) return;
    overview.querySelector('.card-asset-chooser')?.remove();
    overview.insertAdjacentHTML('beforeend', `<div class="card-asset-chooser" role="dialog" aria-label="Choose card currency"><strong>Choose the currency for your card</strong><div>${fundedAssets.map(({ key, label }) => `<button type="button" data-card-choice="${key}">${label} card</button>`).join('')}<button type="button" class="card-asset-chooser__cancel" data-card-choice-cancel>Cancel</button></div></div>`);
    const chooser = overview.querySelector('.card-asset-chooser');
    chooser.addEventListener('click', (event) => {
        if (event.target.closest('[data-card-choice-cancel]')) {
            chooser.remove();
            return;
        }
        const choice = event.target.closest('[data-card-choice]');
        const asset = fundedAssets.find(({ key }) => key === choice?.dataset.cardChoice);
        if (!asset) return;
        requestApproval('card', { type: `${asset.label} card`, asset: asset.key });
    });
}

function createCardDetails() {
    const digits = Array.from({ length: 16 }, () => Math.floor(Math.random() * 10)).join('');
    const expiry = new Date();
    expiry.setFullYear(expiry.getFullYear() + 3);
    return {
        serialNumber: digits.replace(/(.{4})/g, '$1 ').trim(),
        expiry: `${String(expiry.getMonth() + 1).padStart(2, '0')}/${String(expiry.getFullYear()).slice(-2)}`,
        cvv: String(Math.floor(100 + Math.random() * 900))
    };
}

function ensureCardDetails(account) {
    let changed = false;
    account.cards.forEach((card) => {
        if (card.serialNumber && card.expiry && card.cvv) return;
        Object.assign(card, createCardDetails());
        changed = true;
    });
    if (changed) saveAccount(account);
}

function showCardDetails(cardIndex) {
    const account = getAccount();
    const card = account?.cards[cardIndex];
    if (!account || !card) return;

    let modal = document.getElementById('cardDetailsModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'cardDetailsModal';
        modal.className = 'card-details-modal';
        modal.innerHTML = '<div class="card-details-modal__backdrop" data-close-card-details></div><section class="card-details-panel" role="dialog" aria-modal="true" aria-labelledby="cardDetailsTitle"><button type="button" class="card-details-close" data-close-card-details aria-label="Close card details">&times;</button><p class="card-details-eyebrow">Card details</p><h2 id="cardDetailsTitle"></h2><div class="card-details-grid"><div><small>Serial number</small><strong data-card-detail="serialNumber"></strong></div><div><small>Expiry</small><strong data-card-detail="expiry"></strong></div><div><small>CVV</small><strong data-card-detail="cvv"></strong></div><div><small>Status</small><strong data-card-detail="status"></strong></div></div></section>';
        document.body.appendChild(modal);
        modal.addEventListener('click', (event) => {
            if (event.target.closest('[data-close-card-details]')) modal.hidden = true;
        });
    }

    modal.querySelector('.card-details-panel').dataset.cardTheme = String(cardIndex % 3);
    modal.querySelector('#cardDetailsTitle').textContent = card.type || 'Card';
    modal.querySelector('[data-card-detail="serialNumber"]').textContent = card.serialNumber;
    modal.querySelector('[data-card-detail="expiry"]').textContent = card.expiry;
    modal.querySelector('[data-card-detail="cvv"]').textContent = card.cvv;
    modal.querySelector('[data-card-detail="status"]').textContent = card.active === false ? 'Deactivated' : 'Active';
    modal.hidden = false;
    modal.querySelector('.card-details-close').focus();
}

function renderAccount() {
    const account = getAccount();
    if (!account) return;
    ensureCardDetails(account);
    const overview = document.getElementById('accountOverview');
    const cards = document.getElementById('accountCards');
    const investments = document.getElementById('accountInvestments');
    if (overview) {
        overview.innerHTML = `<div><h2>Total asset <button type="button" class="dashboard-balance-toggle" id="dashboardBalanceToggle" aria-label="Hide total asset" title="Hide total asset"><i class="uil uil-eye"></i></button></h2><p>Live value of your crypto holdings.</p></div><div class="dashboard-asset-values"><strong id="dashboardTotalBalance">${formatWalletCurrency(account.balance)}</strong><span id="dashboardPnl">Today's P&amp;L: +0.00%</span></div>`;
        setupDashboardBalanceToggle();
    }
    if (cards) {
        cards.querySelector('.card-request-bar')?.remove();
        cards.querySelectorAll('.card').forEach((card) => card.remove());
        cards.insertAdjacentHTML('afterbegin', '<div class="card-request-bar"><button type="button" class="account-request-btn" id="requestCardBtn">Request card</button></div>');
        account.cards.forEach((card, cardIndex) => {
            const asset = cardAssets.find(({ key }) => key === card.asset);
            const amount = asset ? Number(account.cryptoBalances[asset.key]) : Number(card.balance) || 0;
            const label = asset?.label || card.type;
            const isActive = card.active !== false;
            cards.insertAdjacentHTML('beforeend', `<article class="card${isActive ? '' : ' card--inactive'}" tabindex="0" role="link" aria-label="Open ${label} card management" data-card-index="${cardIndex}"><div class="card__header"><div class="card__header-left"><img src="invest-asset/${asset?.key?.toUpperCase() || 'BTC'}.png" alt=""><h3>${label}</h3></div><div class="card__header-right"><img src="invest-asset/visa.png" alt="Visa"></div></div><div class="card__body"><h1>${asset ? `${formatCryptoAmount(amount)} ${label}` : formatWalletCurrency(amount)}</h1><div class="card__body-chip"><img src="invest-asset/card chip.png" alt=""></div></div><div class="card__footer"><div class="card__footer-left"><small>Card Holder</small><h5>${account.name}</h5></div><small class="card__open-hint">Manage card</small></div></article>`);
        });
    }
    if (investments) {
        investments.querySelectorAll('.investment').forEach((investment) => investment.remove());
        account.investments.forEach((investment) => investments.insertAdjacentHTML('beforeend', `<article class="investment"><h4>${investment.name}</h4><div class="date-time"><p>${new Date(investment.createdAt).toLocaleDateString()}</p></div><div class="amount"><h5>${formatWalletCurrency(investment.amount)}</h5></div></article>`));
        if (!account.investments.length) investments.insertAdjacentHTML('beforeend', '<p class="account-empty">No investments available yet.</p>');
    }
    const cardRequest = document.getElementById('requestCardBtn');
    const investmentRequest = document.getElementById('requestInvestmentBtn');
    const hasPendingCard = account.requests.some((request) => request.type === 'card' && request.status === 'pending');
    const hasPendingInvestment = account.requests.some((request) => request.type === 'investment' && request.status === 'pending');
    if (cardRequest) {
        cardRequest.disabled = account.cards.length >= maxCardsPerUser || hasPendingCard;
        cardRequest.textContent = account.cards.length >= maxCardsPerUser ? 'Card limit reached' : hasPendingCard ? 'Processing' : `Request card (${account.cards.length}/${maxCardsPerUser})`;
    }
    if (investmentRequest) { investmentRequest.disabled = hasPendingInvestment; investmentRequest.textContent = hasPendingInvestment ? 'Processing' : 'Request investment'; }
}

function setupDashboardBalanceToggle() {
    const toggle = document.getElementById('dashboardBalanceToggle');
    const balance = document.getElementById('dashboardTotalBalance');
    const pnl = document.getElementById('dashboardPnl');
    if (!toggle || !balance || toggle.dataset.ready) return;
    toggle.dataset.ready = 'true';
    toggle.addEventListener('click', () => {
        const hidden = balance.classList.toggle('dashboard-value-hidden');
        pnl?.classList.toggle('dashboard-value-hidden', hidden);
        toggle.setAttribute('aria-label', hidden ? 'Show total asset' : 'Hide total asset');
        toggle.title = hidden ? 'Show total asset' : 'Hide total asset';
        toggle.innerHTML = `<i class="uil uil-eye${hidden ? '-slash' : ''}"></i>`;
    });
}

if (!currentUser) {
    window.location.href = 'invest-first__page.html';
} else {
    renderProfile(getAccount() || currentUser);
}

const logoutButton = document.querySelector('.profile-menu__item--danger');
if (logoutButton) {
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('investCurrentUser');
        window.location.href = 'invest-first__page.html';
    });
}

document.addEventListener('click', (event) => {
    if (!event.target.closest('#requestCardBtn')) return;
    const asset = chooseCardAsset();
    if (asset) requestApproval('card', { type: `${asset.label} card`, asset: asset.key });
});

document.getElementById('accountCards')?.addEventListener('click', (event) => {
    const cardElement = event.target.closest('.card');
    if (cardElement) window.location.href = `card-management.html?card=${cardElement.dataset.cardIndex}`;
});

document.getElementById('accountCards')?.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const cardElement = event.target.closest('.card');
    if (!cardElement) return;
    event.preventDefault();
    window.location.href = `card-management.html?card=${cardElement.dataset.cardIndex}`;
});

document.getElementById('requestInvestmentBtn')?.addEventListener('click', () => requestApproval('investment', { name: 'Starter investment', amount: 0 }));

function renderTransactionHistory() {
    const historyBody = document.getElementById('transactionHistoryBody');
    const account = getAccount();
    if (!historyBody || !account) return;
    historyBody.replaceChildren();
    [...account.transactions].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).forEach((transaction) => {
        const row = document.createElement('tr');
        const isConversion = transaction.type === 'conversion';
        const amount = isConversion
            ? `<span class="danger">-${transaction.fromAmount} ${transaction.fromAsset}</span><br><span class="success">+${transaction.toAmount} ${transaction.toAsset}</span>`
            : `<span class="${transaction.type === 'deposit' ? 'success' : ''}">${transaction.direction === 'in' ? '+' : '-'}${transaction.amount} ${transaction.asset || transaction.coin || 'USD'}</span>`;
        const from = transaction.direction === 'in' ? 'External wallet' : account.name;
        const to = transaction.direction === 'in' ? account.name : transaction.recipient || (isConversion ? 'Wallet' : 'Card provider');
        const statusClass = transaction.status === 'Pending' ? '' : transaction.direction === 'in' ? 'success' : 'danger';
        const statusCellClass = transaction.status === 'Completed' ? 'status-completed' : statusClass;
        row.innerHTML = `<td>${transaction.id || '-'}</td><td>${new Date(transaction.createdAt).toLocaleString()}</td><td>${from}</td><td>${to}</td><td>${isConversion ? `${transaction.fromAsset} to ${transaction.toAsset}` : transaction.asset || transaction.coin || 'USD'}</td><td>${amount}</td><td>${transaction.description || transaction.note || '-'}</td><td class="${statusClass}"><span class="${statusCellClass}">${transaction.status || 'Completed'}</span></td>`;
        historyBody.appendChild(row);
    });
}

// theme toggle
const themeBtn = document.querySelector(".nav__theme-btn");

function updateThemeButton() {
    if (!themeBtn) return;
    if (document.body.classList.contains('dark-theme')) {
        themeBtn.innerHTML = '<i class="uil uil-sun"></i>';
    } else {
        themeBtn.innerHTML = '<i class="uil uil-moon"></i>';
    }
}

function setTheme(isDark) {
    if (isDark) {
        document.body.classList.add('dark-theme');
        localStorage.setItem('currentTheme', 'dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
        localStorage.setItem('currentTheme', '');
    }
    updateThemeButton();
    const settingsTheme = document.getElementById('settingsTheme');
    if (settingsTheme) settingsTheme.value = isDark ? 'dark' : 'light';
}

if (themeBtn) {
    themeBtn.addEventListener('click', () => {
        setTheme(!document.body.classList.contains('dark-theme'));
        createTradingView();
    });
}

const savedTheme = localStorage.getItem('currentTheme');
setTheme(savedTheme === 'dark-theme');
createTradingView(); // initialize chart on load




//  show/Hide Sidebar
const sidebar = document.querySelector(".sidebar");
const closeSidebarBtn = document.querySelector(".sidebar__close-btn");
const openSidebarBtn = document.querySelector(".nav__menu-btn");


if (openSidebarBtn && sidebar) {
    openSidebarBtn.addEventListener('click', () => {
        sidebar.style.display = 'flex';
    });
}

if (closeSidebarBtn && sidebar) {
    closeSidebarBtn.addEventListener('click', () => {
        sidebar.style.display = 'none';
    });
}

const walletEyeToggle = document.querySelector('.wallet__balance h4 i');
const walletBalanceAmount = document.querySelector('.wallet__balance h1');
const walletPnl = document.getElementById('wallet-pnl');
const walletTokenAmounts = document.querySelectorAll('.wallet__token p');
const selectedAssetKey = new URLSearchParams(window.location.search).get('asset');

document.querySelectorAll('.wallet__token[data-asset]').forEach((token) => {
    const openDetails = () => {
        window.location.href = `crypto-detail.html?asset=${token.dataset.asset}`;
    };
    token.addEventListener('click', openDetails);
    token.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openDetails();
        }
    });
});

function goToTransactionPage() {
    window.location.href = 'invest-transaction.html';
}

function goToDepositForm() {
    const depositSection = document.getElementById('depositFormSection');
    if (!depositSection) return;
    depositSection.hidden = false;
    depositSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function goToDepositPage() {
    if (document.getElementById('depositFormSection')) {
        goToDepositForm();
        return;
    }
    window.location.href = 'invest-wallet.html#deposit';
}

if (window.location.hash === '#deposit') goToDepositForm();

document.getElementById('depositRequestForm')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const amount = Number(formData.get('amount'));
    if (!Number.isFinite(amount) || amount <= 0) return;
    const coin = formData.get('coin');
    requestApproval('deposit', { coin, amount });
    event.currentTarget.reset();
    showInlineNotice('Deposit request sent to admin.');
});

if (walletEyeToggle && walletBalanceAmount) {
    walletEyeToggle.style.cursor = 'pointer';
    walletBalanceAmount.dataset.amount = walletBalanceAmount.textContent.trim();
    walletTokenAmounts.forEach(field => {
        field.dataset.amount = field.textContent.trim();
    });

    walletEyeToggle.addEventListener('click', () => {
        const hidden = !walletBalanceAmount.classList.contains('wallet__balance-hidden');
        walletBalanceAmount.classList.toggle('wallet__balance-hidden', hidden);
        walletEyeToggle.classList.toggle('uil-eye-slash', !hidden);
        walletEyeToggle.classList.toggle('uil-eye', hidden);
        walletEyeToggle.title = hidden ? 'Show balance' : 'Hide balance';

        walletBalanceAmount.textContent = hidden ? '••••••••••••' : walletBalanceAmount.dataset.amount;
        walletTokenAmounts.forEach(field => {
            field.textContent = hidden ? '••••••••••••' : field.dataset.amount;
            field.classList.toggle('wallet__amount-hidden', hidden);
        });
    });
}

function formatWalletCurrency(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
}

function formatCryptoAmount(value) {
    return (Number(value) || 0).toLocaleString('en-US', { maximumFractionDigits: 8 });
}

function getMarketPriceSnapshot() {
    return fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,litecoin,dogecoin,solana,cardano&vs_currencies=usd&include_24hr_change=true')
        .then((response) => {
            if (!response.ok) throw new Error(`Market request failed: ${response.status}`);
            return response.json();
        });
}

function updateExchangePageFromMarket(data) {
    const exchangePriceValue = document.getElementById('exchangePriceValue');
    const exchangeRangeValue = document.getElementById('exchangeRangeValue');
    const exchangeRateValue = document.getElementById('exchangeRateValue');
    const exchangePriceChange = document.getElementById('exchangePriceChange');
    const payAmountInput = document.getElementById('exchangePayAmount');
    const receiveAmountInput = document.getElementById('exchangeReceiveAmount');

    if (!exchangePriceValue && !exchangeRateValue && !payAmountInput) return;

    const account = getAccount();
    const btcPrice = Number(data?.bitcoin?.usd) || 0;
    const btcChange = Number(data?.bitcoin?.usd_24h_change) || 0;
    const availableBtc = Number(account?.cryptoBalances?.btc) || 0;
    const defaultPay = availableBtc > 0 ? Math.min(availableBtc, 0.42) : 0;

    if (exchangePriceValue) exchangePriceValue.textContent = formatWalletCurrency(btcPrice);
    if (exchangeRateValue) exchangeRateValue.textContent = `1 BTC = ${formatWalletCurrency(btcPrice)}`;
    if (exchangePriceChange) {
        const changeText = `${btcChange >= 0 ? '+' : '-'}${Math.abs(btcChange).toFixed(2)}%`;
        exchangePriceChange.textContent = changeText;
        exchangePriceChange.classList.toggle('positive', btcChange >= 0);
        exchangePriceChange.classList.toggle('negative', btcChange < 0);
    }
    if (exchangeRangeValue) {
        const lower = btcPrice * (1 - 0.02);
        const upper = btcPrice * (1 + 0.02);
        exchangeRangeValue.textContent = `24h range: ${formatWalletCurrency(lower)} - ${formatWalletCurrency(upper)}`;
    }

    if (payAmountInput) {
        payAmountInput.value = Number(payAmountInput.value || 0) > 0 ? Number(payAmountInput.value) : defaultPay;
        if (!Number.isFinite(Number(payAmountInput.value)) || Number(payAmountInput.value) <= 0) {
            payAmountInput.value = '0';
        }
        if (receiveAmountInput) {
            receiveAmountInput.value = (Number(payAmountInput.value) * btcPrice).toFixed(2);
        }
    }

    const marketRows = document.querySelectorAll('.market-row[data-coin]');
    marketRows.forEach((row) => {
        const key = row.dataset.coin;
        const priceMap = {
            btc: { usd: data?.bitcoin?.usd, change: data?.bitcoin?.usd_24h_change },
            eth: { usd: data?.ethereum?.usd, change: data?.ethereum?.usd_24h_change },
            sol: { usd: data?.solana?.usd, change: data?.solana?.usd_24h_change },
            doge: { usd: data?.dogecoin?.usd, change: data?.dogecoin?.usd_24h_change },
            ada: { usd: data?.cardano?.usd, change: data?.cardano?.usd_24h_change }
        };
        const current = priceMap[key];
        const priceEl = row.querySelector('.market-price');
        const trendEl = row.querySelector('.trend');
        if (priceEl && current?.usd) {
            priceEl.textContent = formatWalletCurrency(current.usd);
        }
        if (trendEl && current?.change !== undefined) {
            const value = Number(current.change) || 0;
            trendEl.textContent = `${value >= 0 ? '+' : '-'}${Math.abs(value).toFixed(2)}%`;
            trendEl.classList.toggle('positive', value >= 0);
            trendEl.classList.toggle('negative', value < 0);
        }
    });
}

function updateAnalysisPageFromMarket(data) {
    const portfolioValueEl = document.getElementById('analysisPortfolioValue');
    const portfolioChangeEl = document.getElementById('analysisPortfolioChange');
    const cashValueEl = document.getElementById('analysisCashValue');
    const cashShareEl = document.getElementById('analysisCashShare');
    const dailyValueEl = document.getElementById('analysisDailyValue');
    const dailyPctEl = document.getElementById('analysisDailyPct');
    const riskLabelEl = document.getElementById('analysisRiskLabel');
    const riskStateEl = document.getElementById('analysisRiskState');

    if (!portfolioValueEl && !cashValueEl && !dailyValueEl) return;

    const account = getAccount();
    if (!account) return;

    const holdingMap = {
        btc: { id: 'bitcoin', amount: Number(account.cryptoBalances?.btc) || 0 },
        eth: { id: 'ethereum', amount: Number(account.cryptoBalances?.eth) || 0 },
        ltc: { id: 'litecoin', amount: Number(account.cryptoBalances?.ltc) || 0 },
        doge: { id: 'dogecoin', amount: Number(account.cryptoBalances?.doge) || 0 }
    };

    const holdingsValue = Object.values(holdingMap).reduce((sum, item) => {
        const price = Number(data[item.id]?.usd) || 0;
        return sum + (item.amount * price);
    }, 0);

    const cashValue = Number(account.balance) || 0;
    const portfolioValue = holdingsValue + cashValue;
    const weightedChange = Object.values(holdingMap).reduce((sum, item) => {
        const price = Number(data[item.id]?.usd) || 0;
        const change = Number(data[item.id]?.usd_24h_change) || 0;
        const value = item.amount * price;
        return sum + (value * change);
    }, 0) / (portfolioValue || 1);

    const dailyReturn = portfolioValue * (weightedChange / 100);
    const cashShare = portfolioValue > 0 ? (cashValue / portfolioValue) * 100 : 0;

    if (portfolioValueEl) portfolioValueEl.textContent = formatWalletCurrency(portfolioValue);
    if (portfolioChangeEl) {
        const changeText = `${weightedChange >= 0 ? '+' : '-'}${Math.abs(weightedChange).toFixed(2)}%`;
        portfolioChangeEl.textContent = `${changeText} YTD`;
        portfolioChangeEl.classList.toggle('positive', weightedChange >= 0);
        portfolioChangeEl.classList.toggle('negative', weightedChange < 0);
    }
    if (cashValueEl) cashValueEl.textContent = formatWalletCurrency(cashValue);
    if (cashShareEl) cashShareEl.textContent = `${cashShare.toFixed(1)}% of assets`;
    if (dailyValueEl) dailyValueEl.textContent = formatWalletCurrency(Math.abs(dailyReturn));
    if (dailyPctEl) {
        const pct = portfolioValue > 0 ? (dailyReturn / portfolioValue) * 100 : 0;
        const sign = pct >= 0 ? '+' : '-';
        dailyPctEl.textContent = `${sign}${Math.abs(pct).toFixed(2)}%`;
        dailyPctEl.classList.toggle('positive', pct >= 0);
        dailyPctEl.classList.toggle('negative', pct < 0);
    }
    if (riskLabelEl) {
        riskLabelEl.textContent = portfolioValue > 250000 ? 'Moderate' : 'Balanced';
    }
    if (riskStateEl) {
        riskStateEl.textContent = portfolioValue > 250000 ? 'Growth focus' : 'Balanced';
    }
}

function updateWalletBalanceFromMarket() {
    const dashboardTotalBalance = document.getElementById('dashboardTotalBalance');
    if (!walletBalanceAmount && !dashboardTotalBalance) return;

    const isHidden = walletBalanceAmount?.classList.contains('wallet__balance-hidden') || false;
    const account = getAccount();
    if (!account) return;
    const initialBalance = Number(account.balance) || 0;

    getMarketPriceSnapshot()
        .then((data) => {
            const holdings = [
                { key: 'btc', name: 'bitcoin', amount: account.cryptoBalances.btc },
                { key: 'eth', name: 'ethereum', amount: account.cryptoBalances.eth },
                { key: 'ltc', name: 'litecoin', amount: account.cryptoBalances.ltc },
                { key: 'doge', name: 'dogecoin', amount: account.cryptoBalances.doge }
            ];
            const visibleHoldings = selectedAssetKey
                ? holdings.filter((item) => item.key === selectedAssetKey)
                : holdings;

            const rows = selectedAssetKey
                ? document.querySelectorAll('.wallet__token:not([hidden])')
                : document.querySelectorAll('.wallet__token');
            let totalBalance = visibleHoldings.reduce((total, item) => {
                const price = data[item.name]?.usd || 0;
                return total + (price * item.amount);
            }, 0);

            rows.forEach((row, index) => {
                const item = visibleHoldings[index];
                if (!item) return;
                const price = data[item.name]?.usd || 0;
                const holdingValue = price * item.amount;
                const coinAmount = row.querySelector('.wallet__token-right h4');
                    if (coinAmount) coinAmount.textContent = formatCoinAmount(item.amount);

                const priceFields = row.querySelectorAll('p');
                if (priceFields[0]) {
                    priceFields[0].dataset.amount = formatWalletCurrency(price);
                    priceFields[0].textContent = isHidden ? '••••••••••••' : priceFields[0].dataset.amount;
                }
                if (priceFields[1]) {
                    priceFields[1].dataset.amount = formatWalletCurrency(holdingValue);
                    priceFields[1].textContent = isHidden ? '••••••••••••' : priceFields[1].dataset.amount;
                }
            });

            const pnlValue = totalBalance - initialBalance;
            const pnlPercent = initialBalance > 0 ? (pnlValue / initialBalance) * 100 : 0;

            if (walletBalanceAmount) {
                walletBalanceAmount.dataset.amount = formatWalletCurrency(totalBalance);
                walletBalanceAmount.textContent = isHidden ? '••••••••••••' : walletBalanceAmount.dataset.amount;
            }
            if (dashboardTotalBalance) dashboardTotalBalance.textContent = formatWalletCurrency(totalBalance);
            const dashboardPnl = document.getElementById('dashboardPnl');
            if (dashboardPnl) {
                const sign = pnlValue >= 0 ? '+' : '-';
                dashboardPnl.textContent = `Today's P&L: ${sign}${Math.abs(pnlPercent).toFixed(2)}%`;
                dashboardPnl.classList.toggle('negative', pnlValue < 0);
            }

            if (walletPnl) {
                const sign = pnlValue >= 0 ? '+' : '-';
                const pnlText = `${sign}${Math.abs(pnlPercent).toFixed(2)}%`;
                walletPnl.textContent = `P&L: ${pnlText}`;
                walletPnl.classList.toggle('negative', pnlValue < 0);
            }

            updateExchangePageFromMarket(data);
            updateAnalysisPageFromMarket(data);
        })
        .catch(() => {
            const balanceSource = walletBalanceAmount || document.getElementById('dashboardTotalBalance');
            const currentBalance = parseFloat(balanceSource?.dataset.amount?.replace(/[$,]/g, '') || '0');
            const pnlValue = currentBalance - initialBalance;
            const pnlPercent = initialBalance > 0 ? (pnlValue / initialBalance) * 100 : 0;

            if (walletBalanceAmount) {
                walletBalanceAmount.dataset.amount = formatWalletCurrency(currentBalance);
                walletBalanceAmount.textContent = isHidden ? '••••••••••••' : walletBalanceAmount.dataset.amount;
            }
            if (dashboardTotalBalance) dashboardTotalBalance.textContent = formatWalletCurrency(currentBalance);
            const dashboardPnl = document.getElementById('dashboardPnl');
            if (dashboardPnl) {
                const sign = pnlValue >= 0 ? '+' : '-';
                dashboardPnl.textContent = `Today's P&L: ${sign}${Math.abs(pnlPercent).toFixed(2)}%`;
                dashboardPnl.classList.toggle('negative', pnlValue < 0);
            }

            if (walletPnl) {
                const sign = pnlValue >= 0 ? '+' : '-';
                const pnlText = `${sign}${Math.abs(pnlPercent).toFixed(2)}%`;
                walletPnl.textContent = `P&L: ${pnlText}`;
                walletPnl.classList.toggle('negative', pnlValue < 0);
            }

            walletTokenAmounts.forEach((field) => {
                field.textContent = field.classList.contains('wallet__amount-hidden') || isHidden
                    ? '••••••••••••'
                    : field.dataset.amount || '$0.00';
            });
        });
}

function formatCoinAmount(value) {
    return (Number(value) || 0).toLocaleString('en-US', { maximumFractionDigits: 8 });
}
setInterval(updateWalletBalanceFromMarket, 10000);
updateWalletBalanceFromMarket();

renderAccount();
renderTransactionHistory();
setupLanguageSelector();
setupSettings();
applyLanguage();

window.addEventListener('storage', (event) => {
    if (event.key === usersStorageKey || event.key === requestsStorageKey) {
        renderAccount();
        renderTransactionHistory();
        applyLanguage();
    }
});
window.addEventListener('pageshow', () => {
    renderAccount();
    renderTransactionHistory();
    applyLanguage();
});

// Compute TradingView theme from body class
function createTradingView(){
    const container = document.getElementById('tradingview_chart');
    if (!container || typeof TradingView === 'undefined') {
        return;
    }

    const tvTheme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
    const toolbarBg = tvTheme === 'dark' ? '#1f2937' : '#f1f3f6';

    container.innerHTML = '';

    new TradingView.widget({
        container_id: "tradingview_chart",
        autosize: true,
        symbol: "BINANCE:BTCUSDT",
        interval: "60",
        timezone: "Etc/UTC",
        theme: tvTheme,
        style: "1",
        locale: "en",
        toolbar_bg: toolbarBg,
        enable_publishing: false,
        allow_symbol_change: true,
        hide_side_toolbar: false,
        hide_legend: true,
        withdateranges: true,
        details: true,
        hotlist: true,
        calendar: true
    });
}

// Make toggleProfileMenu globally accessible for onclick handler
window.toggleProfileMenu = function() {
    console.log('toggleProfileMenu called');
    const menu = document.getElementById('profileMenu');
    console.log('menu element:', menu);
    if (menu) {
        console.log('current classes:', menu.className);
        menu.classList.toggle('show');
        console.log('new classes:', menu.className);
    } else {
        console.log('profileMenu element not found!');
    }
};

// Close menu when clicking outside
document.addEventListener('click', (event) => {
    const menu = document.getElementById('profileMenu');
    const trigger = document.querySelector('.nav__profile-toggle');
    
    if (menu && trigger && !menu.contains(event.target) && !trigger.contains(event.target)) {
        menu.classList.remove('show');
    }
});












document.addEventListener('click', (event) => {
    const menu = document.getElementById('profileMenu');
    const trigger = document.querySelector('.nav__profile .uil-angle-down');

    if (!menu || !trigger) return;
    if (menu.classList.contains('show') &&
        !menu.contains(event.target) &&
        !trigger.contains(event.target)) {
        menu.classList.remove('show');
    }
});


