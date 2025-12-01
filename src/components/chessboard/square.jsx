import Pieza from './piece';

export default function Square({ piece, isLight, notation, onClick }) {
  return (
    <div
      className={`square ${isLight ? 'light' : 'dark'}`}
      data-notation={notation}
      onClick={onClick}
    >
      {piece && <Pieza piece={piece} />}
    </div>
  );
}