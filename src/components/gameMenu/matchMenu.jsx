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
}) {
  
  const [difficulty, setDifficulty] = useState(3);

  return (
    <div className="match-menu-container">

      {/*----------------*/}
      {/* --- MODO 1 --- */}
      {/*----------------*/}
      {!gameStarted ? (
        <>
          <div className="text-center mt-5 mb-3">
            <button
              onClick={onStartGame}
              className="matchButton inicio"
            >
              Iniciar Partida
            </button>
          </div>

          <div className="mb-3">
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

          <div className="form-check text-start mb-3 mt-4">
            <input
              className="form-check-input"
              type="checkbox"
              checked={showEvaluationBar}
              onChange={(e) => setShowEvaluationBar(e.target.checked)}
            />
            <label>Barra de ventaja</label>
          </div>

          <div className="subMenu mb-4">
            <label className="form-label fw-bold mb-1">Dificultad</label>
            <select
              className="form-select bg-dark text-white border-secondary"
              value={difficulty}
              onChange={(e) => setDifficulty(Number(e.target.value))}
            >
              <option value={1}>Nivel 1 ( 800 - 1000 )</option>
              <option value={2}>Nivel 2 ( 1000 - 1200 )</option>
              <option value={3}>Nivel 3 ( 1200 - 1400 )</option>
              <option value={4}>Nivel 4 ( 1400 - 1600 )</option>
              <option value={5}>Nivel 5 ( 1600 - 1800 )</option>
              <option value={6}>Nivel 6 ( 1800 - 2000 )</option>
              <option value={7}>Nivel 7 ( +2000 )</option>
            </select>
          </div>
        </>
      ) : (
        <>
          {/*----------------*/}
          {/* --- MODO 2 --- */}
          {/*----------------*/}
          <h5 className="text-center mb-1">Historial</h5>
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
                ))
              }
            </div>
          </div>

          
          <div className="text-center">
            <button
              onClick={onResetGame}
              className="matchButton rendirse"
            >
              Rendirse
            </button>
          </div>
        </>
      )}
    </div>
  );
}