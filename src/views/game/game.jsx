import "../styles/menustyle.css";
import AsideMenu from '../../components/asideMenu/aside';
import MatchMenu from '../../components/gameMenu/matchMenu';
import EvaluationBar from '../../components/advantageBar/advantageBar';
import ChessGame from '../../components/chessboard/ChessGame'; 
import useClue from '../../components/gameMenu/clue';
import { useState, useEffect, useRef } from 'react';
import { useContext } from "react";
import { saveMatch } from "../../services/match.service";
import AuthContext from "../../context/authContext";

const Juego = () => {
  const { user, isAuthLoading } = useContext(AuthContext);
  
  useEffect(() => {
    console.log("💡 Usuario actual:", user);
  }, [user, isAuthLoading]);

  const [gameStarted, setGameStarted] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [selectedColor, setSelectedColor] = useState("white");
  const [difficulty, setDifficulty] = useState(3);
  const [moveHistory, setMoveHistory] = useState([]);
  const [boardEvaluation, setBoardEvaluation] = useState(0);
  const [showEvaluationBar, setShowEvaluationBar] = useState(true);
  const [gameResult, setGameResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(300); // Tiempo por defecto: 5 minutos
  const [increment, setIncrement] = useState(0);
  const [baseTime, setBaseTime] = useState(300); // Guardar el tiempo base seleccionado
  const [isInfiniteTime, setIsInfiniteTime] = useState(false);
  const [currentFen, setCurrentFen] = useState('start');
  const { clueArrow, handleClue, clearClue } = useClue(currentFen);
  const timerRef = useRef(null);

  const buildMatchData = () => {
    const userId = user?._id || user?.user?._id;

    return {
      user: userId,
      playerColor: selectedColor,
      winner: gameResult.winner,
      resultReason: gameResult.reason,
      moveHistory,
      totalMoves: moveHistory.length,
      difficulty,
      finalFen: gameResult.finalFen,
    };
  };

  // --- GUARDAR PARTIDA ---
  const handleSaveGame = () => {
    if (isAuthLoading || !user) {
      return;
    }

    const matchData = buildMatchData();    
    saveMatch(matchData)
      .then(() => console.log("✅ Partida guardada"))
      .catch(err => console.error("❌ Error al guardar:", err.response?.data));
  };

  // --- ELIGE TIEMPO, PERO NO LO INICIA ---
  const handleTimeChange = (timeControl) => {
    const infinite = Boolean(timeControl?.isInfinite);
    setIsInfiniteTime(infinite);
    setTimeLeft(infinite ? Infinity : timeControl.base);
    setBaseTime(infinite ? 0 : timeControl.base);
    setIncrement(timeControl.increment);
  };

  // --- INICIA LA PARTIDA
  const handleStart = () => {
    let finalColor = selectedColor;

    if (selectedColor === "gradient") {
      finalColor = Math.random() < 0.5 ? "white" : "black";
      setSelectedColor(finalColor);
    }

    // -- REINICIA LA INFO DE LA PARTIDA ANTERIOR --
    setGameStarted(false);
    clearInterval(timerRef.current);
    setMoveHistory([]);
    setBoardEvaluation(0);
    setGameResult(null);
    setTimeLeft(isInfiniteTime ? Infinity : baseTime);

    // -- FUERZA EL REINICIO DEL TABLERO --
    setResetKey(prev => prev + 1);

    // -- INICIA EL JUEGO DESPUÉS DE UN DELAY (100ms) PARA ASEGURAR QUE TODO SE REINICIE CORRECTAMENTE --
    setTimeout(() => {
      setGameStarted(true);
      if (!isInfiniteTime) {
        startTimer();
      }
    }, 100);
  };

  // --- FINAL DE PARTIDA --
  const handleGameEnd = (data) => {
    clearInterval(timerRef.current);
    setGameStarted(false); 
    setGameResult({
      winner: data.winner || "draw",   
      reason: data.reason || "unknown",
      finalFen: data.finalFen || ""
    });
  };

  // --- TABLERO A SU ESTADO INICIA ---
  const handleReset = () => {
    clearInterval(timerRef.current);
    setTimeLeft(isInfiniteTime ? Infinity : baseTime); // ✅ Restaurar al tiempo base configurado
    setGameStarted(false);
    setMoveHistory([]);
    setBoardEvaluation(0);
    setGameResult(null);
    setResetKey(prev => prev + 1);
  };

  // --- CONTADOR DE TIEMPO ---
  const startTimer = () => {
    if (isInfiniteTime) return;

    clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleGameEnd({
            winner: selectedColor === "white" ? "black" : "white",
            reason: "time",
            finalFen: "timeout"
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // --- DETIENE EL TIEMPO CUANDO TERMINA LA PARTIDA ---
  useEffect(() => {
    if (!gameStarted && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [gameStarted]);

  // --- AÑADIR INCREMENTO DE TIEMPO DESPUÉS DE CADA MOVIMIENTO DEL JUGADOR ---
  useEffect(() => {
    if (!gameStarted) return;

    const lastMoveIndex = moveHistory.length - 1;

    const playerMoved =
      (selectedColor === "white" && lastMoveIndex % 2 === 0) ||
      (selectedColor === "black" && lastMoveIndex % 2 === 1);

    if (playerMoved) {
      setTimeLeft(prev => prev + increment);
    }
  }, [moveHistory, gameStarted, selectedColor, increment]);

  const formattedTime = isInfiniteTime
    ? '∞'
    : `${String(Math.floor(timeLeft / 60)).padStart(2, "0")}:${String(timeLeft % 60).padStart(2, "0")}`;


  return (
    <div className="vh-100 img-fondo2">
      <div className="row w-100 h-100 m-0">
        <div className="col-xl-2 col-md-1 col-12 px-0 d-flex">
          <aside className="menuLateral">
            <AsideMenu />
          </aside>
        </div>
        <div className="col-xl-6 col-md-7 col-12 d-flex align-items-center justify-content-center">
          <div className="game-board-layout">
            {showEvaluationBar && (
              <EvaluationBar
                evaluation={boardEvaluation}
                playerColor={selectedColor}
              />
            )}

            <div className="game-board-panel">
              <div className="board-header">
                <span className="username">Dificultad {difficulty}</span>
              </div>
              
              {/* TABLERO DE AJEDREZ */}
              <ChessGame 
                className="game-chessboard"
                gameStarted={gameStarted}
                selectedColor={selectedColor}
                resetKey={resetKey}
                onMoveHistory={setMoveHistory}
                onEvaluation={setBoardEvaluation}
                difficulty={difficulty}
                onGameEnd={handleGameEnd}
                onSaveGame={handleSaveGame}
                onFenChange={(fen) => { setCurrentFen(fen); clearClue(); }}
                clueArrow={clueArrow}
              />
              
              <div className="board-footer">
                <span className="username"> {user?.name || "Invitado"} </span>
                <div className="right">
                  <span className="tiempo">
                    {formattedTime}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="matchMenu col-xl-4 col-md-4 col-12 d-flex align-items-center justify-content-center">
          <MatchMenu
            gameStarted={gameStarted}
            onStartGame={handleStart}
            onTimeChange={handleTimeChange}
            onResetGame={handleReset}       
            selectedColor={selectedColor}
            setSelectedColor={setSelectedColor}
            setDifficulty={setDifficulty} 
            moveHistory={moveHistory}
            showEvaluationBar={showEvaluationBar}
            setShowEvaluationBar={setShowEvaluationBar}
            gameResult={gameResult}
            onSaveGame={handleSaveGame}
            onGameEnd={handleGameEnd}
            onClue={handleClue}
          />
        </div>
      </div>
    </div>
  );
};

export default Juego;