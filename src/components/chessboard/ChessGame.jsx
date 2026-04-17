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
  onFenChange,
  clueArrow = [],
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

  // --- ORIENTACION DEL TABLERO ---
  useEffect(() => {
    setBoardOrientation(selectedColor === 'black' ? 'black' : 'white');
  }, [selectedColor]);

  // --- AJUSTA EL TAMAÑO DEL TABLERO ---
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

  // --- MOVIMIENTO DE PIEZAS ---
  const makeMove = useCallback((moveData) => {
    try {
      const currentGame = gameRef.current;
      const moveResult = currentGame.move(moveData);

      if (moveResult) {
        const newGame = new Chess(currentGame.fen());
        setGame(newGame);
        setSelectedSquare(null);
        setLegalMoves([]);

        if (onMoveHistory) {
          onMoveHistory(prev => [...prev, moveResult.san]);
        }
        if (onFenChange) {
          onFenChange(newGame.fen());
        }
        return true;
      }
    } catch (error) {
      console.error(error);
    }
    return false;
  }, [onMoveHistory]);

  // --- MOVIMIENTOS LEGALES ---
  const getLegalMoves = useCallback((square) => {
    const currentGame = gameRef.current;
    const moves = currentGame.moves({ square, verbose: true });
    return moves.map(move => move.to);
  }, []);

  // --- MANEJO DE CLICS EN CASILLAS ---
  const onSquareClick = useCallback((square) => {
    if (isThinking) return;

    const currentGame = gameRef.current;
    const isPlayerTurn = (selectedColor === 'white' && currentGame.turn() === 'w') ||
                         (selectedColor === 'black' && currentGame.turn() === 'b');

    if (!isPlayerTurn) return;

    // - SI HAY UNA PIEZA SELECCIONADA Y EL CLICK ES EN UN MOVIMIENTO LEGAL → HACER MOVIMIENTO -
    if (selectedSquare && legalMoves.includes(square)) {
      const moveSuccess = makeMove({
        from: selectedSquare,
        to: square,
        promotion: 'q', 
      });
      return;
    }

    // - SELECCIONA LA PIEZA CLICADA -
    const piece = currentGame.get(square);
    if (piece) {
      const isPieceOwnedByPlayer = (selectedColor === 'white' && piece.color === 'w') ||
                                   (selectedColor === 'black' && piece.color === 'b');
      if (isPieceOwnedByPlayer) {
        setSelectedSquare(square);
        const moves = getLegalMoves(square);
        setLegalMoves(moves);
        return;
      }
    }
    setSelectedSquare(null);
    setLegalMoves([]);
  }, [gameStarted, isThinking, selectedColor, selectedSquare, legalMoves, makeMove, getLegalMoves]);

  // --- INICIAR STOCKFISH ---
  useEffect(() => {
    const worker = new Worker('/stockfish.js');
    stockfish.current = worker;

    worker.postMessage('uci');
    worker.postMessage('isready');
    worker.onmessage = (e) => {
      const line = e.data;

      // // --- MOVIMIENTO DE LA IA ---
      if (line.includes('bestmove')) {
        const moveStr = line.split(' ')[1];
        if (moveStr && moveStr !== '(none)') {
          makeMove(moveStr);
          setIsThinking(false);
        }
      }

      // // --- EVALUACIÓN DE LA BARRA DE VENTAJA ---
      if (line.includes('score cp')) {
        const parts = line.split(' ');
        const cpIndex = parts.indexOf('cp') + 1;
        if (cpIndex > 0 && cpIndex < parts.length) {
          let cp = parseInt(parts[cpIndex], 10);

          if (gameRef.current.turn() === 'b') {
            cp = -cp;
          }
          if (onEvaluation) onEvaluation(cp);
        }
      }
    };

    return () => {
      worker.terminate();
      stockfish.current = null;
    };
  }, [makeMove, onEvaluation]);

  // --- RESET COMPLETO DEL JUEGO ---
  useEffect(() => {
    const newGame = new Chess();
    setGame(newGame);
    gameRef.current = newGame;
    setIsThinking(false);
    gameOverRef.current = false;
    
    setSelectedSquare(null);
    setLegalMoves([]);

    if (onMoveHistory) onMoveHistory([]);
    if (onEvaluation) onEvaluation(0);

    if (stockfish.current) {
      stockfish.current.postMessage('ucinewgame');
      stockfish.current.postMessage('isready');
    }
  }, [resetKey]);

  // --- TURNO DE LA IA ---
  useEffect(() => {
    if (isThinking || gameRef.current.isGameOver()) return;

    const turn = gameRef.current.turn();
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
      stockfish.current.postMessage(`position fen ${gameRef.current.fen()}`);
      stockfish.current.postMessage(`go depth ${config.depth}`);
    }
  }, [game, gameStarted, selectedColor, difficulty, isThinking]);

  // --- DETECTA EL FIN DE LA PARTIDA ---
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

  // --- MANEJO DE MOVIMIENTOS POR DRAG & DROP ---
  function onDrop(sourceSquare, targetSquare) {
    if (isThinking) return false;

    const currentGame = gameRef.current;
    const isPlayerTurn = (selectedColor === 'white' && currentGame.turn() === 'w') ||
                         (selectedColor === 'black' && currentGame.turn() === 'b');

    if (!isPlayerTurn) return false;
    
    return makeMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q',
    });
  }

  // --- GENERAR ESTILOS PARA LAS CASILLAS ---
  const getCustomSquareStyles = () => {
    const styles = {};
    
    // - RESALTAR CASILLA SELECCIONADA -
    if (selectedSquare) {
      styles[selectedSquare] = { 
        backgroundColor: 'rgba(255, 255, 0, 0.6)',
        border: '3px solid #ffeb3b'
      };
    }
    
    // - PUNTO EN CASILLAS LEGALES -
    legalMoves.forEach(square => {
      styles[square] = { cursor: 'pointer' };
    });
    
    return styles;
  };

  // --- CALCULAR POSICIÓN DE LOS CÍRCULOS DE MOVIMIENTOS LEGALES ---
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
        customArrows={clueArrow}
        customBoardStyle={{
          borderRadius: "4px",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)"
        }}
      />

      {/* - MUESTRA CÍRCULOS CON LOS MOVIMIENTOS LEGALES - */}
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