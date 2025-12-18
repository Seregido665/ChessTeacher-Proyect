
import { getPawnAttacks } from './basicMoves.js';
import { getPseudoLegalMoves, getLegalMoves } from './legalMoves.js'; // solo para reutilizar en ataques


// --- DEVUELVE TODAS LAS CASILLAS QUE ATACA UNA PIEZA, INCLUSO LAS ILEGALES ---
export const getPseudoAttacks = (row, col, board) => {
  const piece = board[row][col];
  if (!piece) return [];

  // -- PORQUE NO COME IGUAL QUE COMO SE MUEVE --
  if (piece.type === 'pawn') return getPawnAttacks(row, col, piece.color);
  return getPseudoLegalMoves(row, col, board);
};

// --- PARA COMPROBAR SI EL REY ESTA EN JAQUE---
export const isInCheck = (board, color) => {
  let kingRow = -1;
  let kingCol = -1;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece.type === 'king' && piece.color === color) {
        kingRow = r;
        kingCol = c;
        break; 
      }
    }
    if (kingRow !== -1) break; // PARA SALIR TAMBIEN DEL BUCLE DE FUERA
  }

  if (kingRow === -1) return false;

  const opponent = color === 'white' ? 'black' : 'white';

  // -- PARA VER SI ALGUNA PIEZA ENEMIGA LE ATACA --
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece.color === opponent) {
        const attacks = getPseudoAttacks(r, c, board);
        if (attacks.some(m => m.row === kingRow && m.col === kingCol)) {
          return true; 
        }
      }
    }
  }

  return false;
};

// --- PARA LUEGO USARLO PARA EL JAQUE MATE Y EL AHOGADO ---
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

// --- PARA SITUACIONES COMO ENROQUES Y CAPURAS AL PASO ---
export const isSquareAttacked = (board, row, col, attackerColor) => {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece.color === attackerColor) {
        const attacks = getPseudoAttacks(r, c, board);
        if (attacks.some(m => m.row === row && m.col === col)) return true;
      }
    }
  }
  return false;
};