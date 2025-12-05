import { makeTempMove, undoTempMove } from './boardUtils.js';
import { getPawnPseudoMoves, getKnightPseudoMoves, getRookPseudoMoves, getBishopPseudoMoves, getQueenPseudoMoves, getKingPseudoMoves } from './basicMoves.js';
import { isInCheck, isSquareAttacked } from './checks.js'; 


// ------ AQUI PASAN LOS TODOS LOS POSIBLES MOVIMIENTOS PARA SER VALIDADOS ------
// --- PARA COMPROBAR SI SON POSIBLES O NO ---
export function getLegalMoves(row, col, board, color, lastMove = null, castling = {}) {
  const piece = board[row][col];
  if (!piece || piece.color !== color) return [];

  const legalMoves = [];
  const opponent = color === 'white' ? 'black' : 'white';
  const pseudoMoves = getPseudoLegalMoves(row, col, board, lastMove);
  const castlingCopy = { ...castling };

  // -- REVISA TODOS LOS getPseudoLegalMoves --
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
    if (!isInCheck(board, color)) {
      legalMoves.push(move);
    }
    undoTempMove(board, castlingCopy, row, col, move.row, move.col, backup);
  }

  // -- REVISA SI REALIZAR UN POSIBLE ENROQUE FUESE POSIBLE --
  if (piece.type === 'king' && !castling[color + 'KingMoved']) {
    const backRank = color === 'white' ? 7 : 0;

    // - ENROQUE CORTO -
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
    // - ENROQUE LARGO -
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

// --- PARA PASAR TODOS LOS MOVIMIENTOS BASICOS SIN CONDICION ALGUNA ---
export const getPseudoLegalMoves = (row, col, board, lastMove = null) => {
  const piece = board[row][col];
  if (!piece) return [];

  switch (piece.type) {
    case 'pawn':   return getPawnPseudoMoves(row, col, piece.color, board, lastMove);
    case 'night': return getKnightPseudoMoves(row, col, piece.color, board);
    case 'rook':   return getRookPseudoMoves(row, col, piece.color, board);
    case 'bishop': return getBishopPseudoMoves(row, col, piece.color, board);
    case 'queen':  return getQueenPseudoMoves(row, col, piece.color, board);
    case 'king':   return getKingPseudoMoves(row, col, piece.color, board);
    default:       return [];
  }
};