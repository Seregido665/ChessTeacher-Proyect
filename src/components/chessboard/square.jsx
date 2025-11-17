import Piece from './piece';

export default function Square({ piece, isLight, onClick }) {
  return (
    <div
      className={`square ${isLight ? 'light' : 'dark'}`}
      onClick={onClick}
    >
      <Piece code={piece} />
    </div>
  );
}