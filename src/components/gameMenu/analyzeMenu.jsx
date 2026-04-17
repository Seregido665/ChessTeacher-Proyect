import { useEffect } from "react";
import "./matchMenu.css";

export default function AnalyzeMenu({
  moveHistory = [],
  moveQualities = [],
  currentMoveIndex = 0,
  onGoStart,
  onPrevMove,
  onNextMove,
  onGoEnd,
  onSelectMove,
}) {
  const currentMovePosition = currentMoveIndex - 1;

  // -- CALIDAD DE JUGADAS --
  const getMoveQualityClass = (index) => {
    const quality = moveQualities[index];
    if (quality === "Buena") return "move-quality-good";
    if (quality === "ErrorLeve") return "move-quality-light-error";
    if (quality === "ErrorGrade") return "move-quality-severe-error";

    return "";
  };

  // -- FUNCIONAMIENTO DE LAS TECLAS DE NAVEGACION --
  useEffect(() => {
    const handleKeyDown = (event) => {
      const target = event.target;
      const tagName = target?.tagName?.toLowerCase();
      const isTypingField =
        tagName === "input" ||
        tagName === "textarea" ||
        target?.isContentEditable;

      if (isTypingField) return;

      if (event.key === "ArrowLeft" && currentMoveIndex > 0) {
        event.preventDefault();
        onPrevMove?.();
      }
      if (event.key === "ArrowRight" && currentMoveIndex < moveHistory.length) {
        event.preventDefault();
        onNextMove?.();
      }
      if (event.key === "ArrowUp" && currentMoveIndex > 0) {
        event.preventDefault();
        onGoStart?.();
      }
      if (event.key === "ArrowDown" && currentMoveIndex < moveHistory.length) {
        event.preventDefault();
        onGoEnd?.();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    currentMoveIndex,
    moveHistory.length,
    onGoStart,
    onPrevMove,
    onNextMove,
    onGoEnd,
  ]);

  return (
    <div className="analyze-menu-container">
      <h5 className="text-center mb-3">Análisis de Partida</h5>

      {/* - HISTORIAL DE MOVIMIENTOS - */}
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
              <div
                className={`move-white ${getMoveQualityClass(i * 2)} ${currentMovePosition === i * 2 ? "active-move" : ""} ${moveHistory[i * 2] ? "clickable-move" : ""}`}
                onClick={() => moveHistory[i * 2] && onSelectMove?.(i * 2 + 1)}
                title={moveQualities[i * 2] || ""}
              >
                {moveHistory[i * 2] || "—"}
              </div>
              <div
                className={`move-black ${getMoveQualityClass(i * 2 + 1)} ${currentMovePosition === i * 2 + 1 ? "active-move" : ""} ${moveHistory[i * 2 + 1] ? "clickable-move" : ""}`}
                onClick={() => moveHistory[i * 2 + 1] && onSelectMove?.(i * 2 + 2)}
                title={moveQualities[i * 2 + 1] || ""}
              >
                {moveHistory[i * 2 + 1] || "—"}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* - TECLAS DE NAVEGACION - */}
      <div className="analyze-controls">
        <button
          type="button"
          className="analysis-nav-btn"
          onClick={onGoStart}
          disabled={currentMoveIndex <= 0}
          title="Ir al inicio"
        >
          <img src="/botonesAnalisis/First.jpg" alt="Ir al inicio" className="analysis-nav-icon" />
        </button>
        <button
          type="button"
          className="analysis-nav-btn"
          onClick={onPrevMove}
          disabled={currentMoveIndex <= 0}
          title="Retroceder un movimiento"
        >
          <img src="/botonesAnalisis/Prev.jpg" alt="Retroceder" className="analysis-nav-icon" />
        </button>
        <button
          type="button"
          className="analysis-nav-btn"
          onClick={onNextMove}
          disabled={currentMoveIndex >= moveHistory.length}
          title="Avanzar un movimiento"
        >
          <img src="/botonesAnalisis/Next.jpg" alt="Avanzar" className="analysis-nav-icon" />
        </button>
        <button
          type="button"
          className="analysis-nav-btn"
          onClick={onGoEnd}
          disabled={currentMoveIndex >= moveHistory.length}
          title="Ir al final"
        >
          <img src="/botonesAnalisis/Last.jpg" alt="Ir al final" className="analysis-nav-icon" />
        </button>
      </div>
    </div>
  );
}