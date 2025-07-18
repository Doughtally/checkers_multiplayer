// player allocation

let selectedPiece = null;
let currentPlayer = 'white';
let playerNames = {
  white: 'Player 1',
  black: 'Player 2'
};

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

// more clickable?

function handleSquareClick(square) {
  const piece = square.querySelector('.piece');

  // Select a piece
  if (piece && piece.classList.contains(currentPlayer)) {
    selectedPiece = square;
    highlight(square);
    return;
  }

  // Try to move
  if (selectedPiece && isValidMove(selectedPiece, square)) {
    movePiece(selectedPiece, square);
    selectedPiece = null;
    togglePlayer();
    updateTurnDisplay();
  }
}

//highlight square

function highlight(square) {
  document.querySelectorAll('.square').forEach(sq => sq.classList.remove('highlight'));
  square.classList.add('highlight');
}

//moving pieces
function movePiece(fromSquare, toSquare) {
  const piece = fromSquare.querySelector('.piece');
  toSquare.appendChild(piece);
  fromSquare.classList.remove('highlight');

  // Check for kinging
  const toRow = parseInt(toSquare.dataset.row);
  if ((currentPlayer === 'white' && toRow === 7) || (currentPlayer === 'black' && toRow === 0)) {
    piece.classList.add('king');
    piece.innerText = 'K';
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
      midSquare.innerHTML = '';
      return isKing || rowDiff === 2 * direction;
    }
  }

  return false;
}
