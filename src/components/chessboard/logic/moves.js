export const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

export function coordinates(row, col) {
  return `${files[col]}${8 - row}`;
}

export const isInsideBoard = (r, c) => r >= 0 && r < 8 && c >= 0 && c < 8;

// --- MAKE / UNDO TEMP MOVE (OPTIMIZADO Y FUNCIONAL) ---
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

  // Mover pieza
  board[toRow][toCol] = piece;
  board[fromRow][fromCol] = null;

  // Captura al paso
  if (enPassant && piece.type === 'pawn') {
    const capturedRow = piece.color === 'white' ? toRow + 1 : toRow - 1;
    backup.enPassantCaptured = board[capturedRow][toCol] ? { ...board[capturedRow][toCol] } : null;
    backup.enPassantPos = { row: capturedRow, col: toCol };
    board[capturedRow][toCol] = null;
  }

  // Enroque (solo si el rey se mueve 2 casillas horizontalmente)
  if (piece.type === 'king' && Math.abs(toCol - fromCol) === 2) {
    const row = fromRow;
    if (toCol > fromCol) {
      // Enroque corto
      board[row][5] = board[row][7];
      board[row][7] = null;
      backup.rookFrom = { row, col: 7 };
      backup.rookTo = { row, col: 5 };
      backup.rookMoved = board[row][5] ? { ...board[row][5] } : null;
    } else {
      // Enroque largo
      board[row][3] = board[row][0];
      board[row][0] = null;
      backup.rookFrom = { row, col: 0 };
      backup.rookTo = { row, col: 3 };
      backup.rookMoved = board[row][3] ? { ...board[row][3] } : null;
    }
  }

  // Actualizar derechos de enroque temporalmente
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

// --- OBTENER MOVIMIENTOS LEGALES (AHORA USA makeTempMove → MUCHO MÁS RÁPIDO) ---
export function getLegalMoves(row, col, board, color, lastMove = null, castling = {}) {
  const piece = board[row][col];
  if (!piece || piece.color !== color) return [];

  const legalMoves = [];
  const opponent = color === 'white' ? 'black' : 'white';
  const pseudoMoves = getPseudoLegalMoves(row, col, board, lastMove);

  // Copia ligera del castling para modificarlo sin afectar el original
  const castlingCopy = { ...castling };

  for (const move of pseudoMoves) {
    const backup = makeTempMove(
      board,
      castlingCopy,
      row,
      col,
      move.row,
      move.col,
      !!move.enPassant
    );

    // Comprobamos si el rey queda en jaque después del movimiento
    if (!isInCheck(board, color)) {
      legalMoves.push(move);
    }

    // Restauramos todo
    undoTempMove(board, castlingCopy, row, col, move.row, move.col, backup);
  }

  // === ENROQUE (se comprueba en el tablero original) ===
  if (piece.type === 'king' && !castling[color + 'KingMoved']) {
    const backRank = color === 'white' ? 7 : 0;

    // Enroque corto
    if (
      col === 4 &&
      !castling[color + 'RookKingsideMoved'] &&
      !board[backRank][5] && !board[backRank][6] &&
      !isInCheck(board, color) &&
      !isSquareAttacked(board, backRank, 4, opponent) &&
      !isSquareAttacked(board, backRank, 5, opponent) &&
      !isSquareAttacked(board, backRank, 6, opponent)
    ) {
      legalMoves.push({ row: backRank, col: 6, castling: 'kingside' });
    }

    // Enroque largo
    if (
      col === 4 &&
      !castling[color + 'RookQueensideMoved'] &&
      !board[backRank][1] && !board[backRank][2] && !board[backRank][3] &&
      !isInCheck(board, color) &&
      !isSquareAttacked(board, backRank, 4, opponent) &&
      !isSquareAttacked(board, backRank, 3, opponent) &&
      !isSquareAttacked(board, backRank, 2, opponent)
    ) {
      legalMoves.push({ row: backRank, col: 2, castling: 'queenside' });
    }
  }

  return legalMoves;
}


// --- FUNCION QUE REUNE TODOS LOS MOVIMIENTOS ---
export const getPseudoLegalMoves = (row, col, board, lastMove = null) => {
  const piece = board[row][col];
  if (!piece) return [];

  const { type, color } = piece;

  switch (type) {
    case 'pawn':   return getPawnPseudoMoves(row, col, color, board, lastMove);
    case 'night': return getKnightPseudoMoves(row, col, color, board);
    case 'rook':   return getRookPseudoMoves(row, col, color, board);
    case 'bishop': return getBishopPseudoMoves(row, col, color, board);
    case 'queen':  return getQueenPseudoMoves(row, col, color, board);
    case 'king':   return getKingPseudoMoves(row, col, color, board);
    default:       return [];
  }
};


// --- OBTENER CASILLAS ATACADAS POR UN PEON ---
export const getPawnAttacks = (row, col, color) => {
  const attacks = [];
  const direction = color === 'white' ? -1 : 1;

  [-1, 1].forEach(offset => {
    const aRow = row + direction;
    const aCol = col + offset;
    if (isInsideBoard(aRow, aCol)) {
      attacks.push({ row: aRow, col: aCol });
    }
  });

  return attacks;
};
export const getPseudoAttacks = (row, col, board) => {
  const piece = board[row][col];
  if (!piece) return [];

  // Los peones atacan diferente a como se mueven
  if (piece.type === 'pawn') {
    return getPawnAttacks(row, col, piece.color);
  }

  // Para el resto, los ataques = donde podrían mover si no hubiera jaque
  return getPseudoLegalMoves(row, col, board);
};


