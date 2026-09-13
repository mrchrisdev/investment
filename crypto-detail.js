const assetDefinitions = {
    btc: { name: 'Bitcoin', symbol: 'BTC' },
    eth: { name: 'Ethereum', symbol: 'ETH' },
    ltc: { name: 'Litecoin', symbol: 'LTC' },
    doge: { name: 'Dogecoin', symbol: 'DOGE' }
};

function getCryptoAccount() {
    try {
        const currentUser = JSON.parse(localStorage.getItem('investCurrentUser') || 'null');
        const users = JSON.parse(localStorage.getItem('investUsers') || '[]');
        return users.find((user) => user.email === currentUser?.email) || null;
    } catch {
        return null;
    }
}

function formatQuantity(value) {
    return (Number(value) || 0).toLocaleString('en-US', { maximumFractionDigits: 8 });
}

const assetKey = new URLSearchParams(window.location.search).get('asset') || 'btc';
const asset = assetDefinitions[assetKey] || assetDefinitions.btc;
const account = getCryptoAccount();
const quantity = Number(account?.cryptoBalances?.[assetKey]) || 0;

const convertLink = document.getElementById('assetConvertLink');
if (convertLink) convertLink.href = `convert.html?from=${assetKey}`;

document.title = `${asset.name} | Invest`;
document.getElementById('selectedAssetHeading').firstChild.textContent = `${asset.name} Balance `;
document.querySelectorAll('.wallet__token').forEach((token) => {
    if (token.dataset.asset !== assetKey) {
        token.remove();
        return;
    }
    token.removeAttribute('role');
    token.removeAttribute('tabindex');
});

const activities = (account?.transactions || []).filter((transaction) => {
    const coin = String(transaction.coin || '').toLowerCase();
    return coin === asset.symbol.toLowerCase() || coin === asset.name.toLowerCase();
});
const activityList = document.getElementById('activityList');
document.getElementById('activityTitle').textContent = `${asset.name} Activity`;

if (!activities.length) {
    activityList.innerHTML = `<p class="empty-state">No ${asset.name} activity yet.</p>`;
} else {
    activities.forEach((transaction) => {
        const amount = Number(transaction.amount) || 0;
        const activity = document.createElement('article');
        activity.innerHTML = `<div><h3>${transaction.note || `Sent to ${transaction.recipient || 'wallet'}`}</h3><p>${transaction.recipient || 'Wallet activity'} &bull; ${new Date(transaction.createdAt).toLocaleString()}</p></div><strong class="${amount >= 0 ? 'incoming' : 'outgoing'}">${amount >= 0 ? '+' : ''}${formatQuantity(amount)} ${asset.symbol}</strong>`;
        activityList.appendChild(activity);
    });
}
