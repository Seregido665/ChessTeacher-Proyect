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
  const stockfish = useRef(null);

  // 1. INICIALIZACIÓN Y PROTOCOLO UCI
  useEffect(() => {
    const worker = new Worker('/stockfish.js');
    stockfish.current = worker;

    // Configuración inicial del motor
    worker.postMessage('uci');
    worker.postMessage('isready');

    worker.onmessage = (e) => {
      const line = e.data;
      console.log('Stockfish dice:', line); // <-- Mira tu consola (F12)

      if (line.includes('bestmove')) {
        const moveStr = line.split(' ')[1];
        if (moveStr && moveStr !== '(none)') {
          applyMove(moveStr);
          setIsThinking(false);
        }
      }

      if (line.includes('score cp')) {
        const parts = line.split(' ');
        const cp = parseInt(parts[parts.indexOf('cp') + 1]);
        const evaluation = (game.turn() === 'w' ? cp : -cp) / 100;
        if (onEvaluation) onEvaluation(evaluation);
      }
    };

    return () => {
      worker.terminate();
      stockfish.current = null;
    };
  }, []);

  // 2. REINICIO
  useEffect(() => {
    setGame(new Chess());
    setIsThinking(false);
    if (onMoveHistory) onMoveHistory([]);
    if (onEvaluation) onEvaluation(0);
    if (stockfish.current) {
      stockfish.current.postMessage('ucinewgame');
      stockfish.current.postMessage('isready');
    }
  }, [resetKey]);

  useEffect(() => {
    setBoardOrientation(selectedColor === 'black' ? 'black' : 'white');
  }, [selectedColor]);

  // 3. FUNCIÓN PARA APLICAR MOVIMIENTOS
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

  // 4. DISPARADOR DE IA (EFECTO CORREGIDO)
useEffect(() => {
  if (!gameStarted || game.isGameOver() || isThinking) return;

  const turn = game.turn();
  const isAiTurn = (selectedColor === 'white' && turn === 'b') || 
                   (selectedColor === 'black' && turn === 'w');

  // ... dentro del useEffect de la IA en ChessGame.jsx

// ... dentro del useEffect de la IA en ChessGame.jsx

// ... dentro del useEffect de la IA en ChessGame.jsx

if (isAiTurn && stockfish.current && !isThinking) {
  setIsThinking(true);
  
  // Mapeo equilibrado de 10 niveles (0 al 9)
  const levels = {
    // PRINCIPIANTES (Uso de movetime para limitar visión táctica)
    0: { skill: 0,  depth: 1, movetime: 10 },  // Regala piezas constantemente
    1: { skill: 1,  depth: 1, movetime: 50 },  // Comete errores graves
    2: { skill: 3,  depth: 1, movetime: 150 }, // Ve amenazas directas de 1 jugada
    3: { skill: 5,  depth: 2 },                // Juega con lógica básica

    // INTERMEDIOS (Uso de profundidad moderada)
    4: { skill: 8,  depth: 4 },                // Empieza a usar estrategia
    5: { skill: 12, depth: 6 },                // No se deja piezas gratis
    6: { skill: 15, depth: 8 },                // Calcula combinaciones cortas

    // ALTOS (Máximo nivel de habilidad, profundidad competitiva)
    7: { skill: 18, depth: 10 },               // Nivel experto
    8: { skill: 20, depth: 12 },               // Muy sólido
    9: { skill: 20, depth: 15 }                // Prácticamente imbatible
  };

  const config = levels[difficulty] || levels[3];

  // 1. Configurar Skill Level (0-20)
  stockfish.current.postMessage(`setoption name Skill Level value ${config.skill}`);
  
  // 2. Cargar posición FEN
  stockfish.current.postMessage(`position fen ${game.fen()}`);
  
  // 3. Lanzar cálculo
  if (config.movetime) {
    stockfish.current.postMessage(`go movetime ${config.movetime}`);
  } else {
    stockfish.current.postMessage(`go depth ${config.depth}`);
  }
}
}, [game, gameStarted, selectedColor, difficulty, isThinking]);

  // 5. SOLTADO DE PIEZA (HUMANO)
  function onDrop(sourceSquare, targetSquare) {
    if (!gameStarted || isThinking) return false;

    // Validar turno humano
    const isPlayerTurn = (selectedColor === 'white' && game.turn() === 'w') || 
                         (selectedColor === 'black' && game.turn() === 'b');
    if (!isPlayerTurn) return false;

    const move = applyMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q',
    });

    return move !== null;
  }

  return (
    <div style={{ width: '500px', maxWidth: '100%' }}>
      <Chessboard 
        position={game.fen()} 
        onPieceDrop={onDrop}
        boardOrientation={boardOrientation}
        customBoardStyle={{
          borderRadius: '4px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)'
        }}
      />
    </div>
  );
};

export default ChessGame;