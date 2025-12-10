import "../styles/menustyle.css";
import "../../components/chessboard/board.css";
import Chessboard from '../../components/chessboard/board';
import AsideMenu from '../../components/asideMenu/aside';
import MatchMenu from '../../components/gameMenu/matchMenu';
import { useState } from 'react';

const Juego = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const handleStart = () => setGameStarted(true);

  const handleReset = () => {
    setGameStarted(false);
    setAiThinking(false);
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

        <div className="col-xl-6 col-md-6 col-12 flex-column d-flex align-items-center justify-content-center">
          <div className="all-data">
            <div className="board-header">
              <div><span className="username">Oponente</span></div>
              <div className="right"><span id="top-timer" className="tiempo">00:00</span></div>
            </div>

            <Chessboard
              key={resetKey}               
              gameStarted={gameStarted}
              aiThinking={aiThinking}
              setAiThinking={setAiThinking}
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
            />
        </div>

        <div className="col-xl-1"></div>
      </div>
    </div>
  );
};

export default Juego;