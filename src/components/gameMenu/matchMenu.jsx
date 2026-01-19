import { useState, useEffect, useRef, useContext } from 'react';
import AuthContext from "../../context/userContext";
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
        return gameResult.winner === "white" ? "¡Blancas ganan!" : "¡Negras ganan!";
      }
      if (gameResult.reason === "resignation") {
        const winnerColor = gameResult.winner === "white" ? "Blancas" : "Negras";
        return `¡${winnerColor} ganan! (abandono)`;
      }
      return "Tablas";
    }

    if (isResigned) {
      const winner = selectedColor === "white" ? "Negras" : "Blancas";
      return `¡${winner} ganan! (abandono)`;
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
  const handleNewGame = () => {
    setHasSaved(false);
    setIsResigned(false);
    onResetGame?.();      // si quieres resetear todo desde el padre
    onStartGame?.();      // o solo iniciar de nuevo
  };

  return (
    <div className="match-menu-container">

      {isGameActive ? (
        // ── Modo PARTIDA EN CURSO ──
        // Solo historial + botón rendirse
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

          <div className="text-center mt-4">
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
          {/* Mostrar resultado si la partida ya terminó */}
          {showResult && (
            <div className="result-section text-center mb-4">
              <h2 className="result-text mb-3">
                {getResultText()}
              </h2>
            </div>
          )}

          <div className="text-center mt-3 mb-4">
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

          <div className="form-check text-start mb-3">
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

          <div className="subMenu mb-4">
            <label className="form-label fw-bold mb-1 d-block">
              Dificultad del Motor
            </label>
            <select
              className="form-select bg-dark text-white border-secondary"
              value={localDifficulty}
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

          {/* Botón Guardar solo cuando terminó la partida */}
          {showResult && (
            <div className="text-center mt-3">
              {user && !hasSaved ? (
                <button
                  onClick={handleSave}
                  className="matchButton guardar"
                >
                  Guardar Partida
                </button>
              ) : hasSaved ? (
                <p className="text-success fw-bold mt-2">
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