import { useState, useEffect, useRef, useCallback } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import Result from "../resultado/result";
import './chessboard.css';

const ChessGame = ({
  gameStarted,
  selectedColor,
  resetKey,
  onMoveHistory,
  onEvaluation,
  difficulty,
  onGameEnd,
  className = ''
}) => {
  const [game, setGame] = useState(() => new Chess());
  const [boardOrientation, setBoardOrientation] = useState('white');
  const [isThinking, setIsThinking] = useState(false);
  const [boardWidth, setBoardWidth] = useState(400);
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [legalMoves, setLegalMoves] = useState([]);
  
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
        
        // Limpiar selección después de un movimiento exitoso
        setSelectedSquare(null);
        setLegalMoves([]);

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

  // Función para obtener movimientos legales de una pieza en una casilla
  const getLegalMoves = useCallback((square) => {
    const currentGame = gameRef.current;
    const moves = currentGame.moves({ square, verbose: true });
    return moves.map(move => move.to);
  }, []);

  // Función para manejar clicks en casillas
  const onSquareClick = useCallback((square) => {
    if (!gameStarted || isThinking) return;

    const currentGame = gameRef.current;
    const isPlayerTurn = (selectedColor === 'white' && currentGame.turn() === 'w') ||
                         (selectedColor === 'black' && currentGame.turn() === 'b');

    if (!isPlayerTurn) return;

    // Si hay una casilla seleccionada y clickeamos en una casilla legal, hacer movimiento
    if (selectedSquare && legalMoves.includes(square)) {
      const moveSuccess = makeMove({
        from: selectedSquare,
        to: square,
        promotion: 'q', // Por defecto promover a dama
      });
      
      if (moveSuccess) {
        console.log(`👤 Movimiento por click: ${selectedSquare} -> ${square}`);
      }
      return;
    }

    // Verificar si hay una pieza en la casilla clickeada
    const piece = currentGame.get(square);
    
    if (piece) {
      // Verificar que la pieza pertenece al jugador actual
      const isPieceOwnedByPlayer = (selectedColor === 'white' && piece.color === 'w') ||
                                   (selectedColor === 'black' && piece.color === 'b');
      
      if (isPieceOwnedByPlayer) {
        // Seleccionar nueva pieza y obtener sus movimientos legales
        setSelectedSquare(square);
        const moves = getLegalMoves(square);
        setLegalMoves(moves);
        console.log(`🔍 Pieza seleccionada en ${square} con ${moves.length} movimientos legales:`, moves);
        return;
      }
    }

    // Si clickeamos en una casilla vacía o una pieza enemiga, deseleccionar
    setSelectedSquare(null);
    setLegalMoves([]);
  }, [gameStarted, isThinking, selectedColor, selectedSquare, legalMoves, makeMove, getLegalMoves]);

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
    
    // Limpiar selección al reiniciar
    setSelectedSquare(null);
    setLegalMoves([]);

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

    console.log(`👤 Movimiento humano por arrastrar: ${sourceSquare} -> ${targetSquare}`);
    
    return makeMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q',
    });
  }

  // Generar estilos personalizados para las casillas (solo la seleccionada)
  const getCustomSquareStyles = () => {
    const styles = {};
    
    // Resaltar casilla seleccionada
    if (selectedSquare) {
      styles[selectedSquare] = { 
        backgroundColor: 'rgba(255, 255, 0, 0.6)',
        border: '3px solid #ffeb3b'
      };
    }
    
    // Cursor pointer en casillas legales
    legalMoves.forEach(square => {
      styles[square] = { cursor: 'pointer' };
    });
    
    return styles;
  };

  // Calcula la posición en píxeles (top-left) de una casilla dada la orientación
  const getSquarePosition = (square) => {
    const file = square.charCodeAt(0) - 'a'.charCodeAt(0); // 0-7
    const rank = parseInt(square[1]) - 1;                  // 0-7

    const squareSize = boardWidth / 8;

    let col, row;
    if (boardOrientation === 'white') {
      col = file;
      row = 7 - rank;
    } else {
      col = 7 - file;
      row = rank;
    }

    return {
      x: col * squareSize,
      y: row * squareSize,
      size: squareSize,
    };
  };

  return (
    <div
      className={`chessgame-wrapper ${className}`.trim()}
      style={{ '--board-size': `${boardWidth}px` }}
    >
      <Chessboard
        boardWidth={boardWidth}
        position={game.fen()}
        onPieceDrop={onDrop}
        onSquareClick={onSquareClick}
        boardOrientation={boardOrientation}
        customSquareStyles={getCustomSquareStyles()}
        customBoardStyle={{
          borderRadius: "4px",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)"
        }}
      />

      {/* Overlay para los círculos de movimientos legales (por encima de las piezas) */}
      <div
        className="chessgame-overlay"
        style={{ width: boardWidth, height: boardWidth }}
      >
        {legalMoves.map(square => {
          const { x, y, size } = getSquarePosition(square);
          const circleSize = size * 0.32;
          return (
            <div
              key={square}
              onClick={(e) => { e.stopPropagation(); onSquareClick(square); }}
              style={{
                position: "absolute",
                left: x + size / 2 - circleSize / 2,
                top: y + size / 2 - circleSize / 2,
                width: circleSize,
                height: circleSize,
                borderRadius: "50%",
                backgroundColor: "rgba(0, 0, 0, 0.28)",
                pointerEvents: "auto",
                cursor: "pointer",
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ChessGame;