// Pong - Classic arcade

function initPongGame(container) {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 400;
    canvas.style.cssText = 'background:#000;display:block;margin:0 auto;border-radius:8px;';
    container.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    
    // Game state
    let paddle1 = { x: 10, y: 150, width: 10, height: 80, speed: 5 };
    let paddle2 = { x: 580, y: 150, width: 10, height: 80, speed: 4 };
    let ball = { x: 300, y: 200, radius: 8, dx: 5, dy: 3 };
    let score1 = 0, score2 = 0;
    let gameOver = false;
    let gameLoop;
    
    // Controls
    let upPressed = false, downPressed = false;
    
    document.addEventListener('keydown', (e) => {
        if (e.code === 'ArrowUp') upPressed = true;
        if (e.code === 'ArrowDown') downPressed = true;
        if (e.code === 'KeyW') upPressed = true;
        if (e.code === 'KeyS') downPressed = true;
    });
    
    document.addEventListener('keyup', (e) => {
        if (e.code === 'ArrowUp') upPressed = false;
        if (e.code === 'ArrowDown') downPressed = false;
        if (e.code === 'KeyW') upPressed = false;
        if (e.code === 'KeyS') downPressed = false;
    });
    
    // Touch controls
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        const y = touch.clientY - rect.top;
        paddle1.y = y - paddle1.height / 2;
    });
    
    function update() {
        if (gameOver) return;
        
        // Paddle 1 (player)
        if (upPressed && paddle1.y > 0) paddle1.y -= paddle1.speed;
        if (downPressed && paddle1.y < canvas.height - paddle1.height) paddle1.y += paddle1.speed;
        
        // AI Paddle 2
        const targetY = ball.y - paddle2.height / 2;
        if (paddle2.y < targetY) paddle2.y += paddle2.speed;
        if (paddle2.y > targetY) paddle2.y -= paddle2.speed;
        paddle2.y = Math.max(0, Math.min(canvas.height - paddle2.height, paddle2.y));
        
        // Ball movement
        ball.x += ball.dx;
        ball.y += ball.dy;
        
        // Wall collision
        if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
            ball.dy = -ball.dy;
        }
        
        // Paddle collision
        if (ball.dx < 0 && ball.x - ball.radius < paddle1.x + paddle1.width &&
            ball.y > paddle1.y && ball.y < paddle1.y + paddle1.height) {
            ball.dx = -ball.dx * 1.05;
        }
        if (ball.dx > 0 && ball.x + ball.radius > paddle2.x &&
            ball.y > paddle2.y && ball.y < paddle2.y + paddle2.height) {
            ball.dx = -ball.dx * 1.05;
        }
        
        // Score
        if (ball.x < 0) {
            score2++;
            resetBall();
        }
        if (ball.x > canvas.width) {
            score1++;
            if (score1 >= 5) endGame();
            resetBall();
        }
        
        // Clamp ball speed
        ball.dx = Math.max(-15, Math.min(15, ball.dx));
    }
    
    function resetBall() {
        ball.x = 300;
        ball.y = 200;
        ball.dx = (Math.random() > 0.5 ? 1 : -1) * 5;
        ball.dy = (Math.random() - 0.5) * 6;
    }
    
    function draw() {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Center line
        ctx.strokeStyle = '#333';
        ctx.setLineDash([10, 10]);
        ctx.beginPath();
        ctx.moveTo(canvas.width/2, 0);
        ctx.lineTo(canvas.width/2, canvas.height);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Paddles
        ctx.fillStyle = '#fff';
        ctx.fillRect(paddle1.x, paddle1.y, paddle1.width, paddle1.height);
        ctx.fillRect(paddle2.x, paddle2.y, paddle2.width, paddle2.height);
        
        // Ball
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Score
        ctx.font = 'bold 40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(score1, canvas.width/4, 50);
        ctx.fillText(score2, canvas.width*3/4, 50);
        
        if (gameOver) {
            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#0f0';
            ctx.font = 'bold 30px Arial';
            ctx.fillText('You Win!', canvas.width/2, canvas.height/2 - 30);
            ctx.font = '20px Arial';
            ctx.fillText('Click to restart', canvas.width/2, canvas.height/2 + 20);
        }
    }
    
    function endGame() {
        gameOver = true;
        if (typeof addCoins === 'function') addCoins(50);
    }
    
    function gameStep() {
        update();
        draw();
        if (!gameOver || score1 < 10) {
            gameLoop = requestAnimationFrame(gameStep);
        }
    }
    
    canvas.addEventListener('click', () => {
        if (gameOver) {
            score1 = score2 = 0;
            gameOver = false;
            gameStep();
        }
    });
    
    gameStep();
}
