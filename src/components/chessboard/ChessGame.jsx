import { useState, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';

const ChessGame = ({ 
  gameStarted, 
  selectedColor,
  resetKey,
  onMoveHistory,
  onEvaluation
}) => {
  const [game, setGame] = useState(new Chess());
  const [boardOrientation, setBoardOrientation] = useState('white');

  // Reiniciar juego cuando cambia resetKey
  useEffect(() => {
    const newGame = new Chess();
    setGame(newGame);
    if (onMoveHistory) onMoveHistory([]);
    if (onEvaluation) onEvaluation(0);
    console.log('🔄 Juego reiniciado');
  }, [resetKey]);

  // Cambiar orientación del tablero según el color seleccionado
  useEffect(() => {
    if (gameStarted) {
      setBoardOrientation(selectedColor === 'black' ? 'black' : 'white');
      console.log('🎨 Orientación del tablero:', selectedColor);
    }
  }, [gameStarted, selectedColor]);

  // Función principal para manejar movimientos
  function onDrop(sourceSquare, targetSquare) {
    console.log('🎯 Intento de movimiento:', sourceSquare, '→', targetSquare);
    
    // Verificar si el juego ha comenzado
    if (!gameStarted) {
      console.log('❌ El juego no ha comenzado');
      return false;
    }

    // Verificar si es el turno del jugador
    const currentTurn = game.turn();
    const isPlayerTurn = 
      (selectedColor === 'white' && currentTurn === 'w') ||
      (selectedColor === 'black' && currentTurn === 'b');

    console.log('📊 Estado del juego:', {
      turnoActual: currentTurn === 'w' ? 'Blancas' : 'Negras',
      colorJugador: selectedColor,
      esTurnoJugador: isPlayerTurn
    });

    if (!isPlayerTurn) {
      console.log('❌ No es tu turno');
      return false;
    }

    // Intentar hacer el movimiento
    try {
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q' // Promoción automática a reina
      });

      // Si move es null, el movimiento es ilegal
      if (move === null) {
        console.log('❌ Movimiento ilegal según las reglas del ajedrez');
        return false;
      }

      console.log('✅ Movimiento VÁLIDO:', move.san);

      // Actualizar el estado con una nueva instancia
      setGame(new Chess(game.fen()));

      // Actualizar historial
      if (onMoveHistory) {
        const history = game.history();
        console.log('📋 Historial:', history);
        onMoveHistory(history);
      }

      // Actualizar evaluación
      if (onEvaluation) {
        const evaluation = evaluateBoard(game);
        console.log('📊 Evaluación:', evaluation);
        onEvaluation(evaluation);
      }

      // Verificar si hay jaque mate o tablas
      if (game.isGameOver()) {
        if (game.isCheckmate()) {
          const winner = game.turn() === 'w' ? 'Negras' : 'Blancas';
          console.log('👑 ¡JAQUE MATE! Ganan las', winner);
          alert(`¡JAQUE MATE! Ganan las ${winner}`);
        } else if (game.isDraw()) {
          console.log('🤝 ¡TABLAS!');
          alert('¡TABLAS!');
        }
      } else if (game.isCheck()) {
        console.log('⚠️ ¡JAQUE!');
      }

      return true;

    } catch (error) {
      console.error('💥 Error al intentar mover:', error);
      return false;
    }
  }

  // Función de evaluación (material)
  function evaluateBoard(chess) {
    const pieceValues = {
      p: 1,   // peón
      n: 3,   // caballo
      b: 3,   // alfil
      r: 5,   // torre
      q: 9,   // reina
      k: 0    // rey
    };

    let evaluation = 0;
    const board = chess.board();

    board.forEach(row => {
      row.forEach(square => {
        if (square) {
          const value = pieceValues[square.type];
          evaluation += square.color === 'w' ? value : -value;
        }
      });
    });

    return evaluation;
  }

  return (
    <div style={{ width: '500px', maxWidth: '600px' }}>
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