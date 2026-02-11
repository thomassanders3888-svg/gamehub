// Brick Breaker Game - Classic Arcade
function initBreakoutGame(container) {
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 400;
  canvas.style.cssText = 'background:#000;display:block;margin:0 auto;';
  container.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  // Game constants
  const PADDLE_WIDTH = 80;
  const PADDLE_HEIGHT = 10;
  const BALL_SIZE = 8;
  const BRICK_WIDTH = 60;
  const BRICK_HEIGHT = 20;
  const BRICK_ROWS = 4;
  const BRICK_COLS = 6;
  const BRICK_PADDING = 10;
  const BRICK_OFFSET_TOP = 40;
  const BRICK_OFFSET_LEFT = 35;

  // Game state
  let score = 0;
  let lives = 3;
  let gameOver = false;
  let gameWon = false;
  let animationId = null;

  // Paddle
  let paddleX = (canvas.width - PADDLE_WIDTH) / 2;
  let rightPressed = false;
  let leftPressed = false;

  // Ball
  let ball = {
    x: canvas.width / 2,
    y: canvas.height - 30,
    dx: 3,
    dy: -3,
    speed: 4
  };

  // Bricks
  const brickColors = ['#ef4444', '#f97316', '#84cc16', '#06b6d4'];
  let bricks = [];
  for (let r = 0; r < BRICK_ROWS; r++) {
    bricks[r] = [];
    for (let c = 0; c < BRICK_COLS; c++) {
      bricks[r][c] = { status: 1, color: brickColors[r] };
    }
  }

  // UI overlay
  const ui = document.createElement('div');
  ui.className = 'game-ui';
  ui.innerHTML = `Score: <span id="breakout-score">0</span> | Lives: <span id="breakout-lives">3</span>`;
  container.style.position = 'relative';
  container.appendChild(ui);

  // Event listeners
  document.addEventListener('keydown', keyDownHandler);
  document.addEventListener('keyup', keyUpHandler);
  document.addEventListener('mousemove', mouseMoveHandler);
  canvas.addEventListener('touchmove', touchMoveHandler);

  function keyDownHandler(e) {
    if (e.keyCode === 39) {
      rightPressed = true;
    } else if (e.keyCode === 37) {
      leftPressed = true;
    }
  }

  function keyUpHandler(e) {
    if (e.keyCode === 39) {
      rightPressed = false;
    } else if (e.keyCode === 37) {
      leftPressed = false;
    }
  }

  function mouseMoveHandler(e) {
    const relativeX = e.clientX - canvas.getBoundingClientRect().left;
    if (relativeX > 0 && relativeX < canvas.width) {
      paddleX = relativeX - PADDLE_WIDTH / 2;
    }
  }

  function touchMoveHandler(e) {
    e.preventDefault();
    const relativeX = e.touches[0].clientX - canvas.getBoundingClientRect().left;
    if (relativeX > 0 && relativeX < canvas.width) {
      paddleX = relativeX - PADDLE_WIDTH / 2;
    }
  }

  function collisionDetection() {
    for (let r = 0; r < BRICK_ROWS; r++) {
      for (let c = 0; c < BRICK_COLS; c++) {
        const b = bricks[r][c];
        if (b.status === 1) {
          const brickX = c * (BRICK_WIDTH + BRICK_PADDING) + BRICK_OFFSET_LEFT;
          const brickY = r * (BRICK_HEIGHT + BRICK_PADDING) + BRICK_OFFSET_TOP;
          if (ball.x > brickX && ball.x < brickX + BRICK_WIDTH &&
              ball.y > brickY && ball.y < brickY + BRICK_HEIGHT) {
            ball.dy = -ball.dy;
            b.status = 0;
            score += 10;
            document.getElementById('breakout-score').textContent = score;
          }
        }
      }
    }
  }

  function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, BALL_SIZE, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.closePath();
  }

  function drawPaddle() {
    ctx.fillStyle = '#6366f1';
    ctx.fillRect(paddleX, canvas.height - PADDLE_HEIGHT - 5, PADDLE_WIDTH, PADDLE_HEIGHT);
    ctx.fillStyle = '#818cf8';
    ctx.fillRect(paddleX, canvas.height - PADDLE_HEIGHT - 5, PADDLE_WIDTH, 3);
  }

  function drawBricks() {
    for (let r = 0; r < BRICK_ROWS; r++) {
      for (let c = 0; c < BRICK_COLS; c++) {
        if (bricks[r][c].status === 1) {
          const brickX = c * (BRICK_WIDTH + BRICK_PADDING) + BRICK_OFFSET_LEFT;
          const brickY = r * (BRICK_HEIGHT + BRICK_PADDING) + BRICK_OFFSET_TOP;
          ctx.fillStyle = bricks[r][c].color;
          ctx.fillRect(brickX, brickY, BRICK_WIDTH, BRICK_HEIGHT);
          ctx.fillStyle = 'rgba(255,255,255,0.2)';
          ctx.fillRect(brickX, brickY, BRICK_WIDTH, 3);
        }
      }
    }
  }

  function drawGameOver() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    if (gameWon) {
      ctx.fillText('YOU WON!', canvas.width / 2, canvas.height / 2 - 30);
    } else {
      ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 30);
    }
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 10);
  }

  function checkWin() {
    for (let r = 0; r < BRICK_ROWS; r++) {
      for (let c = 0; c < BRICK_COLS; c++) {
        if (bricks[r][c].status === 1) {
          return false;
        }
      }
    }
    return true;
  }

  function endGame(won = false) {
    gameOver = true;
    gameWon = won;
    cancelAnimationFrame(animationId);
    const coins = Math.floor(score / 50) * 10;
    if (coins > 0 && typeof addCoins === 'function') {
      addCoins(coins);
    }
    if (userData.highScores) {
      const currentHigh = userData.highScores.breakout || 0;
      if (score > currentHigh) {
        userData.highScores.breakout = score;
        if (typeof saveUserData === 'function') saveUserData();
      }
    }
  }

  function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height - 30;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * 3;
    ball.dy = -3;
    paddleX = (canvas.width - PADDLE_WIDTH) / 2;
  }

  function update() {
    if (gameOver) {
      drawGameOver();
      return;
    }

    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawBricks();
    drawBall();
    drawPaddle();
    collisionDetection();

    ball.x += ball.dx;
    ball.y += ball.dy;

    // Wall collision
    if (ball.x - BALL_SIZE < 0 || ball.x + BALL_SIZE > canvas.width) {
      ball.dx = -ball.dx;
    }
    if (ball.y - BALL_SIZE < 0) {
      ball.dy = -ball.dy;
    }

    // Paddle collision
    if (ball.y + BALL_SIZE > canvas.height - PADDLE_HEIGHT - 5 &&
        ball.y - BALL_SIZE < canvas.height &&
        ball.x > paddleX &&
        ball.x < paddleX + PADDLE_WIDTH) {
      ball.dy = -ball.dy;
    }

    // Fall off bottom (lose life)
    if (ball.y + BALL_SIZE > canvas.height && !gameOver) {
      lives--;
      document.getElementById('breakout-lives').textContent = lives;
      if (lives <= 0) {
        endGame(false);
      } else {
        resetBall();
      }
    }

    // Paddle movement
    if (rightPressed && paddleX < canvas.width - PADDLE_WIDTH) {
      paddleX += 7;
    }
    if (leftPressed && paddleX > 0) {
      paddleX -= 7;
    }

    // Win condition
    if (checkWin() && !gameOver) {
      endGame(true);
    }

    animationId = requestAnimationFrame(update);
  }

  // Start game
  update();

  // Cleanup function for modal close
  window.breakoutCleanup = function() {
    cancelAnimationFrame(animationId);
    document.removeEventListener('keydown', keyDownHandler);
    document.removeEventListener('keyup', keyUpHandler);
    document.removeEventListener('mousemove', mouseMoveHandler);
  };
}
