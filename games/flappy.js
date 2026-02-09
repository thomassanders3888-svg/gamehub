// Flappy Bird-style game

function initFlappyGame(container) {
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 480;
    canvas.style.cssText = 'background: linear-gradient(#87CEEB, #E0F6FF); display:block; margin:0 auto; border-radius:8px;';
    container.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    
    // Game state
    let bird = { x: 50, y: 200, width: 30, height: 30, velocity: 0, gravity: 0.5, jump: -8 };
    let pipes = [];
    let score = 0;
    let gameOver = false;
    let frame = 0;
    let gameLoop;
    
    // UI
    const ui = document.createElement('div');
    ui.className = 'game-ui';
    ui.innerHTML = 'Score: <span id="flappy-score">0</span>';
    container.appendChild(ui);
    
    // Input
    function jump() {
        if (gameOver) {
            reset();
            return;
        }
        bird.velocity = bird.jump;
    }
    
    document.addEventListener('keydown', (e) => { if (e.code === 'Space') jump(); });
    canvas.addEventListener('click', jump);
    canvas.addEventListener('touchstart', (e) => { e.preventDefault(); jump(); });
    
    function createPipe() {
        const gap = 120;
        const minHeight = 50;
        const maxHeight = canvas.height - gap - minHeight;
        const topHeight = Math.floor(Math.random() * (maxHeight - minHeight) + minHeight);
        
        pipes.push({
            x: canvas.width,
            topHeight: topHeight,
            bottomY: topHeight + gap,
            width: 50,
            passed: false
        });
    }
    
    function reset() {
        bird.y = 200;
        bird.velocity = 0;
        pipes = [];
        score = 0;
        gameOver = false;
        document.getElementById('flappy-score').textContent = 0;
    }
    
    function update() {
        if (gameOver) return;
        
        frame++;
        
        // Bird physics
        bird.velocity += bird.gravity;
        bird.y += bird.velocity;
        
        // Floor/ceiling collision
        if (bird.y + bird.height > canvas.height) {
            bird.y = canvas.height - bird.height;
            endGame();
        }
        if (bird.y < 0) {
            bird.y = 0;
            bird.velocity = 0;
        }
        
        // Spawn pipes
        if (frame % 90 === 0) createPipe();
        
        // Update pipes
        pipes.forEach(pipe => {
            pipe.x -= 2;
            
            // Score
            if (!pipe.passed && bird.x > pipe.x + pipe.width) {
                score++;
                pipe.passed = true;
                document.getElementById('flappy-score').textContent = score;
            }
            
            // Collision
            if (bird.x + bird.width > pipe.x && bird.x < pipe.x + pipe.width) {
                if (bird.y < pipe.topHeight || bird.y + bird.height > pipe.bottomY) {
                    endGame();
                }
            }
        });
        
        // Remove off-screen pipes
        pipes = pipes.filter(p => p.x + p.width > -10);
    }
    
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw bird (emoji)
        ctx.font = '30px Arial';
        ctx.fillText('🐦', bird.x - 5, bird.y + 25);
        
        // Draw pipes
        ctx.fillStyle = '#228B22';
        pipes.forEach(pipe => {
            // Top pipe
            ctx.fillRect(pipe.x, 0, pipe.width, pipe.topHeight);
            // Bottom pipe
            ctx.fillRect(pipe.x, pipe.bottomY, pipe.width, canvas.height - pipe.bottomY);
            // Cap
            ctx.fillRect(pipe.x - 2, pipe.topHeight - 10, pipe.width + 4, 10);
            ctx.fillRect(pipe.x - 2, pipe.bottomY, pipe.width + 4, 10);
        });
        
        if (gameOver) {
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'white';
            ctx.font = 'bold 30px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Game Over!', canvas.width/2, canvas.height/2 - 40);
            ctx.font = '20px Arial';
            ctx.fillText(`Score: ${score}`, canvas.width/2, canvas.height/2 + 10);
            ctx.fillText('Tap to restart', canvas.width/2, canvas.height/2 + 50);
        }
    }
    
    function endGame() {
        gameOver = true;
        cancelAnimationFrame(gameLoop);
        
        const coins = Math.floor(score / 5) * 25;
        if (coins > 0 && typeof addCoins === 'function') {
            addCoins(coins);
        }
    }
    
    function gameStep() {
        update();
        draw();
        if (!gameOver) {
            gameLoop = requestAnimationFrame(gameStep);
        }
    }
    
    // Start
    createPipe();
    gameStep();
}
