export default function Pieza({ piece }) {
  if (!piece) return null;

  const { type, color } = piece;
  const PIECE_LETTER = {
    pawn: 'P',
    knight: 'N',
    bishop: 'B',
    rook: 'R',
    queen: 'Q',
    king: 'K'
  };
  const colorLetter = color === 'white' ? 'w' : 'b';
  const typeLetter = PIECE_LETTER[type];
  const code = colorLetter + typeLetter;

  return (
    <img
      src={`/piezas/${code}.png`}
      alt={code}
      className="piece"
      draggable={true}
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', JSON.stringify(piece));
      }}
      data-color={color}
      data-type={type}
    />
  );
}