import { getLegalMoves } from './legalMoves';
import { isInCheck } from './checks';


// --- CODIGO NECESARIO PARA EL FUNCIONAMIENTO DEL ALGORITMO "MINIMAX CON PODA ALFA-BETA" ---
// --- MOTOR DE AJEDREZ ELEGIDO PARA LA APLICACION ---
// -- EVALUACIÓN DE LA POSICIÓN DEL TABLERO --
const pieceValues = {
  pawn: 100,
  night: 320,
  bishop: 330,
  rook: 500,
  queen: 900,
  king: 20000
};

const pawnTable = [
  0,  0,  0,  0,  0,  0,  0,  0,
  50, 50, 50, 50, 50, 50, 50, 50,
  10, 10, 20, 30, 30, 20, 10, 10,
  5,  5, 10, 25, 25, 10,  5,  5,
  0,  0,  0, 20, 20,  0,  0,  0,
  5, -5,-10,  0,  0,-10, -5,  5,
  5, 10, 10,-20,-20, 10, 10,  5,
  0,  0,  0,  0,  0,  0,  0,  0
];

const nightTable = [
  -50,-40,-30,-30,-30,-30,-40,-50,
  -40,-20,  0,  0,  0,  0,-20,-40,
  -30,  0, 10, 15, 15, 10,  0,-30,
  -30,  5, 15, 20, 20, 15,  5,-30,
  -30,  0, 15, 20, 20, 15,  0,-30,
  -30,  5, 10, 15, 15, 10,  5,-30,
  -40,-20,  0,  5,  5,  0,-20,-40,
  -50,-40,-30,-30,-30,-30,-40,-50
];

function getPiecePositionValue(piece, row, col) {
  if (!piece) return 0;
  
  const index = piece.color === 'white' ? (7 - row) * 8 + col : row * 8 + col;
  
  if (piece.type === 'pawn') return pawnTable[index];
  if (piece.type === 'night') return nightTable[index];
  
  return 0;
}

export function evaluateBoard(board) {
  let totalEvaluation = 0;
  
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece) {
        const pieceValue = pieceValues[piece.type] || 0;
        const positionValue = getPiecePositionValue(piece, row, col);
        const value = pieceValue + positionValue;
        
        totalEvaluation += piece.color === 'white' ? value : -value;
      }
    }
  }
  
  return totalEvaluation;
}


function minimax(board, depth, alpha, beta, isMaximizingPlayer, getLegalMovesForAI, executeMoveCopy) {
  if (depth === 0) {
    return evaluateBoard(board);
  }

  const color = isMaximizingPlayer ? 'white' : 'black';
  const moves = getAllPossibleMoves(board, color, getLegalMovesForAI);

  if (moves.length === 0) {
    const inCheck = isInCheck(board, color);
    if (inCheck) {
      return isMaximizingPlayer ? -100000 : 100000; // JAQUE MATE
    } else {
      return 0; // AHOGADO
    }
  }

  if (isMaximizingPlayer) {
    let maxEval = -Infinity;
    for (const move of moves) {
      const newBoard = executeMoveCopy(
        board,
        move.fromRow,
        move.fromCol,
        move.toRow,
        move.toCol,
        move.moveData
      );
      const evalScore = minimax(newBoard, depth - 1, alpha, beta, false, getLegalMovesForAI, executeMoveCopy);
      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      const newBoard = executeMoveCopy(
        board,
        move.fromRow,
        move.fromCol,
        move.toRow,
        move.toCol,
        move.moveData
      );
      const evalScore = minimax(newBoard, depth - 1, alpha, beta, true, getLegalMovesForAI, executeMoveCopy);
      minEval = Math.min(minEval, evalScore);
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}


function getAllPossibleMoves(board, color, getLegalMovesForAI) {
  const moves = [];
  
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === color) {
        const legalMoves = getLegalMovesForAI(row, col, board);
        legalMoves.forEach(move => {
          moves.push({
            fromRow: row,
            fromCol: col,
            toRow: move.row,
            toCol: move.col,
            moveData: move
          });
        });
      }
    }
  }
  
  return moves;
}

// --- FUNCIÓN PARA OBTENER EL MEJOR MOVIMIENTO ---
export function getBestMove(board, color, depth, getLegalMovesForAI, executeMoveCopy) {
  const allMoves = getAllPossibleMoves(board, color, getLegalMovesForAI);
  
  if (allMoves.length === 0) return null;
  
  let bestMove = null;
  let bestValue = color === 'white' ? -999999 : 999999;
  
  for (const move of allMoves) {
    const newBoard = executeMoveCopy(board, move.fromRow, move.fromCol, move.toRow, move.toCol, move.moveData);
    const boardValue = minimax(
      newBoard, 
      depth - 1, 
      -999999, 
      999999, 
      color === 'black', 
      getLegalMovesForAI,
      executeMoveCopy
    );
    
    if (color === 'white') {
      if (boardValue > bestValue) {
        bestValue = boardValue;
        bestMove = move;
      }
    } else {
      if (boardValue < bestValue) {
        bestValue = boardValue;
        bestMove = move;
      }
    }
  }
  
  return bestMove;
}

// --- FUNCIONES AUXILIARES PARA LA IA ---
const copyBoard = (board) => {
  return board.map(row => row.map(piece => piece ? { ...piece } : null));
};

// -- EJECUTA EL MOVIMIENTO EN UNA COPIA DEL TABLERO --
export const executeMoveCopy = (board, fromRow, fromCol, toRow, toCol, moveData = {}) => {
  const newBoard = copyBoard(board);
  const piece = newBoard[fromRow][fromCol];
  
  if (!piece) return newBoard;
  
  newBoard[toRow][toCol] = { ...piece };
  newBoard[fromRow][fromCol] = null;
  
  // Captura al paso
  if (moveData.enPassant) {
    const capturedRow = piece.color === 'white' ? toRow + 1 : toRow - 1;
    newBoard[capturedRow][toCol] = null;
  }
  
  // Enroques
  if (moveData.castling) {
    const row = piece.color === 'white' ? 7 : 0;
    if (moveData.castling === 'kingside') {
      newBoard[row][5] = newBoard[row][7];
      newBoard[row][7] = null;
    } else if (moveData.castling === 'queenside') {
      newBoard[row][3] = newBoard[row][0];
      newBoard[row][0] = null;
    }
  }
  
  return newBoard;
};

// Versión de getLegalMoves que funciona con cualquier tablero (para la IA)
export const getLegalMovesForAI = (row, col, board, lastMove = null, castlingRights = {}) => {
  return getLegalMoves(row, col, board, board[row][col]?.color || 'white', lastMove, castlingRights);
};