const currentUserKey = 'investCurrentUser';
const usersKey = 'investUsers';
const cardAssets = {
    btc: { label: 'BTC', image: 'BTC.png' },
    eth: { label: 'ETH', image: 'ETH.png' },
    ltc: { label: 'LTC', image: 'LTC.png' },
    doge: { label: 'DOGE', image: 'DOGE.png' }
};

function readJson(key, fallback) {
    try {
        return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
    } catch {
        return fallback;
    }
}

function getAccount() {
    const currentUser = readJson(currentUserKey, null);
    const users = readJson(usersKey, []);
    return users.find((user) => user.email === currentUser?.email) || null;
}

function saveAccount(account) {
    const users = readJson(usersKey, []);
    const index = users.findIndex((user) => user.email === account.email);
    if (index === -1) return;
    users[index] = account;
    localStorage.setItem(usersKey, JSON.stringify(users));
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

const account = getAccount();
const cardIndex = Number(new URLSearchParams(window.location.search).get('card'));
const card = account?.cards?.[cardIndex];
const board = document.getElementById('cardManagementBoard');

function redirectToDashboard() {
    window.location.href = 'investment.html';
}

if (!account || !card || !Number.isInteger(cardIndex) || cardIndex < 0) {
    board.innerHTML = '<div class="empty-state"><h1>Card not found</h1><p>This card is no longer available.</p><a class="board-back" href="investment.html">Return to dashboard</a></div>';
} else {
    if (!card.serialNumber || !card.expiry || !card.cvv) {
        Object.assign(card, createCardDetails());
        saveAccount(account);
    }

    const asset = cardAssets[card.asset] || { label: card.type || 'Card', image: 'BTC.png' };
    const active = card.active !== false;
    const managementCard = document.getElementById('managementCard');
    managementCard.className = `management-card theme-${cardIndex % 3}`;
    managementCard.innerHTML = `<div class="management-card__top"><div class="management-card__brand"><img src="invest-asset/${asset.image}" alt="${asset.label}"><strong>${asset.label}</strong></div><span class="management-card__visa">VISA</span></div><strong class="management-card__number">${card.serialNumber}</strong><div class="management-card__bottom"><div><small>Cardholder</small><strong>${account.name}</strong></div><div><small>Expires</small><strong>${card.expiry}</strong></div></div>`;
    document.getElementById('managementTitle').textContent = `${asset.label} card`;
    document.getElementById('serialNumber').textContent = card.serialNumber;
    document.getElementById('expiry').textContent = card.expiry;
    document.getElementById('cvv').textContent = card.cvv;
    document.getElementById('cardholder').textContent = account.name;

    const status = document.getElementById('managementStatus');
    const toggle = document.getElementById('toggleCardButton');
    const feedback = document.getElementById('actionFeedback');
    status.textContent = active ? 'Active' : 'Deactivated';
    status.className = `status-badge ${active ? 'is-active' : 'is-inactive'}`;
    toggle.innerHTML = `<i class="uil uil-power"></i> ${active ? 'Deactivate card' : 'Activate card'}`;

    toggle.addEventListener('click', () => {
        card.active = card.active === false;
        saveAccount(account);
        window.location.reload();
    });

    const deleteButton = document.getElementById('deleteCardButton');
    deleteButton.addEventListener('click', () => {
        if (deleteButton.dataset.deletePending !== 'true') {
            deleteButton.dataset.deletePending = 'true';
            deleteButton.textContent = 'Confirm delete';
            feedback.textContent = 'Click delete again to permanently remove this card.';
            feedback.className = 'action-feedback action-feedback--warning';
            return;
        }
        account.cards.splice(cardIndex, 1);
        saveAccount(account);
        redirectToDashboard();
    });

    window.addEventListener('storage', (event) => {
        if (event.key === usersKey) window.location.reload();
    });
}
