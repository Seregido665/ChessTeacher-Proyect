import { useState, useEffect, useCallback } from 'react';
import Square from './Square';
import useChessEngine from './logic/chessEngine';
import { getBestMove } from './logic/chessAI';
import { getLegalMovesForAI, executeMoveCopy } from './logic/chessEngine';
import './board.css';

const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

export default function Chessboard({gameStarted, playerColor, aiThinking, setAiThinking, aiDepth }) {
  const {
    board,
    currentTurn,
    promotionData,
    movePiece,
    getLegalMoves,
    lastMove,
    castlingRights
  } = useChessEngine();

  const [selectedSquare, setSelectedSquare] = useState(null);
  const [legalMoves, setLegalMoves] = useState([]);
  //onst playerColor = 'white';

  // IA juega cuando es su turno
useEffect(() => {
  const aiColor = playerColor === 'white' ? 'black' : 'white';
  if (gameStarted && playerColor === 'black' && currentTurn === aiColor && !promotionData && !aiThinking) {
    
      setAiThinking(true);

      setTimeout(() => {
        const bestMove = getBestMove(
          board,
          'white',
          aiDepth,
          (row, col, boardCopy) => getLegalMovesForAI(row, col, boardCopy, lastMove, castlingRights),
          executeMoveCopy
        );

        if (bestMove) {
          movePiece(bestMove.fromRow, bestMove.fromCol, bestMove.toRow, bestMove.toCol, bestMove.moveData);
        }
        setAiThinking(false);
      }, 600);
    }
  }, [currentTurn, gameStarted, board, promotionData, aiThinking, lastMove, castlingRights, movePiece, setAiThinking, playerColor, aiDepth]);

  const handleSquareClick = (row, col) => {
    if (!gameStarted || aiThinking) return;

    const actualRow = playerColor === 'white' ? row : 7 - row;
    const actualCol = playerColor === 'white' ? col : 7 - col;

    const piece = board[actualRow][actualCol];

    if (!selectedSquare) {
      if (piece && piece.color === playerColor) {
        setSelectedSquare({ row: actualRow, col: actualCol });
        setLegalMoves(getLegalMoves(actualRow, actualCol));
      }
      return;
    }

    const { row: fromRow, col: fromCol } = selectedSquare;
    if (fromRow === actualRow && fromCol === actualCol) {
      setSelectedSquare(null);
      setLegalMoves([]);
      return;
    }

    const validMove = legalMoves.find(m => m.row === actualRow && m.col === actualCol);
    if (validMove) {
      movePiece(fromRow, fromCol, actualRow, actualCol, validMove);
      setSelectedSquare(null);
      setLegalMoves([]);
      return;
    }

    if (piece && piece.color === playerColor) {
      setSelectedSquare({ row: actualRow, col: actualCol });
      setLegalMoves(getLegalMoves(actualRow, actualCol));
    } else {
      setSelectedSquare(null);
      setLegalMoves([]);
    }
  };

  const highlightLegalMoves = useCallback(() => {
  document.querySelectorAll('.square').forEach(sq => {
    sq.classList.remove('selected', 'legal-move', 'capture-move');
  });

  if (!selectedSquare) return;

  // Convertimos selectedSquare (real indices) a indices visuales
  const visualRow = playerColor === 'white' ? selectedSquare.row : 7 - selectedSquare.row;
  const visualCol = playerColor === 'white' ? selectedSquare.col : 7 - selectedSquare.col;

  const fromNotation = `${files[visualCol]}${8 - visualRow}`;
  const selectedEl = document.querySelector(`[data-notation="${fromNotation}"]`);
  if (selectedEl) selectedEl.classList.add('selected');

  legalMoves.forEach(move => {
    const visualMoveRow = playerColor === 'white' ? move.row : 7 - move.row;
    const visualMoveCol = playerColor === 'white' ? move.col : 7 - move.col;

    const toNotation = `${files[visualMoveCol]}${8 - visualMoveRow}`;
    const el = document.querySelector(`[data-notation="${toNotation}"]`);
    if (el) {
      el.classList.add('legal-move');
      if (board[move.row][move.col]) el.classList.add('capture-move');
    }
  });
}, [selectedSquare, legalMoves, board, playerColor]);


  useEffect(() => {
    highlightLegalMoves();
  }, [highlightLegalMoves]);

  const displayedBoard = playerColor === 'white' ? board : board.map(row => [...row].reverse()).reverse();


return (
  <div className="chessboard">
    {displayedBoard.map((row, rowIndex) => (
      <div key={rowIndex} className="board-row">
        {row.map((piece, colIndex) => {
          const notation = `${files[colIndex]}${8 - rowIndex}`;
          return (
            <Square
              key={notation}
              piece={piece}
              isLight={(rowIndex + colIndex) % 2 === 0}
              notation={notation}
              onClick={() => handleSquareClick(rowIndex, colIndex)}
            />
          );
        })}
      </div>
    ))}
  </div>
);

}