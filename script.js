// player allocation

let selectedPiece = null;
let currentPlayer = 'white';
let playerNames = {
  white: 'Player 1',
  black: 'Player 2'
};

let forcedJumpSquares = [];

// Drawing board

const board = document.getElementById('board');

for (let row = 0; row < 8; row++) {
  for (let col = 0; col < 8; col++) {
    const square = document.createElement('div');
    square.classList.add('square');
    square.classList.add((row + col) % 2 === 0 ? 'light' : 'dark');
    square.dataset.row = row;
    square.dataset.col = col;
    board.appendChild(square);

    // Add checkers onto board
    if ((row + col) % 2 === 1) {
      if (row < 3) {
        const piece = document.createElement('div');
        piece.classList.add('piece', 'white');
        square.appendChild(piece);
      } else if (row > 4) {
        const piece = document.createElement('div');
        piece.classList.add('piece', 'black');
        square.appendChild(piece);
      }
    }

    // board clickable
    square.addEventListener('click', () => handleSquareClick(square));
    board.appendChild(square);
    
  }
}

// more clickable? & help enforce jump rule

function handleSquareClick(square) {
  const piece = square.querySelector('.piece');

  if (!selectedPiece) {
    forcedJumpSquares = getForcedJumpSquares(currentPlayer);
  }
  
  // Selecting a piece 
  if (piece && piece.classList.contains(currentPlayer)) {
   if (forcedJumpSquares.length > 0 && !forcedJumpSquares.includes(square)) {
      alert('You must choose a piece that can jump.');
      return;
    }

    selectedPiece = square;
    highlight(square);
    return;
  }
  
  // Moving a selected piece
  if (selectedPiece && isValidMove(selectedPiece, square)) {
    const isJump = Math.abs(parseInt(selectedPiece.dataset.row) - parseInt(square.dataset.row)) === 2;

    // Enforce jump rule
    if (forcedJumpSquares.length > 0 && !isJump) {
      alert('You must jump if able.');
      return;
    }

    movePiece(selectedPiece, square);
    selectedPiece = null;
    forcedJumpSquares = []; // reset for next turn
    checkWinCondition();
    togglePlayer();
    updateTurnDisplay();
  }
}}

 
//highlight square

function highlight(square) {
  document.querySelectorAll('.square').forEach(sq => sq.classList.remove('highlight'));
  square.classList.add('highlight');
}

//moving pieces
function movePiece(fromSquare, toSquare) {
  const piece = fromSquare.querySelector('.piece');
  const fromRow = parseInt(fromSquare.dataset.row);
  const fromCol = parseInt(fromSquare.dataset.col);
  const toRow = parseInt(toSquare.dataset.row);
  const toCol = parseInt(toSquare.dataset.col);

  // If it's a jump, remove the captured piece
  if (Math.abs(fromRow - toRow) === 2 && Math.abs(fromCol - toCol) === 2) {
    const midRow = (fromRow + toRow) / 2;
    const midCol = (fromCol + toCol) / 2;
    const midSquare = document.querySelector(`[data-row='${midRow}'][data-col='${midCol}']`);
    midSquare.innerHTML = '';
  }

  toSquare.appendChild(piece);
  fromSquare.classList.remove('highlight');

  // king logic
  if ((currentPlayer === 'white' && toRow === 7) || (currentPlayer === 'black' && toRow === 0)) {
    piece.classList.add('king');
    piece.innerHTML = '<span class="king-label">K</span>';
  }
}



//mmoves validate

function isValidMove(from, to) {
  const fromRow = parseInt(from.dataset.row);
  const fromCol = parseInt(from.dataset.col);
  const toRow = parseInt(to.dataset.row);
  const toCol = parseInt(to.dataset.col);

  // Must be a dark square and empty
  if (!to.classList.contains('dark') || to.querySelector('.piece')) return false;

  const piece = from.querySelector('.piece');
  const isKing = piece.classList.contains('king');
  const direction = currentPlayer === 'white' ? 1 : -1;

  const rowDiff = toRow - fromRow;
  const colDiff = toCol - fromCol;

  // Simple diagonal move
  if (Math.abs(rowDiff) === 1 && Math.abs(colDiff) === 1) {
    if (isKing || rowDiff === direction) return true;
  }

  // Jump move
  if (Math.abs(rowDiff) === 2 && Math.abs(colDiff) === 2) {
    const midRow = (fromRow + toRow) / 2;
    const midCol = (fromCol + toCol) / 2;
    const midSquare = document.querySelector(`[data-row='${midRow}'][data-col='${midCol}']`);
    const midPiece = midSquare.querySelector('.piece');
    if (midPiece && midPiece.classList.contains(opponent())) {
      return isKing || rowDiff === 2 * direction;
    }
  }

  return false;
}

