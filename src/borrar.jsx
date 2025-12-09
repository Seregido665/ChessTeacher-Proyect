import { useState } from 'react';
import Square from './square';

const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

const createInitialBoard = () => {
  const board = Array(8).fill(null).map(() => Array(8).fill(null));

  const piecesRow = ['rook', 'night', 'bishop', 'queen', 'king', 'bishop', 'night', 'rook'];
                          // "Knight"                                      "knight"
  board[0] = piecesRow.map(type => ({ type, color: 'black' }));
  board[1] = Array(8).fill({ type: 'pawn', color: 'black' });

  board[6] = Array(8).fill({ type: 'pawn', color: 'white' });
  board[7] = piecesRow.map(type => ({ type, color: 'white' }));

  
  return board;
};

export default function Chessboard() {
  const [board] = useState(createInitialBoard());

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
                  row={rowIndex}
                  col={colIndex}
                  onClick={() => console.log(`${notation} - ${piece.color} ${piece.type}`)}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}



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