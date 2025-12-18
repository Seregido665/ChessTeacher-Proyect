import { useState } from 'react';
import { hasLegalMoves, isInCheck } from './checks';
import { getLegalMoves } from './legalMoves';
//import { coordinates } from './boardUtils';


// --- CREA EL TABLERO INICIAL E INDICA DONDE VA CADA PIEZA ---
const createInitialBoard = () => {
  const board = Array(8).fill(null).map(() => Array(8).fill(null));
  const backRow = ['rook', 'night', 'bishop', 'queen', 'king', 'bishop', 'night', 'rook'];
  board[0] = backRow.map(type => ({ type, color: 'black' }));
  board[1] = Array(8).fill({ type: 'pawn', color: 'black' });
  board[6] = Array(8).fill({ type: 'pawn', color: 'white' });
  board[7] = backRow.map(type => ({ type, color: 'white' }));
  return board;
};

// --- FUNCIÓN AUXILIAR PARA GENERAR CLAVE ÚNICA DE POSICIÓN (PARA REPETICIÓN) ---
const getPositionKey = (board, currentTurn, castlingRights, lastMove) => {
  const boardStr = board.map(row => row.map(piece => 
    piece ? `${piece.color[0]}${piece.type[0].toUpperCase()}` : '-'
  ).join(',')).join('|');
  const castlingStr = Object.values(castlingRights).join(',');
  const enPassantStr = lastMove && lastMove.enPassant ? `${lastMove.to.row},${lastMove.to.col}` : '-';
  return `${boardStr}|${currentTurn}|${castlingStr}|${enPassantStr}`;
};

// --- FUNCIÓN AUXILIAR PARA COMPROBAR MATERIAL INSUFICIENTE ---
const isInsufficientMaterial = (board) => {
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
  if (whitePieces + blackPieces <= 2 && whiteKnights + blackKnights + whiteBishops + blackBishops === whitePieces + blackPieces) return true; // e.g., N vs N, B vs B, N vs B
  return false;
};


