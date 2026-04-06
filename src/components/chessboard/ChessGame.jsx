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
  const [game, setGame] = useState(() => new Chess());
  const [boardOrientation, setBoardOrientation] = useState('white');
  const [isThinking, setIsThinking] = useState(false);
  const [boardWidth, setBoardWidth] = useState(400);
  
  const stockfish = useRef(null);
  const gameOverRef = useRef(false);
  const gameRef = useRef(game);

  useEffect(() => {
    gameRef.current = game;
  }, [game]);

  useEffect(() => {
    setBoardOrientation(selectedColor === 'black' ? 'black' : 'white');
  }, [selectedColor]);

  // Responsive board size
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

  const makeMove = useCallback((moveData) => {
    try {
      const currentGame = gameRef.current;
      const moveResult = currentGame.move(moveData);

      if (moveResult) {
        console.log(`✅ Movimiento realizado: ${moveResult.san}`);

        const newGame = new Chess(currentGame.fen());
        setGame(newGame);

        if (onMoveHistory) {
          onMoveHistory(prev => [...prev, moveResult.san]);
        }

        return true;
      }
    } catch (error) {
      console.error("❌ Error al hacer movimiento:", error);
    }
    return false;
  }, [onMoveHistory]);

  // Stockfish initialization
  useEffect(() => {
    console.log("🔧 Inicializando Stockfish");
    const worker = new Worker('/stockfish.js');
    stockfish.current = worker;

    worker.postMessage('uci');
    worker.postMessage('isready');

    worker.onmessage = (e) => {
      const line = e.data;

      // Best move from AI
      if (line.includes('bestmove')) {
        const moveStr = line.split(' ')[1];
        if (moveStr && moveStr !== '(none)') {
          console.log("🤖 Stockfish sugiere:", moveStr);
          makeMove(moveStr);
          setIsThinking(false);
        }
      }

      // Evaluation (score cp)
      if (line.includes('score cp')) {
        const parts = line.split(' ');
        const cpIndex = parts.indexOf('cp') + 1;
        if (cpIndex > 0 && cpIndex < parts.length) {
          let cp = parseInt(parts[cpIndex], 10);

          // NORMALIZACIÓN: hacer que siempre sea desde la perspectiva de las blancas
          // Si es turno de negras → invertir el signo
          if (gameRef.current.turn() === 'b') {
            cp = -cp;
          }

          console.log(`Evaluación normalizada (perspectiva blancas): ${cp}`);
          if (onEvaluation) onEvaluation(cp);
        }
      }
    };

    return () => {
      worker.terminate();
      stockfish.current = null;
    };
  }, [makeMove, onEvaluation]);

  // Reset completo
  useEffect(() => {
    const newGame = new Chess();
    setGame(newGame);
    gameRef.current = newGame;
    setIsThinking(false);
    gameOverRef.current = false;

    if (onMoveHistory) onMoveHistory([]);
    if (onEvaluation) onEvaluation(0);

    if (stockfish.current) {
      stockfish.current.postMessage('ucinewgame');
      stockfish.current.postMessage('isready');
    }
  }, [resetKey]);

  // Turno de la IA
  useEffect(() => {
    if (!gameStarted || isThinking || gameRef.current.isGameOver()) return;

    const turn = gameRef.current.turn();
    const isAiTurn = (selectedColor === 'white' && turn === 'b') ||
                     (selectedColor === 'black' && turn === 'w');

    if (isAiTurn && stockfish.current) {
      console.log("🤖 Es turno de la IA - Turn:", turn, "Player:", selectedColor);
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
      stockfish.current.postMessage(`position fen ${gameRef.current.fen()}`);
      stockfish.current.postMessage(`go depth ${config.depth}`);
    }
  }, [game, gameStarted, selectedColor, difficulty, isThinking]);

  // Detección de fin de juego
  useEffect(() => {
    if (gameRef.current.isGameOver() && !gameOverRef.current) {
      gameOverRef.current = true;

      let winner = "draw";
      if (gameRef.current.isCheckmate()) {
        winner = gameRef.current.turn() === "w" ? "black" : "white";
      }

      onGameEnd?.({
        winner,
        reason: gameRef.current.isCheckmate() ? "checkmate" : "draw",
        finalFen: gameRef.current.fen(),
      });
    }
  }, [game, onGameEnd]);

  function onDrop(sourceSquare, targetSquare) {
    if (!gameStarted || isThinking) return false;

    const currentGame = gameRef.current;
    const isPlayerTurn = (selectedColor === 'white' && currentGame.turn() === 'w') ||
                         (selectedColor === 'black' && currentGame.turn() === 'b');

    if (!isPlayerTurn) return false;

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