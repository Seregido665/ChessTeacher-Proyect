// boardInteractions.js
import { getLegalMoves } from './legalMoves'; // Asegúrate de que la ruta sea correcta

export const createInteractionHandlers = ({ gameStarted, aiThinking, promotionData, playerColor, board, movePiece,
  selectedSquare, setSelectedSquare, legalMoves, setLegalMoves, draggedSquare, setDraggedSquare, onMove }) => {
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

  // Convierte coordenadas visuales a coordenadas internas del tablero
  const getActualCoords = (row, col) => ({
    row: playerColor === 'white' ? row : 7 - row,
    col: playerColor === 'white' ? col : 7 - col
  });

  // HANDLE CLICK
  const handleSquareClick = (visualRow, visualCol) => {
    if (!gameStarted || aiThinking || promotionData) return;

    const { row: actualRow, col: actualCol } = getActualCoords(visualRow, visualCol);
    const piece = board[actualRow][actualCol];

    // No hay pieza seleccionada aún
    if (!selectedSquare) {
      if (piece && piece.color === playerColor) {
        setSelectedSquare({ row: actualRow, col: actualCol });
        setLegalMoves(getLegalMoves(actualRow, actualCol));
      }
      return;
    }

    const { row: fromRow, col: fromCol } = selectedSquare;

    // Click en la misma casilla → deseleccionar
    if (fromRow === actualRow && fromCol === actualCol) {
      setSelectedSquare(null);
      setLegalMoves([]);
      return;
    }

    // Intentar mover
    const validMove = legalMoves.find(m => m.row === actualRow && m.col === actualCol);

    if (validMove) {
      const notation = movePiece(fromRow, fromCol, actualRow, actualCol, validMove);
      if (notation && onMove) onMove(notation);
    }

    // Seleccionar otra pieza o limpiar selección
    if (piece && piece.color === playerColor) {
      setSelectedSquare({ row: actualRow, col: actualCol });
      setLegalMoves(getLegalMoves(actualRow, actualCol));
    } else {
      setSelectedSquare(null);
      setLegalMoves([]);
    }
  };

  // HANDLE DRAG START
  const handleDragStart = (e, visualRow, visualCol) => {
    if (!gameStarted || aiThinking || promotionData) {
      e.preventDefault();
      return;
    }

    const { row: actualRow, col: actualCol } = getActualCoords(visualRow, visualCol);
    const piece = board[actualRow][actualCol];

    if (!piece || piece.color !== playerColor) {
      e.preventDefault();
      return;
    }

    e.dataTransfer.setData("text/plain", "chess");
    e.dataTransfer.effectAllowed = "move";

    setDraggedSquare({ row: actualRow, col: actualCol });
    setSelectedSquare({ row: actualRow, col: actualCol });
    setLegalMoves(getLegalMoves(actualRow, actualCol));
  };

  // HANDLE DROP
  const handleDrop = (visualRow, visualCol) => {
    if (!draggedSquare) return;

    const { row: actualRow, col: actualCol } = getActualCoords(visualRow, visualCol);

    const validMove = legalMoves.find(m => m.row === actualRow && m.col === actualCol);

    if (validMove) {
      const notation = movePiece(draggedSquare.row, draggedSquare.col, actualRow, actualCol, validMove);
      if (notation && onMove) onMove(notation);
    }

    setDraggedSquare(null);
    setSelectedSquare(null);
    setLegalMoves([]);
  };

  // HIGHLIGHT LEGAL MOVES
  const highlightLegalMoves = () => {
    document.querySelectorAll('.square').forEach(sq =>
      sq.classList.remove('selected', 'legal-move', 'capture-move')
    );

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

      if (el) {
        el.classList.add('legal-move');
        if (board[move.row][move.col]) el.classList.add('capture-move');
      }
    });
  };

  return {
    handleSquareClick,
    handleDragStart,
    handleDrop,
    highlightLegalMoves
  };
};