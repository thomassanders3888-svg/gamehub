// GameHub - Main Controller

// User data
let userData = {
    coins: 0,
    gamesPlayed: 0,
    totalScore: 0,
    unlockedGames: ['snake', 'tetris', 'memory'],
    highScores: {}
};

// Load data from localStorage
function loadUserData() {
    const saved = localStorage.getItem('gamehub_data');
    if (saved) {
        userData = { ...userData, ...JSON.parse(saved) };
    }
    updateUI();
}

// Save data
function saveUserData() {
    localStorage.setItem('gamehub_data', JSON.stringify(userData));
}

// Update UI
function updateUI() {
    document.getElementById('coin-count').textContent = userData.coins;
    document.getElementById('games-played').textContent = userData.gamesPlayed;
    document.getElementById('total-score').textContent = userData.totalScore;
    
    // Update locked games
    document.querySelectorAll('.game-card.premium').forEach(card => {
        const game = card.dataset.game;
        if (userData.unlockedGames.includes(game)) {
            card.classList.remove('premium');
            const btn = card.querySelector('.btn-play');
            btn.classList.remove('locked');
            btn.textContent = 'Play Now';
            btn.onclick = () => loadGame(game);
        }
    });
}

// Add coins
function addCoins(amount) {
    userData.coins += amount;
    saveUserData();
    updateUI();
    showNotification(`+${amount} coins!`, 'success');
}

// Show notification
function showNotification(message, type = 'info') {
    const notif = document.createElement('div');
    notif.className = `notification ${type}`;
    notif.textContent = message;
    notif.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : '#6366f1'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 3000);
}

// Load game
function loadGame(gameName) {
    const modal = document.getElementById('game-modal');
    const title = document.getElementById('game-title');
    const container = document.getElementById('game-container');
    
    container.innerHTML = '';
    modal.classList.add('active');
    
    userData.gamesPlayed++;
    saveUserData();
    updateUI();
    
    switch(gameName) {
        case 'snake':
            title.textContent = 'Snake Classic';
            initSnakeGame(container);
            break;
        case 'tetris':
            title.textContent = 'Block Drop';
            initTetrisGame(container);
            break;
        case 'memory':
            title.textContent = 'Memory Match';
            initMemoryGame(container);
            break;
        default:
            title.textContent = gameName;
            container.innerHTML = '<p style="color:white;text-align:center;padding:2rem;">Game coming soon!</p>';
    }
}

// Close game
function closeGame() {
    const modal = document.getElementById('game-modal');
    const container = document.getElementById('game-container');
    
    // Stop any running games
    if (window.gameLoop) {
        cancelAnimationFrame(window.gameLoop);
    }
    if (window.gameInterval) {
        clearInterval(window.gameInterval);
    }
    
    container.innerHTML = '';
    modal.classList.remove('active');
}

// Restart game
function restartGame() {
    const title = document.getElementById('game-title').textContent;
    const container = document.getElementById('game-container');
    container.innerHTML = '';
    
    if (title === 'Snake Classic') initSnakeGame(container);
    else if (title === 'Block Drop') initTetrisGame(container);
    else if (title === 'Memory Match') initMemoryGame(container);
}

// Unlock game
function unlockGame(game, cost) {
    if (userData.coins >= cost) {
        userData.coins -= cost;
        userData.unlockedGames.push(game);
        saveUserData();
        updateUI();
        showNotification(`Unlocked! -${cost} coins`, 'success');
        loadGame(game);
    } else {
        showNotification(`Need ${cost - userData.coins} more coins`, 'error');
    }
}

// Payment Modal
let selectedPackage = null;
let stripe = null;
let cardElement = null;

document.getElementById('buy-coins').addEventListener('click', () => {
    document.getElementById('payment-modal').classList.add('active');
    initPayment();
});

function closePayment() {
    document.getElementById('payment-modal').classList.remove('active');
}

function selectPackage(coins, price) {
    selectedPackage = { coins, price };
    document.querySelectorAll('.package').forEach(p => p.classList.remove('selected'));
    event.currentTarget.classList.add('selected');
}

function initPayment() {
    const config = window.PAYMENT_CONFIG || { demoMode: true };
    const notice = document.getElementById('demo-notice');
    const payButton = document.getElementById('pay-button');
    
    if (config.demoMode) {
        // Demo mode - show notice and set up fake payment
        notice.style.display = 'block';
        payButton.textContent = 'Demo Purchase (No Real Charge)';
        payButton.onclick = processDemoPayment;
        document.getElementById('paypal-button-container').style.display = 'none';
        document.getElementById('stripe-card-element').style.display = 'none';
    } else {
        // Production mode - set up real payments
        notice.style.display = 'none';
        payButton.textContent = 'Complete Purchase';
        
        // Initialize Stripe if key provided
        if (config.stripePublicKey && config.stripePublicKey.startsWith('pk_')) {
            initStripe(config.stripePublicKey);
        } else {
            document.getElementById('stripe-card-element').style.display = 'none';
        }
        
        // Initialize PayPal if desired
        if (config.paypalClientId && config.paypalClientId !== 'sb') {
            renderPayPalButtons();
        } else {
            document.getElementById('paypal-button-container').style.display = 'none';
        }
        
        payButton.onclick = processRealPayment;
    }
}

function initStripe(publicKey) {
    try {
        stripe = Stripe(publicKey);
        const elements = stripe.elements();
        cardElement = elements.create('card', { style: { base: { color: '#fff', fontSize: '16px' } } });
        cardElement.mount('#stripe-card-element');
    } catch (e) {
        console.log('Stripe init failed:', e);
        document.getElementById('stripe-card-element').style.display = 'none';
    }
}

function processDemoPayment() {
    const coins = selectedPackage ? selectedPackage.coins : 100;
    addCoins(coins);
    closePayment();
    showNotification(`✓ Demo purchase: +${coins} coins added (no charge)`, 'success');
}

function processRealPayment() {
    // Real payment logic here - would need backend
    showNotification('Production payment processing requires backend setup', 'info');
}

function renderPayPalButtons() {
    const container = document.getElementById('paypal-button-container');
    if (!container) return;
    
    if (typeof paypal !== 'undefined') {
        paypal.Buttons({
            createOrder: function(data, actions) {
                const amount = selectedPackage ? selectedPackage.price : '0.99';
                return actions.order.create({
                    purchase_units: [{ amount: { value: amount } }]
                });
            },
            onApprove: function(data, actions) {
                return actions.order.capture().then(function(details) {
                    const coins = selectedPackage ? selectedPackage.coins : 100;
                    addCoins(coins);
                    closePayment();
                    showNotification(`✓ Payment successful! +${coins} coins`, 'success');
                });
            }
        }).render(container);
    }
}

// Initialize
loadUserData();

// Close modals on outside click
window.onclick = function(e) {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
};
