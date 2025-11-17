import Square from './square';

const initialBoard = [
  ['bR', 'bN', 'bB', 'bQ', 'bK', 'bB', 'bN', 'bR'],
  ['bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP'],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  ['wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP'],
  ['wR', 'wN', 'wB', 'wQ', 'wK', 'wB', 'wN', 'wR'],
];

const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

export default function Chessboard() {
  return (
    <div className="chessboard">
      {initialBoard.map((row, rowIndex) => (
        <div key={rowIndex} className="board-row">
          {row.map((pieceCode, colIndex) => {
            const isLight = (rowIndex + colIndex) % 2 === 0;
            const notation = `${files[colIndex]}${8 - rowIndex}`;

            return (
              <Square
                key={notation}
                piece={pieceCode}          
                isLight={isLight}
                onClick={() => console.log(`Casilla ${notation}`)}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}