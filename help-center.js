const supportStorageKey = 'investSupportConversations';
const supportMessages = document.getElementById('supportMessages');
const supportForm = document.getElementById('supportForm');
const supportInput = document.getElementById('supportInput');
const supportFeedback = document.getElementById('supportFeedback');

function getSupportUserKey() {
    try {
        const currentUser = JSON.parse(localStorage.getItem('investCurrentUser') || 'null');
        return currentUser?.email || 'guest';
    } catch {
        return 'guest';
    }
}

function readConversations() {
    try {
        const conversations = JSON.parse(localStorage.getItem(supportStorageKey) || '{}');
        return conversations && typeof conversations === 'object' ? conversations : {};
    } catch {
        return {};
    }
}

function saveConversation(messages) {
    const conversations = readConversations();
    conversations[getSupportUserKey()] = messages;
    localStorage.setItem(supportStorageKey, JSON.stringify(conversations));
}

let conversation = readConversations()[getSupportUserKey()] || [{
    sender: 'support',
    text: 'Welcome to Invest support. How can we help you today?',
    createdAt: new Date().toISOString()
}];

function renderMessages() {
    supportMessages.replaceChildren();
    conversation.forEach((message) => {
        const article = document.createElement('article');
        article.className = `support-message support-message--${message.sender === 'user' ? 'user' : 'support'}`;
        const bubble = document.createElement('div');
        bubble.className = 'support-message__bubble';
        bubble.textContent = message.text;
        const meta = document.createElement('small');
        meta.className = 'support-message__meta';
        meta.textContent = `${message.sender === 'user' ? 'You' : 'Invest support'} • ${new Date(message.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
        article.append(bubble, meta);
        supportMessages.appendChild(article);
    });
    supportMessages.scrollTop = supportMessages.scrollHeight;
}

function createSupportReply(text) {
    const normalized = text.toLowerCase();
    if (normalized.includes('deposit') || normalized.includes('fund')) return 'You can submit a deposit request from the Wallet page. Our team will review it and update your account after approval.';
    if (normalized.includes('password') || normalized.includes('security') || normalized.includes('login')) return 'Open Settings to change your password, update security options, and manage your account preferences.';
    if (normalized.includes('balance') || normalized.includes('crypto') || normalized.includes('bitcoin') || normalized.includes('ethereum')) return 'Your crypto quantities are managed from the account ledger and their dollar values follow live market prices on the Wallet page.';
    if (normalized.includes('transaction') || normalized.includes('send')) return 'Please share the transaction type and approximate time. We will review the request and follow up here.';
    return 'Thanks for contacting Invest support. Your message is in our queue and a customer-service representative will follow up shortly.';
}

function sendSupportMessage(text) {
    const cleanText = text.trim();
    if (!cleanText) return;
    conversation.push({ sender: 'user', text: cleanText, createdAt: new Date().toISOString() });
    saveConversation(conversation);
    renderMessages();
    supportFeedback.textContent = 'Support is reviewing your message...';
    window.setTimeout(() => {
        conversation.push({ sender: 'support', text: createSupportReply(cleanText), createdAt: new Date().toISOString() });
        saveConversation(conversation);
        renderMessages();
        supportFeedback.textContent = 'Support replied just now.';
    }, 700);
}

supportForm.addEventListener('submit', (event) => {
    event.preventDefault();
    sendSupportMessage(supportInput.value);
    supportInput.value = '';
    supportInput.focus();
});

document.querySelectorAll('[data-support-topic]').forEach((button) => {
    button.addEventListener('click', () => {
        supportInput.value = button.dataset.supportTopic;
        supportInput.focus();
    });
});

renderMessages();