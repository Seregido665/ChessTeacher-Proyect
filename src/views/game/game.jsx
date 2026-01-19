import "../styles/menustyle.css";
import AsideMenu from '../../components/asideMenu/aside';
import MatchMenu from '../../components/gameMenu/matchMenu';
import EvaluationBar from '../../components/advantageBar/advantageBar';
import ChessGame from '../../components/chessboard/ChessGame'; 
import { useState, useEffect, useRef } from 'react';
import { useContext } from "react";
import { saveMatch } from "../../services/match.service";
import AuthContext from "../../context/userContext";

const Juego = () => {
  const { user } = useContext(AuthContext);

  const [gameStarted, setGameStarted] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [selectedColor, setSelectedColor] = useState("white");
  const [difficulty, setDifficulty] = useState(3);
  const [moveHistory, setMoveHistory] = useState([]);
  const [boardEvaluation, setBoardEvaluation] = useState(0);
  const [showEvaluationBar, setShowEvaluationBar] = useState(true);
  const [gameResult, setGameResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [increment, setIncrement] = useState(0);
  const timerRef = useRef(null);

const buildMatchData = () => {
  // ✅ CORREGIDO: usar _id en lugar de id
  const userId = user?.data?.user?._id || user?._id;
  
  if (!userId || !gameResult?.winner) {
    console.error("❌ [buildMatchData] Falta userId o winner");
    console.error("   - userId:", userId);
    console.error("   - gameResult:", gameResult);
    return null;
  }

  return {
    user: userId,  // ✅ Ahora será "696d0d057037b99d5d9452e6"
    playerColor: selectedColor,
    winner: gameResult.winner,
    resultReason: gameResult.reason,
    moveHistory,
    totalMoves: moveHistory.length,
    difficulty,
    finalFen: gameResult.finalFen,
  };
};




 const handleSaveGame = () => {
  // 🔍 LOGS DE DEPURACIÓN - ANTES DE buildMatchData
  console.log("🔍 === DEPURACIÓN handleSaveGame ===");
  console.log("🔍 user completo:", user);
  console.log("🔍 user?.data?.user?.id:", user?.data?.user?.id);
  console.log("🔍 user?.id:", user?.id);
  console.log("🔍 gameResult completo:", gameResult);
  console.log("🔍 gameResult?.winner:", gameResult?.winner);
  console.log("🔍 selectedColor:", selectedColor);
  console.log("🔍 moveHistory.length:", moveHistory.length);
  console.log("🔍 difficulty:", difficulty);
  
  const matchData = buildMatchData();

  // 🔍 LOG DESPUÉS DE buildMatchData
  console.log("🔍 matchData generado:", matchData);

  if (!matchData) {
    console.error("❌ No se puede guardar: partida no finalizada");
    return;
  }

  console.log("🧪 matchData:", matchData); // Este ya lo tenías

  saveMatch(matchData)
    .then(() => console.log("✅ Partida guardada"))
    .catch(err => console.error("❌ Error al guardar:", err.response?.data));
};




  // 🔥 DEBUG: Monitorear historial
  useEffect(() => {
    console.log("📊 HISTORIAL EN PADRE:", moveHistory);
    console.log(`📊 Total: ${moveHistory.length} movimientos`);
  }, [moveHistory]);

  // Determinar color IA
  const aiColor = selectedColor === "white" ? "black" : "white";
  const aiEvaluation = aiColor === "white" ? boardEvaluation : -boardEvaluation;

  const handleStart = (timeControl) => {
    let finalColor = selectedColor;

    if (selectedColor === "gradient") {
      finalColor = Math.random() < 0.5 ? "white" : "black";
      setSelectedColor(finalColor);
    }

    clearInterval(timerRef.current);      // 🔥 CLAVE
    setTimeLeft(timeControl.base);
    setIncrement(timeControl.increment);
    setGameStarted(true);

    startTimer();                          // 🔥 ARRANQUE LIMPIO
  };



  const handleGameEnd = (data) => {
    setGameResult({
      winner: data.winner || "draw",   // nunca undefined
      reason: data.reason || "unknown",
      finalFen: data.finalFen || ""
    });
  };


  const handleReset = () => {
  clearInterval(timerRef.current);
  setTimeLeft(0);
  setGameStarted(false);
  setMoveHistory([]);
  setBoardEvaluation(0);
  setGameResult(null);
  setResetKey(prev => prev + 1);
};


 const startTimer = () => {
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

useEffect(() => {
  if (!gameStarted) return;
  if (moveHistory.length === 0) return;

  const lastMoveIndex = moveHistory.length - 1;

  const playerMoved =
    (selectedColor === "white" && lastMoveIndex % 2 === 0) ||
    (selectedColor === "black" && lastMoveIndex % 2 === 1);

  if (playerMoved) {
    setTimeLeft(prev => prev + increment);
  }
}, [moveHistory, gameStarted, selectedColor, increment]);



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

          <div className="">
            <div className="board-header">
              <span className="username">Oponente </span>
            </div>
            
            {/* TABLERO DE AJEDREZ */}
            <ChessGame 
              gameStarted={gameStarted}
              selectedColor={selectedColor}
              resetKey={resetKey}
              onMoveHistory={setMoveHistory} // ✅ Directo y simple
              onEvaluation={setBoardEvaluation}
              difficulty={difficulty}
              onGameEnd={handleGameEnd}
              onSaveGame={handleSaveGame}
            />
            
            <div className="board-footer">
              <span className="username"> {user?.data?.user?.name || "Invitado"} </span>
              <div className="right">
                <span className="tiempo">
                  {String(Math.floor(timeLeft / 60)).padStart(2, "0")}:
                  {String(timeLeft % 60).padStart(2, "0")}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-3 col-12 d-flex align-items-center justify-content-center">
          <MatchMenu
            gameStarted={gameStarted}
            onStartGame={handleStart}
            onResetGame={handleReset}       
            selectedColor={selectedColor}
            setSelectedColor={setSelectedColor}
            setDifficulty={setDifficulty} 
            moveHistory={moveHistory}
            showEvaluationBar={showEvaluationBar}
            setShowEvaluationBar={setShowEvaluationBar}
            gameResult={gameResult}           // ← NUEVO
            onSaveGame={handleSaveGame}
            onGameEnd={handleGameEnd}
          />
        </div>

        <div className="col-xl-1"></div>
      </div>
    </div>
  );
};

export default Juego;