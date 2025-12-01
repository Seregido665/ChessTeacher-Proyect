import { useState, useEffect } from 'react';
import Square from './Square';
import './board.css';

import { getPseudoLegalMoves } from './logic/moves';

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
  const [lastMove, setLastMove] = useState(null);

  // Mover pieza (incluye captura al paso)
  const movePiece = (fromRow, fromCol, toRow, toCol, enPassant = false) => {
    const newBoard = board.map(r => [...r]);
    const piece = newBoard[fromRow][fromCol];

    newBoard[toRow][toCol] = piece;
    newBoard[fromRow][fromCol] = null;

    if (enPassant) {
      const capturedRow = piece.color === 'white' ? toRow + 1 : toRow - 1;
      newBoard[capturedRow][toCol] = null;
    }

    setBoard(newBoard);
    setLastMove({
      from: { row: fromRow, col: fromCol },
      to: { row: toRow, col: toCol },
      piece,
      enPassant
    });
    setCurrentTurn(prev => prev === 'white' ? 'black' : 'white');
  };

  const handleSquareClick = (row, col) => {
    const piece = board[row][col];

    if (selectedSquare) {
      const { row: sR, col: sC } = selectedSquare;

      // Deseleccionar
      if (sR === row && sC === col) {
        setSelectedSquare(null);
        setLegalMoves([]);
        return;
      }

      // Intentar mover
      const validMove = legalMoves.find(m => m.row === row && m.col === col);
      if (validMove) {
        movePiece(sR, sC, row, col, !!validMove.enPassant);
        setSelectedSquare(null);
        setLegalMoves([]);
        return;
      }

      // Seleccionar nueva pieza del mismo color
      if (piece && piece.color === currentTurn) {
        setSelectedSquare({ row, col });
        setLegalMoves(getPseudoLegalMoves(row, col, board, lastMove));
        return;
      }

      // Cualquier otro click → deseleccionar
      setSelectedSquare(null);
      setLegalMoves([]);
    } else {
      // Primer click
      if (piece && piece.color === currentTurn) {
        setSelectedSquare({ row, col });
        setLegalMoves(getPseudoLegalMoves(row, col, board, lastMove));
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

  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']; // solo para render

  return (
    <div>
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