// QUE EL TABLERO PUEDA GIRARSE SI EL JUGADOS ES NEGRAS.
// QUE LA NOTACION SEA LA OFICIAL DE LAS PARTIDAS DE AJEDREZ: Nf3, exd5, 0-0...
// HISTORIAL DE MOVIIENTOS Y NUMERACION
// RESALTAR CASILLA DEL REY SI ESTA EN JAQUE.
// PREMOVER, ARRASTRAR PIEZA EN VEZ DE click-click
// MOSTRAR PIEZAS CAPTURADAS
// REGLA DE 50 JUGADAS SIN CAPTURA/MOVERPEON --> TABLAS
// TRIPLE REPETICION DE JUGADAS --> TABLAS
// MATERIAL INSUFICIENTE (SOLO REYES) --> TABLAS
// EXPORTAR PGN


import { useState, useEffect } from 'react';
import Square from './Square';
import './board.css';
import { getLegalMoves, coordinates, hasLegalMoves, isInCheck } from './logic/moves';

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
  const [moveHistory, setMoveHistory] = useState([]);
  const [castlingRights, setCastlingRights] = useState({
    whiteKingMoved: false,
    blackKingMoved: false,
    whiteRookKingsideMoved: false,
    whiteRookQueensideMoved: false,
    blackRookKingsideMoved: false,
    blackRookQueensideMoved: false
  });

  // Estado para la promoción
  const [promotionData, setPromotionData] = useState(null);
  // { fromRow, fromCol, toRow, toCol, pieceColor, enPassant }

  // === MOVER PIEZA (NORMAL O CON PROMOCIÓN) ===
  const movePiece = (fromRow, fromCol, toRow, toCol, moveData = {}) => {
    const piece = board[fromRow][fromCol];

    // DETECTAR PROMOCIÓN
    if (piece.type === 'pawn' && (toRow === 0 || toRow === 7)) {
      setPromotionData({
        fromRow,
        fromCol,
        toRow,
        toCol,
        pieceColor: piece.color,
        enPassant: !!moveData.enPassant
      });
      return; // No hacemos el movimiento aún
    }

    // Si no es promoción → movimiento normal
    executeMove(fromRow, fromCol, toRow, toCol, moveData, piece);
  };

  // === FUNCIÓN QUE EJECUTA EL MOVIMIENTO (usada también por promoción) ===
  const executeMove = (fromRow, fromCol, toRow, toCol, moveData = {}, pieceOverride = null, promotedTo = null) => {
    const newBoard = board.map(r => r.map(p => p ? { ...p } : null));
    const piece = pieceOverride || { ...newBoard[fromRow][fromCol] };

    // Promoción (si viene promotedTo)
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

    // Aplicar tablero
    setBoard(newBoard);
    setLastMove({
      from: { row: fromRow, col: fromCol },
      to: { row: toRow, col: toCol },
      piece,
      promotedTo,
      ...moveData
    });
    setCurrentTurn(prev => prev === 'white' ? 'black' : 'white');

    // === DETECCIÓN DE JAQUE MATE / AHOGADO ===
    const nextPlayer = piece.color === 'white' ? 'black' : 'white';
    const kingInCheck = isInCheck(newBoard, nextPlayer);
    const hasMoves = hasLegalMoves(newBoard, nextPlayer, lastMove, castlingRights);

    if (!hasMoves) {
      if (kingInCheck) {
        alert(`¡JAQUE MATE! Ganaron las ${piece.color === 'white' ? 'BLANCAS' : 'NEGRAS'}`);
      } else {
        alert("¡TABLAS por ahogado!");
      }
    } else if (kingInCheck) {
      // alert(`¡Jaque al rey ${nextPlayer}!`);
    }

    // Historial bonito
    const fromNotation = coordinates(fromRow, fromCol);
    const toNotation = coordinates(toRow, toCol);
    let notation = '';
    if (moveData.enPassant) {
      notation = `${fromNotation}x${toNotation} e.p.`;
    } else if (moveData.castling) {
      notation = moveData.castling === 'kingside' ? 'O-O' : 'O-O-O';
    } else if (promotedTo) {
      const symbol = promotedTo === 'queen' ? 'D' : promotedTo === 'rook' ? 'T' : promotedTo === 'bishop' ? 'A' : 'C';
      notation = `${fromNotation} → ${toNotation} = ${symbol}`;
    } else {
      notation = `${fromNotation} → ${toNotation}`;
    }
    setMoveHistory(prev => [...prev, notation]);
  };

  // === PROMOCIÓN: ELEGIR PIEZA ===
  const handlePromotion = (type) => {
    const { fromRow, fromCol, toRow, toCol, pieceColor, enPassant } = promotionData;
    executeMove(fromRow, fromCol, toRow, toCol, { enPassant }, null, type);
    setPromotionData(null);
  };

  // === CLICK EN CASILLA ===
  const handleSquareClick = (row, col) => {
    const piece = board[row][col];

    if (!selectedSquare) {
      if (piece && piece.color === currentTurn) {
        setSelectedSquare({ row, col });
        setLegalMoves(getLegalMoves(row, col, board, currentTurn, lastMove, castlingRights));
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
      setLegalMoves(getLegalMoves(row, col, board, currentTurn, lastMove, castlingRights));
      return;
    }

    setSelectedSquare(null);
    setLegalMoves([]);
  };

  // === RESALTAR MOVIMIENTOS LEGALES ===
  const highlightLegalMoves = () => {
    document.querySelectorAll('.square').forEach(sq => {
      sq.classList.remove('selected', 'legal-move', 'capture-move');
    });

    if (!selectedSquare) return;

    const fromNotation = coordinates(selectedSquare.row, selectedSquare.col);
    const selectedEl = document.querySelector(`[data-notation="${fromNotation}"]`);
    if (selectedEl) selectedEl.classList.add('selected');

    legalMoves.forEach(move => {
      const toNotation = coordinates(move.row, move.col);
      const moveEl = document.querySelector(`[data-notation="${toNotation}"]`);
      if (moveEl) {
        moveEl.classList.add('legal-move');
        if (board[move.row][move.col]) {
          moveEl.classList.add('capture-move');
        }
      }
    });
  };

  useEffect(() => {
    highlightLegalMoves();
  }, [selectedSquare, legalMoves, board]);

  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
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

      {/* === MODAL DE PROMOCIÓN === */}
      {promotionData && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center',
          alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(5px)'
        }}>
          <div style={{
            background: '#f0d9b5', padding: '30px 40px', borderRadius: '20px',
            boxShadow: '0 15px 40px rgba(0,0,0,0.6)', textAlign: 'center'
          }}>
            <h2 style={{ margin: '0 0 20px 0', color: '#333', fontSize: '28px' }}>
              ¡Promoción! Elige tu pieza
            </h2>
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {[
                { type: 'queen', label: 'Reina', symbol: 'Q' },
                { type: 'rook', label: 'Torre', symbol: 'R' },
                { type: 'bishop', label: 'Alfil', symbol: 'B' },
                { type: 'knight', label: 'Caballo', symbol: 'N' }
              ].map(({ type, label, symbol }) => (
                <button
                  key={type}
                  onClick={() => handlePromotion(type)}
                  style={{
                    padding: '15px 20px', fontSize: '20px', cursor: 'pointer',
                    background: 'white', border: '4px solid #b58863', borderRadius: '15px',
                    width: '120px', height: '120px', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', gap: '10px',
                    transition: 'all 0.2s', boxShadow: '0 5px 15px rgba(0,0,0,0.3)'
                  }}
                  onMouseEnter={e => e.target.style.transform = 'scale(1.1)'}
                  onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                >
                  <img
                    src={`/piezas/${promotionData.pieceColor[0]}${symbol}.png`}
                    alt={label}
                    style={{ width: '60px', height: '60px' }}
                  />
                  <span style={{ fontWeight: 'bold', color: '#333' }}>{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* === HISTORIAL (opcional, descomenta si quieres verlo) === */}
      {/* 
      <div style={{ marginTop: '20px', padding: '15px', background: '#222', color: 'white', borderRadius: '10px' }}>
        <h3>Historial de movimientos</h3>
        <ol style={{ margin: 0, paddingLeft: '20px' }}>
          {moveHistory.map((m, i) => <li key={i}>{m}</li>)}
        </ol>
      </div>
      */}
    </div>
  );
}