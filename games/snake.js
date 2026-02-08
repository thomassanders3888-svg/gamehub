// Snake Game - Classic Arcade

function initSnakeGame(container) {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    canvas.style.cssText = 'background:#000;display:block;margin:0 auto;';
    container.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    const gridSize = 20;
    const tileCount = canvas.width / gridSize;
    
    // Game state
    let snake = [{ x: 10, y: 10 }];
    let food = { x: 15, y: 15 };
    let dx = 0;
    let dy = 0;
    let score = 0;
    let gameOver = false;
    let speed = 100;
    
    // UI overlay
    const ui = document.createElement('div');
    ui.className = 'game-ui';
    ui.innerHTML = `Score: <span id="snake-score">0</span>`;
    container.style.position = 'relative';
    container.appendChild(ui);
    
    // Input handling
    document.addEventListener('keydown', changeDirection);
    
    // Touch controls for mobile
    let touchStartX = 0;
    let touchStartY = 0;
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);
    
    function handleTouchStart(e) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }
    
    function handleTouchMove(e) {
        e.preventDefault();
        const touchX = e.touches[0].clientX;
        const touchY = e.touches[0].clientY;
        const dx = touchX - touchStartX;
        const dy = touchY - touchStartY;
        
        if (Math.abs(dx) > Math.abs(dy)) {
            if (dx > 0 && snake[0].dx !== -1) { dx = 1; dy = 0; }
            else if (dx < 0 && snake[0].dx !== 1) { dx = -1; dy = 0; }
        } else {
            if (dy > 0 && snake[0].dy !== -1) { dx = 0; dy = 1; }
            else if (dy < 0 && snake[0].dy !== 1) { dx = 0; dy = -1; }
        }
        
        touchStartX = touchX;
        touchStartY = touchY;
    }
    
    function changeDirection(e) {
        const goingUp = dy === -1;
        const goingDown = dy === 1;
        const goingRight = dx === 1;
        const goingLeft = dx === -1;
        
        if (e.keyCode === 37 && !goingRight) { dx = -1; dy = 0; }
        else if (e.keyCode === 38 && !goingDown) { dx = 0; dy = -1; }
        else if (e.keyCode === 39 && !goingLeft) { dx = 1; dy = 0; }
        else if (e.keyCode === 40 && !goingUp) { dx = 0; dy = 1; }
    }
    
    function drawGame() {
        // Clear canvas
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        if (gameOver) {
            ctx.fillStyle = 'white';
            ctx.font = '30px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Game Over!', canvas.width/2, canvas.height/2 - 30);
            ctx.font = '20px Arial';
            ctx.fillText(`Score: ${score}`, canvas.width/2, canvas.height/2 + 10);
            ctx.fillText('Press Restart to play again', canvas.width/2, canvas.height/2 + 40);
            return;
        }
        
        // Move snake
        const head = { x: snake[0].x + dx, y: snake[0].y + dy };
        
        // Wrap around edges
        if (head.x < 0) head.x = tileCount - 1;
        if (head.x >= tileCount) head.x = 0;
        if (head.y < 0) head.y = tileCount - 1;
        if (head.y >= tileCount) head.y = 0;
        
        snake.unshift(head);
        
        // Check food collision
        if (head.x === food.x && head.y === food.y) {
            score += 10;
            document.getElementById('snake-score').textContent = score;
            placeFood();
            // Speed up slightly
            if (speed > 50) speed -= 2;
        } else {
            snake.pop();
        }
        
        // Check self collision
        for (let i = 1; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) {
                endGame();
                return;
            }
        }
        
        // Draw food
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);
        
        // Draw snake
        snake.forEach((segment, i) => {
            ctx.fillStyle = i === 0 ? '#10b981' : '#059669';
            ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
            
            // Snake eyes
            if (i === 0) {
                ctx.fillStyle = 'white';
                ctx.fillRect(segment.x * gridSize + 4, segment.y * gridSize + 4, 4, 4);
                ctx.fillRect(segment.x * gridSize + 12, segment.y * gridSize + 4, 4, 4);
            }
        });
    }
    
    function placeFood() {
        food = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
        
        // Make sure food not on snake
        for (let segment of snake) {
            if (segment.x === food.x && segment.y === food.y) {
                placeFood();
                break;
            }
        }
    }
    
    function endGame() {
        gameOver = true;
        clearInterval(window.gameInterval);
        
        // Award coins based on score
        const coins = Math.floor(score / 50) * 10;
        if (coins > 0 && typeof addCoins === 'function') {
            addCoins(coins);
        }
        
        // Save high score
        const currentHigh = userData.highScores.snake || 0;
        if (score > currentHigh) {
            userData.highScores.snake = score;
            saveUserData();
        }
    }
    
    // Start game loop
    window.gameInterval = setInterval(drawGame, speed);
    
    // Initial draw
    drawGame();
    
    // Start moving
    dx = 1;
    dy = 0;
}
