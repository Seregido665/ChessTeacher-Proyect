import { useState, useEffect } from 'react';
import Square from './square';
import './board.css';

const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

// --- GENERAR EL TABLERO ---
const createInitialBoard = () => {
  const board = Array(8).fill(null).map(() => Array(8).fill(null));

  const backRow = ['rook', 'night', 'bishop', 'queen', 'king', 'bishop', 'night', 'rook'];
  board[0] = backRow.map(type => ({ type, color: 'black' }));
  board[1] = Array(8).fill({ type: 'pawn', color: 'black' });
  board[6] = Array(8).fill({ type: 'pawn', color: 'white' });
  board[7] = backRow.map(type => ({ type, color: 'white' }));

  return board;
};

export default function Chessboard() {
  const [board, setBoard] = useState(createInitialBoard());
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [legalMoves, setLegalMoves] = useState([]);
  const [currentTurn, setCurrentTurn] = useState('white');
  const [lastMove, setLastMove] = useState(null); // Necesario para captura al paso



  // --- UTILIDAD ---> PREGUNTAR A CHATGPT
  const isInsideBoard = (r, c) => r >= 0 && r < 8 && c >= 0 && c < 8;


  
  // --- MOVIMIENTOS ---
  // -- PEON --
  const getPawnPseudoMoves = (row, col, color) => {
    const moves = [];
    const direction = color === 'white' ? -1 : 1;
    const startRow = color === 'white' ? 6 : 1;

    // --> Avance simple
    const nextRow = row + direction;
    if (isInsideBoard(nextRow, col) && !board[nextRow][col]) {
      moves.push({ row: nextRow, col });

      // --> Avance doble desde inicio
      if (row === startRow) {
        const doubleRow = row + 2 * direction;
        if (!board[doubleRow][col]) {
          moves.push({ row: doubleRow, col });
        }
      }
    }
    
    [-1, 1].forEach(offset => {     // Capturas diagonales + al paso
      const cCol = col + offset;
      const cRow = row + direction;
      if (!isInsideBoard(cRow, cCol)) return;

      const target = board[cRow][cCol];
      if (target && target.color !== color) {
        moves.push({ row: cRow, col: cCol });
      }

      if (                  // Captura al paso
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

  // -- CABALLO --
  const getKnightPseudoMoves = (row, col, color) => {
    const moves = [];
    const offsets = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
    offsets.forEach(([dr, dc]) => {
      const r = row + dr, c = col + dc;
      if (isInsideBoard(r, c)) {
        const target = board[r][c];
        if (!target || target.color !== color) {
          moves.push({ row: r, col: c });
        }
      }
    });
    return moves;
  };

  // -- TORRE --
  const getRookPseudoMoves = (row, col, color) => {
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

  // -- ALFIL --
  const getBishopPseudoMoves = (row, col, color) => {
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

  // -- REINA --> Torre + Alfil
  const getQueenPseudoMoves = (row, col, color) => {
    return getRookPseudoMoves(row, col, color).concat(getBishopPseudoMoves(row, col, color));
  };

  // -- REY --
  const getKingPseudoMoves = (row, col, color) => {
    const moves = [];
    const offsets = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
    offsets.forEach(([dr, dc]) => {
      const r = row + dr;
      const c = col + dc;
      if (isInsideBoard(r, c)) {
        const target = board[r][c];
        if (!target || target.color !== color) {
          moves.push({ row: r, col: c });
        }
      }
    });
    return moves;
  };

  // --- GESTOR DE MOVIMIENTOS ---
  const getPseudoLegalMoves = (row, col) => {
    const piece = board[row][col];
    if (!piece) return [];

    switch (piece.type) {
      case 'pawn':   return getPawnPseudoMoves(row, col, piece.color);
      case 'knight': return getKnightPseudoMoves(row, col, piece.color);
      case 'rook':   return getRookPseudoMoves(row, col, piece.color);
      case 'bishop': return getBishopPseudoMoves(row, col, piece.color);
      case 'queen':  return getQueenPseudoMoves(row, col, piece.color);
      case 'king':   return getKingPseudoMoves(row, col, piece.color);
      default:       return [];
    }
  };

  // Movimientos legales (sin jaque aún)
  const getLegalMoves = (row, col) => {
    const piece = board[row][col];
    if (!piece || piece.color !== currentTurn) return [];
    return getPseudoLegalMoves(row, col);
  };

  // Mover pieza
  const movePiece = (fromRow, fromCol, toRow, toCol, enPassant = false) => {
    const newBoard = board.map(r => [...r]);
    const piece = newBoard[fromRow][fromCol];

    newBoard[toRow][toCol] = piece;
    newBoard[fromRow][fromCol] = null;

    // Captura al paso
    if (enPassant) {
      const capturedRow = piece.color === 'white' ? toRow + 1 : toRow - 1;
      newBoard[capturedRow][toCol] = null;
    }

    setBoard(newBoard);
    setLastMove({
      from: { row: fromRow, col: fromCol },
      to: { row: toRow, col: toCol },
      piece: { type: piece.type, color: piece.color },
      enPassant
    });
    setCurrentTurn(prev => prev === 'white' ? 'black' : 'white');
  };

  // --- GESTOR DE LA SELECCION ---
  const handleSquareClick = (row, col) => {
    const piece = board[row][col];
    const notation = `${files[col]}${8 - row}`;

    if (piece) {
      console.log(`${notation} → ${piece.color} ${piece.type}`);
    } else {
      console.log(`${notation}`);
    }

    if (selectedSquare) {
      const { row: sR, col: sC } = selectedSquare;

      if (sR === row && sC === col) {
        setSelectedSquare(null);
        setLegalMoves([]);
        return;
      }

      const validMove = legalMoves.find(m => m.row === row && m.col === col);
      if (validMove) {
        movePiece(sR, sC, row, col, !!validMove.enPassant);
        setSelectedSquare(null);
        setLegalMoves([]);
        return;
      }

      if (piece && piece.color === currentTurn) {
        setSelectedSquare({ row, col });
        setLegalMoves(getLegalMoves(row, col));
        return;
      }

      setSelectedSquare(null);
      setLegalMoves([]);
    } else {
      if (piece && piece.color === currentTurn) {
        setSelectedSquare({ row, col });
        setLegalMoves(getLegalMoves(row, col));
      }
    }
  };

  // Resaltado visual
  useEffect(() => {
    document.querySelectorAll('.square').forEach(sq => {
      sq.classList.remove('selected', 'legal-move', 'capture-move');
    });

    if (!selectedSquare) return;

    const selNot = `${files[selectedSquare.col]}${8 - selectedSquare.row}`;
    document.querySelector(`[data-notation="${selNot}"]`)?.classList.add('selected');

    legalMoves.forEach(move => {
      const not = `${files[move.col]}${8 - move.row}`;
      const el = document.querySelector(`[data-notation="${not}"]`);
      if (el) {
        el.classList.add('legal-move');
        if (board[move.row][move.col]) el.classList.add('capture-move');
      }
    });
  }, [selectedSquare, legalMoves, board]);

  return (
    <div className="chessboard-container">
      <div className="chessboard">
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className="board-row">
            {row.map((piece, colIndex) => {
              const isLight = (rowIndex + colIndex) % 2 === 0;
              const notation = `${files[colIndex]}${8 - rowIndex}`;

              return (
                <Square
                  key={notation}
                  piece={piece}
                  isLight={isLight}
                  notation={notation}
                  onClick={() => handleSquareClick(rowIndex, colIndex)}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}