import { useContext } from 'react';
import AuthContext from "../../context/authContext";
import ConfigMenu from './configMenu';
import GameMatchMenu from './gameMatchMenu';
import AnalyzeMenu from './analyzeMenu';
import "./matchMenu.css";

export default function MatchMenu({
  gameStarted,
  onStartGame,
  onTimeChange, // ✅ NUEVA prop
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
  isAnalysisMode = false, // ✅ NUEVA prop para modo análisis
  match, // ✅ NUEVA prop para datos del match en análisis
}) {
  const { user } = useContext(AuthContext);

  const showResult = !!gameResult;
  const isGameActive = gameStarted && !showResult;

  return (
    <div className="match-menu-container">
      {isAnalysisMode ? (
        // Modo ANÁLISIS
        <AnalyzeMenu
          match={match}
          moveHistory={moveHistory}
        />
      ) : isGameActive ? (
        // Modo PARTIDA EN CURSO
        <GameMatchMenu
          moveHistory={moveHistory}
          onGameEnd={onGameEnd}
          selectedColor={selectedColor}
        />
      ) : (
        // Modo CONFIGURACIÓN (inicio o después de terminar)
        <ConfigMenu
          gameStarted={gameStarted}
          showResult={showResult}
          gameResult={gameResult}
          selectedColor={selectedColor}
          setSelectedColor={setSelectedColor}
          showEvaluationBar={showEvaluationBar}
          setShowEvaluationBar={setShowEvaluationBar}
          setDifficulty={setDifficulty}
          user={user}
          onSaveGame={onSaveGame}
          onStartGame={onStartGame}
          onTimeChange={onTimeChange} // ✅ Pasar la nueva prop
          onResetGame={onResetGame}
        />
      )}
    </div>
  );
}