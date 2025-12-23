import Pieza from './piece';

export default function Square({ piece,isLight, notation, onClick, onDragStart, onDragOver, onDrop, draggable }) {
  return (
    <div
      className={`square ${isLight ? 'light' : 'dark'}`}
      data-notation={notation}
      onClick={onClick}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {piece && (
        <div
          draggable={draggable}
          onDragStart={onDragStart}
          style={{ width: "100%", height: "100%" }}
        >
          <Pieza piece={piece} />
        </div>
      )}
    </div>
  );
}
