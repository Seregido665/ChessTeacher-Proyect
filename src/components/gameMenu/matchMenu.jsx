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
  gameResult,               // ← Necesario para saber el resultado final
  setDifficulty,            // ← Ya lo pasabas antes, lo mantenemos
}) {
  
  const [difficulty, setDifficultyLocal] = useState(3);

  // Si usas el difficulty del padre (recomendado), usa setDifficulty del prop
  const handleDifficultyChange = (e) => {
    const value = Number(e.target.value);
    setDifficultyLocal(value);
    if (setDifficulty) setDifficulty(value);
  };

  // Función para generar y descargar el PGN
  const exportPGN = () => {
    const today = new Date();
    const dateStr = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;

    let pgn = `[Event "Partida casual"]\n`;
    pgn += `[Site "Tu app de ajedrez"]\n`;
    pgn += `[Date "${dateStr}"]\n`;
    pgn += `[White "${selectedColor === 'white' ? 'Seregido665' : 'Engine'}"]\n`;
    pgn += `[Black "${selectedColor === 'black' ? 'Seregido665' : 'Engine'}"]\n`;

    // Determinamos el resultado
    let result = "*"; // por defecto: partida en curso (aunque no debería pasar)
    if (gameResult) {
      if (gameResult.includes("Victoria")) {
        const ganadorBlancas = gameResult.includes("BLANCAS");
        result = selectedColor === 'white' 
          ? (ganadorBlancas ? "1-0" : "0-1")
          : (ganadorBlancas ? "0-1" : "1-0");
      } else {
        // Tablas por cualquier motivo
        result = "1/2-1/2";
      }
    }

    pgn += `[Result "${result}"]\n\n`;

    // Movimientos numerados
    for (let i = 0; i < moveHistory.length; i += 2) {
      const moveNum = Math.floor(i / 2) + 1;
      const whiteMove = moveHistory[i] || "";
      const blackMove = moveHistory[i + 1] || "";
      pgn += `${moveNum}. ${whiteMove}`;
      if (blackMove) pgn += ` ${blackMove}`;
      pgn += " ";
    }

    pgn += result;

    // Descarga del archivo
    const blob = new Blob([pgn], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `partida_${dateStr}.pgn`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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
              onChange={handleDifficultyChange}
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

          {/* Botón de exportar PGN - justo antes de Rendirse */}
          <div className="text-center mb-3">
            <button onClick={exportPGN} className="">
              Exportar partida (PGN)
            </button>
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