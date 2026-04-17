import { useContext } from 'react';
import AuthContext from "../../context/authContext";
import ConfigMenu from './configMenu';
import GameMatchMenu from './gameMatchMenu';
import AnalyzeMenu from './analyzeMenu';
import "./matchMenu.css";

export default function MatchMenu({
  gameStarted,
  onStartGame,
  onTimeChange, 
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
  onClue,
  isAnalysisMode = false, 
  match,
  currentMoveIndex,
  onGoStart,
  onPrevMove,
  onNextMove,
  onGoEnd,
  onSelectMove,
  moveQualities = [],
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
          moveQualities={moveQualities}
          currentMoveIndex={currentMoveIndex}
          onGoStart={onGoStart}
          onPrevMove={onPrevMove}
          onNextMove={onNextMove}
          onGoEnd={onGoEnd}
          onSelectMove={onSelectMove}
        />
      ) : isGameActive ? (
        // Modo PARTIDA EN CURSO
        <GameMatchMenu
          moveHistory={moveHistory}
          onGameEnd={onGameEnd}
          selectedColor={selectedColor}
          onClue={onClue}
        />
      ) : (
        // Modo CONFIGURACIÓN 
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
          onTimeChange={onTimeChange} 
          onResetGame={onResetGame}
        />
      )}
    </div>
  );
}