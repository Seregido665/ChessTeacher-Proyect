import { useState } from 'react';

export default function MatchMenu({
  gameStarted,
  aiThinking,
  onStartGame,
  onResetGame,
  onResign, // opcional: para más adelante
  moveHistory = [], // ← aquí recibirás el historial (string como "e2e4", "e7e5", etc.)
}) {
  // Estado local solo para opciones antes de empezar
  const [difficulty, setDifficulty] = useState(3);

  return (
    <div className="match-menu h-100 d-flex flex-column p-4 text-white" style={{ maxWidth: '100%' }}>
      <h3 className="text-center mb-4 fw-bold text-shadow">Chess Teacher</h3>

      {/* ==================================== */}
      {/* MODO 1: ANTES DE EMPEZAR LA PARTIDA */}
      {/* ==================================== */}
      {!gameStarted ? (
        <>
          <div className="text-center mb-5">
            <button
              onClick={onStartGame}
              className="btn btn-success btn-lg px-5 py-3 w-100 shadow-lg hover-scale"
            >
              Iniciar Partida
            </button>
          </div>

          <h5 className="text-center mb-3">Configuración rápida</h5>

          <div className="mb-4">
            <label className="form-label fw-bold">Dificultad de la IA</label>
            <select
              className="form-select form-select-lg bg-dark text-white border-secondary"
              value={difficulty}
              onChange={(e) => setDifficulty(Number(e.target.value))}
            >
              <option value={1}>Fácil</option>
              <option value={3} selected>Media</option>
              <option value={5}>Difícil</option>
            </select>
          </div>

          <div className="text-center text-muted small">
            Juegas con las <strong>Blancas</strong>
            <br />
            Minimax α-β · Profundidad: {difficulty}
          </div>
        </>
      ) : (
        <>
          {/* ==================================== */}
          {/* MODO 2: PARTIDA EN CURSO */}
          {/* ==================================== */}
          <div className="text-center mb-4">
            <button
              onClick={onResetGame}
              className="btn btn-outline-warning btn-sm w-100 mb-2"
            >
              Reiniciar Partida
            </button>
            <button
              onClick={onResign || onResetGame}
              className="btn btn-outline-danger btn-sm w-100"
            >
              Rendirse
            </button>
          </div>

          {/* Indicador de turno simple */}
          <div className="text-center py-3 rounded bg-dark bg-opacity-50 mb-4">
            {aiThinking ? (
              <div className="text-warning fw-bold">IA pensando...</div>
            ) : (
              <div className="text-light fw-bold">Tu turno</div>
            )}
          </div>

          {/* Historial de jugadas */}
          <h5 className="text-center mb-3">Historial de jugadas</h5>
          <div className="flex-grow-1 overflow-auto bg-dark bg-opacity-30 rounded-3 p-3" style={{ maxHeight: '400px' }}>
            {moveHistory.length === 0 ? (
              <p className="text-center text-muted small mb-0">Aún no hay jugadas</p>
            ) : (
              <div className="text-monospace small">
                {moveHistory.map((move, index) => (
                  <div key={index} className="d-flex">
                    <span className="text-muted me-3">{Math.floor(index / 2) + 1}.</span>
                    <span className={index % 2 === 0 ? 'text-light' : 'text-secondary'}>
                      {move}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Estilos bonitos y limpios */}
      <style jsx>{`
        .hover-scale:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.4) !important;
        }
        .text-shadow {
          text-shadow: 0 2px 6px rgba(0,0,0,0.8);
        }
        .form-select {
          background-color: #212529;
        }
        .form-select:focus {
          background-color: #212529;
          border-color: #0d6efd;
          box-shadow: 0 0 0 0.25rem rgba(13,110,253,.25);
        }
      `}</style>
    </div>
  );
}