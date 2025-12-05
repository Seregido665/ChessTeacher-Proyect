// METER Stockfish
// QUE EL TABLERO PUEDA GIRARSE SI EL JUGADOS ES NEGRAS.
//--> QUE LA NOTACION SEA LA OFICIAL DE LAS PARTIDAS DE AJEDREZ: Nf3, exd5, 0-0...
// HISTORIAL DE MOVIMIENTOS Y NUMERACION
//--> RESALTAR CASILLA DEL REY SI ESTA EN JAQUE.
//--> PREMOVER, ARRASTRAR PIEZA EN VEZ DE click-click
// MOSTRAR PIEZAS CAPTURADAS
// REGLA DE 50 JUGADAS SIN CAPTURA/MOVERPEON --> TABLAS
// TRIPLE REPETICION DE JUGADAS --> TABLAS
// MATERIAL INSUFICIENTE (SOLO REYES) --> TABLAS
// EXPORTAR PGN

import { useState, useEffect, useCallback } from 'react';
import Square from './Square';
import useChessEngine from './logic/chessEngine';
import './board.css';

const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

export default function Chessboard() {
  const {
    board,
    currentTurn,
    promotionData,
    movePiece,
    handlePromotion,
    getLegalMoves
  } = useChessEngine();

  const [selectedSquare, setSelectedSquare] = useState(null);
  const [legalMoves, setLegalMoves] = useState([]);


  // --- SELECCION Y DESSELECION DE CASILLAS ---
  const handleSquareClick = (row, col) => {
    const piece = board[row][col];

    // -- PARA SELECCIONAR UNA PIEZA PROPIA --
    if (!selectedSquare) {
      if (piece && piece.color === currentTurn) {
        setSelectedSquare({ row, col });
        setLegalMoves(getLegalMoves(row, col));
      }
      return;
    }

    // -- SI SELECCIONA LA MISMA CASILLA SE DESELECCIONA --
    const { row: fromRow, col: fromCol } = selectedSquare;
    if (fromRow === row && fromCol === col) {
      setSelectedSquare(null);
      setLegalMoves([]);
      return;
    }

    // -- COMPRUEBA QUE EL MOVIMIENTO SEA VALIDO --
    const validMove = legalMoves.find(m => m.row === row && m.col === col);
    if (validMove) {
      movePiece(fromRow, fromCol, row, col, validMove);
      setSelectedSquare(null);
      setLegalMoves([]);
      return;
    }

    // -- SI SELECCIONAS OTRA PIEZA SE MARCA --
    if (piece && piece.color === currentTurn) {
      setSelectedSquare({ row, col });
      setLegalMoves(getLegalMoves(row, col));
    } else {
      setSelectedSquare(null);
      setLegalMoves([]);
    }
  };
  // --- ESTETICA DE CADA TIPO DE CASILLA RESALTADA ---
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

      {/* Modal de promoción */}
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
                { type: 'night', label: 'Caballo', symbol: 'N' }
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
    </div>
  );
}