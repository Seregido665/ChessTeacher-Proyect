// board.jsx

import { useState, useEffect, useCallback } from 'react';
import Square from './Square';
import PromotionSelector from "../promotion/promotion";
import useChessEngine from './logic/chessEngine';
import { getBestMove, getLegalMovesForAI, executeMoveCopy, evaluateBoard } from './logic/chessAI';
import './board.css';

const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

export default function Chessboard({ onMove, gameStarted, playerColor, aiThinking, setAiThinking, aiDepth, onEvaluationChange }) {
  const {
    board, currentTurn, promotionData,
    movePiece, getLegalMoves, lastMove, castlingRights,
    handlePromotion
  } = useChessEngine();

  const [selectedSquare, setSelectedSquare] = useState(null);
  const [legalMoves, setLegalMoves] = useState([]);

  // --- CALCULA EVALUACIÓN ---
  useEffect(() => {
    if (gameStarted && onEvaluationChange) onEvaluationChange(evaluateBoard(board));
    else if (!gameStarted && onEvaluationChange) onEvaluationChange(0);
  }, [board, gameStarted, onEvaluationChange]);

  // --- TURNO IA ---
  useEffect(() => {
    const aiColor = playerColor === 'white' ? 'black' : 'white';
    if (gameStarted && currentTurn === aiColor && !promotionData && !aiThinking) {
      setAiThinking(true);

      setTimeout(() => {
        const bestMove = getBestMove(board, aiColor, aiDepth, (r, c, b) => getLegalMovesForAI(r, c, b, lastMove, castlingRights), executeMoveCopy);
        if (bestMove) {
          const notation = movePiece(bestMove.fromRow, bestMove.fromCol, bestMove.toRow, bestMove.toCol, bestMove.moveData, true);
          if (notation && onMove) onMove(notation);
        }
        setAiThinking(false);
      }, 1000);
    }
  }, [currentTurn, gameStarted, board, promotionData, aiThinking, lastMove, castlingRights, movePiece, playerColor, aiDepth, onMove]);

  // --- CLICK EN CASILLAS ---
  const handleSquareClick = (row, col) => {
    if (!gameStarted || aiThinking || promotionData) return;

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
      setSelectedSquare(null); setLegalMoves([]);
      return;
    }

    const validMove = legalMoves.find(m => m.row === actualRow && m.col === actualCol);
    if (validMove) {
      const notation = movePiece(fromRow, fromCol, actualRow, actualCol, validMove);
      if (notation && onMove) onMove(notation);
    }

    if (piece && piece.color === playerColor) {
      setSelectedSquare({ row: actualRow, col: actualCol });
      setLegalMoves(getLegalMoves(actualRow, actualCol));
    } else setSelectedSquare(null); setLegalMoves([]);
  };

  const highlightLegalMoves = useCallback(() => {
    document.querySelectorAll('.square').forEach(sq => sq.classList.remove('selected','legal-move','capture-move'));
    if (!selectedSquare) return;

    const visualRow = playerColor === 'white' ? selectedSquare.row : 7 - selectedSquare.row;
    const visualCol = playerColor === 'white' ? selectedSquare.col : 7 - selectedSquare.col;
    const fromNotation = `${files[visualCol]}${8 - visualRow}`;
    const selectedEl = document.querySelector(`[data-notation="${fromNotation}"]`);
    if (selectedEl) selectedEl.classList.add('selected');

    legalMoves.forEach(move => {
      const vr = playerColor === 'white' ? move.row : 7 - move.row;
      const vc = playerColor === 'white' ? move.col : 7 - move.col;
      const toNotation = `${files[vc]}${8 - vr}`;
      const el = document.querySelector(`[data-notation="${toNotation}"]`);
      if (el) { el.classList.add('legal-move'); if (board[move.row][move.col]) el.classList.add('capture-move'); }
    });
  }, [selectedSquare, legalMoves, board, playerColor]);

  useEffect(() => { highlightLegalMoves(); }, [highlightLegalMoves]);

  const displayedBoard = playerColor === 'white' ? board : board.map(r => [...r].reverse()).reverse();

  const handlePromotionSelect = (type) => {
    const notation = handlePromotion(type);
    if (notation && onMove) onMove(notation);
  };

  return (
    <div className="chessboard">
      {displayedBoard.map((row, rowIndex) => (
        <div key={rowIndex} className="board-row">
          {row.map((piece, colIndex) => {
            const notation = `${files[colIndex]}${8 - rowIndex}`;
            return <Square key={notation} piece={piece} isLight={(rowIndex + colIndex) % 2 === 0} notation={notation} onClick={() => handleSquareClick(rowIndex, colIndex)} />;
          })}
        </div>
      ))}

      {promotionData && <PromotionSelector color={promotionData.pieceColor} onSelect={handlePromotionSelect} />}
    </div>
  );
}