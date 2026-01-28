import { useState, useEffect, useRef, useContext } from 'react';
import AuthContext from "../../context/authContext";
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
  setDifficulty,
  gameResult,
  onSaveGame,
  onGameEnd,
}) {
  const { user } = useContext(AuthContext);

  const [localDifficulty, setLocalDifficulty] = useState(3);
  const [hasSaved, setHasSaved] = useState(false);
  const [isResigned, setIsResigned] = useState(false);
  const [timeControl, setTimeControl] = useState({
    base: 300,      // 5 minutos por defecto
    increment: 0
  });
  const [timeIndex, setTimeIndex] = useState(5);

  const historyEndRef = useRef(null);

  // ── Variables de estado derivadas ──
  const showResult = !!gameResult || isResigned;
  const isGameActive = gameStarted && !showResult;

  // Sincronizar dificultad local con prop del padre
  const handleDifficultyChange = (e) => {
    const value = Number(e.target.value);
    setLocalDifficulty(value);
    setDifficulty?.(value);
  };

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

  setTimeControl(options[value]);
};



  // Scroll automático solo cuando estamos en modo partida activa
  useEffect(() => {
    if (historyEndRef.current && isGameActive) {
      historyEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [moveHistory, isGameActive]);

  // Texto del resultado según situación
  const getResultText = () => {
    if (gameResult) {
      if (gameResult.reason === "checkmate") {
        return gameResult.winner === "white" ? "¡Blancas GANAN!" : "¡Negras GANAN!";
      }
      if (gameResult.reason === "resignation") {
        const winnerColor = gameResult.winner === "white" ? "Blancas" : "Negras";
        return `¡${winnerColor} GANAN!`;
      }
      return "Tablas";
    }


    return "";
  };

  // Manejar rendición del jugador
  const handleResign = () => {
    if (!gameStarted || isResigned || showResult) return;

    setIsResigned(true);

    const winner = selectedColor === "white" ? "black" : "white";

    const resignResult = {
      winner,
      reason: "resignation",
      finalFen: "unknown (resignation)", // ← Idealmente pásalo desde ChessGame
    };

    onGameEnd?.(resignResult);
  };

  // Guardar partida (solo una vez)
  const handleSave = () => {
    if (hasSaved || !user) return;
    setHasSaved(true);
    onSaveGame();
  };

  // Reiniciar estados para nueva partida
  // Reiniciar estados para nueva partida
  const handleNewGame = () => {
    // Resetear estados locales
    setHasSaved(false);
    setIsResigned(false);
    
    // Importante: llamar a la función del padre que reinicia TODO
    if (showResult) {
      // Si venimos de una partida terminada → reinicio completo
      onResetGame?.();     // Esta función debe existir en Juego.jsx
    }
    
    // Iniciar la nueva partida
    onStartGame?.(timeControl);
  };

  return (
    <div className="match-menu-container">

      {isGameActive ? (
        // ── Modo PARTIDA EN CURSO ──
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

          <div className="text-center mt-2">
            <button
              onClick={handleResign}
              className="matchButton rendirse"
              disabled={isResigned}
            >
              RENDIRSE
            </button>
          </div>
        </>
      ) : (
        // ── Modo CONFIGURACIÓN ── (antes de empezar o después de terminar)
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
            <label className="form-label  mb-1 d-block">
              Dificultad 
            </label>
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
            <label className="form-label mb-1 d-block">
              Duración
            </label>
            <select
              className="form-select bg-dark text-white border-secondary"
              value={timeIndex}
              onChange={handleTimeChange}
            >
              <option value={0}>Bullet - 1 min</option>
              <option value={1}>Bullet - 1 | 1</option>
              <option value={2}>Bullet -- 2 | 1</option>
              <option value={3}>Blitz --- 3 min</option>
              <option value={4}>Blitz --- 3 | 2</option>
              <option value={5}>Blitz ----- 5 min</option>
              <option value={6}>Blitz ----- 5 | 3</option>
              <option value={7}>Rapid ---------- 10 min</option>
              <option value={8}>Rapid ---------- 10 | 5</option>
              <option value={9}>Rapid --------------- 15 | 10</option>
            </select>
          </div>

          {/* Botón Guardar solo cuando terminó la partida */}
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
      )}
    </div>
  );
} 