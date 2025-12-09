import { useState } from 'react';
import { hasLegalMoves, isInCheck } from './checks';
import { getLegalMoves } from './legalMoves';
import { coordinates } from './boardUtils';


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

  // -- CONTROLA Y TODO LO RELACIONADO CON MOVER PIEZAS --
  const executeMove = (fromRow, fromCol, toRow, toCol, moveData = {}, pieceOverride = null, promotedTo = null) => {
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

    // - DETECTA JAQUE MATE Y AHOGADO -
    const nextPlayer = piece.color === 'white' ? 'black' : 'white';
    const kingInCheck = isInCheck(newBoard, nextPlayer);
    const hasMoves = hasLegalMoves(newBoard, nextPlayer, lastMove, castlingRights);
    if (!hasMoves) {
      if (kingInCheck) {
        alert(`¡JAQUE MATE! Ganaron las ${piece.color === 'white' ? 'BLANCAS' : 'NEGRAS'}`);
      } else {
        alert("¡TABLAS por ahogado!");
      }
    }

    // - NOTACION DE LOS MOVIMIENTOS -
    const fromNotation = coordinates(fromRow, fromCol);
    const toNotation = coordinates(toRow, toCol);
    let notation = '';
    if (moveData.enPassant) notation = `${fromNotation}x${toNotation} e.p.`;
    else if (moveData.castling) notation = moveData.castling === 'kingside' ? 'O-O' : 'O-O-O';
    else if (promotedTo) {
      const symbol = promotedTo === 'queen' ? 'D' : promotedTo === 'rook' ? 'T' : promotedTo === 'bishop' ? 'A' : 'C';
      notation = `${fromNotation} → ${toNotation} = ${symbol}`;
    } else notation = `${fromNotation} → ${toNotation}`;

    setMoveHistory(prev => [...prev, notation]);
  };

  // - PARA MOVER LA PIEZA, Y CONTEMPLA LAS PROMOCIONES -
  const movePiece = (fromRow, fromCol, toRow, toCol, moveData = {}) => {
    const piece = board[fromRow][fromCol];
    if (piece.type === 'pawn' && (toRow === 0 || toRow === 7)) {
      setPromotionData({ fromRow, fromCol, toRow, toCol, pieceColor: piece.color, enPassant: !!moveData.enPassant });
      return;
    }
    executeMove(fromRow, fromCol, toRow, toCol, moveData);
  };

  // - DETERMINA EL MOVIMIENTO SEGUN LA PIEZA POR LA QUE SE QUIERA CAMBIAR EL PEON CORONADO -
  const handlePromotion = (type) => {
    const { fromRow, fromCol, toRow, toCol, enPassant } = promotionData; 
    executeMove(fromRow, fromCol, toRow, toCol, { enPassant }, null, type);
    setPromotionData(null);
  };

  // - PARA REINICIAR LA PARTIDA -
  const resetGame = () => {
    setBoard(createInitialBoard());
    setCurrentTurn('white');
    setLastMove(null);
    setMoveHistory([]);
    setCastlingRights({
      whiteKingMoved: false, blackKingMoved: false,
      whiteRookKingsideMoved: false, whiteRookQueensideMoved: false,
      blackRookKingsideMoved: false, blackRookQueensideMoved: false
    });
    setPromotionData(null);
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
    getLegalMoves: (row, col) => getLegalMoves(row, col, board, currentTurn, lastMove, castlingRights),
    resetGame
  };
}






// --- FUNCIONES AUXILIARES PARA LA IA ---
// Copia del tablero para simulaciones
export const copyBoard = (board) => {
  return board.map(row => row.map(piece => piece ? { ...piece } : null));
};

// Ejecuta un movimiento en una copia del tablero (sin cambiar el estado)
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