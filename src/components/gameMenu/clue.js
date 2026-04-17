import { useState } from 'react';
const useClue = (fen) => {
  const [clueArrow, setClueArrow] = useState([]);

  const handleClue = () => {
    if (clueArrow.length > 0) {
      setClueArrow([]);
      return;
    }

    // --- PIDE LA MEJOR JUGADA A STOCKFISH ---
    const worker = new Worker('/stockfish.js');
    worker.postMessage('uci');
    worker.postMessage('isready');

    const onMessage = (e) => {
      const line = e.data;
      if (typeof line === 'string' && line.startsWith('bestmove')) {
        const bestMove = line.split(' ')[1];
        if (bestMove && bestMove !== '(none)' && bestMove.length >= 4) {
          const from = bestMove.slice(0, 2);
          const to = bestMove.slice(2, 4);
          setClueArrow([[from, to, 'rgb(49, 255, 100)']]);
        }
        worker.removeEventListener('message', onMessage);
        worker.terminate();
      }
    };

    worker.addEventListener('message', onMessage);
    worker.postMessage(`position fen ${fen}`);
    worker.postMessage('go depth 12');
  };

  const clearClue = () => setClueArrow([]);

  return { clueArrow, handleClue, clearClue };
};

export default useClue;
