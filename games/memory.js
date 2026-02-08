// Memory Match Game

function initMemoryGame(container) {
    const gridSize = 4; // 4x4 grid
    const totalCards = gridSize * gridSize;
    const pairs = totalCards / 2;
    
    // Emoji pairs
    const emojis = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔'];
    const gameEmojis = emojis.slice(0, pairs);
    const cards = [...gameEmojis, ...gameEmojis];
    
    // Shuffle
    for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    
    let flipped = [];
    let matched = [];
    let moves = 0;
    let score = 0;
    let gameComplete = false;
    
    // Create grid
    const grid = document.createElement('div');
    grid.style.cssText = `
        display: grid;
        grid-template-columns: repeat(4, 80px);
        gap: 10px;
        justify-content: center;
        padding: 20px;
    `;
    container.appendChild(grid);
    
    // UI
    const ui = document.createElement('div');
    ui.className = 'game-ui';
    ui.innerHTML = `Moves: <span id="memory-moves">0</span> Score: <span id="memory-score">0</span>`;
    container.style.position = 'relative';
    container.appendChild(ui);
    
    // Create cards
    cards.forEach((emoji, index) => {
        const card = document.createElement('div');
        card.dataset.index = index;
        card.dataset.emoji = emoji;
        card.style.cssText = `
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #6366f1, #4f46e5);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 40px;
            cursor: pointer;
            transition: transform 0.3s, background 0.3s;
            user-select: none;
        `;
        
        card.addEventListener('click', () => flipCard(card));
        grid.appendChild(card);
    });
    
    function flipCard(card) {
        if (flipped.length >= 2 || flipped.includes(card) || matched.includes(card)) {
            return;
        }
        
        // Flip animation
        card.style.transform = 'rotateY(180deg)';
        setTimeout(() => {
            card.textContent = card.dataset.emoji;
            card.style.background = '#10b981';
        }, 150);
        
        flipped.push(card);
        
        if (flipped.length === 2) {
            moves++;
            document.getElementById('memory-moves').textContent = moves;
            checkMatch();
        }
    }
    
    function checkMatch() {
        const [card1, card2] = flipped;
        const match = card1.dataset.emoji === card2.dataset.emoji;
        
        if (match) {
            matched.push(card1, card2);
            flipped = [];
            score += 50;
            document.getElementById('memory-score').textContent = score;
            
            // Check win
            if (matched.length === totalCards) {
                setTimeout(endGame, 500);
            }
        } else {
            setTimeout(() => {
                flipped.forEach(card => {
                    card.style.transform = 'rotateY(0deg)';
                    setTimeout(() => {
                        card.textContent = '';
                        card.style.background = 'linear-gradient(135deg, #6366f1, #4f46e5)';
                    }, 150);
                });
                flipped = [];
            }, 1000);
        }
    }
    
    function endGame() {
        gameComplete = true;
        
        // Calculate coins based on moves (fewer moves = more coins)
        const baseCoins = 15;
        const bonus = Math.max(0, 20 - moves);
        const coins = baseCoins + bonus;
        
        if (typeof addCoins === 'function') {
            addCoins(coins);
        }
        
        // Save high score (lowest moves)
        const currentBest = userData.highScores.memory || 999;
        if (moves < currentBest) {
            userData.highScores.memory = moves;
            saveUserData();
        }
        
        // Show completion
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0,0,0,0.9);
            padding: 2rem;
            border-radius: 16px;
            text-align: center;
            color: white;
        `;
        overlay.innerHTML = `
            <h2>🎉 Complete!</h2>
            <p>Moves: ${moves}</p>
            <p>Score: ${score}</p>
            <p>+${coins} coins!</p>
            <button onclick="this.parentElement.remove()" style="
                margin-top: 1rem;
                padding: 0.75rem 1.5rem;
                background: #6366f1;
                border: none;
                border-radius: 8px;
                color: white;
                cursor: pointer;
            ">Play Again</button>
        `;
        container.appendChild(overlay);
    }
}
