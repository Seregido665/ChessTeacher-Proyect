/*export default function Pieza({ code }) {
  if (!code) return null; 

  const src = `/piezas/${code}.png`;

  return (
    <img
      src={src}
      alt={code}
      className="piece"
      draggable={false}      
    />
  );
}*/

export default function Pieza({ piece }) {
  if (!piece) return null;

  const { type, color } = piece;
  const colorLetter = color === 'white' ? 'w' : 'b';
  const typeLetter = type.charAt(0).toUpperCase(); // p -> P, etc.
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