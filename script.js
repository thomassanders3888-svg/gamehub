// GameHub - Main Controller

// User data
let userData = {
    coins: 0,
    gamesPlayed: 0,
    totalScore: 0,
    unlockedGames: ['snake', 'tetris', 'memory'],
    highScores: {}
};

let selectedPackage = null;
let paypalButtonsRendered = false;

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
    
    if (window.gameLoop) cancelAnimationFrame(window.gameLoop);
    if (window.gameInterval) clearInterval(window.gameInterval);
    
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
document.getElementById('buy-coins').addEventListener('click', () => {
    document.getElementById('payment-modal').classList.add('active');
    renderPayPalButtons();
});

function closePayment() {
    document.getElementById('payment-modal').classList.remove('active');
}

function selectPackage(coins, price) {
    selectedPackage = { coins, price };
    document.querySelectorAll('.package').forEach(p => p.classList.remove('selected'));
    event.currentTarget.classList.add('selected');
    
    // Re-render PayPal buttons with new amount
    renderPayPalButtons();
}

function renderPayPalButtons() {
    const container = document.getElementById('paypal-button-container');
    if (!container || typeof paypal === 'undefined') {
        console.error('PayPal SDK not loaded');
        return;
    }
    
    // Clear existing buttons
    container.innerHTML = '';
    
    // Render new PayPal buttons
    paypal.Buttons({
        style: {
            layout: 'vertical',
            color: 'gold',
            shape: 'rect',
            label: 'paypal'
        },
        createOrder: function(data, actions) {
            const amount = selectedPackage ? selectedPackage.price.toFixed(2) : '0.99';
            return actions.order.create({
                purchase_units: [{
                    amount: {
                        currency_code: 'USD',
                        value: amount
                    },
                    description: `${selectedPackage?.coins || 100} GameHub Coins`
                }]
            });
        },
        onApprove: function(data, actions) {
            return actions.order.capture().then(function(details) {
                const coins = selectedPackage ? selectedPackage.coins : 100;
                addCoins(coins);
                closePayment();
                showNotification(`✓ Payment successful! +${coins} coins`, 'success');
                
                // Log for debugging
                console.log('Payment completed:', details);
            });
        },
        onError: function(err) {
            console.error('PayPal error:', err);
            showNotification('Payment failed. Please try again.', 'error');
        },
        onCancel: function() {
            console.log('Payment cancelled by user');
        }
    }).render(container);
    
    paypalButtonsRendered = true;
}

// Initialize
loadUserData();

// Close modals on outside click
window.onclick = function(e) {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
};
