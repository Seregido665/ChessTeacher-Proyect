import { Chess } from 'chess.js';

const getPgnTag = (pgnText, tagName) => {
	const regex = new RegExp(`\\[${tagName}\\s+"([^"]+)"\\]`, 'i');
	const match = pgnText.match(regex);
	return match?.[1] || null;
};

const getWinnerFromResultTag = (resultTag) => {
	if (resultTag === '1-0') return 'white';
	if (resultTag === '0-1') return 'black';
	if (resultTag === '1/2-1/2') return 'draw';
	return 'draw';
};

const inferPlayerColorFromTags = (pgnText) => {
	const whiteTag = (getPgnTag(pgnText, 'White') || '').toLowerCase();
	const blackTag = (getPgnTag(pgnText, 'Black') || '').toLowerCase();

	if (whiteTag.includes('jugador')) return 'white';
	if (blackTag.includes('jugador')) return 'black';
	if (whiteTag.includes('stockfish')) return 'black';
	if (blackTag.includes('stockfish')) return 'white';

	return 'white';
};

const getResultReason = (chess, winner) => {
	if (chess.isCheckmate()) return 'checkmate';
	if (winner === 'draw' && chess.isStalemate()) return 'stalemate';
	if (winner === 'draw') return 'draw';
	return 'resignation';
};

export const buildMatchDataFromPgnFile = async (file, userId) => {
	if (!file) {
		throw new Error('No se proporciono archivo PGN.');
	}

	if (!userId) {
		throw new Error('No se pudo identificar el usuario. Inicia sesion de nuevo.');
	}

	const rawPgnText = await file.text();
	const pgnText = rawPgnText.replace(/^\uFEFF/, '').trim();

	if (!pgnText) {
		throw new Error('El archivo PGN esta vacio.');
	}

	const chess = new Chess();
	chess.loadPgn(pgnText, { strict: false });

	const moveHistory = chess.history();
	if (!moveHistory.length) {
		throw new Error('El PGN no contiene movimientos validos.');
	}

	const resultTag = getPgnTag(pgnText, 'Result');
	const winner = getWinnerFromResultTag(resultTag);
	const resultReason = getResultReason(chess, winner);
	const difficultyTag = Number(getPgnTag(pgnText, 'Difficulty'));
	const difficulty = Number.isFinite(difficultyTag) ? difficultyTag : 3;

	return {
		user: userId,
		playerColor: inferPlayerColorFromTags(pgnText),
		winner,
		resultReason,
		moveHistory,
		totalMoves: moveHistory.length,
		difficulty,
		finalFen: chess.fen(),
	};
};
