import { useState, useEffect, useRef, useCallback } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';

const ChessGame = ({
  gameStarted,
  selectedColor,
  resetKey,
  onMoveHistory,
  onEvaluation,
  difficulty
}) => {
  const [game, setGame] = useState(new Chess());
  const [boardOrientation, setBoardOrientation] = useState('white');
  const [isThinking, setIsThinking] = useState(false);
  const [boardWidth, setBoardWidth] = useState(400);

  const stockfish = useRef(null);
  const selectedColorRef = useRef(selectedColor);

  // Mantener actualizado el ref del color seleccionado
  useEffect(() => {
    selectedColorRef.current = selectedColor;
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

  // FUNCION PARA APLICAR MOVIMIENTOS
  const applyMove = useCallback((moveData) => {
    setGame((prevGame) => {
      const newGame = new Chess(prevGame.fen());
      try {
        const move = typeof moveData === 'string'
          ? newGame.move({ from: moveData.substring(0, 2), to: moveData.substring(2, 4), promotion: 'q' })
          : newGame.move(moveData);

        if (move) {
          if (onMoveHistory) onMoveHistory(newGame.history());
          return newGame;
        }
      } catch (e) {
        console.error("Error al mover:", e);
      }
      return prevGame;
    });
  }, [onMoveHistory]);

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
          applyMove(moveStr);
          setIsThinking(false);
        }
      }

      // Evaluación de posición
     if (line.includes('score cp')) {
        const parts = line.split(' ');
        const cpIndex = parts.indexOf('cp') + 1;
        if (cpIndex > 0 && cpIndex < parts.length) {
          const cp = parseInt(parts[cpIndex], 10);

          // ✅ Enviar directamente la evaluación tal como viene de Stockfish
          if (onEvaluation) onEvaluation(cp);
        }
      }

    };

    return () => {
      worker.terminate();
      stockfish.current = null;
    };
  }, [applyMove, onEvaluation]); // Se monta solo una vez por React

  // REINICIO DEL JUEGO
  useEffect(() => {
    setGame(new Chess());
    setIsThinking(false);
    if (onMoveHistory) onMoveHistory([]);
    if (onEvaluation) onEvaluation(0);
    if (stockfish.current) {
      stockfish.current.postMessage('ucinewgame');
      stockfish.current.postMessage('isready');
    }
  }, [resetKey, onMoveHistory, onEvaluation]);

  // TURNO IA
  useEffect(() => {
    if (!gameStarted || game.isGameOver() || isThinking) return;

    const turn = game.turn();
    const isAiTurn = (selectedColor === 'white' && turn === 'b') ||
                     (selectedColor === 'black' && turn === 'w');

    if (isAiTurn && stockfish.current) {
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

  // MOVIMIENTO HUMANO
  function onDrop(sourceSquare, targetSquare) {
    if (!gameStarted || isThinking) return false;

    const isPlayerTurn =
      (selectedColor === 'white' && game.turn() === 'w') ||
      (selectedColor === 'black' && game.turn() === 'b');

    if (!isPlayerTurn) return false;

    applyMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q',
    });

    return true;
  }

  return (
    <Chessboard
      boardWidth={boardWidth}
      position={game.fen()}
      onPieceDrop={onDrop}
      boardOrientation={boardOrientation}
      customBoardStyle={{
        borderRadius: '4px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)'
      }}
    />
  );
};

export default ChessGame;
