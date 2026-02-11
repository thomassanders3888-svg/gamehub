// Minesweeper Game - Classic Puzzle
function initMinesweeperGame(container) {
  const GRID_SIZE = 8;
  const MINES = 10;
  const CELL_SIZE = 45;

  const grid = document.createElement('div');
  grid.style.cssText = `display:grid;grid-template-columns:repeat(${GRID_SIZE},${CELL_SIZE}px);gap:2px;background:#333;padding:10px;border-radius:4px;margin:0 auto;user-select:none;`;
  container.appendChild(grid);

  const ui = document.createElement('div');
  ui.className = 'game-ui';
  ui.innerHTML = `Mines: <span id="mine-count">${MINES}</span> | Status: <span id="game-status">Playing</span>`;
  container.style.position = 'relative';
  container.insertBefore(ui, grid);

  let board = [], mines = [], revealed = [], flagged = [], gameOver = false, won = false;

  function init() {
    board = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));
    revealed = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(false));
    flagged = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(false));
    mines = [];
    gameOver = false; won = false;

    let placed = 0;
    while (placed < MINES) {
      const r = Math.floor(Math.random() * GRID_SIZE);
      const c = Math.floor(Math.random() * GRID_SIZE);
      if (!mines.some(m => m.r === r && m.c === c)) {
        mines.push({ r, c });
        board[r][c] = -1;
        placed++;
      }
    }

    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (board[r][c] !== -1) {
          let count = 0;
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const nr = r + dr, nc = c + dc;
              if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE && board[nr][nc] === -1) count++;
            }
          }
          board[r][c] = count;
        }
      }
    }

    render();
  }

  function reveal(r, c) {
    if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE || revealed[r][c] || flagged[r][c] || gameOver) return;
    revealed[r][c] = true;
    if (board[r][c] === -1) { endGame(false); return; }
    if (board[r][c] === 0) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) reveal(r + dr, c + dc);
      }
    }
    checkWin();
  }

  function toggleFlag(r, c) {
    if (revealed[r][c] || gameOver) return;
    flagged[r][c] = !flagged[r][c];
    updateUI();
    render();
  }

  function checkWin() {
    let safeRevealed = 0;
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (board[r][c] !== -1 && revealed[r][c]) safeRevealed++;
      }
    }
    if (safeRevealed === GRID_SIZE * GRID_SIZE - MINES) endGame(true);
  }

  function endGame(win) {
    gameOver = true; won = win;
    document.getElementById('game-status').textContent = win ? 'Won!' : 'Game Over';
    if (win && typeof addCoins === 'function') addCoins(10);
    render();
  }

  function updateUI() {
    const flags = flagged.flat().filter(f => f).length;
    document.getElementById('mine-count').textContent = MINES - flags;
  }

  function render() {
    grid.innerHTML = '';
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const cell = document.createElement('div');
        cell.style.cssText = `width:${CELL_SIZE}px;height:${CELL_SIZE}px;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:18px;cursor:pointer;`;
        if (revealed[r][c]) {
          cell.style.background = '#e5e5e5';
          if (board[r][c] === -1) cell.textContent = '💣', cell.style.background = '#ef4444';
          else if (board[r][c] > 0) cell.textContent = board[r][c], cell.style.color = ['#3b82f6','#22c55e','#ef4444','#a855f7','#f97316','#06b6d4','#000','#64748b'][board[r][c]-1];
        } else {
          cell.style.background = gameOver && board[r][c] === -1 ? '#ef4444' : '#64748b';
          if (flagged[r][c]) cell.textContent = '🚩';
          cell.onmousedown = (e) => { e.preventDefault(); if (e.button === 2) toggleFlag(r, c); else if (e.button === 0) reveal(r, c); };
          cell.oncontextmenu = () => false;
        }
        grid.appendChild(cell);
      }
    }
  }

  init();
}
