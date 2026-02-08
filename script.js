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

// PayPal Modal
let selectedPackage = null;

document.getElementById('buy-coins').addEventListener('click', () => {
    document.getElementById('paypal-modal').classList.add('active');
    renderPayPalButtons();
});

function closePayPal() {
    document.getElementById('paypal-modal').classList.remove('active');
}

function selectPackage(coins, price) {
    selectedPackage = { coins, price };
    document.querySelectorAll('.package').forEach(p => p.classList.remove('selected'));
    event.currentTarget.classList.add('selected');
}

function renderPayPalButtons() {
    const container = document.getElementById('paypal-button-container');
    container.innerHTML = '';
    
    // Check PayPal sandbox mode
    if (typeof paypal !== 'undefined') {
        paypal.Buttons({
            createOrder: function(data, actions) {
                const amount = selectedPackage ? selectedPackage.price : '0.99';
                return actions.order.create({
                    purchase_units: [{
                        amount: { value: amount }
                    }]
                });
            },
            onApprove: function(data, actions) {
                return actions.order.capture().then(function(details) {
                    const coins = selectedPackage ? selectedPackage.coins : 100;
                    addCoins(coins);
                    closePayPal();
                    showNotification(`Payment successful! +${coins} coins`, 'success');
                });
            },
            onError: function(err) {
                // Sandbox/demo mode - add coins anyway for testing
                const coins = selectedPackage ? selectedPackage.coins : 100;
                addCoins(coins);
                closePayPal();
                showNotification(`Demo mode: +${coins} coins added`, 'info');
            }
        }).render(container);
    } else {
        // Fallback for no PayPal SDK
        container.innerHTML = '<button onclick="demoPurchase()">Demo Purchase (Add 100 Coins)</button>';
    }
}

function demoPurchase() {
    addCoins(100);
    closePayPal();
}

// Initialize
loadUserData();

// Close modals on outside click
window.onclick = function(e) {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
};
