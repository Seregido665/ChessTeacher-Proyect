import "../styles/menustyle.css";
import "../../components/chessboard/board.css";
import Chessboard from '../../components/chessboard/board';
import AsideMenu from '../../components/asideMenu/aside';
import MatchMenu from '../../components/gameMenu/matchMenu';
import EvaluationBar from '../../components/advantageBar/advantageBar';
import Alerta from '../../components/alerts/alert';

import { useState } from 'react';

const Juego = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [selectedColor, setSelectedColor] = useState("white");
  const [difficulty, setDifficulty] = useState(3);
  const [moveHistory, setMoveHistory] = useState([]);
  const [boardEvaluation, setBoardEvaluation] = useState(0);
  const [showEvaluationBar, setShowEvaluationBar] = useState(true);
  const [gameResult, setGameResult] = useState(null);

  const handleStart = () => {
    let color = selectedColor;
    if (color === "gradient") {
      color = Math.random() < 0.5 ? "white" : "black";
      setSelectedColor(color);
    }
    setGameStarted(true);
  };

  const handleReset = () => {
    setGameStarted(false);
    setAiThinking(false);
    setMoveHistory([]);
    setGameResult(null);
    setResetKey(prev => prev + 1);
  };

  return (
    <div className="vh-100 d-flex img-fondo2">
      <div className="row w-100 m-0 flex-grow-1">

        <div className="col-xl-2 col-md-3 col-12 px-0 d-flex">
          <aside className="menuLateral">
            <AsideMenu />
          </aside>
        </div>

        <div className="col-xl-6 col-md-6 col-12 d-flex justify-content-center align-items-center">
          {showEvaluationBar && (
            <EvaluationBar
              evaluation={boardEvaluation}
              playerColor={selectedColor}
            />
          )}

          <Chessboard
            key={resetKey}
            gameStarted={gameStarted}
            aiThinking={aiThinking}
            setAiThinking={setAiThinking}
            playerColor={selectedColor}
            aiDepth={difficulty}
            onMove={m => setMoveHistory(prev => [...prev, m])}
            onEvaluationChange={setBoardEvaluation}
            onGameResult={setGameResult}
          />
        </div>

        <div className="col-xl-3 col-md-3 col-12 d-flex flex-column align-items-center">
          <MatchMenu
            gameStarted={gameStarted}
            aiThinking={aiThinking}
            onStartGame={handleStart}
            onResetGame={handleReset}
            selectedColor={selectedColor}
            setSelectedColor={setSelectedColor}
            setDifficulty={setDifficulty}
            moveHistory={moveHistory}
            showEvaluationBar={showEvaluationBar}
            setShowEvaluationBar={setShowEvaluationBar}
            gameResult={gameResult}
          />

          {/* 👇 ALERTA JUSTO DESPUÉS DEL MATCHMENU */}
          <Alerta
            gameResult={gameResult}
            onClose={() => setGameResult(null)}
          />
        </div>

        <div className="col-xl-1"></div>
      </div>
    </div>
  );
};

export default Juego;
