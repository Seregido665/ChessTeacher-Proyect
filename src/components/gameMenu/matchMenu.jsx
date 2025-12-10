import { useState } from 'react';
import "./matchMenu.css";

export default function MatchMenu({
  gameStarted,
  onStartGame,
  onResetGame,
  //moveHistory = [], // ← aquí recibirás el historial (string como "e2e4", "e7e5", etc.)
}) {
  
  const [difficulty, setDifficulty] = useState(3);
  const [selectedColor, setSelectedColor] = useState("white");

  return (
    <div className="match-menu-container">
      <h3 className="text-center mb-4 fw-bold">Personalizar partida.</h3>

      {/* --- MODO 1 --- */}
      {!gameStarted ? (
        <>
          <div className="text-center">
            <button
              onClick={onStartGame}
              className="matchButton inicio"
            >
              Iniciar Partida
            </button>
          </div>


          {/*       SELECTOR DE COLOR        */}
          <div className=" mb-4">
            <label className="form-label fw-bold">Color</label>
            <div className="text-center color-selector">
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


          <div className="mb-4">
            <label className="form-label fw-bold">Dificultad</label>
            <select
              className="form-select bg-dark text-white border-secondary"
              value={difficulty}
              onChange={(e) => setDifficulty(Number(e.target.value))}
            >
              <option value={1}>Fácil</option>
              <option value={3} selected>Media</option>
              <option value={5}>Difícil</option>
            </select>
          </div>

          <div className="text-center text-muted small">
            Profundidad: {difficulty}
          </div>
        </>
      ) : (
        <>
          {/* --- MODO 2 --- */}
          <div className="text-center mb-4">
            <button
              onClick={onResetGame}
              className="matchButton rendirse"
            >
              Rendirse
            </button>
          </div>

          {/* Historial de jugadas 
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
          </div>*/}
        </>
      )}
    </div>
  );
}