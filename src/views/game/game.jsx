import "../styles/menustyle.css";
import "../../components/chessboard/board.css";
import Chessboard from '../../components/chessboard/board';
import AsideMenu from '../../components/asideMenu/aside';
import MatchMenu from '../../components/gameMenu/matchMenu';
import EvaluationBar from '../../components/advantageBar/advantageBar';
import { useState } from 'react';

const Juego = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [selectedColor, setSelectedColor] = useState("white");
  const [difficulty, setDifficulty] = useState(3);
  const [moveHistory, setMoveHistory] = useState([]);
  const [boardEvaluation, setBoardEvaluation] = useState(0);

  

  const handleStart = () => {
    let finalColor = selectedColor;

    // Elegir aleatoriamente entre 'white' y 'black'
    if (selectedColor === "gradient") {
      finalColor = Math.random() < 0.5 ? "white" : "black";
      setSelectedColor(finalColor); // Actualiza la selección para reflejar el resultado
    }

    setGameStarted(true);
  };

  const handleReset = () => {
    // Determina quién ganó
    const winner = selectedColor === "black" ? "BLANCAS" : "NEGRAS";
    alert(`Te has rendido. ¡${winner} ganan!`);

    setGameStarted(false);
    setAiThinking(false);
    setMoveHistory([]);
    setResetKey(prev => prev + 1); // FUERZA UN RESET COMPLETO DEL TABLERO.
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
          <EvaluationBar
              evaluation={boardEvaluation}
              playerColor={selectedColor === "black" ? "black" : "white"}
            />
          <div className="all-data">
            <div className="board-header">
              <div><span className="username">Oponente </span></div>
              <div className="right"><span id="top-timer" className="tiempo">00:00</span></div>
            </div>
            <Chessboard
              key={resetKey}               
              gameStarted={gameStarted}
              aiThinking={aiThinking}
              setAiThinking={setAiThinking}
              playerColor={selectedColor === "black" ? "black" : "white"}
              aiDepth={difficulty}
              onMove={(moveNotation) => setMoveHistory(prev => [...prev, moveNotation])} 
              onEvaluationChange={setBoardEvaluation}
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
            />
        </div>

        <div className="col-xl-1"></div>
      </div>
    </div>
  );
};

export default Juego;