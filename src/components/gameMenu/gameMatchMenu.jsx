import { useContext, useEffect, useRef } from 'react';
import AuthContext from '../../context/authContext';
import "./matchMenu.css";

export default function GameMatchMenu({
  moveHistory = [],
  onGameEnd,
  selectedColor,
  onClue,
}) {
  const historyEndRef = useRef(null);
  const { isAuthenticated } = useContext(AuthContext);

  // --- SCROLL VERTICAL ---
  useEffect(() => {
    if (historyEndRef.current) {
      historyEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [moveHistory]);

  const handleResign = () => {
    const winner = selectedColor === "white" ? "black" : "white";

    onGameEnd?.({
      winner,
      reason: "resignation",
      finalFen: "unknown (resignation)",
    });
  };

  return (
    <>
      <h5 className="text-center mb-3">Historial de movimientos</h5>

      <div className="move-history mb-4">
        <div className="move-table">
          <div className="table-header">
            <div>#</div>
            <div>Blancas</div>
            <div>Negras</div>
          </div>

          {Array.from({ length: Math.ceil(moveHistory.length / 2) }, (_, i) => (
            <div key={i} className="table-row">
              <div className="move-number">{i + 1}.</div>
              <div className="move-white">{moveHistory[i * 2] || "—"}</div>
              <div className="move-black">{moveHistory[i * 2 + 1] || "—"}</div>
            </div>
          ))}

          <div ref={historyEndRef} />
        </div>
      </div>

      {isAuthenticated && (
        <div className="text-center mt-2">
          <button className="matchButton pista" onClick={onClue}>
            MEJOR JUGADA
          </button>
        </div>
      )}

      <div className="text-center mt-2">
        <button
          onClick={handleResign}
          className="matchButton rendirse"
        >
          RENDIRSE
        </button>
      </div>
    </>
  );
}