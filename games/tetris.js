// Block Drop (Tetris-like)

function initTetrisGame(container) {
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 600;
    canvas.style.cssText = 'background:#1a1a2e;display:block;margin:0 auto;';
    container.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    const COLS = 10;
    const ROWS = 20;
    const BLOCK_SIZE = 30;
    
    // Tetromino shapes
    const SHAPES = [
        [[1,1,1,1]], // I
        [[1,1],[1,1]], // O
        [[1,1,1],[0,1,0]], // T
        [[1,1,1],[1,0,0]], // L
        [[1,1,1],[0,0,1]], // J
        [[0,1,1],[1,1,0]], // S
        [[1,1,0],[0,1,1]] // Z
    ];
    
    const COLORS = ['#00f0f0', '#f0f000', '#a000f0', '#f0a000', '#0000f0', '#00f000', '#f00000'];
    
    let board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
    let currentPiece = null;
    let currentX = 0;
    let currentY = 0;
    let currentColor = 0;
    let score = 0;
    let lines = 0;
    let gameOver = false;
    let dropCounter = 0;
    let dropInterval = 1000;
    let lastTime = 0;
    
    // UI
    const ui = document.createElement('div');
    ui.className = 'game-ui';
    ui.innerHTML = `Score: <span id="tetris-score">0</span> Lines: <span id="tetris-lines">0</span>`;
    container.style.position = 'relative';
    container.appendChild(ui);
    
    // Input
    document.addEventListener('keydown', handleInput);
    
    function handleInput(e) {
        if (gameOver) return;
        
        if (e.keyCode === 37) movePiece(-1, 0);
        else if (e.keyCode === 39) movePiece(1, 0);
        else if (e.keyCode === 40) movePiece(0, 1);
        else if (e.keyCode === 38) rotatePiece();
        else if (e.keyCode === 32) hardDrop();
    }
    
    function createPiece() {
        const type = Math.floor(Math.random() * SHAPES.length);
        currentPiece = SHAPES[type];
        currentColor = type + 1;
        currentX = Math.floor((COLS - currentPiece[0].length) / 2);
        currentY = 0;
        
        if (!isValidMove(currentX, currentY)) {
            gameOver = true;
            endGame();
        }
    }
    
    function isValidMove(x, y, piece = currentPiece) {
        for (let row = 0; row < piece.length; row++) {
            for (let col = 0; col < piece[row].length; col++) {
                if (piece[row][col]) {
                    const newX = x + col;
                    const newY = y + row;
                    
                    if (newX < 0 || newX >= COLS || newY >= ROWS) return false;
                    if (newY >= 0 && board[newY][newX]) return false;
                }
            }
        }
        return true;
    }
    
    function movePiece(dx, dy) {
        if (isValidMove(currentX + dx, currentY + dy)) {
            currentX += dx;
            currentY += dy;
            return true;
        } else if (dy > 0) {
            placePiece();
            return false;
        }
        return false;
    }
    
    function rotatePiece() {
        const rotated = currentPiece[0].map((_, i) =>
            currentPiece.map(row => row[i]).reverse()
        );
        
        if (isValidMove(currentX, currentY, rotated)) {
            currentPiece = rotated;
        }
    }
    
    function hardDrop() {
        while (movePiece(0, 1)) {}
    }
    
    function placePiece() {
        for (let row = 0; row < currentPiece.length; row++) {
            for (let col = 0; col < currentPiece[row].length; col++) {
                if (currentPiece[row][col]) {
                    board[currentY + row][currentX + col] = currentColor;
                }
            }
        }
        
        clearLines();
        createPiece();
    }
    
    function clearLines() {
        let linesCleared = 0;
        
        for (let row = ROWS - 1; row >= 0; row--) {
            if (board[row].every(cell => cell !== 0)) {
                board.splice(row, 1);
                board.unshift(Array(COLS).fill(0));
                linesCleared++;
                row++;
            }
        }
        
        if (linesCleared > 0) {
            lines += linesCleared;
            score += linesCleared * 100 * linesCleared;
            document.getElementById('tetris-score').textContent = score;
            document.getElementById('tetris-lines').textContent = lines;
            
            // Speed up
            dropInterval = Math.max(100, 1000 - lines * 20);
        }
    }
    
    function draw() {
        // Clear
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw board
        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                if (board[row][col]) {
                    ctx.fillStyle = COLORS[board[row][col] - 1];
                    ctx.fillRect(col * BLOCK_SIZE, row * BLOCK_SIZE, BLOCK_SIZE - 2, BLOCK_SIZE - 2);
                }
            }
        }
        
        // Draw current piece
        if (currentPiece) {
            ctx.fillStyle = COLORS[currentColor - 1];
            for (let row = 0; row < currentPiece.length; row++) {
                for (let col = 0; col < currentPiece[row].length; col++) {
                    if (currentPiece[row][col]) {
                        ctx.fillRect(
                            (currentX + col) * BLOCK_SIZE,
                            (currentY + row) * BLOCK_SIZE,
                            BLOCK_SIZE - 2,
                            BLOCK_SIZE - 2
                        );
                    }
                }
            }
        }
        
        // Draw grid
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        for (let i = 0; i <= COLS; i++) {
            ctx.beginPath();
            ctx.moveTo(i * BLOCK_SIZE, 0);
            ctx.lineTo(i * BLOCK_SIZE, canvas.height);
            ctx.stroke();
        }
        for (let i = 0; i <= ROWS; i++) {
            ctx.beginPath();
            ctx.moveTo(0, i * BLOCK_SIZE);
            ctx.lineTo(canvas.width, i * BLOCK_SIZE);
            ctx.stroke();
        }
    }
    
    function gameLoop(time) {
        if (gameOver) return;
        
        const deltaTime = time - lastTime;
        lastTime = time;
        
        dropCounter += deltaTime;
        if (dropCounter > dropInterval) {
            movePiece(0, 1);
            dropCounter = 0;
        }
        
        draw();
        window.gameLoop = requestAnimationFrame(gameLoop);
    }
    
    function endGame() {
        const coins = Math.floor(score / 200) * 20;
        if (coins > 0 && typeof addCoins === 'function') {
            addCoins(coins);
        }
        
        const currentHigh = userData.highScores.tetris || 0;
        if (score > currentHigh) {
            userData.highScores.tetris = score;
            saveUserData();
        }
        
        ctx.fillStyle = 'rgba(0,0,0,0.8)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over', canvas.width/2, canvas.height/2 - 30);
        ctx.font = '20px Arial';
        ctx.fillText(`Score: ${score}`, canvas.width/2, canvas.height/2 + 10);
        ctx.fillText(`+${coins} coins`, canvas.width/2, canvas.height/2 + 40);
    }
    
    createPiece();
    window.gameLoop = requestAnimationFrame(gameLoop);
}