// ---------- FUNCION CENTRARL ----------
// --- CONTROLA TODA LA LOGICA Y ESTADO DEL TABLERO ---
export default function useChessEngine() {
  const [board, setBoard] = useState(createInitialBoard());
  const [currentTurn, setCurrentTurn] = useState('white');
  const [lastMove, setLastMove] = useState(null);
  const [moveHistory, setMoveHistory] = useState([]);
  const [castlingRights, setCastlingRights] = useState({
    whiteKingMoved: false,
    blackKingMoved: false,
    whiteRookKingsideMoved: false,
    whiteRookQueensideMoved: false,
    blackRookKingsideMoved: false,
    blackRookQueensideMoved: false
  });
  const [promotionData, setPromotionData] = useState(null);
  const [halfMoveCounter, setHalfMoveCounter] = useState(0);
  const [positionHistory, setPositionHistory] = useState(new Map());
  const [gameOver, setGameOver] = useState(false);
  const [gameResult, setGameResult] = useState(null);

  // -- CONTROLA Y TODO LO RELACIONADO CON MOVER PIEZAS --
  const executeMove = (fromRow, fromCol, toRow, toCol, moveData = {}, pieceOverride = null, promotedTo = null) => {
    if (gameOver) return;

    const newBoard = board.map(r => r.map(p => p ? { ...p } : null));
    const piece = pieceOverride || { ...newBoard[fromRow][fromCol] };

    // - PROMOCION -
    if (promotedTo) {
      newBoard[toRow][toCol] = { type: promotedTo, color: piece.color };
    } else {
      newBoard[toRow][toCol] = piece;
    }
    newBoard[fromRow][fromCol] = null;

    // - CAPTURA AL PASO -
    if (moveData.enPassant) {
      const capturedRow = piece.color === 'white' ? toRow + 1 : toRow - 1;
      newBoard[capturedRow][toCol] = null;
    }

    // - ENROQUES -
    if (moveData.castling) {
      const row = piece.color === 'white' ? 7 : 0;
      if (moveData.castling === 'kingside') {
        newBoard[row][5] = newBoard[row][7]; newBoard[row][7] = null;
      } else if (moveData.castling === 'queenside') {
        newBoard[row][3] = newBoard[row][0]; newBoard[row][0] = null;
      }
    }

    // - ACTUALIZA ESTADO DE LOS ENROQUES -
    if (piece.type === 'king') {
      setCastlingRights(prev => ({
        ...prev,
        [piece.color + 'KingMoved']: true,
        [piece.color + 'RookKingsideMoved']: true,
        [piece.color + 'RookQueensideMoved']: true
      }));
    }
    if (piece.type === 'rook' && (fromCol === 0 || fromCol === 7)) {
      const side = fromCol === 7 ? 'RookKingsideMoved' : 'RookQueensideMoved';
      setCastlingRights(prev => ({ ...prev, [piece.color + side]: true }));
    }

    setBoard(newBoard);
    setLastMove({ from: { row: fromRow, col: fromCol }, to: { row: toRow, col: toCol }, piece, promotedTo, ...moveData });
    setCurrentTurn(prev => prev === 'white' ? 'black' : 'white');

    // - ACTUALIZA CONTADOR DE 50 MOVIMIENTOS -
    let newHalfMoveCounter = halfMoveCounter + 1;
    const isCapture = !!board[toRow][toCol] || moveData.enPassant; // Captura normal o en passant
    if (piece.type === 'pawn' || isCapture) {
      newHalfMoveCounter = 0;
    }
    setHalfMoveCounter(newHalfMoveCounter);

    // - ACTUALIZA HISTORIAL DE POSICIONES PARA REPETICIÓN -
    const positionKey = getPositionKey(newBoard, currentTurn, castlingRights, lastMove);
    const newPositionHistory = new Map(positionHistory);
    const count = (newPositionHistory.get(positionKey) || 0) + 1;
    newPositionHistory.set(positionKey, count);
    setPositionHistory(newPositionHistory);

    // - DETECTA JAQUE MATE, AHOGADO Y OTRAS TABLAS -
    const nextPlayer = piece.color === 'white' ? 'black' : 'white';
    const kingInCheck = isInCheck(newBoard, nextPlayer);
    const hasMoves = hasLegalMoves(newBoard, nextPlayer, lastMove, castlingRights);

    if (!hasMoves) {
      if (kingInCheck) {
        const winner = piece.color === 'white' ? 'BLANCAS' : 'NEGRAS';
        alert(`¡JAQUE MATE! Ganaron las ${winner}`);
        setGameOver(true);
        setGameResult(`Victoria para las ${winner} por jaque mate`);
        return;
      } else {
        alert("¡TABLAS por ahogado!");
        setGameOver(true);
        setGameResult("Tablas por ahogado");
        return;
      }
    }

    if (newHalfMoveCounter >= 100) {
      alert("¡TABLAS por regla de 50 movimientos!");
      setGameOver(true);
      setGameResult("Tablas por regla de 50 movimientos");
      return;
    }

    if (count >= 3) {
      alert("¡TABLAS por repetición de posición (3 veces)!");
      setGameOver(true);
      setGameResult("Tablas por repetición de posición");
      return;
    }

    if (isInsufficientMaterial(newBoard)) {
      alert("¡TABLAS por material insuficiente para dar mate!");
      setGameOver(true);
      setGameResult("Tablas por material insuficiente");
      return;
    }
  };

  // - PARA MOVER LA PIEZA, Y CONTEMPLA LAS PROMOCIONES -
  const movePiece = (fromRow, fromCol, toRow, toCol, moveData = {}) => {
    if (gameOver) return;
    const piece = board[fromRow][fromCol];
    if (piece.type === 'pawn' && (toRow === 0 || toRow === 7)) {
      setPromotionData({ fromRow, fromCol, toRow, toCol, pieceColor: piece.color, enPassant: !!moveData.enPassant });
      return;
    }
    executeMove(fromRow, fromCol, toRow, toCol, moveData);
  };

  // - DETERMINA EL MOVIMIENTO SEGUN LA PIEZA POR LA QUE SE QUIERA CAMBIAR EL PEON CORONADO -
  const handlePromotion = (type) => {
    if (gameOver) return;
    const { fromRow, fromCol, toRow, toCol, enPassant } = promotionData; 
    executeMove(fromRow, fromCol, toRow, toCol, { enPassant }, null, type);
    setPromotionData(null);
  };

  // - PARA REINICIAR LA PARTIDA -
  const resetGame = (playerColor = 'white') => {
    setBoard(createInitialBoard());
    setCurrentTurn(playerColor === 'white' ? 'white' : 'white');
    setLastMove(null);
    setMoveHistory([]);
    setCastlingRights({
      whiteKingMoved: false, blackKingMoved: false,
      whiteRookKingsideMoved: false, whiteRookQueensideMoved: false,
      blackRookKingsideMoved: false, blackRookQueensideMoved: false
    });
    setPromotionData(null);
    setHalfMoveCounter(0);
    setPositionHistory(new Map());
    setGameOver(false);
    setGameResult(null);
  };

  return {
    board,
    currentTurn,
    lastMove,
    moveHistory,
    promotionData,
    castlingRights,
    movePiece,
    handlePromotion,
    getLegalMoves: (row, col) => gameOver ? [] : getLegalMoves(row, col, board, currentTurn, lastMove, castlingRights),
    resetGame,
    gameOver,
    gameResult
  };
}