import { useState, useEffect, useRef, useCallback } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import Result from "../resultado/result";

const ChessGame = ({
  gameStarted,
  selectedColor,
  resetKey,
  onMoveHistory,
  onEvaluation,
  difficulty,
  onGameEnd
}) => {
  const [game, setGame] = useState(new Chess());
  const [boardOrientation, setBoardOrientation] = useState('white');
  const [isThinking, setIsThinking] = useState(false);
  const [boardWidth, setBoardWidth] = useState(400);
  
  const stockfish = useRef(null);
  const moveHistoryRef = useRef([]); 
  const gameOverRef = useRef(false);


  // Mantener actualizado el color
  useEffect(() => {
    setBoardOrientation(selectedColor === 'black' ? 'black' : 'white');
  }, [selectedColor]);

  // TABLERO RESPONSIVO
  useEffect(() => {
    const updateBoardSize = () => {
      const heightBased = window.innerHeight * 0.8;
      const widthBased = window.innerWidth * 0.9;
      setBoardWidth(Math.min(heightBased, widthBased));
    };

    updateBoardSize();
    window.addEventListener('resize', updateBoardSize);
    return () => window.removeEventListener('resize', updateBoardSize);
  }, []);

  // 🔥 NUEVA: Función centralizada para hacer movimientos
  const makeMove = useCallback((moveData) => {
    try {
        const moveResult = game.move(moveData); // usa la instancia actual

        if (moveResult) {
            console.log(`Movimiento realizado: ${moveResult.san}`);

            // Actualizar estado del juego
            setGame(new Chess(game.fen())); // actualizar para forzar re-render

            // Actualizar historial del padre acumulando movimientos
            if (onMoveHistory) {
                onMoveHistory(prev => [...prev, moveResult.san]); // ✅ AÑADIR, no reemplazar
            }

            return true;
        }
    } catch (error) {
        console.error("Error al hacer movimiento:", error);
    }
    return false;
}, [game, onMoveHistory]);


  // INICIALIZAR STOCKFISH
  useEffect(() => {
    const worker = new Worker('/stockfish.js');
    stockfish.current = worker;

    worker.postMessage('uci');
    worker.postMessage('isready');

    worker.onmessage = (e) => {
      const line = e.data;

      // Movimiento IA
      if (line.includes('bestmove')) {
        const moveStr = line.split(' ')[1];
        if (moveStr && moveStr !== '(none)') {
          console.log("Stockfish sugiere:", moveStr);
          makeMove(moveStr);
          setIsThinking(false);
        }
      }

      // Evaluación de posición
      if (line.includes('score cp')) {
        const parts = line.split(' ');
        const cpIndex = parts.indexOf('cp') + 1;
        if (cpIndex > 0 && cpIndex < parts.length) {
          const cp = parseInt(parts[cpIndex], 10);
          if (onEvaluation) onEvaluation(cp);
        }
      }
    };

    return () => {
      worker.terminate();
      stockfish.current = null;
    };
  }, [makeMove, onEvaluation]);

  // REINICIO DEL JUEGO
  useEffect(() => {
  console.log("🔄 REINICIANDO JUEGO COMPLETO");
  const newGame = new Chess();
  setGame(newGame);
  moveHistoryRef.current = [];
  setIsThinking(false);

  gameOverRef.current = false; // 🔑 Reiniciamos el flag

  if (onMoveHistory) onMoveHistory([]);
  if (onEvaluation) onEvaluation(0);

  if (stockfish.current) {
    stockfish.current.postMessage('ucinewgame');
    stockfish.current.postMessage('isready');
  }
}, [resetKey, onMoveHistory, onEvaluation]);


  // TURNO IA - Simple y efectivo
  useEffect(() => {
    if (!gameStarted || isThinking || game.isGameOver()) {
      return;
    }

    const turn = game.turn();
    const isAiTurn = (selectedColor === 'white' && turn === 'b') ||
                     (selectedColor === 'black' && turn === 'w');

    if (isAiTurn && stockfish.current) {
      console.log("🤖 Es turno de la IA");
      setIsThinking(true);

      const levels = {
        0: { skill: 0, depth: 1 },
        1: { skill: 1, depth: 1 },
        2: { skill: 3, depth: 1 },
        3: { skill: 5, depth: 2 },
        4: { skill: 8, depth: 4 },
        5: { skill: 12, depth: 6 },
        6: { skill: 15, depth: 8 },
        7: { skill: 18, depth: 10 },
        8: { skill: 20, depth: 12 },
        9: { skill: 20, depth: 15 }
      };

      const config = levels[difficulty] || levels[3];
      
      stockfish.current.postMessage(`setoption name Skill Level value ${config.skill}`);
      stockfish.current.postMessage(`position fen ${game.fen()}`);
      stockfish.current.postMessage(`go depth ${config.depth}`);
    }
  }, [game, gameStarted, selectedColor, difficulty, isThinking]);

  useEffect(() => {
  if (game.isGameOver() && !gameOverRef.current) {
    gameOverRef.current = true; // 🔒 bloqueamos futuras ejecuciones

    let winner = "draw";
    if (game.isCheckmate()) {
      winner = game.turn() === "w" ? "black" : "white";
    }

    onGameEnd?.({
      winner,
      reason: game.isCheckmate() ? "checkmate" : "draw",
      finalFen: game.fen(),
    });
  }
}, [game, onGameEnd]);

  // MOVIMIENTO HUMANO
  function onDrop(sourceSquare, targetSquare) {
    if (!gameStarted || isThinking) {
      console.log("❌ No se puede mover: juego no iniciado o IA pensando");
      return false;
    }

    const isPlayerTurn = (selectedColor === 'white' && game.turn() === 'w') ||
                         (selectedColor === 'black' && game.turn() === 'b');

    if (!isPlayerTurn) {
      console.log("❌ No es turno del jugador");
      return false;
    }

    console.log(`👤 Movimiento humano: ${sourceSquare} -> ${targetSquare}`);
    
    return makeMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q',
    });
  }

  return (
    <div style={{ position: "relative" }}>
      <Chessboard
        boardWidth={boardWidth}
        position={game.fen()}
        onPieceDrop={onDrop}
        boardOrientation={boardOrientation}
        customBoardStyle={{
          borderRadius: "4px",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)"
        }}
      />

    </div>

  );
};

export default ChessGame;