import { useState, useEffect } from 'react';
import Square from './Square';
import PromotionSelector from "../promotion/promotion";
import useChessEngine from './logic/chessEngine';
import { getBestMove, getLegalMovesForAI, executeMoveCopy, evaluateBoard } from './logic/chessAI';
import { createInteractionHandlers } from './logic/handleClicks'; 
import './board.css';

const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

export default function Chessboard({ onMove, gameStarted, playerColor, aiThinking, setAiThinking, aiDepth, onEvaluationChange }) {
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [draggedSquare, setDraggedSquare] = useState(null);
  const [legalMoves, setLegalMoves] = useState([]);

  const { board, currentTurn, promotionData, movePiece, lastMove, castlingRights, handlePromotion } = useChessEngine();

  // Creamos los handlers de interacción
  const { handleSquareClick, handleDragStart, handleDrop, highlightLegalMoves } = 
    createInteractionHandlers({ gameStarted, aiThinking, promotionData, playerColor, board, movePiece, selectedSquare, setSelectedSquare, legalMoves, setLegalMoves, draggedSquare, setDraggedSquare, onMove });

  // EVALUACIÓN DEL TABLERO
  useEffect(() => {
    if (!onEvaluationChange) return;
    onEvaluationChange(gameStarted ? evaluateBoard(board) : 0);
  }, [board, gameStarted, onEvaluationChange]);

  // TURNO DE LA IA
  useEffect(() => {
    const aiColor = playerColor === 'white' ? 'black' : 'white';

    if (gameStarted && currentTurn === aiColor && !promotionData && !aiThinking) {
      setAiThinking(true);

      setTimeout(() => {
        const bestMove = getBestMove(
          board,
          aiColor,
          aiDepth,
          getLegalMovesForAI,
          executeMoveCopy
        );

        if (bestMove) {
          movePiece( bestMove.fromRow, bestMove.fromCol, bestMove.toRow, bestMove.toCol, bestMove.moveData,
            true
          );
        }

        setAiThinking(false);
      }, 50);
    }
  }, [currentTurn, gameStarted, board, promotionData, aiThinking, lastMove, castlingRights, movePiece, playerColor, aiDepth, onMove, setAiThinking]);

  // HIGHLIGHT LEGAL MOVES
  useEffect(() => {
    highlightLegalMoves();
  }, [highlightLegalMoves]);

  // ORIENTACIÓN DEL TABLERO
  const displayedBoard =
    playerColor === 'white'
      ? board
      : board.map(r => [...r].reverse()).reverse();

  // PROMOCIÓN
  const handlePromotionSelect = (type) => {
    const notation = handlePromotion(type);
    if (notation && onMove) onMove(notation);
  };

  // RENDER
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
                draggable={piece && piece.color === playerColor && gameStarted && !aiThinking}
                onClick={() => handleSquareClick(rowIndex, colIndex)}
                onDragStart={(e) => handleDragStart(e, rowIndex, colIndex)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(rowIndex, colIndex)}
              />
            );
          })}
        </div>
      ))}

      {promotionData && (
        <PromotionSelector
          color={promotionData.pieceColor}
          onSelect={handlePromotionSelect}
        />
      )}
    </div>
  );
}