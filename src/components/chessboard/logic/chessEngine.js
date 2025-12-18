// chessEngine.js

import { useState, useEffect } from 'react';  // Añadido useEffect
import { getLegalMoves } from './legalMoves';
import { checkGameEnd, getPositionKey } from './finalSituations';

// --- CREA EL TABLERO INICIAL ---
const createInitialBoard = () => {
  const board = Array(8).fill(null).map(() => Array(8).fill(null));
  const backRow = ['rook', 'night', 'bishop', 'queen', 'king', 'bishop', 'night', 'rook'];
  board[0] = backRow.map(type => ({ type, color: 'black' }));
  board[1] = Array(8).fill({ type: 'pawn', color: 'black' });
  board[6] = Array(8).fill({ type: 'pawn', color: 'white' });
  board[7] = backRow.map(type => ({ type, color: 'white' }));
  return board;
};

// ---------- MOTOR PRINCIPAL DE AJEDREZ ----------
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

  // --- USEEFFECT PARA COMPROBAR FIN DE PARTIDA DESPUÉS DE ACTUALIZACIONES DE ESTADO (Y RENDER) ---
  useEffect(() => {
    if (!lastMove || gameOver) return; // Evita chequeo inicial o si ya terminó

    const previousPlayerColor = lastMove.piece.color;

    const end = checkGameEnd({
      board,
      currentTurn,
      lastMove,
      castlingRights,
      halfMoveCounter,
      positionHistory,
      previousPlayerColor
    });

    if (end.over) {
      alert(end.result);
      setGameOver(true);
      setGameResult(end.result);
    }
  }, [board, currentTurn, lastMove, castlingRights, halfMoveCounter, positionHistory, gameOver]);

  const executeMove = (fromRow, fromCol, toRow, toCol, moveData = {}, pieceOverride = null, promotedTo = null) => {
    if (gameOver) return;

    const newBoard = board.map(r => r.map(p => p ? { ...p } : null));
    const piece = pieceOverride || { ...newBoard[fromRow][fromCol] };

    // Promoción
    if (promotedTo) {
      newBoard[toRow][toCol] = { type: promotedTo, color: piece.color };
    } else {
      newBoard[toRow][toCol] = piece;
    }
    newBoard[fromRow][fromCol] = null;

    // Captura al paso
    if (moveData.enPassant) {
      const capturedRow = piece.color === 'white' ? toRow + 1 : toRow - 1;
      newBoard[capturedRow][toCol] = null;
    }

    // Enroque
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

    // Actualizar derechos de enroque
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

    // Aplicar cambios al estado
    setBoard(newBoard);
    setLastMove({ from: { row: fromRow, col: fromCol }, to: { row: toRow, col: toCol }, piece, promotedTo, ...moveData });
    setCurrentTurn(prev => prev === 'white' ? 'black' : 'white');

    // Actualizar contador de 50 movimientos
    let newHalfMoveCounter = halfMoveCounter + 1;
    const isCapture = !!board[toRow][toCol] || moveData.enPassant;
    if (piece.type === 'pawn' || isCapture) {
      newHalfMoveCounter = 0;
    }
    setHalfMoveCounter(newHalfMoveCounter);

    // Actualizar historial de posiciones
    const positionKey = getPositionKey(newBoard, currentTurn, castlingRights, lastMove);
    const newPositionHistory = new Map(positionHistory);
    const count = (newPositionHistory.get(positionKey) || 0) + 1;
    newPositionHistory.set(positionKey, count);
    setPositionHistory(newPositionHistory);

    // NOTA: La comprobación de fin de partida se movió al useEffect para que ocurra DESPUÉS del render
  };

  const movePiece = (fromRow, fromCol, toRow, toCol, moveData = {}) => {
    if (gameOver) return;
    const piece = board[fromRow][fromCol];
    if (piece.type === 'pawn' && (toRow === 0 || toRow === 7)) {
      setPromotionData({ fromRow, fromCol, toRow, toCol, pieceColor: piece.color, enPassant: !!moveData.enPassant });
      return;
    }
    executeMove(fromRow, fromCol, toRow, toCol, moveData);
  };

  const handlePromotion = (type) => {
    if (gameOver) return;
    const { fromRow, fromCol, toRow, toCol, enPassant } = promotionData;
    executeMove(fromRow, fromCol, toRow, toCol, { enPassant }, null, type);
    setPromotionData(null);
  };

  const resetGame = (playerColor = 'white') => {
    setBoard(createInitialBoard());
    setCurrentTurn(playerColor === 'white' ? 'white' : 'white');
    setLastMove(null);
    setMoveHistory([]);
    setCastlingRights({
      whiteKingMoved: false,
      blackKingMoved: false,
      whiteRookKingsideMoved: false,
      whiteRookQueensideMoved: false,
      blackRookKingsideMoved: false,
      blackRookQueensideMoved: false
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