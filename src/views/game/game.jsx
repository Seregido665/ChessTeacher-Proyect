import "../styles/menustyle.css";
import AsideMenu from '../../components/asideMenu/aside';
import MatchMenu from '../../components/gameMenu/matchMenu';
import EvaluationBar from '../../components/advantageBar/advantageBar';
import ChessGame from '../../components/chessboard/ChessGame'; 
import { useState, useEffect } from 'react';

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

  // 🔥 DEBUG: Monitorear historial
  useEffect(() => {
    console.log("📊 HISTORIAL EN PADRE:", moveHistory);
    console.log(`📊 Total: ${moveHistory.length} movimientos`);
  }, [moveHistory]);

  // Determinar color IA
  const aiColor = selectedColor === "white" ? "black" : "white";
  const aiEvaluation = aiColor === "white" ? boardEvaluation : -boardEvaluation;

  const handleStart = () => {
    let finalColor = selectedColor;
    if (selectedColor === "gradient") {
      finalColor = Math.random() < 0.5 ? "white" : "black";
      setSelectedColor(finalColor); 
    }
    setGameStarted(true);
    console.log("🚀 Partida iniciada con color:", finalColor);
  };

  const handleReset = () => {
    console.log("🔄 Reiniciando partida...");
    setGameStarted(false);
    setAiThinking(false);
    setMoveHistory([]);
    setBoardEvaluation(0);
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
              evaluation={aiEvaluation}
              playerColor={selectedColor}
            />
          )}

          <div className="all-data">
            <div className="board-header">
              <span className="username">Oponente </span>
              <div className="right"><span id="top-timer" className="tiempo">00:00</span></div>
            </div>
            
            {/* TABLERO DE AJEDREZ */}
            <ChessGame 
              gameStarted={gameStarted}
              selectedColor={selectedColor}
              resetKey={resetKey}
              onMoveHistory={setMoveHistory} // ✅ Directo y simple
              onEvaluation={setBoardEvaluation}
              difficulty={difficulty}
            />
            
            <div className="board-footer">
              <span className="username">Seregido665</span>
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