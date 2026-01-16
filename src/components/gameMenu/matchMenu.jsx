import { useState } from 'react';
import "./matchMenu.css";

export default function MatchMenu({
  gameStarted,
  onStartGame,
  onResetGame,
  selectedColor,
  setSelectedColor,
  moveHistory = [], 
  showEvaluationBar,
  setShowEvaluationBar,
  setDifficulty,            // ← Ya lo pasabas antes, lo mantenemos
}) {
  
  const [difficulty, setDifficultyLocal] = useState(3);

  // Si usas el difficulty del padre (recomendado), usa setDifficulty del prop
  const handleDifficultyChange = (e) => {
    const value = Number(e.target.value);
    setDifficultyLocal(value);
    if (setDifficulty) setDifficulty(value);
  };

  return (
    <div className="match-menu-container">

      {/*----------------*/}
      {/* --- MODO 1 --- */}
      {/*----------------*/}
      {!gameStarted ? (
        <>
          <div className="text-center mt-3 mb-1">
            <button
              onClick={onStartGame}
              className="matchButton inicio"
            >
              Iniciar Partida
            </button>
          </div>

          <div className="mb-1">
            <div className="color-selector">
              <button
                className={`colorButton white ${selectedColor === "white" ? "selected" : ""}`}
                onClick={() => setSelectedColor("white")}
              />
              <button
                className={`colorButton gradient ${selectedColor === "gradient" ? "selected" : ""}`}
                onClick={() => setSelectedColor("gradient")}
              />
              <button
                className={`colorButton black ${selectedColor === "black" ? "selected" : ""}`}
                onClick={() => setSelectedColor("black")}
              />
            </div>
          </div>

          <div className="form-check text-start mb-2 mt-4">
            <input
              className="form-check-input"
              type="checkbox"
              checked={showEvaluationBar}
              onChange={(e) => setShowEvaluationBar(e.target.checked)}
            />
            <label>Barra de ventaja</label>
          </div>

          <div className="subMenu mb-4">
            <label className="form-label fw-bold mb-1">Dificultad del Motor</label>
          <select
            className="form-select bg-dark text-white border-secondary"
            value={difficulty}
            onChange={handleDifficultyChange}
          >
            <option value={0}>Nivel 0 (200 - 500)</option>
            <option value={1}>Nivel 1 (500 - 800)</option>
            <option value={2}>Nivel 2 (800 - 1000)</option>
            <option value={3}>Nivel 3 (1000 - 1200)</option>
            <option value={4}>Nivel 4 (1200 - 1500)</option>
            <option value={5}>Nivel 5 (1500 - 1800)</option>
            <option value={6}>Nivel 6 (1800 - 2000)</option>
            <option value={7}>Nivel 7 (2000 - 2200)</option>
            <option value={8}>Nivel 8 (2200 - 2400)</option>
            <option value={9}>Nivel 9 (2400+)</option>
          </select>
          </div>
        </>
      ) : (
        <>
          {/*----------------*/}
          {/* --- MODO 2 --- */}
          {/*----------------*/}
          <h5 className="text-center mb-2">Historial</h5>
          <div className="move-history mb-5">
            <div className="move-table">
              <div className="table-header">
                <div>#</div>
                <div>Blancas</div>
                <div>Negras</div>
              </div>

              {Array.from({ length: Math.ceil(moveHistory.length / 2) }, (_, i) => (
                <div key={i} className="table-row">
                  <div className="move-number">{i + 1}.</div>
                  <div className="move-white">{moveHistory[i * 2] || ""}</div>
                  <div className="move-black">{moveHistory[i * 2 + 1] || ""}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Botón de exportar PGN - justo antes de Rendirse 
          <div className="text-center mb-3">
            <button className="">
              Exportar partida (PGN)
            </button>
          </div>
          */}

          <div className="text-center">
            <button
              onClick={onResetGame}
              className="matchButton rendirse"
            >
              Reiniciar
            </button>
          </div>
        </>
      )}
    </div>
  );
}