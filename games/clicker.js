// Coin Clicker - Idle/Clicker game

function initClickerGame(container) {
    container.style.cssText = 'background: linear-gradient(135deg, #1a1a2e, #16213e); padding: 20px; text-align: center;';
    
    // Game state
    let coins = 0;
    let perClick = 1;
    let perSecond = 0;
    let totalClicks = 0;
    let startTime = Date.now();
    
    // Upgrades
    const upgrades = [
        { id: 'auto', name: 'Auto Clicker', cost: 50, perSecond: 1, icon: '🤖' },
        { id: 'farm', name: 'Coin Farm', cost: 200, perSecond: 5, icon: '🚜' },
        { id: 'mine', name: 'Coin Mine', cost: 1000, perSecond: 25, icon: '⛏️' },
        { id: 'factory', name: 'Coin Factory', cost: 5000, perSecond: 100, icon: '🏭' },
        { id: 'bank', name: 'Coin Bank', cost: 25000, perSecond: 500, icon: '🏦' },
    ];
    
    let owned = { auto: 0, farm: 0, mine: 0, factory: 0, bank: 0 };
    
    // UI Elements
    container.innerHTML = `
        <div style="max-width: 500px; margin: 0 auto;">
            <h2 style="color: #f59e0b; margin-bottom: 10px;">Coin Clicker</h2>
            <div style="font-size: 3rem; margin: 20px 0; color: #fff;">
                🪙 <span id="clicker-coins">0</span>
            </div>
            <div style="color: #aaa; margin-bottom: 20px;">
                <span id="clicker-perclick">1</span> per click | <span id="clicker-persec">0</span>/sec
            </div>
            
            <button id="clicker-btn" style="
                font-size: 5rem; 
                padding: 40px; 
                border-radius: 50%;
                border: none;
                cursor: pointer;
                background: linear-gradient(135deg, #6366f1, #4f46e5);
                transition: transform 0.1s;
                user-select: none;
            ">🪙</button>
            
            <div style="margin-top: 30px; text-align: left;">
                <h3 style="color: #6366f1; margin-bottom: 10px;">Upgrades</h3>
                <div id="upgrades-list"></div>
            </div>
            
            <div style="margin-top: 20px; color: #666; font-size: 0.9rem;">
                <div>Clicks: <span id="total-clicks">0</span></div>
                <div>Time played: <span id="time-played">0:00</span></div>
            </div>
        </div>
    `;
    
    const coinDisplay = container.querySelector('#clicker-coins');
    const perClickDisplay = container.querySelector('#clicker-perclick');
    const perSecDisplay = container.querySelector('#clicker-persec');
    const totalClicksDisplay = container.querySelector('#total-clicks');
    const timeDisplay = container.querySelector('#time-played');
    const clickBtn = container.querySelector('#clicker-btn');
    const upgradesList = container.querySelector('#upgrades-list');
    
    // Render upgrades
    function renderUpgrades() {
        upgradesList.innerHTML = upgrades.map(u => `
            <button onclick="buyUpgrade('${u.id}')" 
                style="width: 100%; margin: 5px 0; padding: 15px; 
                background: ${coins >= getCost(u) ? 'rgba(99, 102, 241, 0.2)' : 'rgba(100,100,100,0.2)'};
                border: 1px solid ${coins >= getCost(u) ? '#6366f1' : '#333'};
                border-radius: 8px; color: white; cursor: pointer;
                display: flex; justify-content: space-between; align-items: center;">
                <span>${u.icon} ${u.name} (${owned[u.id]})</span>
                <span style="color: #f59e0b;">🪙 ${formatNumber(getCost(u))}</span>
            </button>
        `).join('');
    }
    
    function getCost(upgrade) {
        return Math.floor(upgrade.cost * Math.pow(1.15, owned[upgrade.id]));
    }
    
    function formatNumber(n) {
        if (n >= 1e9) return (n/1e9).toFixed(1) + 'B';
        if (n >= 1e6) return (n/1e6).toFixed(1) + 'M';
        if (n >= 1e3) return (n/1e3).toFixed(1) + 'K';
        return n.toFixed(0);
    }
    
    function update() {
        coinDisplay.textContent = formatNumber(coins);
        perClickDisplay.textContent = formatNumber(perClick);
        perSecDisplay.textContent = formatNumber(perSecond);
        totalClicksDisplay.textContent = totalClicks;
        
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const mins = Math.floor(elapsed / 60);
        const secs = elapsed % 60;
        timeDisplay.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
        
        renderUpgrades();
    }
    
    // Click handler
    clickBtn.addEventListener('click', () => {
        coins += perClick;
        totalClicks++;
        clickBtn.style.transform = 'scale(0.95)';
        setTimeout(() => clickBtn.style.transform = 'scale(1)', 100);
        update();
        
        // Visual feedback
        const float = document.createElement('div');
        float.textContent = '+' + formatNumber(perClick);
        float.style.cssText = 'position: fixed; color: #f59e0b; font-weight: bold; pointer-events: none;';
        const rect = clickBtn.getBoundingClientRect();
        float.style.left = (rect.left + rect.width/2) + 'px';
        float.style.top = (rect.top) + 'px';
        document.body.appendChild(float);
        
        float.animate([
            { transform: 'translateY(0)', opacity: 1 },
            { transform: 'translateY(-50px)', opacity: 0 }
        ], { duration: 1000, easing: 'ease-out' }).onfinish = () => float.remove();
    });
    
    // Buy upgrade
    window.buyUpgrade = function(id) {
        const upgrade = upgrades.find(u => u.id === id);
        const cost = getCost(upgrade);
        
        if (coins >= cost) {
            coins -= cost;
            owned[id]++;
            perSecond += upgrade.perSecond;
            update();
            
            if (typeof addCoins === 'function') {
                // Add real GameHub coins based on play time
                addCoins(Math.floor(totalClicks / 10));
            }
        }
    };
    
    // Passive income
    setInterval(() => {
        coins += perSecond;
        update();
    }, 1000);
    
    // Initial render
    update();
    renderUpgrades();
    
    // Pop animation
    setInterval(() => {
        clickBtn.animate([
            { transform: 'scale(1)' },
            { transform: 'scale(1.05)' },
            { transform: 'scale(1)' }
        ], { duration: 500 });
    }, 3000);
}
