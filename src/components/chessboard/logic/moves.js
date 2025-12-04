
export const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

export function coordinates(row, col) {
  return `${files[col]}${8 - row}`;
}

// Utilidad básica
export const isInsideBoard = (r, c) => r >= 0 && r < 8 && c >= 0 && c < 8;

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


// --- OBTENER MOVIMIENTOS LEGALES ---
export function getLegalMoves(row, col, board, color, lastMove = null, castling = {}) {
  const piece = board[row][col];
  if (!piece || piece.color !== color) return [];

  const legalMoves = [];
  const opponent = color === 'white' ? 'black' : 'white';

  // MOVIMIENTOS PSEUDOLEGALES
  getPseudoLegalMoves(row, col, board, lastMove).forEach(move => {
    // Simular movimiento temporal
    const backupBoard = board.map(r => r.map(p => (p ? { ...p } : null)));
    const tempPiece = board[row][col];
    const capturedPiece = board[move.row][move.col];

    board[move.row][move.col] = tempPiece;
    board[row][col] = null;

    // Comprobar jaque
    const kingPos = findKing(board, color);
    const inCheck = board.some((r, ri) =>
      r.some((p, ci) => p && p.color === opponent && getPseudoLegalMoves(ri, ci, board).some(m => m.row === kingPos.row && m.col === kingPos.col))
    );

    if (!inCheck) legalMoves.push(move);

    // Restaurar tablero
    board[row][col] = tempPiece;
    board[move.row][move.col] = capturedPiece;
  });

  // Enroque (simplificado, se puede mejorar más adelante)
  if (piece.type === 'king' && !castling[color + 'KingMoved'] && !board[row][col + 1] && !board[row][col + 2]) {
    legalMoves.push({ row, col: col + 2 }); // enroque corto
  }
  if (piece.type === 'king' && !castling[color + 'KingMoved'] && !board[row][col - 1] && !board[row][col - 2] && !board[row][col - 3]) {
    legalMoves.push({ row, col: col - 2 }); // enroque largo
  }

  return legalMoves;
}



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