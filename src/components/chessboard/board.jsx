import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import { useRef, useState, useEffect } from "react";


const Board = () => {
  const chess = useRef(new Chess());
  const [position, setPosition] = useState("start");
  const engine = useRef(null);
  const [bestMove, setBestMove] = useState("");

  // --- Inicializar Stockfish ---
  useEffect(() => {
    engine.current = new Worker("/worker.js"); // usa tu worker
    engine.current.onmessage = (event) => {
      const message = event.data;
      if (typeof message === "string" && message.startsWith("bestmove")) {
        const parts = message.split(" ");
        const move = parts[1];
        setBestMove(move);
      }
    };
    engine.current.postMessage("uci"); // iniciar protocolo UCI
  }, []);

  // --- Enviar posición a Stockfish ---
  const requestEngineMove = () => {
    if (!engine.current) return;
    const fen = chess.current.fen();
    engine.current.postMessage(`position fen ${fen}`);
    engine.current.postMessage("go depth 12");
  };

  // --- Movimiento en el tablero ---
  const onDrop = (sourceSquare, targetSquare) => {
    const move = chess.current.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q",
    });
    if (move === null) return false;
    setPosition(chess.current.fen());
    requestEngineMove();
    return true;
  };

  // --- Aplicar movimiento del motor ---
  const makeEngineMove = () => {
    if (!bestMove) return;

    const from = bestMove.substring(0, 2);
    const to = bestMove.substring(2, 4);

    chess.current.move({ from, to, promotion: "q" });
    setPosition(chess.current.fen());
    setBestMove("");
  };

  return (
    <div>
      <Chessboard position={position} onPieceDrop={onDrop} />

      <button onClick={makeEngineMove} style={{ marginTop: "10px" }}>
        Jugar movimiento del motor
      </button>

      {bestMove && (
        <p>Mejor movimiento sugerido: <strong>{bestMove}</strong></p>
      )}
    </div>
  );
};

export default Board;
