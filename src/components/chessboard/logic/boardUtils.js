
// --- PARA PASAR LA CASILLA EN NOTACION DE AJEDREZ ---
export function coordinates(row, col) {
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  return `${files[col]}${8 - row}`;
}


// ------ MAKE / UNDO TEMP MOVE ------
// --- GUARDA LOS DATOS DEL ULTIMO MOVIMIENTO REALIZADO ---
export const makeTempMove = (board, castling, fromRow, fromCol, toRow, toCol, enPassant = false) => {
  const backup = {
    pieceMoved: board[fromRow][fromCol] ? { ...board[fromRow][fromCol] } : null,
    pieceCaptured: board[toRow][toCol] ? { ...board[toRow][toCol] } : null,
    enPassantCaptured: null,
    enPassantPos: null,
    castlingBefore: { ...castling },
    rookFrom: null,
    rookTo: null,
    rookMoved: null
  };
  const piece = board[fromRow][fromCol];
  if (!piece) return backup;

  board[toRow][toCol] = piece;
  board[fromRow][fromCol] = null;

  // -- GUARDA LOE PEONES CAPTURADOS AL PASO --
  if (enPassant && piece.type === 'pawn') {
    const capturedRow = piece.color === 'white' ? toRow + 1 : toRow - 1;
    backup.enPassantCaptured = board[capturedRow][toCol] ? { ...board[capturedRow][toCol] } : null;
    backup.enPassantPos = { row: capturedRow, col: toCol };
    board[capturedRow][toCol] = null;
  }

  // -- GUARDA LA POSICIO ANTES DE LOS ENROQUES --
  if (piece.type === 'king' && Math.abs(toCol - fromCol) === 2) {
    const row = fromRow;
    if (toCol > fromCol) {
      // - CORTO -
      board[row][5] = board[row][7];
      board[row][7] = null;
      backup.rookFrom = { row, col: 7 };
      backup.rookTo = { row, col: 5 };
      backup.rookMoved = board[row][5] ? { ...board[row][5] } : null;
    } else {
      // - LARGO -
      board[row][3] = board[row][0];
      board[row][0] = null;
      backup.rookFrom = { row, col: 0 };
      backup.rookTo = { row, col: 3 };
      backup.rookMoved = board[row][3] ? { ...board[row][3] } : null;
    }
  }

  // --- ACTUALIZA EL ESTADO DE LOS ENROQUES ---
  if (piece.type === 'king') {
    castling[piece.color + 'KingMoved'] = true;
    castling[piece.color + 'RookKingsideMoved'] = true;
    castling[piece.color + 'RookQueensideMoved'] = true;
  }
  if (piece.type === 'rook') {
    if (fromCol === 0) castling[piece.color + 'RookQueensideMoved'] = true;
    if (fromCol === 7) castling[piece.color + 'RookKingsideMoved'] = true;
  }

  return backup;
};
// --- PARA VOLVER AL MOVIMIENTO GUARDADO ANTERIOR ---
export const undoTempMove = (board, castling, fromRow, fromCol, toRow, toCol, backup) => {
  board[fromRow][fromCol] = backup.pieceMoved;
  board[toRow][toCol] = backup.pieceCaptured;

  if (backup.enPassantCaptured !== null) {
    board[backup.enPassantPos.row][backup.enPassantPos.col] = backup.enPassantCaptured;
  }

  if (backup.rookFrom) {
    board[backup.rookFrom.row][backup.rookFrom.col] = backup.rookMoved;
    board[backup.rookTo.row][backup.rookTo.col] = null;
  }

  Object.assign(castling, backup.castlingBefore);
};

