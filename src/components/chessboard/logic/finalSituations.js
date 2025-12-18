import { hasLegalMoves, isInCheck } from './checks';


// --- FUNCIÓN PARA GENERAR CLAVE ÚNICA DE POSICIÓN (REPETICIÓN) ---
export const getPositionKey = (board, currentTurn, castlingRights, lastMove) => {
  const boardStr = board.map(row => row.map(piece => 
    piece ? `${piece.color[0]}${piece.type[0].toUpperCase()}` : '-'
  ).join(',')).join('|');
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
      if (piece.type === 'pawn' || piece.type === 'queen' || piece.type === 'rook') hasPawnQueenRook = true;
      if (piece.color === 'white') {
        whitePieces++;
        if (piece.type === 'night') whiteKnights++;
        if (piece.type === 'bishop') whiteBishops++;
      } else {
        blackPieces++;
        if (piece.type === 'night') blackKnights++;
        if (piece.type === 'bishop') blackBishops++;
      }
    }
  }

  if (hasPawnQueenRook) return false;
  if (whitePieces === 0 && blackPieces === 0) return true; // K vs K
  if (whitePieces === 0 && (blackKnights === 1 && blackBishops === 0 || blackKnights === 0 && blackBishops === 1)) return true;
  if (blackPieces === 0 && (whiteKnights === 1 && whiteBishops === 0 || whiteKnights === 0 && whiteBishops === 1)) return true;
  if (whitePieces + blackPieces <= 2 && whiteKnights + blackKnights + whiteBishops + blackBishops === whitePieces + blackPieces) return true;
  return false;
};

// --- FUNCIÓN CENTRAL QUE COMPRUEBA TODOS LOS FINALES DE PARTIDA ---
export const checkGameEnd = ({
  board,
  currentTurn,
  lastMove,
  castlingRights,
  halfMoveCounter,
  positionHistory,
  previousPlayerColor // color del jugador que ACABA de mover
}) => {
  const nextPlayer = previousPlayerColor === 'white' ? 'black' : 'white';

  // 1. Jaque mate o ahogado
  const kingInCheck = isInCheck(board, nextPlayer);
  const hasMoves = hasLegalMoves(board, nextPlayer, lastMove, castlingRights);

  if (!hasMoves) {
    if (kingInCheck) {
      return {
        over: true,
        result: `Victoria para las ${previousPlayerColor === 'white' ? 'BLANCAS' : 'NEGRAS'} por jaque mate`,
        reason: 'checkmate'
      };
    } else {
      return {
        over: true,
        result: 'Tablas por ahogado',
        reason: 'stalemate'
      };
    }
  }

  // 2. Regla de 50 movimientos
  if (halfMoveCounter >= 100) {
    return {
      over: true,
      result: 'Tablas por regla de 50 movimientos',
      reason: 'fifty_moves'
    };
  }

  // 3. Repetición de posición (3 veces)
  const positionKey = getPositionKey(board, currentTurn, castlingRights, lastMove);
  const count = positionHistory.get(positionKey) || 0;
  if (count >= 3) {
    return {
      over: true,
      result: 'Tablas por repetición de posición',
      reason: 'repetition'
    };
  }

  // 4. Material insuficiente
  if (isInsufficientMaterial(board)) {
    return {
      over: true,
      result: 'Tablas por material insuficiente',
      reason: 'insufficient_material'
    };
  }

  // No hay final de partida
  return { over: false, result: null, reason: null };
};