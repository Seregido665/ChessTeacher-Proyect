import "../styles/menustyle.css";
import AsideMenu from '../../components/asideMenu/aside';
import MatchMenu from '../../components/gameMenu/matchMenu';
import EvaluationBar from '../../components/advantageBar/advantageBar';
import ChessGame from '../../components/chessboard/ChessGame'; 
import { useState, useEffect, useRef } from 'react';
import { useContext } from "react";
import { saveMatch } from "../../services/match.service";
import AuthContext from "../../context/authContext";
import { Navigate } from 'react-router-dom';

const Juego = () => {
  const { user, isAuthLoading } = useContext(AuthContext);
  
  useEffect(() => {
    console.log("💡 Usuario actual:", user);
    console.log("💡 user._id:", user?._id || "No logueado");
    console.log("💡 isAuthLoading:", isAuthLoading);
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
  const timerRef = useRef(null);

  const buildMatchData = () => {
    const userId = user?._id || user?.user?._id;
    
    if (!userId || !gameResult?.winner) {
      console.error("❌ No se puede construir matchData - userId:", userId, "o ganador faltante");
      return null;
    }

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

  const handleSaveGame = () => {
    if (isAuthLoading || !user) {
      console.warn("⚠️ Esperando autenticación o usuario no disponible");
      return;
    }

    const matchData = buildMatchData();
    console.log("📝 matchData generado:", matchData);
    
    if (!matchData) return;
    
    saveMatch(matchData)
      .then(() => console.log("✅ Partida guardada"))
      .catch(err => console.error("❌ Error al guardar:", err.response?.data));
  };

  // DEBUG: Monitorear historial
  useEffect(() => {
    console.log("📊 HISTORIAL EN PADRE:", moveHistory);
    console.log(`📊 Total: ${moveHistory.length} movimientos`);
  }, [moveHistory]);

  // ✅ NUEVA FUNCIÓN: Solo configurar el tiempo, NO iniciar el timer
  const handleTimeChange = (timeControl) => {
    setTimeLeft(timeControl.base);
    setBaseTime(timeControl.base);
    setIncrement(timeControl.increment);
  };

  // ✅ MODIFICADO: Forzar reinicio completo del tablero al iniciar partida
  const handleStart = () => {
    let finalColor = selectedColor;

    if (selectedColor === "gradient") {
      finalColor = Math.random() < 0.5 ? "white" : "black";
      setSelectedColor(finalColor);
    }

    // ✅ PRIMERO: Detener cualquier juego en curso
    setGameStarted(false);
    clearInterval(timerRef.current);

    // ✅ SEGUNDO: Limpiar todo el estado
    setMoveHistory([]);
    setBoardEvaluation(0);
    setGameResult(null);
    setTimeLeft(baseTime);

    // ✅ TERCERO: Forzar reinicio del tablero
    setResetKey(prev => prev + 1);

    // ✅ CUARTO: Iniciar el juego con un pequeño delay para asegurar que el reset se completó
    setTimeout(() => {
      setGameStarted(true);
      startTimer();
    }, 100);
  };

  const handleGameEnd = (data) => {
    clearInterval(timerRef.current); // Detener timer cuando termina el juego
    setGameStarted(false); // ✅ Marcar que el juego terminó
    setGameResult({
      winner: data.winner || "draw",   
      reason: data.reason || "unknown",
      finalFen: data.finalFen || ""
    });
  };

  const handleReset = () => {
    clearInterval(timerRef.current);
    setTimeLeft(baseTime); // ✅ Restaurar al tiempo base configurado
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

  // Effect para detener el timer si gameStarted cambia a false
  useEffect(() => {
    if (!gameStarted && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [gameStarted]);

  // Cleanup al desmontar el componente
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Añadir incremento de tiempo después de cada movimiento del jugador
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

  // Loader si autenticación está cargando
  if (isAuthLoading) {
    return (
      <div className="vh-100 d-flex align-items-center justify-content-center">
        <div>Cargando usuario... Por favor espera.</div>
      </div>
    );
  }

  // Si después de loading no hay user válido, redirigir
  if (!user || !user._id) {
    console.warn("⚠️ No hay usuario autenticado después de cargar.");
    return <Navigate to="/inicioSesion" replace />;
  }

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
              onMoveHistory={setMoveHistory}
              onEvaluation={setBoardEvaluation}
              difficulty={difficulty}
              onGameEnd={handleGameEnd}
              onSaveGame={handleSaveGame}
            />
            
            <div className="board-footer">
              <span className="username"> {user.name || "Invitado"} </span>
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
          />
        </div>

        <div className="col-xl-1"></div>
      </div>
    </div>
  );
};

export default Juego;