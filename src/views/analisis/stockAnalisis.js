import { useEffect, useRef, useState } from 'react';
import { Chess } from 'chess.js';

const parseStockfishScore = (line) => {
	if (typeof line !== 'string' || !line.includes(' score ')) {
		return null;
	}

	const cpMatch = line.match(/score cp (-?\d+)/);
	if (cpMatch) {
		return Number(cpMatch[1]);
	}

	const mateMatch = line.match(/score mate (-?\d+)/);
	if (mateMatch) {
		return Number(mateMatch[1]) > 0 ? 2000 : -2000;
	}

	return null;
};

const classifyMoveByDelta = (deltaCp) => {
	if (deltaCp >= -50) return 'Buena';
	if (deltaCp >= -150) return 'ErrorLeve';
	return 'ErrorGrade';
};

const evaluateFenWithWorker = (worker, fen) =>
	new Promise((resolve) => {
		let lastScore = 0;
		let hasScore = false;

		const onMessage = (event) => {
			const line = event.data;
			const score = parseStockfishScore(line);

			if (score !== null) {
				lastScore = score;
				hasScore = true;
			}

			if (typeof line === 'string' && line.startsWith('bestmove')) {
				worker.removeEventListener('message', onMessage);
				resolve(hasScore ? lastScore : 0);
			}
		};

		worker.addEventListener('message', onMessage);
		worker.postMessage(`position fen ${fen}`);
		worker.postMessage('go depth 10');
	});

const useStockAnalisis = ({ game, match }) => {
	const [bestMoveArrow, setBestMoveArrow] = useState([]);
	const [boardEvaluation, setBoardEvaluation] = useState(0);
	const [moveQualities, setMoveQualities] = useState([]);
	const stockfishRef = useRef(null);

	useEffect(() => {
		const worker = new Worker('/stockfish.js');
		stockfishRef.current = worker;

		worker.postMessage('uci');
		worker.postMessage('isready');

		const handleStockfishMessage = (e) => {
			const line = e.data;
			const score = parseStockfishScore(line);

			if (score !== null) {
				setBoardEvaluation(score);
			}

			if (typeof line === 'string' && line.startsWith('bestmove')) {
				const bestMove = line.split(' ')[1];

				if (bestMove && bestMove !== '(none)' && bestMove.length >= 4) {
					const from = bestMove.slice(0, 2);
					const to = bestMove.slice(2, 4);
					setBestMoveArrow([[from, to, 'rgba(255, 80, 80, 0.85)']]);
				} else {
					setBestMoveArrow([]);
				}
			}
		};

		worker.addEventListener('message', handleStockfishMessage);

		return () => {
			worker.removeEventListener('message', handleStockfishMessage);
			worker.terminate();
			stockfishRef.current = null;
		};
	}, []);

	useEffect(() => {
		if (!stockfishRef.current) return;

		if (game.isGameOver()) {
			setBestMoveArrow([]);
			return;
		}

		stockfishRef.current.postMessage(`position fen ${game.fen()}`);
		stockfishRef.current.postMessage('go depth 12');
	}, [game]);

	useEffect(() => {
		const history = match?.moveHistory || [];

		if (!history.length) {
			setMoveQualities([]);
			return;
		}

		let isCancelled = false;
		const worker = new Worker('/stockfish.js');

		const analyzeMoveQualities = async () => {
			try {
				worker.postMessage('uci');
				worker.postMessage('isready');

				const analysisGame = new Chess();
				const qualities = [];

				for (let i = 0; i < history.length; i += 1) {
					if (isCancelled) return;

					const evalBeforeMove = await evaluateFenWithWorker(worker, analysisGame.fen());

					try {
						analysisGame.move(history[i]);
					} catch (error) {
						console.error('Movimiento inválido en análisis:', error);
						qualities.push('ErrorLeve');
						continue;
					}

					const evalAfterMove = await evaluateFenWithWorker(worker, analysisGame.fen());

					// Stockfish evalúa desde el lado al turno: tras mover, el score se invierte para el jugador que movió.
					const deltaForMover = (-evalAfterMove) - evalBeforeMove;
					qualities.push(classifyMoveByDelta(deltaForMover));
				}

				if (!isCancelled) {
					setMoveQualities(qualities);
				}
			} catch (error) {
				console.error('Error analizando calidad de jugadas:', error);
				if (!isCancelled) {
					setMoveQualities(history.map(() => 'Buena'));
				}
			}
		};

		analyzeMoveQualities();

		return () => {
			isCancelled = true;
			worker.terminate();
		};
	}, [match]);

	return {
		bestMoveArrow,
		boardEvaluation,
		moveQualities,
	};
};

export default useStockAnalisis;
