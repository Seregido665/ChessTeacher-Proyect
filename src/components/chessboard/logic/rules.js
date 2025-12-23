// --- CREA EL TABLERO INICIAL ---
export const createInitialBoard = () => {
  const board = Array(8).fill(null).map(() => Array(8).fill(null));
  const backRow = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
  board[0] = backRow.map(type => ({ type, color: 'black' }));
  board[1] = Array(8).fill({ type: 'pawn', color: 'black' });
  board[6] = Array(8).fill({ type: 'pawn', color: 'white' });
  board[7] = backRow.map(type => ({ type, color: 'white' }));
  return board;
};

export const PIECE_KEY = {
  pawn: 'P',
  knight: 'N',
  bishop: 'B',
  rook: 'R',
  queen: 'Q',
  king: 'K'
};

// --- CLAVE ÚNICA PARA UNA POSICIÓN ---
export const getPositionKey = (board, currentTurn, castlingRights, lastMove) => {
  const boardStr = board.map(row =>
    row.map(piece => piece ? `${piece.color[0]}${PIECE_KEY[piece.type]}` : '-').join(',')
  ).join('|');

  const castlingStr = Object.values(castlingRights).join(',');
  const enPassantStr = lastMove && lastMove.enPassant ? `${lastMove.to.row},${lastMove.to.col}` : '-';

  return `${boardStr}|${currentTurn}|${castlingStr}|${enPassantStr}`;
};

// --- MATERIAL INSUFICIENTE ---
export const isInsufficientMaterial = (board) => {
  let whitePieces = 0, blackPieces = 0;
  let whiteKnights = 0, blackKnights = 0;
  let whiteBishops = 0, blackBishops = 0;
  let hasPawnQueenRook = false;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece || piece.type === 'king') continue;
      if (piece.type === 'pawn' || piece.type === 'queen' || piece.type === 'rook') {
        hasPawnQueenRook = true;
      }
      if (piece.color === 'white') {
        whitePieces++;
        if (piece.type === 'knight') whiteKnights++;
        if (piece.type === 'bishop') whiteBishops++;
      } else {
        blackPieces++;
        if (piece.type === 'knight') blackKnights++;
        if (piece.type === 'bishop') blackBishops++;
      }
    }
  }

  if (hasPawnQueenRook) return false;
  if (whitePieces === 0 && blackPieces === 0) return true;
  if (whitePieces === 0 && (blackKnights === 1 && blackBishops === 0 || blackKnights === 0 && blackBishops === 1)) return true;
  if (blackPieces === 0 && (whiteKnights === 1 && whiteBishops === 0 || whiteKnights === 0 && whiteBishops === 1)) return true;
  if (whitePieces + blackPieces <= 2 && whiteKnights + blackKnights + whiteBishops + blackBishops === whitePieces + blackPieces) return true;
  return false;
};


export { hasLegalMoves, isInCheck } from './checks';
export { getLegalMoves } from './legalMoves';
export { evaluateBoard } from './chessAI'; 
export { toAlgebraicNotation } from './notation';