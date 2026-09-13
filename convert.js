const usersKey = 'investUsers';
const currentUserKey = 'investCurrentUser';
const assets = [
    { key: 'btc', name: 'bitcoin', label: 'Bitcoin', symbol: 'BTC' },
    { key: 'eth', name: 'ethereum', label: 'Ethereum', symbol: 'ETH' },
    { key: 'ltc', name: 'litecoin', label: 'Litecoin', symbol: 'LTC' },
    { key: 'doge', name: 'dogecoin', label: 'Dogecoin', symbol: 'DOGE' }
];

function readJson(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); } catch { return fallback; }
}

function getAccount() {
    const current = readJson(currentUserKey, null);
    return readJson(usersKey, []).find((user) => user.email === current?.email) || null;
}

function saveAccount(account) {
    const users = readJson(usersKey, []);
    const index = users.findIndex((user) => user.email === account.email);
    if (index === -1) return;
    users[index] = account;
    localStorage.setItem(usersKey, JSON.stringify(users));
}

function addConversionTransaction(account, fromAsset, toAsset, fromAmount, toAmount) {
    account.transactions ||= [];
    account.transactions.push({
        id: `tx-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        type: 'conversion',
        direction: 'out',
        fromAsset: fromAsset.symbol,
        toAsset: toAsset.symbol,
        fromAmount: formatAmount(fromAmount),
        toAmount: formatAmount(toAmount),
        description: 'Wallet currency conversion',
        status: 'Completed',
        createdAt: new Date().toISOString()
    });
}

function formatAmount(value) {
    return (Number(value) || 0).toLocaleString('en-US', { maximumFractionDigits: 8 });
}

const account = getAccount() || { cryptoBalances: {} };
if (!getAccount()) window.location.href = 'invest-first__page.html';
const requestedSource = new URLSearchParams(window.location.search).get('from');

const fromSelect = document.getElementById('convertFrom');
const toSelect = document.getElementById('convertTo');
const amountInput = document.getElementById('convertAmount');
const amountUnit = document.getElementById('amountUnit');
const fromBalance = document.getElementById('fromBalance');
const toBalance = document.getElementById('toBalance');
const ratePreview = document.querySelector('#ratePreview strong');
const feedback = document.getElementById('convertFeedback');

function fundedAssets() {
    return assets.filter(({ key }) => Number(account.cryptoBalances?.[key]) > 0);
}

function populateOptions() {
    const funded = fundedAssets();
    fromSelect.innerHTML = funded.length ? funded.map(({ key, label, symbol }) => `<option value="${key}">${label} (${symbol})</option>`).join('') : '<option>No funded currency</option>';
    if (funded.some(({ key }) => key === requestedSource)) fromSelect.value = requestedSource;
    if (!funded.length) {
        toSelect.innerHTML = '<option>No destination available</option>';
        fromSelect.disabled = true;
        toSelect.disabled = true;
    } else {
        updateDestinationOptions();
    }
    renderFundedList(funded);
    updateSourceDisplay();
}

function updateDestinationOptions() {
    const destinations = assets.filter(({ key }) => key !== fromSelect.value);
    toSelect.innerHTML = destinations.length ? destinations.map(({ key, label, symbol }) => {
        const balance = Number(account.cryptoBalances?.[key]) || 0;
        return `<option value="${key}">${label} (${symbol})${balance > 0 ? '' : ' · empty'}</option>`;
    }).join('') : '<option value="">No destination available</option>';
    toSelect.disabled = destinations.length === 0;
    updateDestinationDisplay();
}

function updateSourceDisplay() {
    const source = assets.find(({ key }) => key === fromSelect.value);
    const balance = Number(account.cryptoBalances?.[fromSelect.value]) || 0;
    amountUnit.textContent = source?.symbol || '';
    fromBalance.textContent = source ? `Available: ${formatAmount(balance)} ${source.symbol}` : '';
    amountInput.max = balance || '';
    updateDestinationOptions();
}

function updateDestinationDisplay() {
    const destination = assets.find(({ key }) => key === toSelect.value);
    const balance = Number(account.cryptoBalances?.[toSelect.value]) || 0;
    toBalance.textContent = destination ? `Current balance: ${formatAmount(balance)} ${destination.symbol}` : '';
    updateRatePreview();
}

function renderFundedList(funded) {
    document.getElementById('fundedList').innerHTML = assets.map(({ key, label, symbol }) => `<div class="funded-item"><span>${label}</span><strong>${formatAmount(account.cryptoBalances?.[key])} ${symbol}</strong></div>`).join('');
}

async function getPrices() {
    const source = assets.find(({ key }) => key === fromSelect.value);
    const destination = assets.find(({ key }) => key === toSelect.value);
    if (!source || !destination) return null;
    const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${source.name},${destination.name}&vs_currencies=usd`);
    if (!response.ok) throw new Error('Rates unavailable');
    const data = await response.json();
    return { source, destination, sourcePrice: Number(data[source.name]?.usd), destinationPrice: Number(data[destination.name]?.usd) };
}

async function updateRatePreview() {
    const amount = Number(amountInput.value);
    if (!amount || !toSelect.value) {
        ratePreview.textContent = 'Enter an amount to preview';
        return;
    }
    try {
        const prices = await getPrices();
        if (!prices?.sourcePrice || !prices.destinationPrice) throw new Error();
        const result = (amount * prices.sourcePrice) / prices.destinationPrice;
        ratePreview.textContent = `${formatAmount(result)} ${prices.destination.symbol} estimated`;
    } catch {
        ratePreview.textContent = 'Rate preview unavailable';
    }
}

fromSelect.addEventListener('change', updateSourceDisplay);
toSelect.addEventListener('change', updateDestinationDisplay);
amountInput.addEventListener('input', updateRatePreview);
document.getElementById('maxAmount').addEventListener('click', () => { amountInput.value = amountInput.max; updateRatePreview(); });
document.getElementById('swapCurrencies').addEventListener('click', () => {
    const source = fromSelect.value;
    const destination = toSelect.value;
    if (!destination) return;
    fromSelect.value = destination;
    updateSourceDisplay();
    if ([...toSelect.options].some((option) => option.value === source)) toSelect.value = source;
    updateDestinationDisplay();
});

document.getElementById('convertForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const fromKey = fromSelect.value;
    const toKey = toSelect.value;
    const amount = Number(amountInput.value);
    const available = Number(account.cryptoBalances?.[fromKey]) || 0;
    if (!toKey || fromKey === toKey || !Number.isFinite(amount) || amount <= 0 || amount > available) {
        feedback.textContent = 'Choose two funded currencies and enter an amount within your available balance.';
        return;
    }
    feedback.textContent = 'Getting the latest rate...';
    try {
        const prices = await getPrices();
        if (!prices?.sourcePrice || !prices.destinationPrice) throw new Error();
        const converted = (amount * prices.sourcePrice) / prices.destinationPrice;
        account.cryptoBalances[fromKey] = available - amount;
        account.cryptoBalances[toKey] = (Number(account.cryptoBalances[toKey]) || 0) + converted;
        addConversionTransaction(account, prices.source, prices.destination, amount, converted);
        saveAccount(account);
        feedback.textContent = `Converted ${formatAmount(amount)} ${prices.source.symbol} into ${formatAmount(converted)} ${prices.destination.symbol}.`;
        amountInput.value = '';
        populateOptions();
    } catch {
        feedback.textContent = 'Conversion is unavailable right now. Please try again when market rates are available.';
    }
});

populateOptions();
