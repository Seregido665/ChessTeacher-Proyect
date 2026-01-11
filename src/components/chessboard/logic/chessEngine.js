// useChessEngine.js
import { useState } from 'react';
import {
  createInitialBoard,
  getPositionKey,
  isInsufficientMaterial,
  hasLegalMoves,
  isInCheck,
  toAlgebraicNotation,
  evaluateBoard // ← Importamos evaluateBoard aquí
} from './rules';
import { getLegalMoves } from './legalMoves';

// --- PROMOCIÓN AUTOMÁTICA PARA LA IA (la movemos aquí porque necesita evaluateBoard) ---
const autoPromotionForAI = (board, toRow, toCol, color) => {
  const options = ['queen', 'rook', 'bishop', 'knight'];
  let bestValue = color === 'white' ? -Infinity : Infinity;
  let bestPiece = 'queen';

  for (const pieceType of options) {
    const testBoard = board.map(r => r.map(p => p ? { ...p } : null));
    testBoard[toRow][toCol] = { type: pieceType, color };
    const value = evaluateBoard(testBoard);
    if (color === 'white' ? value > bestValue : value < bestValue) {
      bestValue = value;
      bestPiece = pieceType;
    }
  }
  return bestPiece;
};

export default function useChessEngine() {
  const [board, setBoard] = useState(createInitialBoard());
  const [currentTurn, setCurrentTurn] = useState('white');
  const [lastMove, setLastMove] = useState(null);
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

  // --- EJECUTA UN MOVIMIENTO ---
  const executeMove = (fromRow, fromCol, toRow, toCol, moveData = {}, pieceOverride = null, promotedTo = null) => {
    if (gameOver) return;

    const newBoard = board.map(r => r.map(p => p ? { ...p } : null));
    const piece = pieceOverride || { ...newBoard[fromRow][fromCol] };

    // PROMOCIÓN
    if (promotedTo) newBoard[toRow][toCol] = { type: promotedTo, color: piece.color };
    else newBoard[toRow][toCol] = piece;

    newBoard[fromRow][fromCol] = null;

    // CAPTURA AL PASO
    if (moveData.enPassant) {
      const capturedRow = piece.color === 'white' ? toRow + 1 : toRow - 1;
      newBoard[capturedRow][toCol] = null;
    }

    // ENROQUES
    if (moveData.castling) {
      const row = piece.color === 'white' ? 7 : 0;
      if (moveData.castling === 'kingside') {
        newBoard[row][5] = newBoard[row][7];
        newBoard[row][7] = null;
      }
      if (moveData.castling === 'queenside') {
        newBoard[row][3] = newBoard[row][0];
        newBoard[row][0] = null;
      }
    }

    // ACTUALIZA DERECHOS DE ENROQUE
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

    // CONTADOR 50 MOVIMIENTOS
    let newHalfMoveCounter = halfMoveCounter + 1;
    const isCapture = !!board[toRow][toCol] || moveData.enPassant;
    if (piece.type === 'pawn' || isCapture) newHalfMoveCounter = 0;
    setHalfMoveCounter(newHalfMoveCounter);

    // HISTORIAL DE POSICIONES
    const positionKey = getPositionKey(newBoard, currentTurn, castlingRights, lastMove);
    const newPositionHistory = new Map(positionHistory);
    const count = (newPositionHistory.get(positionKey) || 0) + 1;
    newPositionHistory.set(positionKey, count);
    setPositionHistory(newPositionHistory);

    // JAQUE MATE / AHOGADO / TABLAS
    const nextPlayer = piece.color === 'white' ? 'black' : 'white';
    const kingInCheck = isInCheck(newBoard, nextPlayer);
    const hasMoves = hasLegalMoves(newBoard, nextPlayer, lastMove, castlingRights);

    if (!hasMoves) {
      if (kingInCheck) {
        alert(`¡JAQUE MATE! Ganaron las ${piece.color === 'white' ? 'BLANCAS' : 'NEGRAS'}`);
        setGameOver(true);
        setGameResult(`Victoria para las ${piece.color === 'white' ? 'BLANCAS' : 'NEGRAS'}`);
      } else {
        alert("¡TABLAS por ahogado!");
        setGameOver(true);
        setGameResult("Tablas por ahogado");
      }
      return;
    }

    if (newHalfMoveCounter >= 100) {
      alert("¡TABLAS por regla de 50 movimientos!");
      setGameOver(true);
      setGameResult("Tablas por regla de 50 movimientos");
      return;
    }

    if (count >= 3) {
      alert("¡TABLAS por repetición!");
      setGameOver(true);
      setGameResult("Tablas por repetición");
      return;
    }

    if (isInsufficientMaterial(newBoard)) {
      alert("¡TABLAS por material insuficiente!");
      setGameOver(true);
      setGameResult("Tablas por material insuficiente");
      return;
    }
  };

  // --- MOVER PIEZA (HUMANO O IA) ---
  const movePiece = (fromRow, fromCol, toRow, toCol, moveData = {}, isAI = false) => {
    if (gameOver) return null;
    const piece = board[fromRow][fromCol];

    let promotedTo = null;

    if (piece.type === 'pawn' && (toRow === 0 || toRow === 7)) {
      if (isAI) {
        promotedTo = autoPromotionForAI(board, toRow, toCol, piece.color);
      } else {
        setPromotionData({ fromRow, fromCol, toRow, toCol, pieceColor: piece.color, enPassant: !!moveData.enPassant });
        return null;
      }
    }

    executeMove(fromRow, fromCol, toRow, toCol, moveData, null, promotedTo);

    const moveInfo = {
      fromRow,
      fromCol,
      toRow,
      toCol,
      from: { row: fromRow, col: fromCol },
      to: { row: toRow, col: toCol },
      moveData: { promotion: promotedTo }
    };
    const pieceMoved = { type: piece.type, color: piece.color };
    if (promotedTo) pieceMoved.type = promotedTo;

    return toAlgebraicNotation(board, moveInfo, pieceMoved);
  };

  // --- PROMOCIÓN MANUAL ---
  const handlePromotion = (type) => {
    if (!promotionData || gameOver) return null;
    const { fromRow, fromCol, toRow, toCol, enPassant } = promotionData;

    executeMove(fromRow, fromCol, toRow, toCol, { enPassant }, null, type);
    setPromotionData(null);

    const moveInfo = {
      fromRow,
      fromCol,
      toRow,
      toCol,
      from: { row: fromRow, col: fromCol },
      to: { row: toRow, col: toCol },
      moveData: { promotion: type }
    };
    const promotedPiece = { type, color: promotionData.pieceColor };

    return toAlgebraicNotation(board, moveInfo, promotedPiece);
  };

  const resetGame = () => {
    setBoard(createInitialBoard());
    setCurrentTurn('white');
    setLastMove(null);
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
    promotionData,
    castlingRights,
    movePiece,
    handlePromotion,
    getLegalMoves: (row, col) => gameOver ? [] : getLegalMoves(row, col, board, board[row][col]?.color || 'white', lastMove, castlingRights),
    resetGame,
    gameOver,
    gameResult
  };
}