
export const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

// Utilidad básica
export const isInsideBoard = (r, c) => r >= 0 && r < 8 && c >= 0 && c < 8;

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
    case 'knight': return getKnightPseudoMoves(row, col, color, board);
    case 'rook':   return getRookPseudoMoves(row, col, color, board);
    case 'bishop': return getBishopPseudoMoves(row, col, color, board);
    case 'queen':  return getQueenPseudoMoves(row, col, color, board);
    case 'king':   return getKingPseudoMoves(row, col, color, board);
    default:       return [];
  }
};