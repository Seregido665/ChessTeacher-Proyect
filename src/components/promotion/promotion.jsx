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
        {pieces.map(piece => (
          <img
            key={piece}
            src={`/piezas/${colorLetter}${PIECE_KEY[piece]}.png`}
            alt={piece}
            onClick={() => onSelect(piece)}
          />
        ))}
      </div>
    </div>
  );
}
