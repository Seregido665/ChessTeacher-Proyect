import { useState, useEffect, useCallback } from 'react';
import Square from './Square';
import useChessEngine from './logic/chessEngine';
import { getBestMove } from './logic/chessAI';
import { getLegalMovesForAI, executeMoveCopy } from './logic/chessEngine';
import './board.css';

const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const AI_DEPTH = 3;

export default function Chessboard({gameStarted, aiThinking, setAiThinking /*onGameStart, onGameReset*/ }) {
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
  const playerColor = 'white';

  // IA juega cuando es su turno
  useEffect(() => {
    if (gameStarted && currentTurn === 'black' && !promotionData && !aiThinking) {
      setAiThinking(true);

      setTimeout(() => {
        const bestMove = getBestMove(
          board,
          'black',
          AI_DEPTH,
          (row, col, boardCopy) => getLegalMovesForAI(row, col, boardCopy, lastMove, castlingRights),
          executeMoveCopy
        );

        if (bestMove) {
          movePiece(bestMove.fromRow, bestMove.fromCol, bestMove.toRow, bestMove.toCol, bestMove.moveData);
        }
        setAiThinking(false);
      }, 600);
    }
  }, [currentTurn, gameStarted, board, promotionData, aiThinking, lastMove, castlingRights, movePiece, setAiThinking]);

  const handleSquareClick = (row, col) => {
    if (!gameStarted || aiThinking || currentTurn !== playerColor) return;

    const piece = board[row][col];

    if (!selectedSquare) {
      if (piece && piece.color === currentTurn) {
        setSelectedSquare({ row, col });
        setLegalMoves(getLegalMoves(row, col));
      }
      return;
    }

    const { row: fromRow, col: fromCol } = selectedSquare;
    if (fromRow === row && fromCol === col) {
      setSelectedSquare(null);
      setLegalMoves([]);
      return;
    }

    const validMove = legalMoves.find(m => m.row === row && m.col === col);
    if (validMove) {
      movePiece(fromRow, fromCol, row, col, validMove);
      setSelectedSquare(null);
      setLegalMoves([]);
      return;
    }

    if (piece && piece.color === currentTurn) {
      setSelectedSquare({ row, col });
      setLegalMoves(getLegalMoves(row, col));
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

    const fromNotation = `${files[selectedSquare.col]}${8 - selectedSquare.row}`;
    const selectedEl = document.querySelector(`[data-notation="${fromNotation}"]`);
    if (selectedEl) selectedEl.classList.add('selected');

    legalMoves.forEach(move => {
      const toNotation = `${files[move.col]}${8 - move.row}`;
      const el = document.querySelector(`[data-notation="${toNotation}"]`);
      if (el) {
        el.classList.add('legal-move');
        if (board[move.row][move.col]) el.classList.add('capture-move');
      }
    });
  }, [selectedSquare, legalMoves, board]);

  useEffect(() => {
    highlightLegalMoves();
  }, [highlightLegalMoves]);

  return (
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
  );
}