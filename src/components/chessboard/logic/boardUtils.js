export function toAlgebraicNotation(board, move, piece) {
  const files = ['a','b','c','d','e','f','g','h'];

  // -- COORDENADAS --
  const from = `${files[move.fromCol]}${8 - move.fromRow}`;
  const to   = `${files[move.toCol]}${8 - move.toRow}`;

  // -- ENROQUES --
  if (piece.type === "king") {
    if (move.fromCol === 4 && move.toCol === 6) return "O-O";
    if (move.fromCol === 4 && move.toCol === 2) return "O-O-O";
  }

  const pieceLetter = {
    pawn: "",
    knight: "N",
    bishop: "B",
    rook: "R",
    queen: "Q",
    king: "K"
  }[piece.type];

  const destinationPiece = board[move.toRow][move.toCol];

  const isCapture = !!destinationPiece;

  // -- PEÓN CAPTURANDO --
  let algebraic = "";

  if (piece.type === "pawn") {
    if (isCapture) algebraic = `${from[0]}x${to}`;
    else algebraic = to;
  } else {
    algebraic = pieceLetter;
    if (isCapture) algebraic += "x";
    algebraic += to;
  }

  // -- CORONACIÓN --
  if (move.moveData?.promotion) {
    algebraic += "=" + move.moveData.promotion.toUpperCase();
  }

  return algebraic;
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

  // -- GUARDA LA POSICION ANTES DE LOS ENROQUES --
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

