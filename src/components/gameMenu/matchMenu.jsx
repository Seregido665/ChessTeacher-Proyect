import { useContext } from 'react';
import AuthContext from "../../context/authContext";
import ConfigMenu from './configMenu';
import GameMatchMenu from './gameMatchMenu';
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
}) {
  const { user } = useContext(AuthContext);

  const showResult = !!gameResult;
  const isGameActive = gameStarted && !showResult;

  return (
    <div className="match-menu-container">
      {isGameActive ? (
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