// --- ENCONTRAR LA POSICIÓN DEL REY ---
export const findKing = (board, color) => {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece.type === 'king' && piece.color === color) {
        return { row: r, col: c };
      }
    }
  }
  return null;
};


export const isInCheck = (board, color) => {
  const kingPos = findKing(board, color);
  if (!kingPos) return false;

  const opponent = color === 'white' ? 'black' : 'white';

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece.color === opponent) {
        const attacks = getPseudoAttacks(r, c, board, opponent);
        
        if (attacks.some(m => m.row === kingPos.row && m.col === kingPos.col)) {
          return true;
        }
      }
    }
  }
  return false;
};

export const isSquareAttacked = (board, row, col, attackerColor) => {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece.color === attackerColor) {
        const attacks = getPseudoAttacks(r, c, board, attackerColor);
        
        if (attacks.some(m => m.row === row && m.col === col)) {
          return true;
        }
      }
    }
  }
  return false;
};


// --- MOVIMIENTOS POR PIEZA (pseudo-legales) ---
export const getPawnPseudoMoves = (row, col, color, board, lastMove) => {
  const moves = [];
  const direction = color === 'white' ? -1 : 1;
  const startRow = color === 'white' ? 6 : 1;

  // Avance simple
  const nextRow = row + direction;
  if (isInsideBoard(nextRow, col) && !board[nextRow][col]) {
    moves.push({ row: nextRow, col });

    // Avance doble desde posición inicial
    if (row === startRow) {
      const doubleRow = row + 2 * direction;
      if (isInsideBoard(doubleRow, col) && !board[doubleRow][col]) {
        moves.push({ row: doubleRow, col });
      }
    }
  }

  // Capturas diagonales + al paso
  [-1, 1].forEach(offset => {
    const cCol = col + offset;
    const cRow = row + direction;
    if (!isInsideBoard(cRow, cCol)) return;

    const target = board[cRow][cCol];
    if (target && target.color !== color) {
      moves.push({ row: cRow, col: cCol });
    }

    // Captura al paso
    if (
      lastMove &&
      lastMove.piece?.type === 'pawn' &&
      Math.abs(lastMove.from.row - lastMove.to.row) === 2 &&
      lastMove.to.row === row &&
      lastMove.to.col === cCol
    ) {
      moves.push({ row: cRow, col: cCol, enPassant: true });
    }
  });

  return moves;
};

export const getKnightPseudoMoves = (row, col, color, board) => {
  const moves = [];
  const offsets = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
  offsets.forEach(([dr, dc]) => {
    const r = row + dr, c = col + dc;
    if (isInsideBoard(r, c)) {
      const target = board[r][c];
      if (!target || target.color !== color) {
        moves.push({ row: r, col: c });
      }
    }
  });
  return moves;
};

export const getRookPseudoMoves = (row, col, color, board) => {
  const moves = [];
  const directions = [[0,1],[0,-1],[1,0],[-1,0]];
  directions.forEach(([dr, dc]) => {
    for (let i = 1; i < 8; i++) {
      const r = row + dr * i;
      const c = col + dc * i;
      if (!isInsideBoard(r, c)) break;
      const target = board[r][c];
      if (!target) {
        moves.push({ row: r, col: c });
      } else {
        if (target.color !== color) moves.push({ row: r, col: c });
        break;
      }
    }
  });
  return moves;
};

export const getBishopPseudoMoves = (row, col, color, board) => {
  const moves = [];
  const directions = [[1,1],[1,-1],[-1,1],[-1,-1]];
  directions.forEach(([dr, dc]) => {
    for (let i = 1; i < 8; i++) {
      const r = row + dr * i;
      const c = col + dc * i;
      if (!isInsideBoard(r, c)) break;
      const target = board[r][c];
      if (!target) {
        moves.push({ row: r, col: c });
      } else {
        if (target.color !== color) moves.push({ row: r, col: c });
        break;
      }
    }
  });
  return moves;
};

export const getQueenPseudoMoves = (row, col, color, board) => {
  return getRookPseudoMoves(row, col, color, board)
    .concat(getBishopPseudoMoves(row, col, color, board));
};

const getKingPseudoMoves = (row, col, color, board) => {
  const moves = [];
  const offsets = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
  offsets.forEach(([dr, dc]) => {
    const r = row + dr;
    const c = col + dc;
    if (isInsideBoard(r, c)) {
      const target = board[r][c];
      if (!target || target.color !== color) {
        moves.push({ row: r, col: c });
      }
    }
  });
  return moves;
};

export const hasLegalMoves = (board, color, lastMove = null, castling = {}) => {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece.color === color) {
        const moves = getLegalMoves(r, c, board, color, lastMove, castling);
        if (moves.length > 0) return true;
      }
    }
  }
  return false;
};






