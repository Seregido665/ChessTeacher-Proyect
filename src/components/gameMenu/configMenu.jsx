import { useState } from 'react';
import "./matchMenu.css";

export default function ConfigMenu({
  showResult,
  gameResult,
  selectedColor,
  setSelectedColor,
  showEvaluationBar,
  setShowEvaluationBar,
  setDifficulty,
  user,
  onSaveGame,
  onStartGame,
  onTimeChange, // ✅ NUEVA prop para cambiar tiempo sin iniciar
  onResetGame,
}) {
  const [localDifficulty, setLocalDifficulty] = useState(3);
  const [timeIndex, setTimeIndex] = useState(5);
  const [hasSaved, setHasSaved] = useState(false);

  const handleDifficultyChange = (e) => {
    const value = Number(e.target.value);
    setLocalDifficulty(value);
    setDifficulty?.(value);
  };

  // ✅ MODIFICADO: Solo cambia el tiempo mostrado, NO inicia la partida
  const handleTimeChange = (e) => {
    const value = Number(e.target.value);
    setTimeIndex(value);

    const options = [
      { base: 60, increment: 0 },
      { base: 60, increment: 1 },
      { base: 120, increment: 1 },
      { base: 180, increment: 0 },
      { base: 180, increment: 2 },
      { base: 300, increment: 0 },
      { base: 300, increment: 3 },
      { base: 600, increment: 0 },
      { base: 600, increment: 5 },
      { base: 900, increment: 10 },
    ];

    // ✅ Llamar a onTimeChange en lugar de onStartGame
    onTimeChange?.(options[value]);
  };

  const handleSave = () => {
    if (hasSaved || !user) return;
    setHasSaved(true);
    onSaveGame?.();
  };

  // ✅ MODIFICADO: Iniciar nueva partida
  const handleNewGame = () => {
    setHasSaved(false);
    if (showResult) {
      onResetGame?.();
    }
    onStartGame?.(); // ✅ Ya no pasa timeControl, se usa el configurado
  };

  const getResultText = () => {
    if (!gameResult) return "";
    if (gameResult.reason === "checkmate") {
      return gameResult.winner === "white" ? "¡Blancas GANAN!" : "¡Negras GANAN!";
    }
    if (gameResult.reason === "resignation") {
      const winnerColor = gameResult.winner === "white" ? "Blancas" : "Negras";
      return `¡${winnerColor} GANAN por rendición!`;
    }
    return "Tablas";
  };

  return (
    <>
      <div className="text-center mt-2">
        <button
          onClick={handleNewGame}
          className="matchButton inicio"
        >
          {showResult ? "Nueva Partida" : "Iniciar Partida"}
        </button>
      </div>

      <div className="mb-3">
        <div className="color-selector d-flex justify-content-center gap-3">
          <button
            className={`colorButton white ${selectedColor === "white" ? "selected" : ""}`}
            onClick={() => setSelectedColor("white")}
            title="Blancas"
          />
          <button
            className={`colorButton gradient ${selectedColor === "gradient" ? "selected" : ""}`}
            onClick={() => setSelectedColor("gradient")}
            title="Aleatorio"
          />
          <button
            className={`colorButton black ${selectedColor === "black" ? "selected" : ""}`}
            onClick={() => setSelectedColor("black")}
            title="Negras"
          />
        </div>
      </div>

      <div className="form-check text-start mb-2">
        <input
          className="form-check-input"
          type="checkbox"
          checked={showEvaluationBar}
          onChange={(e) => setShowEvaluationBar(e.target.checked)}
          id="evalBarCheckbox"
        />
        <label className="form-check-label" htmlFor="evalBarCheckbox">
          Mostrar barra de ventaja
        </label>
      </div>

      <div className="subMenu mb-2">
        <label className="form-label mb-1 d-block">Dificultad</label>
        <select
          className="form-select bg-dark text-white border-secondary"
          value={localDifficulty}
          onChange={handleDifficultyChange}
        >
          <option value={0}>0 - (200 - 500)</option>
          <option value={1}>1 - (500 - 800)</option>
          <option value={2}>2 - (800 - 1000)</option>
          <option value={3}>3 - (1000 - 1200)</option>
          <option value={4}>4 - (1200 - 1500)</option>
          <option value={5}>5 - (1500 - 1800)</option>
          <option value={6}>6 - (1800 - 2000)</option>
          <option value={7}>7 - (2000 - 2200)</option>
          <option value={8}>8 - (2200 - 2400)</option>
          <option value={9}>9 - (2400+)</option>
        </select>
      </div>

      <div className="subMenu mb-4">
        <label className="form-label mb-1 d-block">Duración</label>
        <select
          className="form-select bg-dark text-white border-secondary"
          value={timeIndex}
          onChange={handleTimeChange}
        >
          <option value={0}>Bullet - 1 min</option>
          <option value={1}>Bullet - 1 | 1</option>
          <option value={2}>Bullet - 2 | 1</option>
          <option value={3}>Blitz - 3 min</option>
          <option value={4}>Blitz - 3 | 2</option>
          <option value={5}>Blitz - 5 min</option>
          <option value={6}>Blitz - 5 | 3</option>
          <option value={7}>Rapid - 10 min</option>
          <option value={8}>Rapid - 10 | 5</option>
          <option value={9}>Rapid - 15 | 10</option>
        </select>
      </div>

      {showResult && (
        <div className="text-center mt-4">
          <p className="result pb-1 mb-4 fs-4 fw-bold">
            {getResultText()}
          </p>
          {user && !hasSaved ? (
            <button
              onClick={handleSave}
              className="saveButton guardar mb-4"
            >
              Guardar Partida
            </button>
          ) : hasSaved ? (
            <p className="text-success fw-bold mt-2 mb-1">
              Partida guardada ✓
            </p>
          ) : null}
        </div>
      )}
    </>
  );
}