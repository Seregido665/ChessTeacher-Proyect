import "../styles/menustyle.css";
import AsideMenu from '../../components/asideMenu/aside';
import MatchMenu from '../../components/gameMenu/matchMenu';
import EvaluationBar from '../../components/advantageBar/advantageBar';
import ChessGame from '../../components/chessboard/ChessGame'; 
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
  const gameResult = useState(null);

  const handleStart = () => {
    let finalColor = selectedColor;
    if (selectedColor === "gradient") {
      finalColor = Math.random() < 0.5 ? "white" : "black";
      setSelectedColor(finalColor); 
    }
    setGameStarted(true);
  };

  const handleReset = () => {
    setGameStarted(false);
    setAiThinking(false);
    setMoveHistory([]);
    setBoardEvaluation(0); // ← Resetear evaluación
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
            
        
        <div className="col-xl-6 col-md-6 col-12 flex-row d-flex align-items-center justify-content-center">
          {showEvaluationBar && (
            <EvaluationBar
              evaluation={boardEvaluation}
              playerColor={selectedColor === "black" ? "black" : "white"}
            />
          )}

          <div className="all-data">
            <div className="board-header">
              <div><span className="username">Oponente </span></div>
              <div className="right"><span id="top-timer" className="tiempo">00:00</span></div>
            </div>
            
            {/* TABLERO DE AJEDREZ */}
            <ChessGame 
              gameStarted={gameStarted}
              selectedColor={selectedColor}
              resetKey={resetKey}
              onMoveHistory={setMoveHistory}
              onEvaluation={setBoardEvaluation}
              difficulty={difficulty}
            />
            
            <div className="board-footer">
              <div><span className="username">Seregido665</span></div>
              <div className="right"><span id="bottom-timer" className="tiempo">00:00</span></div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-3 col-12 d-flex align-items-center justify-content-center">
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
        </div>

        <div className="col-xl-1"></div>
      </div>
    </div>
  );
};

export default Juego;