//support
function opponent() {
  return currentPlayer === 'white' ? 'black' : 'white';
}

function togglePlayer() {
  currentPlayer = opponent();
}

//player turns

function updateTurnDisplay() {
  document.getElementById('turnDisplay').innerText = `Turn: ${playerNames[currentPlayer]} (${currentPlayer})`;
}

//gameplay

function startGame() {
  const p1 = document.getElementById('player1').value.trim();
  const p2 = document.getElementById('player2').value.trim();

  if (p1) playerNames.white = p1;
  if (p2) playerNames.black = p2;

  document.getElementById('setup').style.display = 'none';
  document.getElementById('board').style.display = 'grid';

  currentPlayer = 'white'; // always start with white

  alert(`${playerNames.white} (White) goes first.`);
  updateTurnDisplay(); // 
}

//stalemate checker

function hasAnyLegalMoves(playerColor) {
  const pieces = document.querySelectorAll(`.piece.${playerColor}`);
  for (let piece of pieces) {
    const square = piece.parentElement;
    const fromRow = parseInt(square.dataset.row);
    const fromCol = parseInt(square.dataset.col);
    const isKing = piece.classList.contains('king');
    const directions = isKing ? [-1, 1] : [playerColor === 'white' ? 1 : -1];

    for (let dr of directions) {
      for (let dc of [-1, 1]) {
        const toRow = fromRow + dr;
        const toCol = fromCol + dc;
        const toSquare = document.querySelector(`[data-row='${toRow}'][data-col='${toCol}']`);
        if (toSquare && isValidMove(square, toSquare)) return true;

        const jumpRow = fromRow + dr * 2;
        const jumpCol = fromCol + dc * 2;
        const jumpSquare = document.querySelector(`[data-row='${jumpRow}'][data-col='${jumpCol}']`);
        if (jumpSquare && isValidMove(square, jumpSquare)) return true;
      }
    }
  }
  return false;
}

//forces jump when available

function getForcedJumpSquares(playerColor) {
  const candidates = [];
  const pieces = document.querySelectorAll(`.piece.${playerColor}`);

  for (let piece of pieces) {
    const square = piece.parentElement;
    const fromRow = parseInt(square.dataset.row);
    const fromCol = parseInt(square.dataset.col);
    const isKing = piece.classList.contains('king');
    const directions = isKing ? [-1, 1] : [playerColor === 'white' ? 1 : -1];

    for (let dr of directions) {
      for (let dc of [-1, 1]) {
        const toRow = fromRow + dr * 2;
        const toCol = fromCol + dc * 2;
        const jumpSquare = document.querySelector(`[data-row='${toRow}'][data-col='${toCol}']`);
        if (jumpSquare && isValidMove(square, jumpSquare)) {
          candidates.push(square);
          break; // this piece can jump; no need to check more directions
        }
      }
    }
  }
  return candidates;
}

//wins & stalemate

function checkWinCondition() {
  const whitePieces = document.querySelectorAll('.piece.white');
  const blackPieces = document.querySelectorAll('.piece.black');

  if (whitePieces.length === 0) {
    alert(`${playerNames.black} (black) wins!`);
    endGame();
    return;
  }

  if (blackPieces.length === 0) {
    alert(`${playerNames.white} (white) wins!`);
    endGame();
    return;
  }

  if (!hasAnyLegalMoves('white') && !hasAnyLegalMoves('black')) {
    alert("Stalemate! It's a draw.");
    endGame();
  }
}

//end game 

function endGame() {
  document.querySelectorAll('.square').forEach(sq => {
    sq.replaceWith(sq.cloneNode(true)); // removes all event listeners
  });

  document.getElementById('turnDisplay').innerText = 'Game over';
  document.getElementById('resetButton').style.display = 'inline-block';
}

//reset game
function resetGame() {
  board.innerHTML = '';
  selectedPiece = null;
  currentPlayer = 'white';

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const square = document.createElement('div');
      square.classList.add('square');
      square.classList.add((row + col) % 2 === 0 ? 'light' : 'dark');
      square.dataset.row = row;
      square.dataset.col = col;

      if ((row + col) % 2 === 1) {
        if (row < 3) {
          const piece = document.createElement('div');
          piece.classList.add('piece', 'white');
          square.appendChild(piece);
        } else if (row > 4) {
          const piece = document.createElement('div');
          piece.classList.add('piece', 'black');
          square.appendChild(piece);
        }
      }

      square.addEventListener('click', () => handleSquareClick(square));
      board.appendChild(square);
    }
  }

  updateTurnDisplay();
  document.getElementById('resetButton').style.display = 'none';
}




