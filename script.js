// player allocation

let selectedPiece = null;
let currentPlayer = 'white';
let playerNames = {
  white: 'Player 1',
  black: 'Player 2'
};

// Drawing  board

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


