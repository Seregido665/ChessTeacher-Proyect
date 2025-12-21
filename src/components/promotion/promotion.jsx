import "./promotion.css";

const PIECE_KEY = {
  queen: 'Q',
  rook: 'R',
  bishop: 'B',
  knight: 'N'
};

export default function PromotionSelector({ color, onSelect }) {
  const pieces = ["queen", "rook", "bishop", "knight"];
  const colorLetter = color === "white" ? "w" : "b";

  return (
    <div className="promotion-overlay">
      <div className="promotion-box">
        {pieces.map(p => (
          <img
            key={p}
            src={`/piezas/${colorLetter}${PIECE_KEY[p]}.png`}
            alt={p}
            onClick={() => onSelect(p)}
          />
        ))}
      </div>
    </div>
  );
}
