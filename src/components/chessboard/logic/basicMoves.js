
// --- COMPRUEBA SI LA CASILLA ESTA EN EL RANGO CORRECTO ---
const isInsideBoard = (r, c) => r >= 0 && r < 8 && c >= 0 && c < 8;


// ------ MOVIMIENTOS BASICOS SIN CONDICIONES ------
// --- PEON ---
export const getPawnPseudoMoves = (row, col, color, board, lastMove) => {
  const moves = [];
  const direction = color === 'white' ? -1 : 1;
  const startRow = color === 'white' ? 6 : 1;

  // -- AVANCE SIMPLE ---
  const nextRow = row + direction;
  if (isInsideBoard(nextRow, col) && !board[nextRow][col]) {
    moves.push({ row: nextRow, col });

    // --- DBOLE ---
    if (row === startRow) {
      const doubleRow = row + 2 * direction;
      if (isInsideBoard(doubleRow, col) && !board[doubleRow][col]) {
        moves.push({ row: doubleRow, col });
      }
    }
  }

  // -- CAPTURAS AL PASO --
  [-1, 1].forEach(offset => {
    const cCol = col + offset;
    const cRow = row + direction;
    if (!isInsideBoard(cRow, cCol)) return;

    const target = board[cRow][cCol];
    if (target && target.color !== color) {
      moves.push({ row: cRow, col: cCol });
    }

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
// --- PARA LOS ATAQUES DEL PEON, DISTINTOS A SU MOVIMIENTO ---
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

// ---CABALLO ---
export const getKnightPseudoMoves = (row, col, color, board) => {
  const moves = [];
  const offsets = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
  offsets.forEach(([dr, dc]) => {
    const r = row + dr, c = col + dc;
    if (isInsideBoard(r, c) && (!board[r][c] || board[r][c].color !== color)) {
      moves.push({ row: r, col: c });
    }
  });
  return moves;
};

// ---TORRE ---
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

// ---ALFIL ---
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

// --- DAMA ---
export const getQueenPseudoMoves = (row, col, color, board) => {
  return getRookPseudoMoves(row, col, color, board)
    .concat(getBishopPseudoMoves(row, col, color, board));
};

// --- REY ---
export const getKingPseudoMoves = (row, col, color, board) => {
  const moves = [];
  const offsets = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
  offsets.forEach(([dr, dc]) => {
    const r = row + dr;
    const c = col + dc;
    if (isInsideBoard(r, c) && (!board[r][c] || board[r][c].color !== color)) {
      moves.push({ row: r, col: c });
    }
  });
  return moves;
};

