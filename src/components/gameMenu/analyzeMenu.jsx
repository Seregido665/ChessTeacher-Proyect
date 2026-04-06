import "./matchMenu.css";

export default function AnalyzeMenu({
  moveHistory = [],
}) {
  return (
    <div className="analyze-menu-container">
      <h5 className="text-center mb-3">Análisis de Partida</h5>

      {/* Historial de movimientos */}
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
        </div>
      </div>

      {/* Aquí se añadirán más funcionalidades de análisis */}
      <div className="analyze-controls">
        <p className="text-center text-muted">
          Controles de análisis - Próximamente
        </p>
      </div>
    </div>
  );
}