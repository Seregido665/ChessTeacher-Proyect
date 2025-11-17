export default function Piece({ code }) {
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
}